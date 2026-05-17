import { useEffect, useMemo, useState } from 'react'
import {
  KONGMING_BOARDS,
  KONGMING_BOARD_LIST,
  type BoardVariant,
  type PegBoardDefinition,
  type PegMove,
  type PegPosition,
} from '../lib/kongming/boards'
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

const STORAGE_KEY = 'mufeng_kongming_progress_v2'
const MAX_UNDO_STEPS = 200
const DEFAULT_VARIANT = KONGMING_BOARD_LIST[3]?.variant ?? KONGMING_BOARD_LIST[0].variant

interface VariantState extends PegStoredVariantState {}

interface KongmingState {
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
  version: 2
  variant: BoardVariant
  variants: Partial<Record<BoardVariant, StoredVariantState>>
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
    grid-template-columns: minmax(0, 1.38fr) minmax(320px, 390px);
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
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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

  .kongming-board {
    position: relative;
    max-width: 100%;
  }

  .kongming-slot {
    position: absolute;
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

    .kongming-meta-grid,
    .kongming-control-grid,
    .kongming-variant-switch {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`

const STORAGE_VERSION = 2

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
    variant: DEFAULT_VARIANT,
    variants: Object.fromEntries(
      KONGMING_BOARD_LIST.map((board) => [board.variant, createVariantState(board.variant)]),
    ) as Record<BoardVariant, VariantState>,
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

function isBoardVariant(value: unknown): value is BoardVariant {
  return typeof value === 'string' && value in KONGMING_BOARDS
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
    if (parsed.version !== STORAGE_VERSION || !isBoardVariant(parsed.variant)) {
      return null
    }

    const nextState = createInitialState()
    nextState.variant = parsed.variant

    for (const board of KONGMING_BOARD_LIST) {
      const storedVariant = parsed.variants?.[board.variant]

      if (!storedVariant || !isValidStoredSnapshot(storedVariant.snapshot)) {
        continue
      }

      nextState.variants[board.variant] = {
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
    console.warn('Failed to load kongming progress', error)
    return null
  }
}

function getBoardMetrics(board: PegBoardDefinition) {
  if (board.geometry === 'triangle') {
    const triangleOrder = board.bounds.rows
    const stepX = triangleOrder <= 5 ? 74 : triangleOrder <= 7 ? 56 : 42
    const stepY = triangleOrder <= 5 ? 58 : triangleOrder <= 7 ? 44 : 34
    const slotSize = triangleOrder <= 5 ? 54 : triangleOrder <= 7 ? 42 : 32
    const width = stepX * Math.max(3, triangleOrder - 1) + slotSize + 32
    const height = stepY * Math.max(3, triangleOrder - 1) + slotSize + 32

    return {
      width,
      height,
      stepX,
      stepY,
      offsetX: width / 2,
      offsetY: slotSize / 2 + 18,
      slotSize,
      holeInset: Math.max(7, Math.round(slotSize * 0.24)),
      pegInset: Math.max(5, Math.round(slotSize * 0.12)),
    }
  }

  const maxSpan = Math.max(board.bounds.rows, board.bounds.cols)
  const compact = maxSpan >= 9
  const step = compact ? 46 : 58
  const slotSize = compact ? 42 : 54
  const width = (board.bounds.cols - 1) * step + slotSize + 36
  const height = (board.bounds.rows - 1) * step + slotSize + 36

  return {
    width,
    height,
    stepX: step,
    stepY: step,
    offsetX: slotSize / 2 + 18,
    offsetY: slotSize / 2 + 18,
    slotSize,
    holeInset: Math.max(7, Math.round(slotSize * 0.24)),
    pegInset: Math.max(5, Math.round(slotSize * 0.12)),
  }
}

function getSlotStyle(position: PegPosition, board: PegBoardDefinition): React.CSSProperties {
  const metrics = getBoardMetrics(board)

  if (board.geometry === 'triangle') {
    return {
      left: metrics.offsetX + (position.col - position.row / 2) * metrics.stepX - metrics.slotSize / 2,
      top: metrics.offsetY + position.row * metrics.stepY - metrics.slotSize / 2,
      width: metrics.slotSize,
      height: metrics.slotSize,
    }
  }

  return {
    left: metrics.offsetX + position.col * metrics.stepX - metrics.slotSize / 2,
    top: metrics.offsetY + position.row * metrics.stepY - metrics.slotSize / 2,
    width: metrics.slotSize,
    height: metrics.slotSize,
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

    const variants = Object.fromEntries(
      KONGMING_BOARD_LIST.map((board) => [
        board.variant,
        {
          ...game.variants[board.variant],
          snapshot: serializeSnapshot(game.variants[board.variant].snapshot),
          undoStack: game.variants[board.variant].undoStack.map(serializeSnapshot),
        },
      ]),
    ) as Partial<Record<BoardVariant, StoredVariantState>>

    const payload: StoredKongmingPayload = {
      version: STORAGE_VERSION,
      variant: game.variant,
      variants,
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('Failed to save kongming progress', error)
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
  const metrics = getBoardMetrics(currentBoard)
  const statusText = currentState.solved
    ? '当前棋盘已经只剩下一枚棋子，可以切到下一种继续挑战。'
    : hasNoMoves(game.variant, currentState.snapshot)
      ? '当前局面已经没有合法步了，可以撤销一步或重开。'
      : currentState.hintMove
        ? '已经为你高亮了一手推荐走法，继续点击终点即可落子。'
        : hydrated
          ? '点选一枚棋子，再点它能跳到的空位。跨过的棋子会被移除。'
          : '正在恢复本地进度...'

  const statusClass = currentState.solved ? ' success' : hasNoMoves(game.variant, currentState.snapshot) ? ' fail' : ''
  const progress = ((currentBoard.positions.length - pegCount) / Math.max(1, currentBoard.positions.length - 1)) * 100

  return (
    <div className="kongming-app">
      <style>{componentStyles}</style>

      <section className="kongming-hero">
        <div className="kongming-eyebrow">Toolbox · 孔明棋</div>
        <h1>把图里的几种经典棋盘都放进来，再把三角盘扩展到 3 到 10 阶。</h1>
        <p>
          现在这页不再只是两个固定版本，而是一组可切换的孔明棋集合。
          十字系、菱形系和多阶三角盘共存，提示策略会按盘面规模自动切换强度与速度。
        </p>
        <div className="kongming-hero-tags">
          <span className="kongming-hero-tag">6 种经典变体</span>
          <span className="kongming-hero-tag">3-10 阶三角盘</span>
          <span className="kongming-hero-tag">撤销 + 提示 + 本地存档</span>
        </div>

        <div className="kongming-variant-switch">
          {KONGMING_BOARD_LIST.map((board) => (
            <button
              key={board.variant}
              type="button"
              className={`kongming-variant-btn${game.variant === board.variant ? ' active' : ''}`}
              onClick={() => selectVariant(board.variant)}
            >
              <div className="kongming-variant-label">{board.label}</div>
              <div className="kongming-variant-subtitle">{board.subtitle}</div>
            </button>
          ))}
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
              <div className="kongming-chip-label">合法步</div>
              <div className="kongming-chip-value">{legalMoves.length}</div>
            </div>
          </div>

          <div className="kongming-progress" style={{ marginTop: 16 }}>
            <div className="kongming-section-subtitle">
              每一种棋盘的当前局面、步数和撤销栈都会分别保存在浏览器本地。大盘提示会自动优先速度，小盘提示会更追求正确性。
            </div>
            <div className="kongming-progress-track">
              <div className="kongming-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className={`kongming-status${statusClass}`} style={{ marginTop: 16 }}>
            {statusText}
          </div>

          <div className="kongming-board-shell">
            <div className="kongming-board" style={{ width: metrics.width, height: metrics.height }}>
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
                const slotStyle = getSlotStyle(position, currentBoard)

                return (
                  <div
                    key={position.id}
                    className={`kongming-slot${hinted ? ' hint' : ''}${selectableTarget ? ' target' : ''}`}
                    style={slotStyle}
                  >
                    {occupied ? (
                      <button
                        type="button"
                        className={`kongming-peg${selected ? ' selected' : ''}`}
                        onClick={() => handlePositionClick(position.id)}
                        aria-label={`选择棋子 ${position.id + 1}`}
                        style={{ inset: metrics.pegInset }}
                      />
                    ) : (
                      <button
                        type="button"
                        className={`kongming-hole${selectableTarget ? ' selectable' : ''}${currentState.hintMove?.to === position.id ? ' hint' : ''}`}
                        onClick={() => handlePositionClick(position.id)}
                        aria-label={`空位 ${position.id + 1}`}
                        disabled={!selectableTarget}
                        style={{ inset: metrics.holeInset }}
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
              提示不会自动代你下，只会高亮一手建议。盘面越大，提示越偏向快速反馈；盘面越小，提示越偏向精确搜索。
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
                onClick={() => {
                  const currentIndex = KONGMING_BOARD_LIST.findIndex((board) => board.variant === game.variant)
                  const nextBoard = KONGMING_BOARD_LIST[(currentIndex + 1) % KONGMING_BOARD_LIST.length]
                  selectVariant(nextBoard.variant)
                }}
              >
                切换到下一盘
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
                <div>实体圆棋子表示当前可操作的棋子。</div>
              </div>
              <div className="kongming-legend-item">
                <div className="kongming-legend-icon">
                  <div className="kongming-legend-hole" />
                </div>
                <div>空孔表示有效落点，但必须满足跳跃规则时才能落下。</div>
              </div>
              <div className="kongming-legend-item">
                <div className="kongming-legend-icon">
                  <div className="kongming-legend-hint" />
                </div>
                <div>高亮孔位表示提示推荐的路线，或当前选中棋子的目标点。</div>
              </div>
            </div>
          </section>

          <section className="kongming-card">
            <div className="kongming-section-title">规则</div>
            <div className="kongming-section-subtitle">
              每一步都要跨过相邻的一枚棋子，并落到它后面的空位上。被跨过的那枚棋子会被移除。最后只剩下一枚棋子时算成功。
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
