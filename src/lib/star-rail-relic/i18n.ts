/**
 * Reliquary Archiver 等英文导出 → 中文展示（套装名、部位、主/副词条 key）
 * 未命中映射时回退原文，避免空白。
 */

/** 隧洞 / 位面套装英文名 → 简中（与游戏内常用译名对齐） */
export const RELIC_SET_ZH: Record<string, string> = {
  'Musketeer of Wild Wheat': '野穗伴行的快枪手',
  'Thief of Shooting Meteor': '流星追迹的怪盗',
  'Hunter of Glacial Forest': '密林卧雪的猎人',
  'Passerby of Wandering Cloud': '云无留迹的过客',
  'Guard of Wuthering Snow': '戍卫风雪的铁卫',
  'Champion of Streetwise Boxing': '街头出身的拳王',
  'Eagle of Twilight Line': '晨昏交界的翔鹰',
  'Genius of Brilliant Stars': '繁星璀璨的天才',
  'Band of Sizzling Thunder': '激奏雷电的乐队',
  'Knight of Purity Palace': '净庭教宗的圣骑士',
  'Messenger Traversing Hackerspace': '骇域漫游的信使',
  'Longevous Disciple': '宝命长存的莳者',
  'Wastelander of Banditry Desert': '盗匪荒漠的废土客',
  'Ashblazing Grand Duke': '毁烬焚骨的大公',
  'Prisoner in Deep Confinement': '幽锁深牢的系囚',
  'Pioneer Diver of Dead Waters': '死水深潜的先驱',
  'Iron Cavalry Against the Scourge': '荡涤妖邪的铁骑',
  'The Wind-Soaring Valorous': '风举云飞的勇烈',
  "Sacerdos' Relived Ordeal": '重循苦旅的司铎',
  'Scholar Lost in Erudition': '识海迷途的学者',
  'Hero of Triumphant Song': '凯歌祝捷的英豪',
  'Warrior of Wilderness Wind': '荒墟的访客',
  'Fleet of the Ageless': '不老者的仙舟',
  'Space Sealing Station': '太空封印站',
  'Inert Salsotto': '停转的萨尔索图',
  'Talia: Kingdom of Banditry': '盗贼公国塔利亚',
  'Sprightly Vonwacq': '生命的翁瓦克',
  'Pan-Cosmic Commercial Enterprise': '泛银河商业公司',
  'Celestial Differentiator': '星体差分机',
  'Broken Keel': '折断的龙骨',
  'Firmament Frontline: Glamoth': '苍穹战线格拉默',
  'Penacony, Land of the Dreams': '匹诺康尼',
  'Sigonia, the Unclaimed Desolation': '无主荒星茨冈尼亚',
  'Izumo Gensei and Takama Divine Realm': '出云显世与高天神国',
  'Duran, Dynasty of Running Wolves': '奔狼的都蓝王朝',
  'Forge of the Kalpagni Lantern': '劫火莲灯铸炼宫',
  'Lushaka, the Sunken Seas': '沉海露莎卡',
};

export function translateRelicSet(en: string): string {
  return RELIC_SET_ZH[en] ?? en;
}

/** 口语/简称 → Archiver 英文套装名（可在此补充你自己的叫法） */
export const RELIC_SET_ALIAS_ZH: Record<string, string> = {
  死水套: 'Pioneer Diver of Dead Waters',
  铁骑套: 'Iron Cavalry Against the Scourge',
  盗贼套: 'Thief of Shooting Meteor',
  信使套: 'Messenger Traversing Hackerspace',
  量子套: 'Genius of Brilliant Stars',
  莳者套: 'Longevous Disciple',
  大公套: 'Ashblazing Grand Duke',
  系囚套: 'Prisoner in Deep Confinement',
};

let relicZhToEnCache: Record<string, string> | null = null;

/** 简中全名或别名 → Archiver 的 relic.name（英文） */
export function getRelicZhToEnMap(): Record<string, string> {
  if (relicZhToEnCache) return relicZhToEnCache;
  const m: Record<string, string> = { ...RELIC_SET_ALIAS_ZH };
  for (const [en, zh] of Object.entries(RELIC_SET_ZH)) {
    if (!(zh in m)) m[zh] = en;
  }
  relicZhToEnCache = m;
  return m;
}

/**
 * 配置里写的套装名 → 与存档 JSON 一致用于匹配的英文名。
 * 已是英文名则原样返回；简中全名或 RELIC_SET_ALIAS_ZH 里的别名会转换。
 */
export function resolveRelicSetNameForArchiver(input: string): string {
  const t = input.trim();
  if (!t) return t;
  if (t in RELIC_SET_ZH) return t;
  const map = getRelicZhToEnMap();
  if (map[t]) return map[t];
  return t;
}

const SLOT_ZH: Record<string, string> = {
  Head: '头部',
  Hands: '手部',
  Body: '躯干部位',
  Feet: '脚部',
  'Planar Sphere': '位面球',
  'Link Rope': '连结绳',
  head: '头部',
  hands: '手部',
  body: '躯干部位',
  feet: '脚部',
};

export function translateSlot(slot: string): string {
  return SLOT_ZH[slot] ?? SLOT_ZH[slot.charAt(0).toUpperCase() + slot.slice(1)] ?? slot;
}

/** 与游戏 6 部位一一对应，用于分列展示 */
export type RelicSlotColumnId = 'head' | 'hands' | 'body' | 'feet' | 'planar_sphere' | 'link_rope';

export const RELIC_SLOT_COLUMNS: readonly { id: RelicSlotColumnId; label: string }[] = [
  { id: 'head', label: '头部' },
  { id: 'hands', label: '手部' },
  { id: 'body', label: '躯干' },
  { id: 'feet', label: '脚部' },
  { id: 'planar_sphere', label: '位面球' },
  { id: 'link_rope', label: '连结绳' },
] as const;

/** 将 Archiver / 简版 JSON 的 slot 归一到六列之一 */
export function normalizeRelicSlotColumn(slot: string): RelicSlotColumnId | null {
  const t = slot.trim();
  const l = t.toLowerCase();
  if (l === 'head' || t.includes('头部')) return 'head';
  if (l === 'hands' || t.includes('手部')) return 'hands';
  if (l === 'body' || t.includes('躯干')) return 'body';
  if (l === 'feet' || t.includes('脚部')) return 'feet';
  if (l === 'planar sphere' || l.includes('sphere') || t.includes('位面球')) return 'planar_sphere';
  if (l === 'link rope' || (l.includes('link') && l.includes('rope')) || t.includes('连结绳') || t.includes('连接绳'))
    return 'link_rope';
  return null;
}

/** Archiver 副词条 / 主属性 key → 简中 */
const STAT_ZH: Record<string, string> = {
  HP: '生命值',
  HP_: '生命值%',
  ATK: '攻击力',
  ATK_: '攻击力%',
  DEF: '防御力',
  DEF_: '防御力%',
  SPD: '速度',
  'CRIT Rate': '暴击率',
  'CRIT Rate_': '暴击率',
  'CRIT DMG': '暴击伤害',
  'CRIT DMG_': '暴击伤害',
  'Break Effect': '击破特攻',
  'Break Effect_': '击破特攻',
  'Effect Hit Rate': '效果命中',
  'Effect Hit Rate_': '效果命中',
  'Energy Regeneration Rate': '能量恢复效率',
  'Outgoing Healing Boost': '治疗量加成',
  'Physical DMG Boost': '物理属性伤害提高',
  'Fire DMG Boost': '火属性伤害提高',
  'Ice DMG Boost': '冰属性伤害提高',
  'Lightning DMG Boost': '雷属性伤害提高',
  'Wind DMG Boost': '风属性伤害提高',
  'Quantum DMG Boost': '量子属性伤害提高',
  'Imaginary DMG Boost': '虚数属性伤害提高',
};

export function translateStatKey(key: string): string {
  const trimmed = key.trim();
  if (STAT_ZH[trimmed]) return STAT_ZH[trimmed];
  const noTrail = trimmed.replace(/_+$/, '');
  if (STAT_ZH[noTrail]) return STAT_ZH[noTrail];
  if (STAT_ZH[trimmed + '_']) return STAT_ZH[trimmed + '_'];
  return trimmed;
}

/** 中文常用叫法 → Archiver 可能出现的 key 变体（用于有效词条匹配） */
const ZH_EFFECTIVE_TO_KEYS: Record<string, string[]> = {
  暴击率: ['CRIT Rate', 'CRIT Rate_'],
  暴击: ['CRIT Rate', 'CRIT Rate_', 'CRIT DMG', 'CRIT DMG_'],
  爆伤: ['CRIT DMG', 'CRIT DMG_'],
  暴击伤害: ['CRIT DMG', 'CRIT DMG_'],
  速度: ['SPD'],
  击破: ['Break Effect', 'Break Effect_'],
  击破特攻: ['Break Effect', 'Break Effect_'],
  攻击: ['ATK', 'ATK_'],
  攻击力: ['ATK', 'ATK_'],
  大攻击: ['ATK_'],
  生命: ['HP', 'HP_'],
  防御: ['DEF', 'DEF_'],
  效果命中: ['Effect Hit Rate', 'Effect Hit Rate_'],
  命中: ['Effect Hit Rate', 'Effect Hit Rate_'],
  充能: ['Energy Regeneration Rate'],
  能量恢复: ['Energy Regeneration Rate'],
  治疗: ['Outgoing Healing Boost'],
  治疗量加成: ['Outgoing Healing Boost'],
  防御力: ['DEF', 'DEF_'],
  生命值: ['HP', 'HP_'],
};

function normStat(s: string): string {
  return s
    .trim()
    .replace(/_+$/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/** 是否将 Archiver 副词条 key 视为某条「有效词条」配置命中 */
export function substatMatchesEffective(archiverKey: string, effectiveToken: string): boolean {
  const k = normStat(archiverKey);
  const t = effectiveToken.trim();
  if (!t) return false;
  if (normStat(t) === k) return true;
  const expanded = ZH_EFFECTIVE_TO_KEYS[t];
  if (expanded) {
    return expanded.some((c) => normStat(c) === k || k.startsWith(normStat(c)) || normStat(c).startsWith(k));
  }
  const enZh = translateStatKey(t);
  if (enZh !== t && normStat(enZh) === k) return false;
  return normStat(t) === k || k.includes(normStat(t)) || normStat(t).includes(k);
}

/** 把配置里的一条有效词条 token 展开为用于匹配的 key 列表 */
export function expandEffectiveTokens(tokens: string[]): string[] {
  const out = new Set<string>();
  for (const raw of tokens) {
    const t = raw.trim();
    if (!t) continue;
    out.add(t);
    const fromZh = ZH_EFFECTIVE_TO_KEYS[t];
    if (fromZh) fromZh.forEach((x) => out.add(x));
  }
  return [...out];
}

/** 副词条中计入「有效」的 count 之和（须从 Archiver 解析时带上每行 count） */
export function effectiveSubstatRollSum(
  relic: { subStats?: { name: string; count?: number }[] },
  effectiveTokens: string[]
): number {
  const expanded = expandEffectiveTokens(effectiveTokens);
  if (!expanded.length || !relic.subStats?.length) return 0;
  let sum = 0;
  for (const line of relic.subStats) {
    if (!expanded.some((tok) => substatMatchesEffective(line.name, tok))) continue;
    sum += typeof line.count === 'number' && Number.isFinite(line.count) ? line.count : 0;
  }
  return sum;
}
