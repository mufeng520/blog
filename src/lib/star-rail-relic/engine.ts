/**
 * 崩坏：星穹铁道遗器看板 — Reliquary Archiver 导出、内容集合规则、匹配与集体套装分析
 */

import {
  effectiveSubstatRollSum,
  mainStatMatchesTarget,
  normalizeRelicSlotColumn,
  resolveRelicSetNameForArchiver,
  translateMainStatTarget,
  translateSlot,
} from './i18n';

/** 将规则里的隧洞/位面套装名统一为 Archiver 英文名（配置可写简中） */
export function normalizeCharacterRules(rules: CharacterRule[]): CharacterRule[] {
  return rules.map((r) => ({
    ...r,
    loadouts: r.loadouts.map((lo) => ({
      ...lo,
      cavernSets: lo.cavernSets.map((s) => resolveRelicSetNameForArchiver(s)),
      planarSets: lo.planarSets.map((s) => resolveRelicSetNameForArchiver(s)),
      mainStatTargets: {
        ...inferMainStatTargets(lo),
        ...normalizeMainStatTargets(lo.mainStatTargets),
      },
    })),
  }));
}

function normalizeMainStatTargets(
  input?: Record<string, string[]>
): Record<string, string[]> {
  if (!input) return {};
  const out: Record<string, string[]> = {};
  for (const [slot, targets] of Object.entries(input)) {
    const normalizedSlot = normalizeSlotKey(slot);
    if (!normalizedSlot) continue;
    const values = Array.isArray(targets)
      ? targets.map((x) => String(x).trim()).filter(Boolean)
      : [];
    if (values.length) out[normalizedSlot] = values;
  }
  return out;
}

function inferMainStatTargets(loadout: RelicLoadoutRule): Record<string, string[]> {
  const tokens = new Set((loadout.effectiveSubstats ?? []).map((token) => token.trim()).filter(Boolean));
  const nameText = `${loadout.name} ${loadout.id}`.toLowerCase();

  const hasAny = (...needles: string[]) => needles.some((needle) => tokens.has(needle));
  const mentionsAny = (...needles: string[]) => needles.some((needle) => nameText.includes(needle));

  const isHealing = mentionsAny('治疗') || hasAny('治疗', '治疗量加成');
  const isShield = mentionsAny('防御', '存护') || hasAny('防御', '防御力');
  const isDot = mentionsAny('dot', '持续') || (hasAny('效果命中') && !hasAny('暴击率', '暴击伤害'));
  const isBreak = mentionsAny('击破') || hasAny('击破', '击破特攻');
  const isCrit = hasAny('暴击率', '暴击伤害');
  const isSupport = mentionsAny('辅助') || (hasAny('效果抵抗') && !isCrit && !isDot && !isHealing);
  const prefersSpeed = hasAny('速度');

  const dominantStat = hasAny('防御', '防御力')
    ? 'DEF_'
    : hasAny('生命', '生命值')
      ? 'HP_'
      : 'ATK_';

  const bodyTargets: string[] = [];
  if (isHealing) bodyTargets.push('Outgoing Healing Boost', 'HP_');
  if (isCrit) bodyTargets.push('CRIT Rate_', 'CRIT DMG_');
  if (hasAny('效果命中')) bodyTargets.push('Effect Hit Rate_');
  if (!bodyTargets.length) bodyTargets.push(dominantStat);

  const feetTargets = prefersSpeed ? ['SPD'] : [dominantStat];

  const sphereTargets: string[] = [];
  if (isHealing) sphereTargets.push('HP_');
  else if (isShield) sphereTargets.push('DEF_');
  else if (isSupport) sphereTargets.push(dominantStat);
  else sphereTargets.push('属性球', 'ATK_');

  const ropeTargets: string[] = [];
  if (isBreak) ropeTargets.push('Break Effect');
  if (isHealing || isSupport || hasAny('效果命中')) ropeTargets.push('Energy Regeneration Rate');
  if (!ropeTargets.length || isDot || isCrit) ropeTargets.push(dominantStat);

  return {
    Head: ['HP'],
    Hands: ['ATK'],
    Body: [...new Set(bodyTargets)],
    Feet: [...new Set(feetTargets)],
    'Planar Sphere': [...new Set(sphereTargets)],
    'Link Rope': [...new Set(ropeTargets)],
  };
}

function normalizeSlotKey(slot: string): string | null {
  const trimmed = slot.trim();
  if (!trimmed) return null;
  const normalized = normalizeRelicSlotColumn(trimmed);
  switch (normalized) {
    case 'head':
      return 'Head';
    case 'hands':
      return 'Hands';
    case 'body':
      return 'Body';
    case 'feet':
      return 'Feet';
    case 'planar_sphere':
      return 'Planar Sphere';
    case 'link_rope':
      return 'Link Rope';
    default:
      return null;
  }
}

function slotPriority(slot: string): number {
  const normalized = normalizeSlotKey(slot);
  switch (normalized) {
    case 'Head':
      return 0;
    case 'Hands':
      return 1;
    case 'Body':
      return 2;
    case 'Feet':
      return 3;
    case 'Planar Sphere':
      return 4;
    case 'Link Rope':
      return 5;
    default:
      return 99;
  }
}

function slotBelongsToKind(slot: string, kind: 'cavern' | 'planar'): boolean {
  const normalized = normalizeSlotKey(slot);
  if (!normalized) return false;
  const isPlanar = normalized === 'Planar Sphere' || normalized === 'Link Rope';
  return kind === 'planar' ? isPlanar : !isPlanar;
}

function buildLoadoutDemands(rules: CharacterRule[]): LoadoutDemand[] {
  const demands: LoadoutDemand[] = [];
  for (const rule of rules) {
    const characterLabel = rule.displayName?.trim() || rule.characterId;
    for (const loadout of rule.loadouts) {
      const allSets = [
        ...loadout.cavernSets.map((setName) => ({ kind: 'cavern' as const, setName })),
        ...loadout.planarSets.map((setName) => ({ kind: 'planar' as const, setName })),
      ];
      for (const [slot, mainStatTargets] of Object.entries(loadout.mainStatTargets ?? {})) {
        const normalizedSlot = normalizeSlotKey(slot);
        if (!normalizedSlot) continue;
        const kind =
          normalizedSlot === 'Planar Sphere' || normalizedSlot === 'Link Rope' ? 'planar' : 'cavern';
        const acceptedSets = allSets
          .filter((item) => item.kind === kind)
          .map((item) => item.setName);
        if (!acceptedSets.length) continue;
        demands.push({
          key: `${rule.entryId}::${loadout.id}::${normalizedSlot}`,
          loadoutKey: `${rule.entryId}::${loadout.id}`,
          entryId: rule.entryId,
          characterId: rule.characterId,
          characterLabel,
          loadoutId: loadout.id,
          loadoutName: loadout.name,
          kind,
          setName: acceptedSets[0],
          acceptedSets,
          slot: normalizedSlot,
          slotLabel: translateSlot(normalizedSlot),
          mainStatTargets: [...mainStatTargets],
          effectiveSubstats: [...(loadout.effectiveSubstats ?? [])],
        });
      }
    }
  }
  return demands;
}

function effectiveHitScoreForDemand(relic: RelicInput, effectiveSubstats: string[]): number {
  if (!effectiveSubstats.length) return relic.hitCount;
  return effectiveSubstatRollSum(relic, effectiveSubstats);
}

/** 与 `src/content.config.ts` 中 starRailRelicRules 集合 schema 一致 */
export interface RelicLoadoutRule {
  id: string;
  name: string;
  cavernSets: string[];
  planarSets: string[];
  /** 本方案有效副词条（与 Archiver substats[].key 或中文别名匹配） */
  effectiveSubstats?: string[];
  /** 按部位限制主词条，key 可写 Head/Body/Feet/Planar Sphere/Link Rope 或中文部位 */
  mainStatTargets?: Record<string, string[]>;
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

export type LoadoutBoxMatchReason = 'equipped' | 'other_equipped' | 'rule';

export interface LoadoutBoxRelic extends RelicInput {
  matchReason: LoadoutBoxMatchReason;
  duplicate?: boolean;
  ownerCharacterId?: string | null;
  ownerCharacterLabel?: string;
  mainStatMatched?: boolean;
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
  mainStatTargets: Record<string, string[]>;
  relics: LoadoutBoxRelic[];
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
  requiredCount: number;
  matchedCount: number;
  shortageCount: number;
  shortageCharacters: string[];
  ownedCount: number;
  qualifiedCount: number;
  minHit: number | null;
  avgHit: number | null;
  maxHit: number | null;
  farmScore: number;
  effectiveSubstats: string[];
  label: string;
}

export interface SlotFarmRow {
  setName: string;
  kind: 'cavern' | 'planar';
  slot: string;
  slotLabel: string;
  demandCharacters: number;
  demandLoadouts: number;
  requiredCount: number;
  matchedCount: number;
  shortageCount: number;
  shortageCharacters: string[];
  groupedCharacterLabels: string[];
  recommendedMainStats: string[];
  effectiveSubstats: string[];
  ownedCount: number;
  matchedMainStatCount: number;
  minHit: number | null;
  avgHit: number | null;
  maxHit: number | null;
  farmScore: number;
  label: string;
}

interface LoadoutDemand {
  key: string;
  loadoutKey: string;
  entryId: string;
  characterId: string;
  characterLabel: string;
  loadoutId: string;
  loadoutName: string;
  kind: 'cavern' | 'planar';
  setName: string;
  acceptedSets: string[];
  slot: string;
  slotLabel: string;
  mainStatTargets: string[];
  effectiveSubstats: string[];
}

interface DemandCandidate {
  relicId: string;
  qualityScore: number;
  priority: number;
}

const QUALIFIED_HIT_THRESHOLD = 7;

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
  const characterLabelById = new Map(
    norm.map((rule) => [rule.characterId, rule.displayName?.trim() || rule.characterId])
  );
  const boxes: LoadoutBoxPayload[] = [];

  for (const rule of norm) {
    const charLabel = rule.displayName?.trim() || rule.characterId;
    for (const loadout of rule.loadouts) {
      const matched: LoadoutBoxPayload['relics'] = [];

      for (const r of relics) {
        const cat = inferCategory(r.slot, r.category);
        if (!setMatchesLoadout(r.set, cat, loadout)) continue;
        const normalizedSlot = normalizeSlotKey(r.slot);
        const mainStatTargets =
          normalizedSlot && loadout.mainStatTargets ? loadout.mainStatTargets[normalizedSlot] ?? [] : [];
        const mainStatMatched =
          mainStatTargets.length === 0
            ? true
            : !!r.mainStat && mainStatTargets.some((target) => mainStatMatchesTarget(r.mainStat as string, target));

        const loc = r.characterId;
        if (loc === rule.characterId) {
          matched.push({
            ...r,
            category: cat,
            matchReason: 'equipped',
            ownerCharacterId: loc,
            ownerCharacterLabel: charLabel,
            mainStatMatched,
          });
        } else if (loc) {
          matched.push({
            ...r,
            category: cat,
            matchReason: 'other_equipped',
            ownerCharacterId: loc,
            ownerCharacterLabel: characterLabelById.get(loc) ?? loc,
            mainStatMatched,
          });
        } else if (!loc) {
          matched.push({
            ...r,
            category: cat,
            matchReason: 'rule',
            duplicate: true,
            mainStatMatched,
          });
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
        mainStatTargets: { ...(loadout.mainStatTargets ?? {}) },
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
  {
    setName: string;
    kind: 'cavern' | 'planar';
    charIds: Set<string>;
    loadoutKeys: Set<string>;
    effectiveSubstats: Set<string>;
    mainStatTargets: Map<string, Set<string>>;
  }
> {
  const setMeta = new Map<
    string,
    {
      setName: string;
      kind: 'cavern' | 'planar';
      charIds: Set<string>;
      loadoutKeys: Set<string>;
      effectiveSubstats: Set<string>;
      mainStatTargets: Map<string, Set<string>>;
    }
  >();

  for (const rule of rules) {
    for (const lo of rule.loadouts) {
      const lk = `${rule.entryId}::${lo.id}`;
      for (const s of lo.cavernSets) {
        const k = setRowKey(s, 'cavern');
        if (!setMeta.has(k))
          setMeta.set(k, {
            setName: s,
            kind: 'cavern',
            charIds: new Set(),
            loadoutKeys: new Set(),
            effectiveSubstats: new Set(),
            mainStatTargets: new Map(),
          });
        setMeta.get(k)!.charIds.add(rule.characterId);
        setMeta.get(k)!.loadoutKeys.add(lk);
        for (const token of lo.effectiveSubstats ?? []) {
          if (token.trim()) setMeta.get(k)!.effectiveSubstats.add(token);
        }
        for (const [slot, targets] of Object.entries(lo.mainStatTargets ?? {})) {
          if (!slotBelongsToKind(slot, 'cavern')) continue;
          const bucket = setMeta.get(k)!.mainStatTargets.get(slot) ?? new Set<string>();
          targets.forEach((target) => {
            if (target.trim()) bucket.add(target);
          });
          if (bucket.size) setMeta.get(k)!.mainStatTargets.set(slot, bucket);
        }
      }
      for (const s of lo.planarSets) {
        const k = setRowKey(s, 'planar');
        if (!setMeta.has(k))
          setMeta.set(k, {
            setName: s,
            kind: 'planar',
            charIds: new Set(),
            loadoutKeys: new Set(),
            effectiveSubstats: new Set(),
            mainStatTargets: new Map(),
          });
        setMeta.get(k)!.charIds.add(rule.characterId);
        setMeta.get(k)!.loadoutKeys.add(lk);
        for (const token of lo.effectiveSubstats ?? []) {
          if (token.trim()) setMeta.get(k)!.effectiveSubstats.add(token);
        }
        for (const [slot, targets] of Object.entries(lo.mainStatTargets ?? {})) {
          if (!slotBelongsToKind(slot, 'planar')) continue;
          const bucket = setMeta.get(k)!.mainStatTargets.get(slot) ?? new Set<string>();
          targets.forEach((target) => {
            if (target.trim()) bucket.add(target);
          });
          if (bucket.size) setMeta.get(k)!.mainStatTargets.set(slot, bucket);
        }
      }
    }
  }
  return setMeta;
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function avgOrNull(values: number[]): number | null {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function minOrNull(values: number[]): number | null {
  return values.length ? Math.min(...values) : null;
}

function maxOrNull(values: number[]): number | null {
  return values.length ? Math.max(...values) : null;
}

function buildDemandCandidates(
  demands: LoadoutDemand[],
  relics: RelicInput[]
): Map<string, DemandCandidate[]> {
  const byDemand = new Map<string, DemandCandidate[]>();
  for (const demand of demands) {
    const candidates: DemandCandidate[] = [];
    for (const relic of relics) {
      const relicKind = inferCategory(relic.slot, relic.category);
      if (relicKind !== demand.kind) continue;
      const relicSlot = normalizeSlotKey(relic.slot);
      if (relicSlot !== demand.slot) continue;
      if (!demand.acceptedSets.includes(relic.set)) continue;
      if (!relic.mainStat) continue;
      if (!demand.mainStatTargets.some((target) => mainStatMatchesTarget(relic.mainStat as string, target))) continue;
      const qualityScore = effectiveHitScoreForDemand(relic, demand.effectiveSubstats);
      const priority =
        relic.characterId === demand.characterId ? 0 : relic.characterId ? 1 : 2;
      candidates.push({
        relicId: relic.id,
        qualityScore,
        priority,
      });
    }
    candidates.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.qualityScore - a.qualityScore;
    });
    byDemand.set(demand.key, candidates);
  }
  return byDemand;
}

function assignQualifiedDemands(
  demands: LoadoutDemand[],
  candidateMap: Map<string, DemandCandidate[]>
): Map<string, DemandCandidate | null> {
  const assignedRelics = new Set<string>();
  const result = new Map<string, DemandCandidate | null>();
  const orderedDemands = [...demands].sort((a, b) => {
    const candA = candidateMap.get(a.key) ?? [];
    const candB = candidateMap.get(b.key) ?? [];
    return candA.length - candB.length;
  });

  for (const demand of orderedDemands) {
    const candidates = (candidateMap.get(demand.key) ?? []).filter(
      (candidate) =>
        candidate.qualityScore >= QUALIFIED_HIT_THRESHOLD &&
        !assignedRelics.has(candidate.relicId)
    );
    const chosen = candidates[0] ?? null;
    if (chosen) assignedRelics.add(chosen.relicId);
    result.set(demand.key, chosen);
  }

  return result;
}

/** 集体刷取：需求来自内容集合中全部方案的套装并集 */
export function computeCollectiveFarmFromRules(
  rules: CharacterRule[],
  relics: RelicInput[]
): { overview: SetFarmRow[]; slotPlans: SlotFarmRow[] } {
  const norm = normalizeCharacterRules(rules);
  const setMeta = collectDemandFromRules(norm);
  const demands = buildLoadoutDemands(norm);
  const candidateMap = buildDemandCandidates(demands, relics);
  const assignedMap = assignQualifiedDemands(demands, candidateMap);
  const bySetKind = new Map<string, number[]>();
  const relicsBySetKindSlot = new Map<string, RelicInput[]>();
  for (const r of relics) {
    const kind = inferCategory(r.slot, r.category);
    const k = setRowKey(r.set, kind);
    const arr = bySetKind.get(k) ?? [];
    arr.push(r.hitCount);
    bySetKind.set(k, arr);

    const slotKey = normalizeSlotKey(r.slot) ?? r.slot;
    const slotBucketKey = `${k}\0${slotKey}`;
    const slotArr = relicsBySetKindSlot.get(slotBucketKey) ?? [];
    slotArr.push({ ...r, category: kind });
    relicsBySetKindSlot.set(slotBucketKey, slotArr);
  }

  const rows: SetFarmRow[] = [];
  const slotPlans: SlotFarmRow[] = [];

  for (const [, meta] of setMeta) {
    const k = setRowKey(meta.setName, meta.kind);
    const hits = bySetKind.get(k) ?? [];
    const relatedDemands = demands.filter(
      (demand) => demand.kind === meta.kind && demand.acceptedSets.includes(meta.setName)
    );
    const setName = meta.setName;
    const ownedCount = hits.length;
    const qualifiedCount = relatedDemands.reduce((sum, demand) => {
      const qualified = (candidateMap.get(demand.key) ?? []).filter(
        (candidate) => candidate.qualityScore >= QUALIFIED_HIT_THRESHOLD
      ).length;
      return sum + qualified;
    }, 0);
    const matchedDemands = relatedDemands.filter((demand) => assignedMap.get(demand.key)).length;
    const shortageDemands = relatedDemands.filter((demand) => !assignedMap.get(demand.key));
    const shortageCharacters = [...new Set(shortageDemands.map((demand) => demand.characterLabel))];
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
    const shortageCount = shortageDemands.length;
    const farmScore =
      shortageCount > 0
        ? shortageCount * 1000 + demandLoadouts * Math.max(0.01, 12 - Math.min(quality, 12))
        : demandLoadouts * Math.max(0.01, 12 - Math.min(quality, 12));

    let label: string;
    if (shortageCount > 0) {
      label = `仍有 ${shortageCharacters.join('、')} 无法分配到 7 词条以上的合格件`;
    } else if ((avgHit as number) < 4 || (minHit as number) < 2) {
      label = '虽能分配，但整体有效词条质量偏低，可继续优化';
    } else {
      label = '当前角色层面可满足需求，暂不缺货';
    }

    rows.push({
      setName,
      kind: meta.kind,
      demandCharacters,
      demandLoadouts,
      requiredCount: relatedDemands.length,
      matchedCount: matchedDemands,
      shortageCount,
      shortageCharacters,
      ownedCount,
      qualifiedCount,
      minHit,
      avgHit,
      maxHit,
      farmScore,
      effectiveSubstats: [...meta.effectiveSubstats],
      label,
    });

    const slotDemands = relatedDemands.filter((demand) => demand.slot);
    for (const demand of slotDemands) {
      const slotBucketKey = `${k}\0${demand.slot}`;
      const slotRelics = relicsBySetKindSlot.get(slotBucketKey) ?? [];
      const matchedMainStatRelics = slotRelics.filter(
        (relic) =>
          relic.mainStat &&
          demand.mainStatTargets.some((target) => mainStatMatchesTarget(relic.mainStat as string, target))
      );
      const hits = matchedMainStatRelics.map((relic) => effectiveHitScoreForDemand(relic, demand.effectiveSubstats));
      const ownedCount = slotRelics.length;
      const matchedMainStatCount = matchedMainStatRelics.length;
      const matchedCount = assignedMap.get(demand.key) ? 1 : 0;
      const shortageCount = matchedCount === 1 ? 0 : 1;
      const shortageCharacters = shortageCount ? [demand.characterLabel] : [];
      const minHit = minOrNull(hits);
      const maxHit = maxOrNull(hits);
      const avgHit = avgOrNull(hits);
      const quality =
        matchedMainStatCount === 0 || avgHit == null || minHit == null
          ? 0
          : avgHit * 0.65 + minHit * 0.35;
      const missingMainStatPenalty = matchedMainStatCount === 0 ? 36 : Math.max(0.01, 20 - quality);
      const farmScore =
        shortageCount > 0
          ? 1000 + missingMainStatPenalty
          : missingMainStatPenalty;

      let slotLabel: string;
      if (shortageCount > 0) {
        slotLabel = `${demand.characterLabel} 还缺 7 词条以上的 ${translateSlot(demand.slot)}`;
      } else if ((avgHit ?? 0) < 4 || (minHit ?? 0) < 2) {
        slotLabel = `${demand.characterLabel} 已可分配，但 ${translateSlot(demand.slot)} 质量偏低`;
      } else {
        slotLabel = `${demand.characterLabel} 该部位已满足`;
      }

      slotPlans.push({
        setName: demand.setName,
        kind: demand.kind,
        slot: demand.slot,
        slotLabel: demand.slotLabel,
        demandCharacters: 1,
        demandLoadouts: 1,
        requiredCount: 1,
        matchedCount,
        shortageCount,
        shortageCharacters,
        groupedCharacterLabels: [demand.characterLabel],
        recommendedMainStats: demand.mainStatTargets.map((target) => translateMainStatTarget(target)),
        effectiveSubstats: [...demand.effectiveSubstats],
        ownedCount,
        matchedMainStatCount,
        minHit,
        avgHit,
        maxHit,
        farmScore,
        label: slotLabel,
      });
    }
  }

  rows.sort((a, b) => {
    if (a.ownedCount === 0 && b.ownedCount > 0) return -1;
    if (b.ownedCount === 0 && a.ownedCount > 0) return 1;
    if (a.farmScore !== b.farmScore) return b.farmScore - a.farmScore;
    const av = (a.avgHit ?? 0) - (b.avgHit ?? 0);
    if (av !== 0) return av;
    return (a.minHit ?? 999) - (b.minHit ?? 999);
  });

  slotPlans.sort((a, b) => {
    if (a.matchedMainStatCount === 0 && b.matchedMainStatCount > 0) return -1;
    if (b.matchedMainStatCount === 0 && a.matchedMainStatCount > 0) return 1;
    if (a.farmScore !== b.farmScore) return b.farmScore - a.farmScore;
    const setCmp = a.setName.localeCompare(b.setName, 'zh');
    if (setCmp !== 0) return setCmp;
    return slotPriority(a.slot) - slotPriority(b.slot);
  });

  return { overview: rows, slotPlans };
}

/** @deprecated 使用 computeCollectiveFarmFromRules */
export function computeCollectiveFarmPriority(
  characters: CharacterInput[],
  relics: RelicInput[]
): { overview: SetFarmRow[]; slotPlans: SlotFarmRow[] } {
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
        mainStatTargets: {},
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
