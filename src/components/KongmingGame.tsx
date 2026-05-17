import { useEffect, useMemo, useState } from 'react'
import { KONGMING_BOARDS, type BoardVariant, type PegMove, type PegPosition } from '../lib/kongming/boards'
import {
  applyMove,
  countPegs,
  createInitialSnapshot,
  getHintMove,
  getLegalMoves,
  getLegalMovesFromPeg,
  hasNoMoves,
  hasSolved,
  isPegOccupied,
  type PegGameSnapshot,
  type PegStoredVariantState,
} from '../lib/kongming/game'

const STORAGE_KEY = 'mufeng_kongming_progress_v1'
const MAX_UNDO_STEPS = 200

interface VariantState extends PegStoredVariantState {}

interface KongmingState {
  variant: BoardVariant
  variants: Record<BoardVariant, VariantState>
}

interface StoredKongmingState {
  version: 1
  variant: BoardVariant
  variants: Record<BoardVariant, VariantState>
}

interface StoredSnapshot {
  occupiedMask: string
  moveCount: number
}

interface StoredVariantState {
  snapshot: StoredSnapshot
  undoStack: StoredSnapshot[]
  selectedPeg: number | null
  hintMove: PegMove | null
  solved: boolean
}

interface StoredKongmingPayload {
  version: 1
  variant: BoardVariant
  variants: Record<BoardVariant, StoredVariantState>
}

const componentStyles = `
  .kongming-app {
    display: grid;
    gap: 22px;
  }

  .kongming-hero,
  .kongming-card,
  .kongming-board-card {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(142, 175, 156, 0.18);
    border-radius: 28px;
    box-shadow: 0 22px 54px rgba(89, 124, 106, 0.08);
    backdrop-filter: blur(18px);
  }

  .kongming-hero {
    padding: 30px 28px;
    background:
      radial-gradient(circle at top right, rgba(179, 219, 196, 0.42), transparent 30%),
      linear-gradient(155deg, rgba(255,255,255,0.84), rgba(248,252,249,0.74));
  }

  .kongming-eyebrow {
    display: inline-flex;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(105, 179, 143, 0.12);
    color: #4d9273;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
  }

  .kongming-hero h1 {
    margin-top: 14px;
    font-family: "Noto Serif SC", serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    color: #24332d;
    line-height: 1.28;
  }

  .kongming-hero p {
    margin-top: 12px;
    max-width: 760px;
    color: #5f7469;
    line-height: 1.9;
    font-size: 0.98rem;
  }

  .kongming-hero-tags {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .kongming-hero-tag {
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.76);
    border: 1px solid rgba(142, 175, 156, 0.16);
    color: #6c7f75;
    font-size: 0.82rem;
  }

  .kongming-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(300px, 370px);
    gap: 18px;
    align-items: start;
  }

  .kongming-board-card {
    padding: 22px;
    background:
      linear-gradient(165deg, rgba(255,255,255,0.84), rgba(242,249,244,0.72)),
      radial-gradient(circle at top left, rgba(160, 205, 178, 0.18), transparent 28%);
  }

  .kongming-card {
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  .kongming-sidebar {
    display: grid;
    gap: 16px;
  }

  .kongming-section-title {
    font-size: 0.98rem;
    font-weight: 700;
    color: #24332d;
  }

  .kongming-section-subtitle {
    color: #6c7f75;
    font-size: 0.82rem;
    line-height: 1.7;
  }

  .kongming-variant-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 18px;
  }

  .kongming-variant-btn {
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

  .kongming-variant-btn:hover {
    transform: translateY(-1px);
    border-color: rgba(105, 179, 143, 0.3);
    background: rgba(248,252,249,0.96);
  }

  .kongming-variant-btn.active {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.18), rgba(255,255,255,0.92));
    border-color: rgba(105, 179, 143, 0.36);
    color: #35684f;
  }

  .kongming-variant-label {
    font-size: 0.92rem;
    font-weight: 700;
  }

  .kongming-variant-subtitle {
    margin-top: 5px;
    font-size: 0.76rem;
    color: inherit;
    opacity: 0.8;
  }

  .kongming-meta-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .kongming-chip {
    border-radius: 22px;
    padding: 14px 14px 12px;
    background: rgba(248, 252, 249, 0.88);
    border: 1px solid rgba(142, 175, 156, 0.16);
  }

  .kongming-chip-label {
    color: #74887d;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .kongming-chip-value {
    margin-top: 6px;
    font-size: 1.1rem;
    font-weight: 700;
    color: #24332d;
  }

  .kongming-progress {
    display: grid;
    gap: 8px;
  }

  .kongming-progress-track {
    height: 10px;
    border-radius: 999px;
    background: rgba(219, 232, 223, 0.85);
    overflow: hidden;
  }

  .kongming-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #5f9f7e, #7ab596);
  }

  .kongming-status {
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(142, 175, 156, 0.16);
    background: rgba(248, 252, 249, 0.84);
    color: #4f6258;
    font-size: 0.9rem;
    line-height: 1.75;
  }

  .kongming-status.success {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.16), rgba(255,255,255,0.8));
    border-color: rgba(105, 179, 143, 0.28);
    color: #35684f;
  }

  .kongming-status.fail {
    background: linear-gradient(135deg, rgba(217, 96, 96, 0.12), rgba(255,255,255,0.82));
    border-color: rgba(217, 96, 96, 0.22);
    color: #8a4040;
  }

  .kongming-control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .kongming-btn {
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

  .kongming-btn:hover:enabled {
    transform: translateY(-1px);
    border-color: rgba(105, 179, 143, 0.36);
    background: rgba(246, 251, 248, 0.96);
    box-shadow: 0 12px 26px rgba(89, 124, 106, 0.08);
  }

  .kongming-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .kongming-btn.primary {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.18), rgba(255,255,255,0.9));
    color: #35684f;
  }

  .kongming-board-shell {
    margin-top: 18px;
    display: grid;
    justify-content: center;
    padding: 18px 18px 8px;
    border-radius: 26px;
    background:
      linear-gradient(180deg, rgba(235, 244, 238, 0.96), rgba(226, 239, 230, 0.92)),
      linear-gradient(90deg, rgba(120, 161, 140, 0.06) 1px, transparent 1px),
      linear-gradient(rgba(120, 161, 140, 0.06) 1px, transparent 1px);
    border: 1px solid rgba(142, 175, 156, 0.2);
  }

  .kongming-board.cross {
    position: relative;
    width: 470px;
    height: 470px;
  }

  .kongming-board.triangle {
    position: relative;
    width: 420px;
    height: 360px;
  }

  .kongming-slot {
    position: absolute;
    width: 54px;
    height: 54px;
    margin-left: -27px;
    margin-top: -27px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(214, 228, 217, 0.95));
    border: 1px solid rgba(124, 159, 140, 0.28);
    box-shadow: inset 0 3px 8px rgba(255,255,255,0.6), inset 0 -6px 10px rgba(130, 154, 138, 0.12);
  }

  .kongming-slot.hint {
    box-shadow:
      0 0 0 4px rgba(105, 179, 143, 0.15),
      inset 0 3px 8px rgba(255,255,255,0.7),
      inset 0 -6px 10px rgba(130, 154, 138, 0.12);
    border-color: rgba(105, 179, 143, 0.4);
  }

  .kongming-slot.target {
    box-shadow:
      0 0 0 4px rgba(81, 122, 101, 0.1),
      inset 0 3px 8px rgba(255,255,255,0.7),
      inset 0 -6px 10px rgba(130, 154, 138, 0.12);
    border-color: rgba(81, 122, 101, 0.32);
  }

  .kongming-peg {
    position: absolute;
    inset: 6px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    background: radial-gradient(circle at 35% 30%, #fefefc 0%, #d7e3d9 42%, #87a38e 100%);
    box-shadow:
      0 10px 16px rgba(86, 112, 96, 0.22),
      inset 0 2px 5px rgba(255,255,255,0.85),
      inset 0 -5px 8px rgba(76, 104, 88, 0.25);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .kongming-peg:hover {
    transform: translateY(-1px);
  }

  .kongming-peg.selected {
    box-shadow:
      0 0 0 4px rgba(105, 179, 143, 0.16),
      0 12px 18px rgba(86, 112, 96, 0.2),
      inset 0 2px 5px rgba(255,255,255,0.85),
      inset 0 -5px 8px rgba(76, 104, 88, 0.25);
  }

  .kongming-hole {
    position: absolute;
    inset: 13px;
    border-radius: 50%;
    background: radial-gradient(circle at 50% 55%, rgba(130, 154, 138, 0.26), rgba(255,255,255,0));
    border: 1px dashed rgba(130, 154, 138, 0.28);
  }

  .kongming-hole.selectable {
    cursor: pointer;
    border-style: solid;
    border-color: rgba(105, 179, 143, 0.42);
    box-shadow: inset 0 0 0 3px rgba(105, 179, 143, 0.12);
  }

  .kongming-hole.hint {
    border-style: solid;
    border-color: rgba(105, 179, 143, 0.5);
    box-shadow: inset 0 0 0 4px rgba(105, 179, 143, 0.18);
  }

  .kongming-legend-list {
    display: grid;
    gap: 10px;
  }

  .kongming-legend-item {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 12px;
    align-items: center;
    color: #51655b;
    font-size: 0.9rem;
  }

  .kongming-legend-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(244, 250, 246, 0.92);
    border: 1px solid rgba(142, 175, 156, 0.18);
  }

  .kongming-legend-peg,
  .kongming-legend-hole,
  .kongming-legend-hint {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  .kongming-legend-peg {
    background: radial-gradient(circle at 35% 30%, #fefefc 0%, #d7e3d9 42%, #87a38e 100%);
    box-shadow: inset 0 2px 5px rgba(255,255,255,0.85), inset 0 -5px 8px rgba(76, 104, 88, 0.25);
  }

  .kongming-legend-hole {
    background: radial-gradient(circle at 50% 55%, rgba(130, 154, 138, 0.26), rgba(255,255,255,0));
    border: 1px dashed rgba(130, 154, 138, 0.28);
  }

  .kongming-legend-hint {
    background: radial-gradient(circle at 50% 55%, rgba(130, 154, 138, 0.18), rgba(255,255,255,0));
    border: 2px solid rgba(105, 179, 143, 0.5);
    box-shadow: inset 0 0 0 4px rgba(105, 179, 143, 0.18);
  }

  @media (max-width: 980px) {
    .kongming-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .kongming-hero {
      padding: 24px 20px;
    }

    .kongming-board-card,
    .kongming-card {
      padding: 16px;
      border-radius: 24px;
    }

    .kongming-meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .kongming-control-grid,
    .kongming-variant-switch {
      grid-template-columns: 1fr;
    }

    .kongming-board.cross {
      width: 320px;
      height: 320px;
    }

    .kongming-board.triangle {
      width: 300px;
      height: 250px;
    }

    .kongming-slot {
      width: 38px;
      height: 38px;
      margin-left: -19px;
      margin-top: -19px;
    }

    .kongming-hole {
      inset: 9px;
    }
  }
`

const STORAGE_VERSION = 1

function createVariantState(variant: BoardVariant): VariantState {
  return {
    snapshot: createInitialSnapshot(variant),
    undoStack: [],
    selectedPeg: null,
    hintMove: null,
    solved: false,
  }
}

function createInitialState(): KongmingState {
  return {
    variant: 'cross',
    variants: {
      cross: createVariantState('cross'),
      triangle: createVariantState('triangle'),
    },
  }
}

function isValidStoredSnapshot(value: unknown): value is StoredSnapshot {
  if (!value || typeof value !== 'object') {
    return false
  }

  const snapshot = value as Partial<StoredSnapshot>
  return typeof snapshot.occupiedMask === 'string' && typeof snapshot.moveCount === 'number'
}

function parseSnapshot(value: StoredSnapshot): PegGameSnapshot {
  return {
    occupiedMask: BigInt(value.occupiedMask),
    moveCount: value.moveCount,
  }
}

function serializeSnapshot(snapshot: PegGameSnapshot): StoredSnapshot {
  return {
    occupiedMask: snapshot.occupiedMask.toString(),
    moveCount: snapshot.moveCount,
  }
}

function isMove(value: unknown): value is PegMove {
  if (!value || typeof value !== 'object') {
    return false
  }

  const move = value as Partial<PegMove>
  return typeof move.from === 'number' && typeof move.over === 'number' && typeof move.to === 'number'
}

function loadStoredState(): KongmingState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<StoredKongmingPayload>

    if (parsed.version !== STORAGE_VERSION || (parsed.variant !== 'cross' && parsed.variant !== 'triangle')) {
      return null
    }

    const nextState = createInitialState()
    nextState.variant = parsed.variant

    for (const variant of ['cross', 'triangle'] as const) {
      const storedVariant = parsed.variants?.[variant]

      if (!storedVariant || !isValidStoredSnapshot(storedVariant.snapshot)) {
        continue
      }

      nextState.variants[variant] = {
        snapshot: parseSnapshot(storedVariant.snapshot),
        undoStack: Array.isArray(storedVariant.undoStack)
          ? storedVariant.undoStack.filter(isValidStoredSnapshot).slice(-MAX_UNDO_STEPS).map(parseSnapshot)
          : [],
        selectedPeg: typeof storedVariant.selectedPeg === 'number' ? storedVariant.selectedPeg : null,
        hintMove: isMove(storedVariant.hintMove) ? storedVariant.hintMove : null,
        solved: Boolean(storedVariant.solved),
      }
    }

    return nextState
  } catch (error) {
    console.warn('读取孔明棋进度失败', error)
    return null
  }
}

function getBoardMetrics(variant: BoardVariant) {
  if (variant === 'cross') {
    return {
      width: 470,
      height: 470,
      stepX: 58,
      stepY: 58,
      offsetX: 58,
      offsetY: 58,
    }
  }

  return {
    width: 420,
    height: 360,
    stepX: 74,
    stepY: 58,
    offsetX: 210,
    offsetY: 44,
  }
}

function getSlotStyle(position: PegPosition, variant: BoardVariant): React.CSSProperties {
  const metrics = getBoardMetrics(variant)

  if (variant === 'cross') {
    return {
      left: metrics.offsetX + position.col * metrics.stepX,
      top: metrics.offsetY + position.row * metrics.stepY,
    }
  }

  return {
    left: metrics.offsetX + (position.col - position.row / 2) * metrics.stepX,
    top: metrics.offsetY + position.row * metrics.stepY,
  }
}

export default function KongmingGame() {
  const [game, setGame] = useState<KongmingState>(() => createInitialState())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const storedState = loadStoredState()

    if (storedState) {
      setGame(storedState)
    }

    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return
    }

    const payload: StoredKongmingPayload = {
      version: STORAGE_VERSION,
      variant: game.variant,
      variants: {
        cross: {
          ...game.variants.cross,
          snapshot: serializeSnapshot(game.variants.cross.snapshot),
          undoStack: game.variants.cross.undoStack.map(serializeSnapshot),
        },
        triangle: {
          ...game.variants.triangle,
          snapshot: serializeSnapshot(game.variants.triangle.snapshot),
          undoStack: game.variants.triangle.undoStack.map(serializeSnapshot),
        },
      },
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('保存孔明棋进度失败', error)
    }
  }, [game, hydrated])

  const currentBoard = KONGMING_BOARDS[game.variant]
  const currentState = game.variants[game.variant]
  const legalMoves = useMemo(
    () => getLegalMoves(game.variant, currentState.snapshot),
    [currentState.snapshot, game.variant],
  )

  function patchCurrentVariant(updater: (state: VariantState) => VariantState) {
    setGame((current) => ({
      ...current,
      variants: {
        ...current.variants,
        [current.variant]: updater(current.variants[current.variant]),
      },
    }))
  }

  function selectVariant(variant: BoardVariant) {
    setGame((current) => ({
      ...current,
      variant,
    }))
  }

  function restartCurrentBoard() {
    patchCurrentVariant(() => createVariantState(game.variant))
  }

  function undoMove() {
    patchCurrentVariant((state) => {
      if (state.undoStack.length === 0) {
        return state
      }

      const previous = state.undoStack[state.undoStack.length - 1]
      return {
        ...state,
        snapshot: previous,
        undoStack: state.undoStack.slice(0, -1),
        selectedPeg: null,
        hintMove: null,
        solved: hasSolved(previous),
      }
    })
  }

  function showHint() {
    patchCurrentVariant((state) => {
      const hintMove = getHintMove(game.variant, state.snapshot)

      return {
        ...state,
        hintMove,
        selectedPeg: hintMove?.from ?? state.selectedPeg,
      }
    })
  }

  function applyPegMove(move: PegMove) {
    patchCurrentVariant((state) => {
      const nextSnapshot = applyMove(state.snapshot, move)

      return {
        ...state,
        snapshot: nextSnapshot,
        undoStack: [...state.undoStack, state.snapshot].slice(-MAX_UNDO_STEPS),
        selectedPeg: null,
        hintMove: null,
        solved: hasSolved(nextSnapshot),
      }
    })
  }

  function handlePositionClick(positionId: number) {
    const pegOccupied = isPegOccupied(currentState.snapshot, positionId)
    const movesFromSelected =
      currentState.selectedPeg !== null
        ? getLegalMovesFromPeg(game.variant, currentState.snapshot, currentState.selectedPeg)
        : []

    if (pegOccupied) {
      if (currentState.selectedPeg === positionId) {
        patchCurrentVariant((state) => ({
          ...state,
          selectedPeg: null,
          hintMove: null,
        }))
        return
      }

      const legalFromPeg = getLegalMovesFromPeg(game.variant, currentState.snapshot, positionId)

      patchCurrentVariant((state) => ({
        ...state,
        selectedPeg: legalFromPeg.length > 0 ? positionId : null,
        hintMove: null,
      }))
      return
    }

    if (currentState.selectedPeg === null) {
      return
    }

    const chosenMove = movesFromSelected.find((move) => move.to === positionId)

    if (!chosenMove) {
      return
    }

    applyPegMove(chosenMove)
  }

  const pegCount = countPegs(currentState.snapshot)
  const statusText = currentState.solved
    ? '只剩下一枚棋子，已经完成这一盘。'
    : hasNoMoves(game.variant, currentState.snapshot)
      ? '当前没有合法步了，这一盘已经走死。'
      : currentState.hintMove
        ? '已高亮一条推荐走法，你可以继续点终点位置完成它。'
        : hydrated
          ? '点一枚棋子，再点它可以跳到的空位。跨过的棋子会被移除。'
          : '正在恢复本地进度...'

  const statusClass = currentState.solved ? ' success' : hasNoMoves(game.variant, currentState.snapshot) ? ' fail' : ''
  const progress = ((currentBoard.positions.length - pegCount) / (currentBoard.positions.length - 1)) * 100

  return (
    <div className="kongming-app">
      <style>{componentStyles}</style>

      <section className="kongming-hero">
        <div className="kongming-eyebrow">Toolbox · 孔明棋</div>
        <h1>把棋子一颗颗跳掉，最后只留下中间那一枚。</h1>
        <p>经典十字盘和三角棋盘放在同一页里，支持撤销、重开、本地存档和下一步提示。</p>
        <div className="kongming-hero-tags">
          <span className="kongming-hero-tag">十字盘 + 三角盘</span>
          <span className="kongming-hero-tag">撤销 + 提示 + 本地存档</span>
          <span className="kongming-hero-tag">单页双棋盘切换</span>
        </div>

        <div className="kongming-variant-switch">
          {(['cross', 'triangle'] as const).map((variant) => {
            const board = KONGMING_BOARDS[variant]
            return (
              <button
                key={variant}
                type="button"
                className={`kongming-variant-btn${game.variant === variant ? ' active' : ''}`}
                onClick={() => selectVariant(variant)}
              >
                <div className="kongming-variant-label">{board.label}</div>
                <div className="kongming-variant-subtitle">{board.subtitle}</div>
              </button>
            )
          })}
        </div>
      </section>

      <div className="kongming-layout">
        <section className="kongming-board-card">
          <div className="kongming-meta-grid">
            <div className="kongming-chip">
              <div className="kongming-chip-label">版本</div>
              <div className="kongming-chip-value">{currentBoard.label}</div>
            </div>
            <div className="kongming-chip">
              <div className="kongming-chip-label">步数</div>
              <div className="kongming-chip-value">{currentState.snapshot.moveCount}</div>
            </div>
            <div className="kongming-chip">
              <div className="kongming-chip-label">剩余棋子</div>
              <div className="kongming-chip-value">{pegCount}</div>
            </div>
            <div className="kongming-chip">
              <div className="kongming-chip-label">可走步</div>
              <div className="kongming-chip-value">{legalMoves.length}</div>
            </div>
          </div>

          <div className="kongming-progress" style={{ marginTop: 16 }}>
            <div className="kongming-section-subtitle">
              当前版本的局面、步数和撤销栈会分别保存在浏览器本地。
            </div>
            <div className="kongming-progress-track">
              <div className="kongming-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className={`kongming-status${statusClass}`} style={{ marginTop: 16 }}>
            {statusText}
          </div>

          <div className="kongming-board-shell">
            <div className={`kongming-board ${game.variant}`}>
              {currentBoard.positions.map((position) => {
                const occupied = isPegOccupied(currentState.snapshot, position.id)
                const selectableTarget =
                  currentState.selectedPeg !== null &&
                  getLegalMovesFromPeg(game.variant, currentState.snapshot, currentState.selectedPeg).some(
                    (move) => move.to === position.id,
                  )
                const hinted = currentState.hintMove
                  ? currentState.hintMove.from === position.id ||
                    currentState.hintMove.over === position.id ||
                    currentState.hintMove.to === position.id
                  : false
                const selected = currentState.selectedPeg === position.id

                return (
                  <div
                    key={position.id}
                    className={`kongming-slot${hinted ? ' hint' : ''}${selectableTarget ? ' target' : ''}`}
                    style={getSlotStyle(position, game.variant)}
                  >
                    {occupied ? (
                      <button
                        type="button"
                        className={`kongming-peg${selected ? ' selected' : ''}`}
                        onClick={() => handlePositionClick(position.id)}
                        aria-label={`选择棋子 ${position.id + 1}`}
                      />
                    ) : (
                      <button
                        type="button"
                        className={`kongming-hole${selectableTarget ? ' selectable' : ''}${currentState.hintMove?.to === position.id ? ' hint' : ''}`}
                        onClick={() => handlePositionClick(position.id)}
                        aria-label={`空位 ${position.id + 1}`}
                        disabled={!selectableTarget}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <aside className="kongming-sidebar">
          <section className="kongming-card">
            <div className="kongming-section-title">操作</div>
            <div className="kongming-section-subtitle">
              提示功能会为当前局面高亮一条可行解的下一步，不会自动代下。
            </div>
            <div className="kongming-control-grid">
              <button type="button" className="kongming-btn primary" onClick={showHint} disabled={legalMoves.length === 0}>
                下一步提示
              </button>
              <button type="button" className="kongming-btn" onClick={undoMove} disabled={currentState.undoStack.length === 0}>
                撤销一步
              </button>
              <button type="button" className="kongming-btn" onClick={restartCurrentBoard}>
                重开当前版本
              </button>
              <button
                type="button"
                className="kongming-btn"
                onClick={() => selectVariant(game.variant === 'cross' ? 'triangle' : 'cross')}
              >
                切换到{game.variant === 'cross' ? '三角盘' : '十字盘'}
              </button>
            </div>
          </section>

          <section className="kongming-card">
            <div className="kongming-section-title">图例</div>
            <div className="kongming-legend-list">
              <div className="kongming-legend-item">
                <div className="kongming-legend-icon">
                  <div className="kongming-legend-peg" />
                </div>
                <div>实心圆棋子表示当前可操作的棋子。</div>
              </div>
              <div className="kongming-legend-item">
                <div className="kongming-legend-icon">
                  <div className="kongming-legend-hole" />
                </div>
                <div>空孔表示可以落子的有效位置，但只有符合跳跃规则时才能落下。</div>
              </div>
              <div className="kongming-legend-item">
                <div className="kongming-legend-icon">
                  <div className="kongming-legend-hint" />
                </div>
                <div>高亮孔位表示当前选中棋子的可跳目标，提示时会标出推荐路线。</div>
              </div>
            </div>
          </section>

          <section className="kongming-card">
            <div className="kongming-section-title">规则</div>
            <div className="kongming-section-subtitle">
              每一步都要跨过相邻的一枚棋子，并落到它后面的空位上。被跨过的那枚棋子会被移除。最后只剩一枚棋子时算成功。
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
