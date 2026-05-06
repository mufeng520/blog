import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SAMPLE_JSON,
  buildLoadoutBoxes,
  computeCollectiveFarmFromRules,
  isArchiverReliquaryExport,
  parsePayload,
  type CharacterRule,
  type LoadoutBoxPayload,
  type RelicInput,
} from '../lib/star-rail-relic/engine';
import {
  RELIC_SLOT_COLUMNS,
  effectiveSubstatRollSum,
  normalizeRelicSlotColumn,
  substatMatchesEffective,
  translateRelicSet,
  translateStatKey,
  type RelicSlotColumnId,
} from '../lib/star-rail-relic/i18n';

type BoxRelic = LoadoutBoxPayload['relics'][number];

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    maxWidth: 1320,
    margin: '0 auto',
    padding: '20px 12px 40px',
    fontFamily: '"PingFang SC","Microsoft YaHei",system-ui,sans-serif',
    color: '#e8ecf4',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: 6,
    letterSpacing: '0.02em',
    background: 'linear-gradient(90deg,#c4b5fd,#38bdf8)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  },
  sub: { color: '#94a3b8', fontSize: '0.82rem', marginBottom: 16, lineHeight: 1.55 },
  panel: {
    background: 'linear-gradient(145deg,#1e293b 0%,#0f172a 100%)',
    border: '1px solid rgba(148,163,184,0.22)',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 14,
    boxShadow: '0 6px 24px rgba(0,0,0,0.28)',
  },
  panelTight: {
    background: 'linear-gradient(145deg,#1e293b 0%,#0f172a 100%)',
    border: '1px solid rgba(148,163,184,0.22)',
    borderRadius: 10,
    padding: '10px 12px',
    marginBottom: 14,
    boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
  },
  row: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  btn: {
    cursor: 'pointer',
    border: '1px solid rgba(56,189,248,0.45)',
    background: 'rgba(56,189,248,0.12)',
    color: '#7dd3fc',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: '0.8rem',
  },
  btnGhost: {
    cursor: 'pointer',
    border: '1px solid rgba(148,163,184,0.35)',
    background: 'transparent',
    color: '#cbd5e1',
    padding: '6px 12px',
    borderRadius: 8,
    fontSize: '0.8rem',
  },
  btnLink: {
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: '#94a3b8',
    fontSize: '0.78rem',
    textDecoration: 'underline',
    padding: '4px 6px',
  },
  textareaSm: {
    width: '100%',
    minHeight: 72,
    maxHeight: 220,
    boxSizing: 'border-box',
    borderRadius: 8,
    border: '1px solid rgba(148,163,184,0.28)',
    background: 'rgba(15,23,42,0.85)',
    color: '#e2e8f0',
    padding: 8,
    fontSize: '0.75rem',
    fontFamily: 'ui-monospace,SFMono-Regular,Consolas,monospace',
    resize: 'vertical' as const,
  },
  err: { color: '#fca5a5', fontSize: '0.8rem', marginTop: 6 },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '0.82rem' },
  th: {
    textAlign: 'left' as const,
    padding: '8px 6px',
    borderBottom: '1px solid rgba(148,163,184,0.22)',
    color: '#94a3b8',
    fontWeight: 500,
    fontSize: '0.78rem',
  },
  td: {
    padding: '8px 6px',
    borderBottom: '1px solid rgba(30,41,59,0.85)',
    verticalAlign: 'top' as const,
  },
  badge: {
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: 999,
    fontSize: '0.65rem',
    marginRight: 4,
    marginBottom: 2,
    background: 'rgba(167,139,250,0.2)',
    color: '#ddd6fe',
  },
  hit: { fontVariantNumeric: 'tabular-nums' as const, fontWeight: 700, color: '#fbbf24' },
  card: {
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: 12,
    padding: '12px 14px',
    background: 'rgba(15,23,42,0.6)',
  },
  cardTitle: { fontSize: '0.95rem', fontWeight: 600, marginBottom: 2, color: '#f1f5f9' },
  muted: { color: '#64748b', fontSize: '0.75rem' },
  hint: { color: '#64748b', fontSize: '0.72rem', marginTop: 6, lineHeight: 1.45 },
  ruleChip: {
    display: 'inline-block',
    margin: '2px 4px 2px 0',
    padding: '2px 8px',
    borderRadius: 6,
    background: 'rgba(51,65,85,0.55)',
    fontSize: '0.72rem',
    color: '#cbd5e1',
  },
  select: {
    width: '100%',
    maxWidth: 420,
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid rgba(148,163,184,0.32)',
    background: 'rgba(15,23,42,0.95)',
    color: '#e2e8f0',
    fontSize: '0.88rem',
    marginBottom: 10,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px 16px',
    fontSize: '0.8rem',
    lineHeight: 1.55,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  summaryStrong: { color: '#f1f5f9', fontWeight: 600 },
  effTag: {
    display: 'inline-block',
    margin: '2px 4px 2px 0',
    padding: '1px 6px',
    borderRadius: 4,
    fontSize: '0.68rem',
    background: 'rgba(52,211,153,0.12)',
    color: '#6ee7b7',
    border: '1px solid rgba(52,211,153,0.28)',
  },
  subEff: { color: '#a7f3d0', fontWeight: 500 },
  slotCol: {
    minWidth: 0,
    border: '1px solid rgba(51,65,85,0.55)',
    borderRadius: 10,
    background: 'rgba(15,23,42,0.45)',
    padding: '8px 6px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
  },
  slotColHead: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#94a3b8',
    textAlign: 'center' as const,
    paddingBottom: 6,
    borderBottom: '1px solid rgba(51,65,85,0.5)',
    letterSpacing: '0.04em',
  },
  slotColBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    minHeight: 48,
    maxHeight: 520,
    overflowY: 'auto' as const,
  },
  relicCard: {
    borderRadius: 8,
    padding: '6px 6px',
    background: 'rgba(30,41,59,0.55)',
    border: '1px solid rgba(71,85,105,0.35)',
    fontSize: '0.7rem',
    lineHeight: 1.35,
  },
  relicSet: {
    color: '#e2e8f0',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    display: 'block',
  },
  relicMeta: { color: '#64748b', marginTop: 2, fontSize: '0.65rem' },
  relicHits: {
    marginTop: 4,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.65rem',
    color: '#94a3b8',
  },
  subWrap: {
    marginTop: 3,
    color: '#64748b',
    fontSize: '0.62rem',
    maxHeight: '2.8em',
    overflow: 'hidden',
    lineHeight: 1.4,
  },
};

function boxKey(box: LoadoutBoxPayload): string {
  return `${box.entryId}::${box.loadoutId}`;
}

function buildEffectiveRules(
  characterRules: CharacterRule[],
  parsed: ReturnType<typeof parsePayload>
): CharacterRule[] {
  if (characterRules.length > 0) return characterRules;
  return parsed.characters.map((c, i) => ({
    entryId: `inline-${c.id}-${i}`,
    characterId: c.id,
    displayName: c.name,
    loadouts: [
      {
        id: 'inline',
        name: 'JSON 内配置',
        cavernSets: c.cavernSets,
        planarSets: c.planarSets,
        effectiveSubstats: [],
      },
    ],
  }));
}

function groupRelicsBySlot(relics: BoxRelic[]): {
  byCol: Map<RelicSlotColumnId, BoxRelic[]>;
  unknown: BoxRelic[];
} {
  const byCol = new Map<RelicSlotColumnId, BoxRelic[]>();
  for (const c of RELIC_SLOT_COLUMNS) byCol.set(c.id, []);
  const unknown: BoxRelic[] = [];
  for (const r of relics) {
    const col = normalizeRelicSlotColumn(r.slot);
    if (!col) unknown.push(r);
    else byCol.get(col)!.push(r);
  }
  for (const c of RELIC_SLOT_COLUMNS) {
    byCol.get(c.id)!.sort((a, b) => b.hitCount - a.hitCount);
  }
  unknown.sort((a, b) => b.hitCount - a.hitCount);
  return { byCol, unknown };
}

function RelicSlotCard({
  rel,
  effectiveTokens,
}: {
  rel: BoxRelic;
  effectiveTokens: string[];
}) {
  const effRoll = effectiveSubstatRollSum(rel as RelicInput, effectiveTokens);
  return (
    <div style={styles.relicCard}>
      <div>
        {rel.matchReason === 'rule' ? (
          <span style={{ ...styles.badge, background: 'rgba(56,189,248,0.12)', color: '#7dd3fc' }}>仓</span>
        ) : (
          <span style={styles.badge}>装</span>
        )}
        {rel.duplicate ? (
          <span style={{ ...styles.badge, background: 'rgba(251,191,36,0.1)', color: '#fcd34d' }}>库</span>
        ) : null}
      </div>
      <span style={styles.relicSet} title={`${translateRelicSet(rel.set)}（${rel.set}）`}>
        {translateRelicSet(rel.set)}
      </span>
      <div style={styles.relicMeta}>
        {rel.mainStat ? translateStatKey(rel.mainStat) : '—'}
        {rel.setId ? ` · #${rel.setId}` : ''}
      </div>
      {rel.subStats?.length ? (
        <div style={styles.subWrap}>
          {rel.subStats.map((s, idx) => {
            const eff =
              effectiveTokens.length > 0 &&
              effectiveTokens.some((tok) => substatMatchesEffective(s.name, tok));
            const cnt = typeof s.count === 'number' && Number.isFinite(s.count) ? s.count : null;
            return (
              <span key={`${rel.id}-${idx}`}>
                {idx > 0 ? ' · ' : ''}
                <span style={eff ? styles.subEff : undefined}>
                  {translateStatKey(s.name)}
                  {cnt != null ? `×${cnt}` : ''}
                </span>
              </span>
            );
          })}
        </div>
      ) : null}
      <div style={styles.relicHits}>
        {effectiveTokens.length > 0 ? (
          <span>
            效<span style={styles.hit}>{effRoll}</span>
          </span>
        ) : (
          <span />
        )}
        <span>
          总<span style={styles.hit}>{rel.hitCount}</span>
        </span>
      </div>
    </div>
  );
}

export interface StarRailRelicDashboardProps {
  characterRules: CharacterRule[];
}

export default function StarRailRelicDashboard({ characterRules }: StarRailRelicDashboardProps) {
  const [text, setText] = useState(() =>
    characterRules.length > 0
      ? '{"source":"reliquary_archiver","version":4,"relics":[]}'
      : SAMPLE_JSON
  );
  const [error, setError] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<LoadoutBoxPayload[] | null>(null);
  const [farmRows, setFarmRows] = useState<SetFarmRow[] | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [jsonEditorOpen, setJsonEditorOpen] = useState(false);

  const runParse = useCallback(() => {
    setError(null);
    try {
      const raw = JSON.parse(text) as unknown;
      const parsed = parsePayload(raw);
      const archiver = isArchiverReliquaryExport(raw);

      if (archiver && characterRules.length === 0 && parsed.characters.length === 0) {
        throw new Error(
          '检测到 Reliquary Archiver 导出，但未配置规则。请在 src/data/star-rail-relic-rules.json 的 characters 中添加角色。'
        );
      }

      const rules = buildEffectiveRules(characterRules, parsed);
      if (!rules.length) throw new Error('无任何角色方案：请配置内容集合或在 JSON 中提供 characters。');

      const nextBoxes = buildLoadoutBoxes(rules, parsed.relics);
      setBoxes(nextBoxes);
      setFarmRows(computeCollectiveFarmFromRules(rules, parsed.relics));
      if (nextBoxes.length) setSelectedKey(boxKey(nextBoxes[0]));
    } catch (e) {
      setBoxes(null);
      setFarmRows(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [text, characterRules]);

  const initial = useMemo(() => {
    try {
      const raw = JSON.parse(
        characterRules.length > 0
          ? '{"source":"reliquary_archiver","version":4,"relics":[]}'
          : SAMPLE_JSON
      ) as unknown;
      const parsed = parsePayload(raw);
      const rules = buildEffectiveRules(characterRules, parsed);
      if (!rules.length) return { boxes: [] as LoadoutBoxPayload[], farmRows: [] as SetFarmRow[] };
      return {
        boxes: buildLoadoutBoxes(rules, parsed.relics),
        farmRows: computeCollectiveFarmFromRules(rules, parsed.relics),
      };
    } catch {
      return { boxes: [] as LoadoutBoxPayload[], farmRows: [] as SetFarmRow[] };
    }
  }, [characterRules]);

  const displayBoxes = boxes ?? initial.boxes;
  const displayFarm = farmRows ?? initial.farmRows;

  useEffect(() => {
    setSelectedKey((prev) => {
      if (!displayBoxes.length) return '';
      const keys = new Set(displayBoxes.map(boxKey));
      if (prev && keys.has(prev)) return prev;
      return boxKey(displayBoxes[0]);
    });
  }, [displayBoxes]);

  const selectedBox = useMemo(() => {
    if (!displayBoxes.length) return null;
    if (!selectedKey) return displayBoxes[0];
    return displayBoxes.find((b) => boxKey(b) === selectedKey) ?? displayBoxes[0];
  }, [displayBoxes, selectedKey]);

  const grouped = useMemo(() => {
    if (!selectedBox) return null;
    return groupRelicsBySlot(selectedBox.relics);
  }, [selectedBox]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ''));
      setError(null);
      setJsonEditorOpen(true);
    };
    reader.readAsText(f, 'UTF-8');
    e.target.value = '';
  };

  const selectOptions = useMemo(() => {
    const byChar = new Map<string, LoadoutBoxPayload[]>();
    for (const b of displayBoxes) {
      const k = b.characterId;
      if (!byChar.has(k)) byChar.set(k, []);
      byChar.get(k)!.push(b);
    }
    const opts: { key: string; label: string }[] = [];
    for (const [, list] of byChar) {
      list.sort((a, b) => a.loadoutName.localeCompare(b.loadoutName, 'zh'));
      for (const b of list) {
        opts.push({
          key: boxKey(b),
          label: `${b.characterLabel} — ${b.loadoutName}`,
        });
      }
    }
    return opts;
  }, [displayBoxes]);

  const jsonSnippetLen = text.length;

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>星穹铁道 · 遗器看板</h1>
      <p style={styles.sub}>
        Archiver 导出 JSON。规则文件里隧洞/位面可写<strong>游戏简中套装全名</strong>或简称（如「信使套」）；保存后会自动换成存档里的英文名再匹配。命中默认取副词条{' '}
        <code style={{ color: '#fbbf24' }}>count</code> 之和。
      </p>

      <div style={{display: 'grid',gridTemplateColumns: '1fr 1fr 1fr 1fr',gap: '8px',}}> 

        <div style={{...styles.panelTight,gridColumn: 1}}>
          <div style={{ ...styles.row, justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={styles.row}>
              <label style={styles.btn}>
                选择文件
                <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={onFile} />
              </label>
              <button type="button" style={styles.btnGhost} onClick={runParse}>
                解析刷新
              </button>
              <button
                type="button"
                style={styles.btnGhost}
                onClick={() =>
                  setText(characterRules.length > 0 ? '{"source":"reliquary_archiver","version":4,"relics":[]}' : SAMPLE_JSON)
                }
              >
                清空
              </button>
            </div>
            <button type="button" style={styles.btnLink} onClick={() => setJsonEditorOpen((o) => !o)}>
              {jsonEditorOpen ? '收起 JSON' : `展开粘贴 JSON（${jsonSnippetLen} 字）`}
            </button>
          </div>
          {jsonEditorOpen ? (
            <textarea
              style={{ ...styles.textareaSm, marginTop: 8 }}
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
            />
          ) : null}
          {error ? <div style={styles.err}>{error}</div> : null}
          {!jsonEditorOpen ? (
            <p style={styles.hint}>装：已装备；仓：仓库匹配；库：未绑定。六列对应六部位。</p>
          ) : null}
        </div>

        <div style={{...styles.panelTight,gridColumn: "2/5"}}>
          <div style={{ ...styles.row, justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ ...styles.cardTitle, marginBottom: 0 }}>内容规则</span>
            <span style={styles.muted}>{characterRules.length ? `${characterRules.length} 名角色` : '未配置'}</span>
          </div>
          {characterRules.length === 0 ? (
            <p style={styles.hint}>编辑 src/data/star-rail-relic-rules.json（数组里每项一名角色）后重新构建。</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
              {characterRules.map((r) => (
                <span key={r.entryId} style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                  <strong style={{ color: '#e2e8f0' }}>{r.displayName ?? r.characterId}</strong>
                  {/* <span style={styles.muted}> #{r.characterId}</span> */}
                  {r.loadouts.map((lo) => (
                    <span key={lo.id} style={styles.ruleChip}>
                      {lo.name}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
      <div style={styles.panel}>
        <h2 style={{ ...styles.cardTitle, marginBottom: 10 }}>集体刷取参考</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>套装</th>
                <th style={styles.th}>类型</th>
                <th style={styles.th}>角色数</th>
                <th style={styles.th}>方案数</th>
                <th style={styles.th}>件数</th>
                <th style={styles.th}>低/均/高</th>
                <th style={styles.th}>说明</th>
              </tr>
            </thead>
            <tbody>
              {displayFarm.map((r) => (
                <tr key={`${r.kind}-${r.setName}`}>
                  <td style={styles.td}>
                    {translateRelicSet(r.setName)}
                    <div style={{ ...styles.muted, fontSize: '0.68rem', marginTop: 2 }}>{r.setName}</div>
                  </td>
                  <td style={styles.td}>{r.kind === 'planar' ? '位面' : '隧洞'}</td>
                  <td style={styles.td}>{r.demandCharacters}</td>
                  <td style={styles.td}>{r.demandLoadouts}</td>
                  <td style={styles.td}>{r.ownedCount}</td>
                  <td style={styles.td}>
                    {r.ownedCount === 0 ? (
                      <span style={{ color: '#fca5a5' }}>—</span>
                    ) : (
                      <>
                        <span style={styles.hit}>{r.minHit}</span>
                        <span style={styles.muted}> / </span>
                        <span style={styles.hit}>{r.avgHit != null ? r.avgHit.toFixed(1) : '—'}</span>
                        <span style={styles.muted}> / </span>
                        <span style={styles.hit}>{r.maxHit}</span>
                      </>
                    )}
                  </td>
                  <td style={styles.td}>{r.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 style={{ ...styles.cardTitle, margin: '6px 0 8px' }}>遗器盒</h2>
      {displayBoxes.length > 0 ? (
        <>
          <label style={{ ...styles.muted, display: 'block', marginBottom: 4, fontSize: '0.78rem' }}>角色与方案</label>
          <select
            style={styles.select}
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            aria-label="选择角色与遗器方案"
          >
            {selectOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>

          {selectedBox && grouped ? (
            <div style={styles.card}>
              <div style={styles.summaryGrid}>
                <div>
                  <span style={styles.summaryStrong}>适用角色</span> {selectedBox.characterLabel}
                  <span style={styles.muted}>（{selectedBox.characterId}）</span>
                </div>
                <div>
                  <span style={styles.summaryStrong}>方案</span> {selectedBox.loadoutName}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={styles.summaryStrong}>隧洞</span>{' '}
                  {selectedBox.cavernSets.length
                    ? selectedBox.cavernSets.map((s) => translateRelicSet(s)).join('、')
                    : '—'}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={styles.summaryStrong}>位面</span>{' '}
                  {selectedBox.planarSets.length
                    ? selectedBox.planarSets.map((s) => translateRelicSet(s)).join('、')
                    : '—'}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={styles.summaryStrong}>有效词条</span>{' '}
                  {selectedBox.effectiveSubstats.length ? (
                    selectedBox.effectiveSubstats.map((t) => (
                      <span key={t} style={styles.effTag}>
                        {translateStatKey(t)}
                      </span>
                    ))
                  ) : (
                    <span style={styles.muted}>未配置 effectiveSubstats</span>
                  )}
                </div>
              </div>

              {selectedBox.relics.length === 0 ? (
                <div style={styles.muted}>暂无匹配遗器</div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto', marginBottom: grouped.unknown.length ? 10 : 0 }}>
                    <div className="sr-relic-slot-grid">
                      {RELIC_SLOT_COLUMNS.map(({ id, label }) => (
                        <div key={id} style={styles.slotCol}>
                          <div style={styles.slotColHead}>{label}</div>
                          <div style={styles.slotColBody}>
                            {(grouped.byCol.get(id) ?? []).map((rel) => (
                              <RelicSlotCard
                                key={`${selectedBox.loadoutId}-${rel.id}-${rel.matchReason}`}
                                rel={rel}
                                effectiveTokens={selectedBox.effectiveSubstats}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {grouped.unknown.length > 0 ? (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ ...styles.muted, marginBottom: 6, fontSize: '0.75rem' }}>未识别部位</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {grouped.unknown.map((rel) => (
                          <div key={`unk-${rel.id}`} style={{ width: 140, flexShrink: 0 }}>
                            <RelicSlotCard rel={rel} effectiveTokens={selectedBox.effectiveSubstats} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </>
      ) : (
        <div style={styles.muted}>解析后显示遗器盒。</div>
      )}

      <style>{`
        .sr-relic-slot-grid {
          display: grid;
          gap: 8px;
          align-items: stretch;
          min-width: min(100%, 720px);
          grid-template-columns: repeat(6, minmax(0, 1fr));
        }
        @media (max-width: 900px) {
          .sr-relic-slot-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 520px) {
          .sr-relic-slot-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>
    </div>
  );
}
