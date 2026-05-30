create extension if not exists pgcrypto;

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  parent_id uuid references comments(id) on delete set null,
  nick text not null,
  mail_hash text,
  link text,
  content text not null,
  status text not null default 'visible'
    check (status in ('visible', 'hidden', 'spam', 'deleted')),
  ip_hash text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_public_roots_idx
  on comments (path, status, created_at desc)
  where parent_id is null;

create index if not exists comments_parent_idx
  on comments (parent_id, status, created_at asc);

create index if not exists comments_admin_idx
  on comments (status, created_at desc);

create index if not exists comments_rate_limit_idx
  on comments (ip_hash, created_at desc);

create table if not exists comment_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into comment_settings (key, value) values
  ('show_author_link', 'true'),
  ('show_email_avatar', 'false')
on conflict (key) do nothing;
