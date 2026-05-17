import { useEffect, useMemo, useRef, useState } from 'react'
import { UNTANGLE_LEVELS } from '../lib/untangle/levels'
import {
  countEdgeIntersections,
  isSolved,
  updateNodePosition,
  type IntersectionResult,
  type UntangleGraph,
} from '../lib/untangle/graph'
import { generatePlanarGraph, shuffleNodePositions } from '../lib/untangle/generator'

type UntangleMode = 'preset' | 'random'

interface BestTimes {
  preset: Record<string, number>
  random: Record<number, number>
}

interface UntangleState {
  mode: UntangleMode
  presetIndex: number
  randomNodeCount: number
  graph: UntangleGraph
  elapsedMs: number
  timerStartedAt: number | null
  solved: boolean
  bestTimes: BestTimes
}

const STORAGE_KEY = 'mufeng_untangle_progress_v1'
const BOARD_WIDTH = 760
const BOARD_HEIGHT = 520
const NODE_RADIUS = 16

const componentStyles = `
  .untangle-app {
    display: grid;
    gap: 22px;
  }

  .untangle-hero,
  .untangle-card,
  .untangle-board-card {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(142, 175, 156, 0.18);
    border-radius: 28px;
    box-shadow: 0 22px 54px rgba(89, 124, 106, 0.08);
    backdrop-filter: blur(18px);
  }

  .untangle-hero {
    padding: 30px 28px;
    background:
      radial-gradient(circle at top right, rgba(179, 219, 196, 0.42), transparent 30%),
      linear-gradient(155deg, rgba(255,255,255,0.84), rgba(248,252,249,0.74));
  }

  .untangle-eyebrow {
    display: inline-flex;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(105, 179, 143, 0.12);
    color: #4d9273;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
  }

  .untangle-hero h1 {
    margin-top: 14px;
    font-family: "Noto Serif SC", serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    color: #24332d;
    line-height: 1.28;
  }

  .untangle-hero p {
    margin-top: 12px;
    max-width: 760px;
    color: #5f7469;
    line-height: 1.9;
    font-size: 0.98rem;
  }

  .untangle-hero-tags {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .untangle-hero-tag {
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.76);
    border: 1px solid rgba(142, 175, 156, 0.16);
    color: #6c7f75;
    font-size: 0.82rem;
  }

  .untangle-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 360px);
    gap: 18px;
    align-items: start;
  }

  .untangle-board-card {
    padding: 22px;
    background:
      linear-gradient(165deg, rgba(255,255,255,0.84), rgba(242,249,244,0.72)),
      radial-gradient(circle at top left, rgba(160, 205, 178, 0.18), transparent 28%);
  }

  .untangle-card {
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  .untangle-sidebar {
    display: grid;
    gap: 16px;
  }

  .untangle-section-title {
    font-size: 0.98rem;
    font-weight: 700;
    color: #24332d;
  }

  .untangle-section-subtitle {
    color: #6c7f75;
    font-size: 0.82rem;
    line-height: 1.7;
  }

  .untangle-mode-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 18px;
  }

  .untangle-mode-btn {
    border: 1px solid rgba(142, 175, 156, 0.18);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.76);
    color: #486355;
    padding: 12px 14px;
    text-align: left;
    font: inherit;
    cursor: pointer;
    transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;
  }

  .untangle-mode-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(105, 179, 143, 0.3);
    background: rgba(248,252,249,0.96);
  }

  .untangle-mode-btn.active {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.18), rgba(255,255,255,0.92));
    border-color: rgba(105, 179, 143, 0.36);
    color: #35684f;
  }

  .untangle-mode-label {
    font-size: 0.92rem;
    font-weight: 700;
  }

  .untangle-mode-subtitle {
    margin-top: 5px;
    font-size: 0.76rem;
    color: inherit;
    opacity: 0.8;
  }

  .untangle-meta-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .untangle-chip {
    border-radius: 22px;
    padding: 14px 14px 12px;
    background: rgba(248, 252, 249, 0.88);
    border: 1px solid rgba(142, 175, 156, 0.16);
  }

  .untangle-chip-label {
    color: #74887d;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .untangle-chip-value {
    margin-top: 6px;
    font-size: 1.1rem;
    font-weight: 700;
    color: #24332d;
  }

  .untangle-progress {
    display: grid;
    gap: 8px;
    margin-top: 16px;
  }

  .untangle-progress-track {
    height: 10px;
    border-radius: 999px;
    background: rgba(219, 232, 223, 0.85);
    overflow: hidden;
  }

  .untangle-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #5f9f7e, #7ab596);
  }

  .untangle-status {
    margin-top: 16px;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(142, 175, 156, 0.16);
    background: rgba(248, 252, 249, 0.84);
    color: #4f6258;
    font-size: 0.9rem;
    line-height: 1.75;
  }

  .untangle-status.success {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.16), rgba(255,255,255,0.8));
    border-color: rgba(105, 179, 143, 0.28);
    color: #35684f;
  }

  .untangle-control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .untangle-btn {
    width: 100%;
    border: 1px solid rgba(142, 175, 156, 0.2);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.78);
    color: #24332d;
    padding: 11px 14px;
    font: inherit;
    font-size: 0.92rem;
    cursor: pointer;
    transition:
      transform 0.24s ease,
      background 0.24s ease,
      border-color 0.24s ease,
      box-shadow 0.24s ease;
  }

  .untangle-btn:hover:enabled {
    transform: translateY(-1px);
    border-color: rgba(105, 179, 143, 0.36);
    background: rgba(246, 251, 248, 0.96);
    box-shadow: 0 12px 26px rgba(89, 124, 106, 0.08);
  }

  .untangle-board-shell {
    margin-top: 18px;
    border-radius: 26px;
    background:
      linear-gradient(180deg, rgba(235, 244, 238, 0.96), rgba(226, 239, 230, 0.92)),
      linear-gradient(90deg, rgba(120, 161, 140, 0.06) 1px, transparent 1px),
      linear-gradient(rgba(120, 161, 140, 0.06) 1px, transparent 1px);
    background-size: auto, 36px 36px, 36px 36px;
    border: 1px solid rgba(142, 175, 156, 0.2);
    overflow: hidden;
  }

  .untangle-svg {
    display: block;
    width: 100%;
    height: auto;
    touch-action: none;
    user-select: none;
  }

  .untangle-edge {
    stroke: rgba(94, 124, 108, 0.5);
    stroke-width: 4;
    stroke-linecap: round;
  }

  .untangle-edge.clear {
    stroke: #67a987;
  }

  .untangle-edge.crossing {
    stroke: #d56a6a;
  }

  .untangle-node {
    cursor: grab;
  }

  .untangle-node circle.outer {
    fill: rgba(248, 252, 249, 0.96);
    stroke: rgba(123, 156, 138, 0.28);
    stroke-width: 2;
  }

  .untangle-node circle.inner {
    fill: #6eaa8a;
  }

  .untangle-node.active circle.inner {
    fill: #2f5e48;
  }

  .untangle-node.active circle.outer {
    stroke: rgba(105, 179, 143, 0.55);
  }

  .untangle-node text {
    font-size: 12px;
    fill: #355545;
    text-anchor: middle;
    dominant-baseline: middle;
    pointer-events: none;
  }

  .untangle-legend-list {
    display: grid;
    gap: 10px;
  }

  .untangle-legend-item {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 12px;
    align-items: center;
    color: #51655b;
    font-size: 0.9rem;
  }

  .untangle-legend-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(244, 250, 246, 0.92);
    border: 1px solid rgba(142, 175, 156, 0.18);
  }

  .untangle-legend-line {
    width: 28px;
    height: 4px;
    border-radius: 999px;
  }

  .untangle-legend-line.safe {
    background: #67a987;
  }

  .untangle-legend-line.cross {
    background: #d56a6a;
  }

  .untangle-legend-node {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6eaa8a;
    box-shadow: 0 0 0 6px rgba(248,252,249,0.9);
  }

  @media (max-width: 980px) {
    .untangle-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .untangle-hero {
      padding: 24px 20px;
    }

    .untangle-board-card,
    .untangle-card {
      padding: 16px;
      border-radius: 24px;
    }

    .untangle-meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .untangle-mode-switch,
    .untangle-control-grid {
      grid-template-columns: 1fr;
    }
  }
`

function cloneState(state: UntangleState): UntangleState {
  return {
    ...state,
    graph: {
      nodes: state.graph.nodes.map((node) => ({ ...node })),
      edges: state.graph.edges.map((edge) => ({ ...edge })),
    },
    bestTimes: {
      preset: { ...state.bestTimes.preset },
      random: { ...state.bestTimes.random },
    },
  }
}

function createPresetState(index = 0): UntangleState {
  const level = UNTANGLE_LEVELS[index]
  return {
    mode: 'preset',
    presetIndex: index,
    randomNodeCount: 10,
    graph: {
      nodes: level.graph.nodes.map((node) => ({ ...node })),
      edges: level.graph.edges.map((edge) => ({ ...edge })),
    },
    elapsedMs: 0,
    timerStartedAt: null,
    solved: false,
    bestTimes: {
      preset: {},
      random: {},
    },
  }
}

function createRandomGraph(nodeCount: number) {
  const seed = Date.now()
  return shuffleNodePositions(generatePlanarGraph(nodeCount, seed), seed + 17)
}

function createRandomState(nodeCount = 10): UntangleState {
  return {
    mode: 'random',
    presetIndex: 0,
    randomNodeCount: nodeCount,
    graph: createRandomGraph(nodeCount),
    elapsedMs: 0,
    timerStartedAt: null,
    solved: false,
    bestTimes: {
      preset: {},
      random: {},
    },
  }
}

function loadStoredState(): UntangleState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<UntangleState>
    if (parsed.mode !== 'preset' && parsed.mode !== 'random') {
      return null
    }
    if (!parsed.graph || !Array.isArray(parsed.graph.nodes) || !Array.isArray(parsed.graph.edges)) {
      return null
    }

    return {
      mode: parsed.mode,
      presetIndex: typeof parsed.presetIndex === 'number' ? parsed.presetIndex : 0,
      randomNodeCount: typeof parsed.randomNodeCount === 'number' ? parsed.randomNodeCount : 10,
      graph: {
        nodes: parsed.graph.nodes.map((node) => ({ ...node })),
        edges: parsed.graph.edges.map((edge) => ({ ...edge })),
      },
      elapsedMs: typeof parsed.elapsedMs === 'number' ? parsed.elapsedMs : 0,
      timerStartedAt: null,
      solved: Boolean(parsed.solved),
      bestTimes: {
        preset: parsed.bestTimes?.preset ?? {},
        random: parsed.bestTimes?.random ?? {},
      },
    }
  } catch (error) {
    console.warn('读取解线游戏进度失败', error)
    return null
  }
}

function clampPoint(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function formatDuration(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function getPresetProgress(index: number): number {
  return ((index + 1) / UNTANGLE_LEVELS.length) * 100
}

export default function UntangleGame() {
  const [state, setState] = useState<UntangleState>(() => createPresetState())
  const [hydrated, setHydrated] = useState(false)
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null)
  const [displayElapsedMs, setDisplayElapsedMs] = useState(0)
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    const storedState = loadStoredState()
    if (storedState) {
      setState(storedState)
      setDisplayElapsedMs(storedState.elapsedMs)
    } else {
      setDisplayElapsedMs(0)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return
    }

    const payload = {
      ...state,
      timerStartedAt: null,
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('保存解线游戏进度失败', error)
    }
  }, [state, hydrated])

  useEffect(() => {
    if (state.timerStartedAt === null || state.solved) {
      setDisplayElapsedMs(state.elapsedMs)
      return
    }

    const tick = () => {
      setDisplayElapsedMs(state.elapsedMs + (Date.now() - state.timerStartedAt))
    }

    tick()
    const timer = window.setInterval(tick, 200)
    return () => {
      window.clearInterval(timer)
    }
  }, [state.elapsedMs, state.solved, state.timerStartedAt])

  const intersections = useMemo<IntersectionResult>(() => countEdgeIntersections(state.graph), [state.graph])
  const levelLabel =
    state.mode === 'preset'
      ? UNTANGLE_LEVELS[state.presetIndex]?.title ?? `第 ${state.presetIndex + 1} 关`
      : `随机 ${state.randomNodeCount} 点`

  useEffect(() => {
    if (state.solved || intersections.count !== 0) {
      return
    }

    setState((current) => {
      if (current.solved) {
        return current
      }

      const elapsedMs =
        current.timerStartedAt === null
          ? current.elapsedMs
          : current.elapsedMs + (Date.now() - current.timerStartedAt)

      const nextState = cloneState({
        ...current,
        elapsedMs,
        timerStartedAt: null,
        solved: true,
      })

      if (current.mode === 'preset') {
        const levelId = UNTANGLE_LEVELS[current.presetIndex].id
        const currentBest = nextState.bestTimes.preset[levelId]
        if (!currentBest || elapsedMs < currentBest) {
          nextState.bestTimes.preset[levelId] = elapsedMs
        }
      } else {
        const currentBest = nextState.bestTimes.random[current.randomNodeCount]
        if (!currentBest || elapsedMs < currentBest) {
          nextState.bestTimes.random[current.randomNodeCount] = elapsedMs
        }
      }

      return nextState
    })
  }, [intersections.count, state.solved, state.timerStartedAt])

  function switchMode(mode: UntangleMode) {
    setState((current) => {
      if (current.mode === mode) {
        return current
      }

      if (mode === 'preset') {
        const next = createPresetState(current.presetIndex)
        next.bestTimes = cloneState(current).bestTimes
        return next
      }

      const next = createRandomState(current.randomNodeCount)
      next.bestTimes = cloneState(current).bestTimes
      return next
    })
  }

  function resetCurrent() {
    setDraggingNodeId(null)
    setState((current) => {
      const next = current.mode === 'preset' ? createPresetState(current.presetIndex) : createRandomState(current.randomNodeCount)
      next.bestTimes = cloneState(current).bestTimes
      return next
    })
    setDisplayElapsedMs(0)
  }

  function goToNextPresetLevel() {
    setDraggingNodeId(null)
    setState((current) => {
      const nextIndex = Math.min(UNTANGLE_LEVELS.length - 1, current.presetIndex + 1)
      const next = createPresetState(nextIndex)
      next.bestTimes = cloneState(current).bestTimes
      return next
    })
    setDisplayElapsedMs(0)
  }

  function rerollRandom(nodeCount = state.randomNodeCount) {
    setDraggingNodeId(null)
    setState((current) => {
      const next = createRandomState(nodeCount)
      next.bestTimes = cloneState(current).bestTimes
      return next
    })
    setDisplayElapsedMs(0)
  }

  function startTimerIfNeeded() {
    setState((current) => {
      if (current.timerStartedAt !== null || current.solved) {
        return current
      }

      return {
        ...current,
        timerStartedAt: Date.now(),
      }
    })
  }

  function updateDraggedNode(clientX: number, clientY: number) {
    if (draggingNodeId === null || !svgRef.current) {
      return
    }

    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = BOARD_WIDTH / rect.width
    const scaleY = BOARD_HEIGHT / rect.height
    const nextX = clampPoint((clientX - rect.left) * scaleX, NODE_RADIUS + 8, BOARD_WIDTH - NODE_RADIUS - 8)
    const nextY = clampPoint((clientY - rect.top) * scaleY, NODE_RADIUS + 8, BOARD_HEIGHT - NODE_RADIUS - 8)

    setState((current) => ({
      ...current,
      graph: updateNodePosition(current.graph, draggingNodeId, { x: nextX, y: nextY }),
    }))
  }

  function handlePointerDown(nodeId: number, clientX: number, clientY: number) {
    setDraggingNodeId(nodeId)
    startTimerIfNeeded()
    updateDraggedNode(clientX, clientY)
  }

  useEffect(() => {
    if (draggingNodeId === null) {
      return
    }

    function handlePointerMove(event: PointerEvent) {
      event.preventDefault()
      updateDraggedNode(event.clientX, event.clientY)
    }

    function handlePointerUp() {
      setDraggingNodeId(null)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [draggingNodeId])

  const statusText = state.solved
    ? '所有线段都已经解开了，可以继续挑战下一关。'
    : hydrated
      ? '拖动圆点，让所有线段都不再相交。共端点的线不算交叉。'
      : '正在恢复本地进度...'

  const progress =
    state.mode === 'preset'
      ? getPresetProgress(state.presetIndex)
      : ((state.randomNodeCount - 8) / 6) * 100

  const currentBest =
    state.mode === 'preset'
      ? state.bestTimes.preset[UNTANGLE_LEVELS[state.presetIndex].id]
      : state.bestTimes.random[state.randomNodeCount]

  return (
    <div className="untangle-app">
      <style>{componentStyles}</style>

      <section className="untangle-hero">
        <div className="untangle-eyebrow">Toolbox · 解线</div>
        <h1>拖动节点，把所有纠缠在一起的线慢慢理开。</h1>
        <p>固定关卡和随机模式都可以直接玩，全部线段无交叉就算过关。</p>
        <div className="untangle-hero-tags">
          <span className="untangle-hero-tag">固定关卡 + 随机模式</span>
          <span className="untangle-hero-tag">实时交叉检测</span>
          <span className="untangle-hero-tag">计时 + 最佳成绩 + 本地存档</span>
        </div>

        <div className="untangle-mode-switch">
          <button
            type="button"
            className={`untangle-mode-btn${state.mode === 'preset' ? ' active' : ''}`}
            onClick={() => switchMode('preset')}
          >
            <div className="untangle-mode-label">固定关卡</div>
            <div className="untangle-mode-subtitle">12 关逐步升难</div>
          </button>
          <button
            type="button"
            className={`untangle-mode-btn${state.mode === 'random' ? ' active' : ''}`}
            onClick={() => switchMode('random')}
          >
            <div className="untangle-mode-label">随机模式</div>
            <div className="untangle-mode-subtitle">每次生成新的缠结图</div>
          </button>
        </div>
      </section>

      <div className="untangle-layout">
        <section className="untangle-board-card">
          <div className="untangle-meta-grid">
            <div className="untangle-chip">
              <div className="untangle-chip-label">当前</div>
              <div className="untangle-chip-value">{levelLabel}</div>
            </div>
            <div className="untangle-chip">
              <div className="untangle-chip-label">节点数</div>
              <div className="untangle-chip-value">{state.graph.nodes.length}</div>
            </div>
            <div className="untangle-chip">
              <div className="untangle-chip-label">交叉数</div>
              <div className="untangle-chip-value">{intersections.count}</div>
            </div>
            <div className="untangle-chip">
              <div className="untangle-chip-label">计时</div>
              <div className="untangle-chip-value">{formatDuration(displayElapsedMs)}</div>
            </div>
          </div>

          <div className="untangle-progress">
            <div className="untangle-section-subtitle">
              {state.mode === 'preset'
                ? '固定关卡会按关卡记录最佳时间，随机模式会按节点数量记录。'
                : '当前随机模式按节点数量保存最佳时间，可以反复刷新挑战。'}
            </div>
            <div className="untangle-progress-track">
              <div className="untangle-progress-fill" style={{ width: `${Math.max(8, progress)}%` }} />
            </div>
          </div>

          <div className={`untangle-status${state.solved ? ' success' : ''}`}>
            {statusText}
            {currentBest ? ` 当前最佳：${formatDuration(currentBest)}。` : ''}
          </div>

          <div className="untangle-board-shell">
            <svg ref={svgRef} className="untangle-svg" viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
              {state.graph.edges.map((edge, index) => {
                const fromNode = state.graph.nodes[edge.from]
                const toNode = state.graph.nodes[edge.to]
                const crossing = intersections.edgeIndexes.has(index)
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    className={`untangle-edge ${crossing ? 'crossing' : 'clear'}`}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                  />
                )
              })}

              {state.graph.nodes.map((node) => (
                <g
                  key={node.id}
                  className={`untangle-node${draggingNodeId === node.id ? ' active' : ''}`}
                  onPointerDown={(event) => handlePointerDown(node.id, event.clientX, event.clientY)}
                >
                  <circle className="outer" cx={node.x} cy={node.y} r={NODE_RADIUS + 4} />
                  <circle className="inner" cx={node.x} cy={node.y} r={NODE_RADIUS} />
                </g>
              ))}
            </svg>
          </div>
        </section>

        <aside className="untangle-sidebar">
          <section className="untangle-card">
            <div className="untangle-section-title">操作</div>
            <div className="untangle-section-subtitle">
              拖住节点移动位置，直到所有红色交叉线都消失。只要线段共端点，就不算冲突。
            </div>
            <div className="untangle-control-grid">
              <button type="button" className="untangle-btn" onClick={resetCurrent}>
                重开当前局面
              </button>
              {state.mode === 'preset' ? (
                <button
                  type="button"
                  className="untangle-btn"
                  onClick={goToNextPresetLevel}
                  disabled={state.presetIndex >= UNTANGLE_LEVELS.length - 1}
                >
                  下一关
                </button>
              ) : (
                <button type="button" className="untangle-btn" onClick={() => rerollRandom()}>
                  重新随机
                </button>
              )}
              {state.mode === 'random' ? (
                <>
                  <button type="button" className="untangle-btn" onClick={() => rerollRandom(Math.max(8, state.randomNodeCount - 1))}>
                    少一节点
                  </button>
                  <button type="button" className="untangle-btn" onClick={() => rerollRandom(Math.min(14, state.randomNodeCount + 1))}>
                    多一节点
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="untangle-btn" onClick={() => switchMode('random')}>
                    去随机模式
                  </button>
                  <button type="button" className="untangle-btn" onClick={() => switchMode('preset')}>
                    固定模式
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="untangle-card">
            <div className="untangle-section-title">图例</div>
            <div className="untangle-legend-list">
              <div className="untangle-legend-item">
                <div className="untangle-legend-icon">
                  <div className="untangle-legend-node" />
                </div>
                <div>圆点是可拖动节点，按住后可以自由移动位置。</div>
              </div>
              <div className="untangle-legend-item">
                <div className="untangle-legend-icon">
                  <div className="untangle-legend-line safe" />
                </div>
                <div>绿色线段表示当前没有和其他边发生交叉。</div>
              </div>
              <div className="untangle-legend-item">
                <div className="untangle-legend-icon">
                  <div className="untangle-legend-line cross" />
                </div>
                <div>红色线段表示存在真正交叉，全部消失后当前局面就解开了。</div>
              </div>
            </div>
          </section>

          <section className="untangle-card">
            <div className="untangle-section-title">模式说明</div>
            <div className="untangle-section-subtitle">
              固定关卡用于稳定上手，随机模式会先生成一个可解平面图，再打乱节点位置，让局面从一开始就带着交叉。
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
