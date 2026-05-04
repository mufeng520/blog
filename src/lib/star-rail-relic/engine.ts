/**
 * 崩坏：星穹铁道遗器看板 — Reliquary Archiver 导出、内容集合规则、匹配与集体套装分析
 */

import { resolveRelicSetNameForArchiver } from './i18n';

/** 将规则里的隧洞/位面套装名统一为 Archiver 英文名（配置可写简中） */
export function normalizeCharacterRules(rules: CharacterRule[]): CharacterRule[] {
  return rules.map((r) => ({
    ...r,
    loadouts: r.loadouts.map((lo) => ({
      ...lo,
      cavernSets: lo.cavernSets.map((s) => resolveRelicSetNameForArchiver(s)),
      planarSets: lo.planarSets.map((s) => resolveRelicSetNameForArchiver(s)),
    })),
  }));
}

/** 与 `src/content.config.ts` 中 starRailRelicRules 集合 schema 一致 */
export interface RelicLoadoutRule {
  id: string;
  name: string;
  cavernSets: string[];
  planarSets: string[];
  /** 本方案有效副词条（与 Archiver substats[].key 或中文别名匹配） */
  effectiveSubstats?: string[];
}

export interface CharacterRule {
  /** 内容条目 id（与 src/data/star-rail-relic-rules.json 中 id 对应） */
  entryId: string;
  characterId: string;
  displayName?: string;
  loadouts: RelicLoadoutRule[];
}

export interface CharacterInput {
  id: string;
  name: string;
  cavernSets: string[];
  planarSets: string[];
}

export interface RelicInput {
  id: string;
  /** 单件展示名（简版 JSON 用） */
  name?: string;
  /** 套装名：须与 Archiver 的 relic.name 或简版 JSON 的 set 一致 */
  set: string;
  setId?: string;
  category?: 'cavern' | 'planar';
  slot: string;
  mainStat?: string;
  subStats?: { name: string; value?: string; count?: number }[];
  hitCount: number;
  characterId?: string | null;
}

export interface LoadoutBoxPayload {
  entryId: string;
  characterId: string;
  characterLabel: string;
  loadoutId: string;
  loadoutName: string;
  cavernSets: string[];
  planarSets: string[];
  effectiveSubstats: string[];
  relics: (RelicInput & { matchReason: 'equipped' | 'rule'; duplicate?: boolean })[];
}

/** @deprecated 旧版「每角色一盒」 */
export interface RelicBoxPayload {
  character: CharacterInput;
  relics: (RelicInput & { matchReason: 'assigned' | 'rule'; duplicate?: boolean })[];
}

export interface SetFarmRow {
  setName: string;
  kind: 'cavern' | 'planar';
  /** 至少一套方案引用该套装的角色数 */
  demandCharacters: number;
  /** 引用该套装的方案（loadout）条数 */
  demandLoadouts: number;
  ownedCount: number;
  minHit: number | null;
  avgHit: number | null;
  maxHit: number | null;
  farmScore: number;
  label: string;
}

const PLANAR_SLOT_KEYWORDS = [
  '位面',
  '连结',
  '球',
  '绳',
  'planar',
  'link',
  'sphere',
  'rope',
];

export function inferCategory(slot: string, explicit?: 'cavern' | 'planar'): 'cavern' | 'planar' {
  if (explicit) return explicit;
  const s = slot.toLowerCase();
  for (const k of PLANAR_SLOT_KEYWORDS) {
    if (slot.includes(k) || s.includes(k.toLowerCase())) return 'planar';
  }
  return 'cavern';
}

export function setMatchesCharacter(
  setName: string,
  category: 'cavern' | 'planar',
  char: CharacterInput
): boolean {
  const list = category === 'planar' ? char.planarSets : char.cavernSets;
  return list.some((t) => resolveRelicSetNameForArchiver(t) === setName);
}

function setMatchesLoadout(
  setName: string,
  category: 'cavern' | 'planar',
  loadout: RelicLoadoutRule
): boolean {
  const list = category === 'planar' ? loadout.planarSets : loadout.cavernSets;
  if (!list.length) return false;
  return list.some((t) => resolveRelicSetNameForArchiver(t) === setName);
}

/** Archiver：relic.name 为套装英文名；词条命中默认取各副词条 count 之和 */
export function isArchiverReliquaryExport(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  if (o.source === 'reliquary_archiver' && Array.isArray(o.relics)) return true;
  if (o.version === 4 && Array.isArray(o.relics)) {
    const first = o.relics[0];
    if (first && typeof first === 'object' && 'set_id' in (first as object)) return true;
  }
  return false;
}

function archiverSubstatHitSum(substats: unknown): number {
  if (!Array.isArray(substats)) return 0;
  let n = 0;
  for (const s of substats) {
    if (!s || typeof s !== 'object') continue;
    const c = (s as Record<string, unknown>).count;
    if (typeof c === 'number' && Number.isFinite(c)) n += c;
  }
  return n;
}

/** 将 Reliquary Archiver 顶层 JSON 转为统一 RelicInput[]（不校验 characters 段） */
export function parseArchiverRelics(raw: unknown): RelicInput[] {
  if (!raw || typeof raw !== 'object') throw new Error('JSON 须为对象');
  const rels = (raw as Record<string, unknown>).relics;
  if (!Array.isArray(rels)) throw new Error('缺少 relics 数组（Archiver 导出）');

  return rels.map((item, i) => {
    if (!item || typeof item !== 'object') throw new Error(`relics[${i}] 无效`);
    const x = item as Record<string, unknown>;
    const setName = String(x.name ?? '');
    const slot = String(x.slot ?? '');
    const uid = x._uid != null ? String(x._uid) : `row-${i}`;
    if (!setName) throw new Error(`relics[${i}].name（套装名）缺失`);
    if (!slot) throw new Error(`relics[${i}].slot 缺失`);

    const hitOverride = x.hitCount;
    let hitCount: number;
    if (typeof hitOverride === 'number' && Number.isFinite(hitOverride)) hitCount = hitOverride;
    else if (typeof hitOverride === 'string' && hitOverride !== '') hitCount = Number(hitOverride);
    else hitCount = archiverSubstatHitSum(x.substats);

    if (!Number.isFinite(hitCount)) hitCount = 0;

    const mainStat = x.mainstat != null ? String(x.mainstat) : undefined;
    const loc = x.location != null && String(x.location) !== '' ? String(x.location) : undefined;
    const setId = x.set_id != null ? String(x.set_id) : undefined;

    const subStats = Array.isArray(x.substats)
      ? (x.substats as { key?: string; value?: number; count?: number }[])
          .filter((s) => s && typeof s === 'object' && s.key)
          .map((s) => {
            const cnt = s.count;
            const count =
              typeof cnt === 'number' && Number.isFinite(cnt) ? cnt : undefined;
            return {
              name: String(s.key),
              value: s.value != null ? String(s.value) : undefined,
              count,
            };
          })
      : undefined;

    return {
      id: uid,
      set: setName,
      setId,
      slot,
      mainStat,
      subStats,
      hitCount,
      characterId: loc,
    };
  });
}

export function parsePayload(raw: unknown): { characters: CharacterInput[]; relics: RelicInput[] } {
  if (!raw || typeof raw !== 'object') throw new Error('JSON 须为对象');
  const o = raw as Record<string, unknown>;
  if (isArchiverReliquaryExport(raw)) {
    return { characters: [], relics: parseArchiverRelics(raw) };
  }
  const chars = o.characters;
  const rels = o.relics;
  if (!Array.isArray(chars)) throw new Error('缺少 characters 数组');
  if (!Array.isArray(rels)) throw new Error('缺少 relics 数组');

  const characters: CharacterInput[] = chars.map((c, i) => {
    if (!c || typeof c !== 'object') throw new Error(`characters[${i}] 无效`);
    const x = c as Record<string, unknown>;
    const id = String(x.id ?? '');
    const name = String(x.name ?? '');
    if (!id) throw new Error(`characters[${i}].id 必填`);
    if (!name) throw new Error(`characters[${i}].name 必填`);
    const cavernSets = Array.isArray(x.cavernSets) ? x.cavernSets.map(String) : [];
    const planarSets = Array.isArray(x.planarSets) ? x.planarSets.map(String) : [];
    return { id, name, cavernSets, planarSets };
  });

  const relics: RelicInput[] = rels.map((r, i) => {
    if (!r || typeof r !== 'object') throw new Error(`relics[${i}] 无效`);
    const x = r as Record<string, unknown>;
    const id = String(x.id ?? '');
    const set = String(x.set ?? '');
    const slot = String(x.slot ?? '');
    if (!id) throw new Error(`relics[${i}].id 必填`);
    if (!set) throw new Error(`relics[${i}].set 必填`);
    if (!slot) throw new Error(`relics[${i}].slot 必填`);
    const hitRaw = x.hitCount;
    const hitCount =
      typeof hitRaw === 'number' && Number.isFinite(hitRaw) ? hitRaw : Number(hitRaw);
    if (!Number.isFinite(hitCount)) throw new Error(`relics[${i}].hitCount 须为数字`);
    let category: 'cavern' | 'planar' | undefined;
    if (x.category === 'cavern' || x.category === 'planar') category = x.category;
    const characterId = x.characterId == null || x.characterId === '' ? undefined : String(x.characterId);
    const name = x.name != null ? String(x.name) : undefined;
    const mainStat = x.mainStat != null ? String(x.mainStat) : undefined;
    const subStats = Array.isArray(x.subStats)
      ? (x.subStats as { name?: string; value?: string; count?: number }[])
          .filter((s) => s && typeof s === 'object' && s.name)
          .map((s) => ({
            name: String(s.name),
            value: s.value != null ? String(s.value) : undefined,
            count:
              typeof s.count === 'number' && Number.isFinite(s.count) ? s.count : undefined,
          }))
      : undefined;
    return {
      id,
      name,
      set,
      category,
      slot,
      mainStat,
      subStats,
      hitCount,
      characterId,
    };
  });

  return { characters, relics };
}

function sortRelicsByHit(a: RelicInput, b: RelicInput): number {
  return b.hitCount - a.hitCount;
}

/** 内容集合规则 + 背包遗器：每个角色 × 每套方案一盒 */
export function buildLoadoutBoxes(rules: CharacterRule[], relics: RelicInput[]): LoadoutBoxPayload[] {
  const norm = normalizeCharacterRules(rules);
  const boxes: LoadoutBoxPayload[] = [];

  for (const rule of norm) {
    const charLabel = rule.displayName?.trim() || rule.characterId;
    for (const loadout of rule.loadouts) {
      const matched: LoadoutBoxPayload['relics'] = [];

      for (const r of relics) {
        const cat = inferCategory(r.slot, r.category);
        if (!setMatchesLoadout(r.set, cat, loadout)) continue;

        const loc = r.characterId;
        if (loc && loc !== rule.characterId) continue;

        if (loc === rule.characterId) {
          matched.push({ ...r, category: cat, matchReason: 'equipped' });
        } else if (!loc) {
          matched.push({ ...r, category: cat, matchReason: 'rule', duplicate: true });
        }
      }

      matched.sort((a, b) => sortRelicsByHit(a, b));
      boxes.push({
        entryId: rule.entryId,
        characterId: rule.characterId,
        characterLabel: charLabel,
        loadoutId: loadout.id,
        loadoutName: loadout.name,
        cavernSets: [...loadout.cavernSets],
        planarSets: [...loadout.planarSets],
        effectiveSubstats: [...(loadout.effectiveSubstats ?? [])],
        relics: matched,
      });
    }
  }

  return boxes;
}

export function buildRelicBoxes(characters: CharacterInput[], relics: RelicInput[]): RelicBoxPayload[] {
  const byChar = new Map<string, RelicBoxPayload>();
  for (const c of characters) {
    byChar.set(c.id, { character: c, relics: [] });
  }

  for (const r of relics) {
    const cat = inferCategory(r.slot, r.category);
    if (r.characterId && byChar.has(r.characterId)) {
      byChar.get(r.characterId)!.relics.push({ ...r, category: cat, matchReason: 'assigned' });
    }
  }

  for (const r of relics) {
    if (r.characterId && byChar.has(r.characterId)) continue;
    const cat = inferCategory(r.slot, r.category);
    const relic = { ...r, category: cat };
    for (const c of characters) {
      if (!setMatchesCharacter(relic.set, cat, c)) continue;
      byChar.get(c.id)!.relics.push({ ...relic, matchReason: 'rule', duplicate: true });
    }
  }

  for (const box of byChar.values()) {
    box.relics.sort((a, b) => sortRelicsByHit(a, b));
  }

  return characters.map((c) => byChar.get(c.id)!);
}

function setRowKey(setName: string, kind: 'cavern' | 'planar'): string {
  return `${kind}\0${setName}`;
}

function collectDemandFromRules(rules: CharacterRule[]): Map<
  string,
  { setName: string; kind: 'cavern' | 'planar'; charIds: Set<string>; loadoutKeys: Set<string> }
> {
  const setMeta = new Map<string, { setName: string; kind: 'cavern' | 'planar'; charIds: Set<string>; loadoutKeys: Set<string> }>();

  for (const rule of rules) {
    for (const lo of rule.loadouts) {
      const lk = `${rule.entryId}::${lo.id}`;
      for (const s of lo.cavernSets) {
        const k = setRowKey(s, 'cavern');
        if (!setMeta.has(k))
          setMeta.set(k, { setName: s, kind: 'cavern', charIds: new Set(), loadoutKeys: new Set() });
        setMeta.get(k)!.charIds.add(rule.characterId);
        setMeta.get(k)!.loadoutKeys.add(lk);
      }
      for (const s of lo.planarSets) {
        const k = setRowKey(s, 'planar');
        if (!setMeta.has(k))
          setMeta.set(k, { setName: s, kind: 'planar', charIds: new Set(), loadoutKeys: new Set() });
        setMeta.get(k)!.charIds.add(rule.characterId);
        setMeta.get(k)!.loadoutKeys.add(lk);
      }
    }
  }
  return setMeta;
}

/** 集体刷取：需求来自内容集合中全部方案的套装并集 */
export function computeCollectiveFarmFromRules(rules: CharacterRule[], relics: RelicInput[]): SetFarmRow[] {
  const norm = normalizeCharacterRules(rules);
  const setMeta = collectDemandFromRules(norm);
  const bySetKind = new Map<string, number[]>();
  for (const r of relics) {
    const kind = inferCategory(r.slot, r.category);
    const k = setRowKey(r.set, kind);
    const arr = bySetKind.get(k) ?? [];
    arr.push(r.hitCount);
    bySetKind.set(k, arr);
  }

  const rows: SetFarmRow[] = [];

  for (const [, meta] of setMeta) {
    const k = setRowKey(meta.setName, meta.kind);
    const hits = bySetKind.get(k) ?? [];
    const setName = meta.setName;
    const ownedCount = hits.length;
    let minHit: number | null = null;
    let avgHit: number | null = null;
    let maxHit: number | null = null;
    if (hits.length) {
      minHit = Math.min(...hits);
      maxHit = Math.max(...hits);
      avgHit = hits.reduce((a, b) => a + b, 0) / hits.length;
    }
    const demandCharacters = meta.charIds.size;
    const demandLoadouts = meta.loadoutKeys.size;
    const quality =
      ownedCount === 0 ? 0 : (avgHit as number) * 0.65 + (minHit as number) * 0.35;
    const farmScore =
      demandLoadouts * (ownedCount === 0 ? 1e6 : Math.max(0.01, 24 - quality));

    let label: string;
    if (ownedCount === 0) label = '背包中暂无该套装，建议优先刷取';
    else if ((avgHit as number) < 4 || (minHit as number) < 2)
      label = '整体词条命中偏低，可作为调整与替换重点';
    else label = '相对饱和，可按方案盒内单品继续优化';

    rows.push({
      setName,
      kind: meta.kind,
      demandCharacters,
      demandLoadouts,
      ownedCount,
      minHit,
      avgHit,
      maxHit,
      farmScore,
      label,
    });
  }

  rows.sort((a, b) => {
    if (a.ownedCount === 0 && b.ownedCount > 0) return -1;
    if (b.ownedCount === 0 && a.ownedCount > 0) return 1;
    if (a.farmScore !== b.farmScore) return b.farmScore - a.farmScore;
    const av = (a.avgHit ?? 0) - (b.avgHit ?? 0);
    if (av !== 0) return av;
    return (a.minHit ?? 999) - (b.minHit ?? 999);
  });

  return rows;
}

/** @deprecated 使用 computeCollectiveFarmFromRules */
export function computeCollectiveFarmPriority(
  characters: CharacterInput[],
  relics: RelicInput[]
): SetFarmRow[] {
  const rules: CharacterRule[] = characters.map((c, idx) => ({
    entryId: `legacy-${c.id}-${idx}`,
    characterId: c.id,
    displayName: c.name,
    loadouts: [
      {
        id: 'default',
        name: '默认',
        cavernSets: c.cavernSets,
        planarSets: c.planarSets,
        effectiveSubstats: [],
      },
    ],
  }));
  return computeCollectiveFarmFromRules(rules, relics);
}

/** 内置简版示例（无 Archiver 文件时演示 UI） */
export const SAMPLE_JSON = `{
  "characters": [
    {
      "id": "jingliu",
      "name": "镜流",
      "cavernSets": ["密林卧雪的猎人"],
      "planarSets": ["停转的萨尔索图"]
    }
  ],
  "relics": [
    {
      "id": "demo-1",
      "name": "Head piece",
      "set": "Hunter of Glacial Forest",
      "slot": "Head",
      "mainStat": "HP",
      "hitCount": 6,
      "characterId": "jingliu"
    },
    {
      "id": "demo-2",
      "set": "Hunter of Glacial Forest",
      "slot": "Hands",
      "hitCount": 4,
      "characterId": "jingliu"
    }
  ]
}`;
