import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { parseMessage, cleanMarkdownContent, truncateText } from './markdown';

export type CommentStatus = 'visible' | 'hidden' | 'spam' | 'deleted';
type SqlClient = ReturnType<typeof neon>;

let sqlClient: SqlClient | null = null;

export interface PublicComment {
  id: string;
  parentId: string | null;
  nick: string;
  mailHash: string | null;
  avatarUrl: string | null;
  link: string | null;
  contentHtml: string;
  contentText: string;
  createdAt: string;
  replies: PublicComment[];
}

export interface PublicCommentSettings {
  showAuthorLink: boolean;
  showEmailAvatar: boolean;
}

export interface AdminComment {
  id: string;
  path: string;
  parentId: string | null;
  nick: string;
  mailHash: string | null;
  link: string | null;
  content: string;
  contentText: string;
  contentHtml: string;
  status: CommentStatus;
  ipHash: string;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentInput {
  path: string;
  parentId?: string | null;
  nick: string;
  mail?: string | null;
  link?: string | null;
  content: string;
  startedAt?: number | null;
  honeyPot?: string | null;
}

interface CommentRow {
  id: string;
  path: string;
  parent_id: string | null;
  nick: string;
  mail_hash: string | null;
  link: string | null;
  content: string;
  status: CommentStatus;
  ip_hash: string;
  user_agent: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export class CommentError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'CommentError';
    this.status = status;
  }
}

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new CommentError(503, '评论数据库还没有配置 DATABASE_URL。');
  }

  if (!sqlClient) {
    sqlClient = neon(process.env.DATABASE_URL);
  }

  return sqlClient;
}

export function normalizeCommentPath(input: unknown): string {
  const raw = String(input || '').trim();
  if (!raw) {
    throw new CommentError(400, '缺少评论路径。');
  }

  let pathname = raw;
  try {
    const url = raw.startsWith('http://') || raw.startsWith('https://')
      ? new URL(raw)
      : new URL(raw, 'https://local.invalid');
    pathname = url.pathname;
  } catch {
    throw new CommentError(400, '评论路径格式不正确。');
  }

  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  if (pathname !== '/' && !pathname.endsWith('/')) {
    pathname = `${pathname}/`;
  }

  return pathname;
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  return headers.get('x-real-ip')
    || headers.get('cf-connecting-ip')
    || 'unknown';
}

export function hashIp(ip: string): string {
  const salt = process.env.COMMENTS_IP_SALT || 'mufeng-comments-dev-salt';
  return createHmac('sha256', salt).update(ip).digest('hex');
}

function hashMail(mail?: string | null): string | null {
  const normalized = mail?.trim().toLowerCase();
  if (!normalized) return null;
  return createHash('sha256').update(normalized).digest('hex');
}

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) return defaultValue;
  return parseBooleanValue(value, defaultValue);
}

function parseBooleanValue(value: unknown, defaultValue: boolean): boolean {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return defaultValue;
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return defaultValue;
}

export function getPublicCommentSettings(): PublicCommentSettings {
  return {
    showAuthorLink: readBooleanEnv('COMMENTS_SHOW_AUTHOR_LINK', true),
    showEmailAvatar: readBooleanEnv('COMMENTS_SHOW_EMAIL_AVATAR', false),
  };
}

async function getPublicCommentSettingsFromDb(sql: SqlClient): Promise<PublicCommentSettings> {
  const settings = getPublicCommentSettings();

  const rows = await sql`
    select key, value
    from comment_settings
    where key in ('show_author_link', 'show_email_avatar')
  ` as { key: string; value: string }[];

  for (const row of rows) {
    if (row.key === 'show_author_link') {
      settings.showAuthorLink = parseBooleanValue(row.value, settings.showAuthorLink);
    }
    if (row.key === 'show_email_avatar') {
      settings.showEmailAvatar = parseBooleanValue(row.value, settings.showEmailAvatar);
    }
  }

  return settings;
}

export async function getAdminCommentSettings(): Promise<PublicCommentSettings> {
  return await getPublicCommentSettingsFromDb(getSql());
}

export async function updateAdminCommentSettings(input: unknown): Promise<PublicCommentSettings> {
  const sql = getSql();
  const data = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const settings = {
    showAuthorLink: Boolean(data.showAuthorLink),
    showEmailAvatar: Boolean(data.showEmailAvatar),
  };

  await sql`
    insert into comment_settings (key, value)
    values
      ('show_author_link', ${String(settings.showAuthorLink)}),
      ('show_email_avatar', ${String(settings.showEmailAvatar)})
    on conflict (key) do update
      set value = excluded.value,
          updated_at = now()
  `;

  return settings;
}

function getAvatarUrl(mailHash: string | null, settings: PublicCommentSettings): string | null {
  if (!settings.showEmailAvatar || !mailHash) return null;
  return `https://gravatar.loli.net/avatar/${mailHash}?d=identicon&s=80`;
}

function normalizeUrl(link?: string | null): string | null {
  const raw = link?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('bad protocol');
    }
    return url.toString().slice(0, 240);
  } catch {
    throw new CommentError(400, '网址需要以 http:// 或 https:// 开头。');
  }
}

export function validateCommentInput(input: CommentInput): Required<CommentInput> & {
  path: string;
  parentId: string | null;
  mail: string | null;
  link: string | null;
} {
  if (input.honeyPot?.trim()) {
    throw new CommentError(400, '评论提交被拦截。');
  }

  const now = Date.now();
  if (input.startedAt && now - input.startedAt < 1800) {
    throw new CommentError(429, '提交太快了，请稍后再试。');
  }

  const path = normalizeCommentPath(input.path);
  const nick = input.nick.trim() || '匿名访客';
  const content = input.content.trim();
  const mail = input.mail?.trim() || null;
  const link = normalizeUrl(input.link);

  if (nick.length > 32) {
    throw new CommentError(400, '昵称长度不能超过 32 个字符。');
  }

  if (mail && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || mail.length > 120)) {
    throw new CommentError(400, '邮箱格式不正确。');
  }

  if (content.length < 2 || content.length > 1000) {
    throw new CommentError(400, '评论内容需要在 2 到 1000 个字符之间。');
  }

  return {
    path,
    parentId: input.parentId || null,
    nick,
    mail,
    link,
    content,
    startedAt: input.startedAt || null,
    honeyPot: input.honeyPot || null,
  };
}

export function validateAdminToken(headers: Headers): void {
  const token = process.env.COMMENTS_ADMIN_TOKEN;
  if (!token) {
    throw new CommentError(503, '还没有配置 COMMENTS_ADMIN_TOKEN。');
  }

  const authorization = headers.get('authorization') || '';
  const value = authorization.replace(/^Bearer\s+/i, '').trim();
  const expected = Buffer.from(token);
  const actual = Buffer.from(value);

  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new CommentError(401, '没有评论管理权限。');
  }
}

async function ensureNotRateLimited(ipHash: string): Promise<void> {
  const sql = getSql();
  const [recent] = await sql`
    select
      count(*) filter (where created_at > now() - interval '60 seconds')::int as minute_count,
      count(*) filter (where created_at > now() - interval '1 hour')::int as hour_count
    from comments
    where ip_hash = ${ipHash}
  ` as { minute_count: number; hour_count: number }[];

  if ((recent?.minute_count ?? 0) >= 1 || (recent?.hour_count ?? 0) >= 10) {
    throw new CommentError(429, '评论太频繁了，请稍后再试。');
  }
}

function formatDate(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function toPublicComment(
  row: CommentRow,
  settings: PublicCommentSettings,
): Promise<PublicComment> {
  return {
    id: row.id,
    parentId: row.parent_id,
    nick: row.nick,
    mailHash: settings.showEmailAvatar ? row.mail_hash : null,
    avatarUrl: getAvatarUrl(row.mail_hash, settings),
    link: settings.showAuthorLink ? row.link : null,
    contentHtml: await parseMessage(row.content),
    contentText: truncateText(cleanMarkdownContent(row.content), 120),
    createdAt: formatDate(row.created_at),
    replies: [],
  };
}

async function toAdminComment(row: CommentRow): Promise<AdminComment> {
  return {
    id: row.id,
    path: row.path,
    parentId: row.parent_id,
    nick: row.nick,
    mailHash: row.mail_hash,
    link: row.link,
    content: row.content,
    contentText: truncateText(cleanMarkdownContent(row.content), 140),
    contentHtml: await parseMessage(row.content),
    status: row.status,
    ipHash: row.ip_hash,
    userAgent: row.user_agent,
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at),
  };
}

export async function listPublicComments(pathInput: unknown, page = 1, pageSize = 10) {
  const sql = getSql();
  const path = normalizeCommentPath(pathInput);
  const safePage = Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1);
  const safePageSize = Math.min(30, Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 10));
  const offset = (safePage - 1) * safePageSize;
  const settings = await getPublicCommentSettingsFromDb(sql);

  const [countRow] = await sql`
    select count(*)::int as total
    from comments
    where path = ${path}
      and status = 'visible'
      and parent_id is null
  ` as { total: number }[];

  const roots = await sql`
    select *
    from comments
    where path = ${path}
      and status = 'visible'
      and parent_id is null
    order by created_at desc
    limit ${safePageSize}
    offset ${offset}
  ` as CommentRow[];

  const rootIds = roots.map((row) => row.id);
  const replies = rootIds.length
    ? await sql`
        select *
        from comments
        where path = ${path}
          and status = 'visible'
          and parent_id = any(${rootIds})
        order by created_at asc
      ` as CommentRow[]
    : [];

  const rootComments = await Promise.all(roots.map((row) => toPublicComment(row, settings)));
  const repliesByParent = new Map<string, PublicComment[]>();
  for (const reply of await Promise.all(replies.map((row) => toPublicComment(row, settings)))) {
    if (!reply.parentId) continue;
    const list = repliesByParent.get(reply.parentId) || [];
    list.push(reply);
    repliesByParent.set(reply.parentId, list);
  }

  for (const root of rootComments) {
    root.replies = repliesByParent.get(root.id) || [];
  }

  return {
    comments: rootComments,
    total: countRow?.total ?? 0,
    page: safePage,
    pageSize: safePageSize,
    hasMore: offset + rootComments.length < (countRow?.total ?? 0),
    settings,
  };
}

export async function createComment(input: CommentInput, headers: Headers) {
  const sql = getSql();
  const data = validateCommentInput(input);
  const ipHash = hashIp(getClientIp(headers));
  const userAgent = headers.get('user-agent')?.slice(0, 300) || null;

  await ensureNotRateLimited(ipHash);

  let parentId = data.parentId;
  if (parentId) {
    const [parent] = await sql`
      select id
      from comments
      where id = ${parentId}
        and path = ${data.path}
        and status = 'visible'
        and parent_id is null
      limit 1
    ` as { id: string }[];

    if (!parent) {
      throw new CommentError(400, '回复的评论不存在或不可回复。');
    }

    parentId = parent.id;
  }

  const [created] = await sql`
    insert into comments (
      path,
      parent_id,
      nick,
      mail_hash,
      link,
      content,
      status,
      ip_hash,
      user_agent
    ) values (
      ${data.path},
      ${parentId},
      ${data.nick},
      ${hashMail(data.mail)},
      ${data.link},
      ${data.content},
      'visible',
      ${ipHash},
      ${userAgent}
    )
    returning *
  ` as CommentRow[];

  return await toPublicComment(created, await getPublicCommentSettingsFromDb(sql));
}

export async function listAdminComments(statusInput: unknown, page = 1, pageSize = 20) {
  const sql = getSql();
  const status = String(statusInput || '').trim() as CommentStatus | '';
  const allowedStatuses: CommentStatus[] = ['visible', 'hidden', 'spam', 'deleted'];
  const safeStatus = allowedStatuses.includes(status as CommentStatus) ? status : '';
  const safePage = Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1);
  const safePageSize = Math.min(50, Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 20));
  const offset = (safePage - 1) * safePageSize;

  const rows = safeStatus
    ? await sql`
        select *
        from comments
        where status = ${safeStatus}
        order by created_at desc
        limit ${safePageSize}
        offset ${offset}
      ` as CommentRow[]
    : await sql`
        select *
        from comments
        order by created_at desc
        limit ${safePageSize}
        offset ${offset}
      ` as CommentRow[];

  const [countRow] = safeStatus
    ? await sql`select count(*)::int as total from comments where status = ${safeStatus}` as { total: number }[]
    : await sql`select count(*)::int as total from comments` as { total: number }[];

  return {
    comments: await Promise.all(rows.map(toAdminComment)),
    total: countRow?.total ?? 0,
    page: safePage,
    pageSize: safePageSize,
    hasMore: offset + rows.length < (countRow?.total ?? 0),
  };
}

export async function updateCommentStatus(id: string, action: unknown) {
  const sql = getSql();
  const statusByAction: Record<string, CommentStatus> = {
    hide: 'hidden',
    restore: 'visible',
    spam: 'spam',
    delete: 'deleted',
  };
  const nextStatus = statusByAction[String(action || '')];

  if (!nextStatus) {
    throw new CommentError(400, '未知的评论管理操作。');
  }

  const [updated] = await sql`
    update comments
    set status = ${nextStatus},
        updated_at = now()
    where id = ${id}
    returning *
  ` as CommentRow[];

  if (!updated) {
    throw new CommentError(404, '评论不存在。');
  }

  return await toAdminComment(updated);
}

export function jsonError(error: unknown) {
  if (error instanceof CommentError) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: error.status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  console.error('[NativeComments]', error);
  return new Response(JSON.stringify({ ok: false, error: '评论服务暂时不可用。' }), {
    status: 500,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function jsonOk(data: unknown, status = 200) {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
