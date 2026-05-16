import { useEffect, useState } from 'react'
import {
  attemptMove,
  countSatisfiedTargets,
  countTargets,
  createLevelSnapshot,
  hasLevelCompleted,
  isBoxValue,
  isTargetValue,
  type Direction,
  type GameSnapshot,
} from '../lib/sokoban/game'
import { SOKOBAN_LEVELS, TOTAL_LEVELS, type LevelMap, type TileValue } from '../lib/sokoban/levels'

const STORAGE_KEY = 'mufeng_sokoban_progress_v1'
const MAX_UNDO_STEPS = 300
const AUTO_ADVANCE_DELAY = 1200

interface GameState {
  levelIndex: number
  highestUnlockedLevel: number
  snapshot: GameSnapshot
  undoStack: GameSnapshot[]
  won: boolean
}

interface StoredGame extends GameState {
  version: 1
}

const directionRotations: Record<Direction, string> = {
  up: '0deg',
  right: '90deg',
  down: '180deg',
  left: '-90deg',
}

const componentStyles = `
  .sokoban-app {
    display: grid;
    gap: 22px;
  }

  .sokoban-hero,
  .sokoban-card,
  .sokoban-board-card {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(142, 175, 156, 0.18);
    border-radius: 28px;
    box-shadow: 0 22px 54px rgba(89, 124, 106, 0.08);
    backdrop-filter: blur(18px);
  }

  .sokoban-hero {
    padding: 30px 28px;
    background:
      radial-gradient(circle at top right, rgba(179, 219, 196, 0.42), transparent 30%),
      linear-gradient(155deg, rgba(255,255,255,0.84), rgba(248,252,249,0.74));
  }

  .sokoban-eyebrow {
    display: inline-flex;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(105, 179, 143, 0.12);
    color: #4d9273;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
  }

  .sokoban-hero h1 {
    margin-top: 14px;
    font-family: "Noto Serif SC", serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    color: #24332d;
    line-height: 1.28;
  }

  .sokoban-hero p {
    margin-top: 12px;
    max-width: 760px;
    color: #5f7469;
    line-height: 1.9;
    font-size: 0.98rem;
  }

  .sokoban-hero-tags {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .sokoban-hero-tag {
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.76);
    border: 1px solid rgba(142, 175, 156, 0.16);
    color: #6c7f75;
    font-size: 0.82rem;
  }

  .sokoban-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(290px, 360px);
    gap: 18px;
    align-items: start;
  }

  .sokoban-board-card {
    padding: 22px;
    background:
      linear-gradient(165deg, rgba(255,255,255,0.84), rgba(242,249,244,0.72)),
      radial-gradient(circle at top left, rgba(160, 205, 178, 0.18), transparent 28%);
  }

  .sokoban-card {
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  .sokoban-sidebar {
    display: grid;
    gap: 16px;
  }

  .sokoban-section-title {
    font-size: 0.98rem;
    font-weight: 700;
    color: #24332d;
  }

  .sokoban-section-subtitle {
    color: #6c7f75;
    font-size: 0.82rem;
    line-height: 1.7;
  }

  .sokoban-meta-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .sokoban-chip {
    border-radius: 22px;
    padding: 14px 14px 12px;
    background: rgba(248, 252, 249, 0.88);
    border: 1px solid rgba(142, 175, 156, 0.16);
  }

  .sokoban-chip-label {
    color: #74887d;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .sokoban-chip-value {
    margin-top: 6px;
    font-size: 1.1rem;
    font-weight: 700;
    color: #24332d;
  }

  .sokoban-progress {
    display: grid;
    gap: 8px;
  }

  .sokoban-progress-track {
    height: 10px;
    border-radius: 999px;
    background: rgba(219, 232, 223, 0.85);
    overflow: hidden;
  }

  .sokoban-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #5f9f7e, #7ab596);
  }

  .sokoban-status {
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(142, 175, 156, 0.16);
    background: rgba(248, 252, 249, 0.84);
    color: #4f6258;
    font-size: 0.9rem;
    line-height: 1.75;
  }

  .sokoban-status.success {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.16), rgba(255,255,255,0.8));
    border-color: rgba(105, 179, 143, 0.28);
    color: #35684f;
  }

  .sokoban-control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .sokoban-btn {
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

  .sokoban-btn:hover:enabled {
    transform: translateY(-1px);
    border-color: rgba(105, 179, 143, 0.36);
    background: rgba(246, 251, 248, 0.96);
    box-shadow: 0 12px 26px rgba(89, 124, 106, 0.08);
  }

  .sokoban-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .sokoban-btn.primary {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.18), rgba(255,255,255,0.9));
    color: #35684f;
  }

  .sokoban-board-shell {
    padding: 16px;
    border-radius: 26px;
    background:
      linear-gradient(180deg, rgba(235, 244, 238, 0.96), rgba(226, 239, 230, 0.92)),
      linear-gradient(90deg, rgba(120, 161, 140, 0.06) 1px, transparent 1px),
      linear-gradient(rgba(120, 161, 140, 0.06) 1px, transparent 1px);
    border: 1px solid rgba(142, 175, 156, 0.2);
  }

  .sokoban-board {
    display: grid;
    gap: 5px;
  }

  .sokoban-cell {
    position: relative;
    aspect-ratio: 1;
    border-radius: 14px;
    background:
      linear-gradient(145deg, rgba(255,255,255,0.9), rgba(242, 247, 243, 0.88));
    border: 1px solid rgba(166, 190, 176, 0.35);
    overflow: hidden;
  }

  .sokoban-cell::before {
    content: "";
    position: absolute;
    inset: 16%;
    border-radius: 10px;
    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), transparent 60%);
    opacity: 0.9;
  }

  .sokoban-cell.target {
    background: linear-gradient(145deg, rgba(244, 250, 246, 0.96), rgba(226, 240, 231, 0.92));
  }

  .sokoban-cell.wall {
    background: linear-gradient(145deg, rgba(194, 222, 207, 0.62), rgba(169, 206, 187, 0.74));
    border-color: rgba(98, 143, 118, 0.42);
  }

  .sokoban-cell svg {
    position: absolute;
    inset: 12%;
    width: 76%;
    height: 76%;
    z-index: 1;
  }

  .sokoban-cell.wall svg {
    inset: 10%;
    width: 80%;
    height: 80%;
  }

  .sokoban-target-icon {
    color: #537968;
  }

  .sokoban-box-icon {
    color: #24332d;
  }

  .sokoban-player-icon {
    color: #24332d;
    filter: drop-shadow(0 8px 12px rgba(66, 100, 80, 0.14));
  }

  .sokoban-wall-icon {
    color: #48765f;
  }

  .sokoban-legend-list {
    display: grid;
    gap: 10px;
  }

  .sokoban-legend-item {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 12px;
    align-items: center;
    color: #51655b;
    font-size: 0.9rem;
  }

  .sokoban-legend-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(244, 250, 246, 0.92);
    border: 1px solid rgba(142, 175, 156, 0.18);
  }

  .sokoban-legend-icon svg {
    width: 30px;
    height: 30px;
  }

  .sokoban-level-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    max-height: 340px;
    overflow: auto;
    padding-right: 2px;
  }

  .sokoban-level-btn {
    border: 1px solid rgba(142, 175, 156, 0.18);
    border-radius: 14px;
    min-height: 52px;
    background: rgba(248, 252, 249, 0.88);
    color: #486355;
    font: inherit;
    font-size: 0.9rem;
    cursor: pointer;
    transition:
      transform 0.24s ease,
      background 0.24s ease,
      border-color 0.24s ease;
  }

  .sokoban-level-btn:hover:enabled {
    transform: translateY(-1px);
    background: rgba(255,255,255,0.96);
    border-color: rgba(105, 179, 143, 0.3);
  }

  .sokoban-level-btn.active {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.18), rgba(255,255,255,0.92));
    border-color: rgba(105, 179, 143, 0.36);
    color: #35684f;
    font-weight: 700;
  }

  .sokoban-level-btn.completed {
    color: #2f5e48;
  }

  .sokoban-level-btn.locked {
    opacity: 0.42;
    cursor: not-allowed;
  }

  .sokoban-pad {
    margin-top: 16px;
    display: grid;
    justify-content: center;
  }

  .sokoban-pad-grid {
    display: grid;
    grid-template-columns: repeat(3, 56px);
    gap: 10px;
    justify-content: center;
  }

  .sokoban-pad-btn,
  .sokoban-pad-spacer {
    width: 56px;
    height: 56px;
    border-radius: 18px;
  }

  .sokoban-pad-btn {
    border: 1px solid rgba(142, 175, 156, 0.18);
    background: rgba(255,255,255,0.82);
    display: grid;
    place-items: center;
    cursor: pointer;
  }

  .sokoban-pad-btn:hover {
    background: rgba(248, 252, 249, 0.96);
  }

  .sokoban-pad-triangle {
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-bottom: 18px solid #2f5141;
  }

  .sokoban-pad-down .sokoban-pad-triangle {
    transform: rotate(180deg);
  }

  .sokoban-pad-left .sokoban-pad-triangle {
    transform: rotate(-90deg);
  }

  .sokoban-pad-right .sokoban-pad-triangle {
    transform: rotate(90deg);
  }

  .sokoban-pad-spacer {
    background: transparent;
  }

  @media (max-width: 980px) {
    .sokoban-layout {
      grid-template-columns: 1fr;
    }

    .sokoban-sidebar {
      order: 2;
    }
  }

  @media (max-width: 760px) {
    .sokoban-hero {
      padding: 24px 20px;
    }

    .sokoban-board-card,
    .sokoban-card {
      padding: 16px;
      border-radius: 24px;
    }

    .sokoban-meta-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .sokoban-control-grid {
      grid-template-columns: 1fr;
    }

    .sokoban-level-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      max-height: 280px;
    }
  }
`

function clampLevelIndex(value: number): number {
  return Math.max(0, Math.min(TOTAL_LEVELS - 1, value))
}

function createGameState(levelIndex = 0, highestUnlockedLevel = 0): GameState {
  const normalizedLevelIndex = clampLevelIndex(levelIndex)
  const normalizedHighestUnlocked = Math.max(normalizedLevelIndex, clampLevelIndex(highestUnlockedLevel))

  return {
    levelIndex: normalizedLevelIndex,
    highestUnlockedLevel: normalizedHighestUnlocked,
    snapshot: createLevelSnapshot(normalizedLevelIndex),
    undoStack: [],
    won: false,
  }
}

function isDirection(value: unknown): value is Direction {
  return value === 'up' || value === 'down' || value === 'left' || value === 'right'
}

function isTileValue(value: unknown): value is TileValue {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4 || value === 5
}

function isLevelMap(value: unknown): value is LevelMap {
  if (!Array.isArray(value) || value.length === 0 || !Array.isArray(value[0])) {
    return false
  }

  const columnCount = value[0].length

  return value.every(
    (row) =>
      Array.isArray(row) &&
      row.length === columnCount &&
      row.every((cellValue) => isTileValue(cellValue)),
  )
}

function isSnapshot(value: unknown): value is GameSnapshot {
  if (!value || typeof value !== 'object') {
    return false
  }

  const snapshot = value as Partial<GameSnapshot>

  if (!isLevelMap(snapshot.map) || !isDirection(snapshot.direction) || typeof snapshot.moves !== 'number') {
    return false
  }

  if (
    !snapshot.player ||
    typeof snapshot.player.row !== 'number' ||
    typeof snapshot.player.col !== 'number'
  ) {
    return false
  }

  const { row, col } = snapshot.player

  if (row < 0 || row >= snapshot.map.length || col < 0 || col >= snapshot.map[0].length) {
    return false
  }

  return snapshot.map[row][col] === 4
}

function loadStoredGame(): GameState | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<StoredGame>

    if (parsed.version !== 1 || typeof parsed.levelIndex !== 'number') {
      return null
    }

    if (!isSnapshot(parsed.snapshot)) {
      return null
    }

    const levelIndex = clampLevelIndex(parsed.levelIndex)
    const highestUnlockedLevel =
      typeof parsed.highestUnlockedLevel === 'number'
        ? Math.max(levelIndex, clampLevelIndex(parsed.highestUnlockedLevel))
        : levelIndex

    const undoStack = Array.isArray(parsed.undoStack)
      ? parsed.undoStack.filter((snapshot) => isSnapshot(snapshot)).slice(-MAX_UNDO_STEPS)
      : []

    const won = Boolean(parsed.won) && hasLevelCompleted(levelIndex, parsed.snapshot.map)

    return {
      levelIndex,
      highestUnlockedLevel,
      snapshot: parsed.snapshot,
      undoStack,
      won,
    }
  } catch (error) {
    console.warn('读取推箱子进度失败', error)
    return null
  }
}

function getDirectionFromKey(key: string): Direction | null {
  switch (key) {
    case 'arrowup':
    case 'w':
      return 'up'
    case 'arrowdown':
    case 's':
      return 'down'
    case 'arrowleft':
    case 'a':
      return 'left'
    case 'arrowright':
    case 'd':
      return 'right'
    default:
      return null
  }
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 100 100" className="sokoban-target-icon" aria-hidden="true">
      <path
        d="M28 28L72 72M72 28L28 72"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 100 100" className="sokoban-box-icon" aria-hidden="true">
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="10" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.35" />
    </svg>
  )
}

function WallIcon() {
  return (
    <svg viewBox="0 0 100 100" className="sokoban-wall-icon" aria-hidden="true">
      <rect x="16" y="16" width="68" height="68" rx="16" fill="currentColor" opacity="0.18" />
      <rect x="16" y="16" width="68" height="68" rx="16" fill="none" stroke="currentColor" strokeWidth="6" />
      <path d="M16 50H84M50 16V84" stroke="currentColor" strokeWidth="6" strokeLinecap="round" opacity="0.82" />
    </svg>
  )
}

function PlayerIcon({ direction }: { direction: Direction }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="sokoban-player-icon"
      aria-hidden="true"
      style={{ transform: `rotate(${directionRotations[direction]})` }}
    >
      <path d="M50 18L78 76H22Z" fill="currentColor" />
      <path d="M50 30L68 66H32Z" fill="rgba(255,255,255,0.34)" />
    </svg>
  )
}

function renderCell(baseTile: TileValue, currentTile: TileValue, direction: Direction) {
  if (currentTile === 1) {
    return (
      <div className="sokoban-cell wall">
        <WallIcon />
      </div>
    )
  }

  const target = isTargetValue(baseTile)
  const box = isBoxValue(currentTile)
  const player = currentTile === 4

  return (
    <div className={`sokoban-cell${target ? ' target' : ''}`}>
      {target ? <TargetIcon /> : null}
      {box ? <BoxIcon /> : null}
      {player ? <PlayerIcon direction={direction} /> : null}
    </div>
  )
}

export default function SokobanGame() {
  const [game, setGame] = useState<GameState>(() => createGameState())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const storedGame = loadStoredGame()

    if (storedGame) {
      setGame(storedGame)
    }

    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return
    }

    const payload: StoredGame = {
      version: 1,
      ...game,
      undoStack: game.undoStack.slice(-MAX_UNDO_STEPS),
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('保存推箱子进度失败', error)
    }
  }, [game, hydrated])

  useEffect(() => {
    if (!hydrated || !game.won || game.levelIndex >= TOTAL_LEVELS - 1) {
      return
    }

    const timer = window.setTimeout(() => {
      setGame((current) => {
        if (!current.won || current.levelIndex !== game.levelIndex) {
          return current
        }

        return createGameState(current.levelIndex + 1, current.highestUnlockedLevel)
      })
    }, AUTO_ADVANCE_DELAY)

    return () => {
      window.clearTimeout(timer)
    }
  }, [game.levelIndex, game.won, hydrated])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement
      const activeTag = activeElement?.tagName

      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return
      }

      const normalizedKey = event.key.toLowerCase()

      if (normalizedKey === 'z') {
        event.preventDefault()
        undoMove()
        return
      }

      const direction = getDirectionFromKey(normalizedKey)

      if (!direction) {
        return
      }

      event.preventDefault()

      setGame((current) => {
        const result = attemptMove(current.levelIndex, current.snapshot, direction)

        if (!result.moved) {
          if (result.snapshot.direction === current.snapshot.direction) {
            return current
          }

          return {
            ...current,
            snapshot: result.snapshot,
            won: false,
          }
        }

        const won = hasLevelCompleted(current.levelIndex, result.snapshot.map)
        const highestUnlockedLevel = won
          ? Math.min(TOTAL_LEVELS - 1, Math.max(current.highestUnlockedLevel, current.levelIndex + 1))
          : current.highestUnlockedLevel

        return {
          ...current,
          snapshot: result.snapshot,
          undoStack: [...current.undoStack, current.snapshot].slice(-MAX_UNDO_STEPS),
          highestUnlockedLevel,
          won,
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [hydrated, game.levelIndex, game.snapshot])

  function move(direction: Direction) {
    setGame((current) => {
      const result = attemptMove(current.levelIndex, current.snapshot, direction)

      if (!result.moved) {
        if (result.snapshot.direction === current.snapshot.direction) {
          return current
        }

        return {
          ...current,
          snapshot: result.snapshot,
          won: false,
        }
      }

      const won = hasLevelCompleted(current.levelIndex, result.snapshot.map)
      const highestUnlockedLevel = won
        ? Math.min(TOTAL_LEVELS - 1, Math.max(current.highestUnlockedLevel, current.levelIndex + 1))
        : current.highestUnlockedLevel

      return {
        ...current,
        snapshot: result.snapshot,
        undoStack: [...current.undoStack, current.snapshot].slice(-MAX_UNDO_STEPS),
        highestUnlockedLevel,
        won,
      }
    })
  }

  function restartLevel() {
    setGame((current) => createGameState(current.levelIndex, current.highestUnlockedLevel))
  }

  function undoMove() {
    setGame((current) => {
      if (current.undoStack.length === 0) {
        return current
      }

      const previousSnapshot = current.undoStack[current.undoStack.length - 1]

      return {
        ...current,
        snapshot: previousSnapshot,
        undoStack: current.undoStack.slice(0, -1),
        won: false,
      }
    })
  }

  function jumpToLevel(levelIndex: number) {
    setGame((current) => {
      if (levelIndex > current.highestUnlockedLevel) {
        return current
      }

      return createGameState(levelIndex, current.highestUnlockedLevel)
    })
  }

  function stepLevel(step: number) {
    setGame((current) => {
      const nextLevelIndex = clampLevelIndex(current.levelIndex + step)

      if (nextLevelIndex > current.highestUnlockedLevel) {
        return current
      }

      return createGameState(nextLevelIndex, current.highestUnlockedLevel)
    })
  }

  const baseLevel = SOKOBAN_LEVELS[game.levelIndex]
  const targetCount = countTargets(game.levelIndex)
  const completedTargets = countSatisfiedTargets(game.levelIndex, game.snapshot.map)
  const unlockedCount = game.highestUnlockedLevel + 1

  const statusText = game.won
    ? game.levelIndex === TOTAL_LEVELS - 1
      ? '100 关全部通关，进度已经保存在当前浏览器里。'
      : '本关已通过，正在进入下一关。你也可以先点撤销或手动选关。'
    : hydrated
      ? '键盘方向键 / WASD 都可以操作。把圆环推到 X 上，撤销、选关和本地存档都已经接好。'
      : '正在恢复本地进度...'

  return (
    <div className="sokoban-app">
      <style>{componentStyles}</style>

        <section className="sokoban-hero">
          <div className="sokoban-eyebrow">Toolbox · 推箱子</div>
          <h1>把圆环推到 X 上，把每一关稳稳推过去。</h1>
          <p>100 关完整保留，支持撤销、选关和本地进度保存。</p>
        <div className="sokoban-hero-tags">
          <span className="sokoban-hero-tag">100 关完整保留</span>
          <span className="sokoban-hero-tag">撤销 + 选关 + 本地存档</span>
          <span className="sokoban-hero-tag">X / 圆环 / 三角形 SVG 图标</span>
        </div>
      </section>

      <div className="sokoban-layout">
        <section className="sokoban-board-card">
          <div className="sokoban-meta-grid">
            <div className="sokoban-chip">
              <div className="sokoban-chip-label">关卡</div>
              <div className="sokoban-chip-value">{game.levelIndex + 1} / {TOTAL_LEVELS}</div>
            </div>
            <div className="sokoban-chip">
              <div className="sokoban-chip-label">步数</div>
              <div className="sokoban-chip-value">{game.snapshot.moves}</div>
            </div>
            <div className="sokoban-chip">
              <div className="sokoban-chip-label">归位</div>
              <div className="sokoban-chip-value">{completedTargets} / {targetCount}</div>
            </div>
            <div className="sokoban-chip">
              <div className="sokoban-chip-label">已解锁</div>
              <div className="sokoban-chip-value">{unlockedCount} / {TOTAL_LEVELS}</div>
            </div>
          </div>

          <div className="sokoban-progress" style={{ marginTop: 16 }}>
            <div className="sokoban-section-subtitle">
              当前进度会自动保存在浏览器本地，刷新页面后会继续恢复。
            </div>
            <div className="sokoban-progress-track">
              <div
                className="sokoban-progress-fill"
                style={{ width: `${(unlockedCount / TOTAL_LEVELS) * 100}%` }}
              />
            </div>
          </div>

          <div className={`sokoban-status${game.won ? ' success' : ''}`} style={{ marginTop: 16 }}>
            {statusText}
          </div>

          <div className="sokoban-board-shell" style={{ marginTop: 18 }}>
            <div
              className="sokoban-board"
              style={{
                gridTemplateColumns: `repeat(${game.snapshot.map[0].length}, minmax(0, 1fr))`,
              }}
            >
              {game.snapshot.map.map((row, rowIndex) =>
                row.map((currentTile, columnIndex) => (
                  <div key={`${rowIndex}-${columnIndex}`}>
                    {renderCell(baseLevel[rowIndex][columnIndex], currentTile, game.snapshot.direction)}
                  </div>
                )),
              )}
            </div>
          </div>

          <div className="sokoban-pad">
            <div className="sokoban-section-subtitle" style={{ textAlign: 'center', marginBottom: 12 }}>
              触控方向键
            </div>
            <div className="sokoban-pad-grid">
              <div className="sokoban-pad-spacer" />
              <button type="button" className="sokoban-pad-btn" onClick={() => move('up')} aria-label="向上">
                <span className="sokoban-pad-triangle" />
              </button>
              <div className="sokoban-pad-spacer" />

              <button
                type="button"
                className="sokoban-pad-btn sokoban-pad-left"
                onClick={() => move('left')}
                aria-label="向左"
              >
                <span className="sokoban-pad-triangle" />
              </button>
              <button type="button" className="sokoban-pad-btn sokoban-pad-down" onClick={() => move('down')} aria-label="向下">
                <span className="sokoban-pad-triangle" />
              </button>
              <button
                type="button"
                className="sokoban-pad-btn sokoban-pad-right"
                onClick={() => move('right')}
                aria-label="向右"
              >
                <span className="sokoban-pad-triangle" />
              </button>
            </div>
          </div>
        </section>

        <aside className="sokoban-sidebar">
          <section className="sokoban-card">
            <div className="sokoban-section-title">图例</div>
            <div className="sokoban-legend-list">
              <div className="sokoban-legend-item">
                <div className="sokoban-legend-icon">
                  <TargetIcon />
                </div>
                <div>X 表示目标点，圆环要被推进到这里。</div>
              </div>
              <div className="sokoban-legend-item">
                <div className="sokoban-legend-icon">
                  <BoxIcon />
                </div>
                <div>圆环表示箱子，推动时一次只能推一个。</div>
              </div>
              <div className="sokoban-legend-item">
                <div className="sokoban-legend-icon">
                  <PlayerIcon direction="up" />
                </div>
                <div>三角形表示玩家，朝向会跟随输入方向变化。</div>
              </div>
              <div className="sokoban-legend-item">
                <div className="sokoban-legend-icon">
                  <WallIcon />
                </div>
                <div>几何砖块表示墙，不能穿过，也不能把箱子推进去。</div>
              </div>
            </div>
          </section>

          <section className="sokoban-card">
            <div className="sokoban-section-title">操作</div>
            <div className="sokoban-section-subtitle">
              上一关 / 下一关会沿着你已解锁的进度前后切换，重开会清空本关撤销栈。
            </div>
            <div className="sokoban-control-grid">
              <button
                type="button"
                className="sokoban-btn"
                onClick={() => stepLevel(-1)}
                disabled={game.levelIndex === 0}
              >
                上一关
              </button>
              <button
                type="button"
                className="sokoban-btn"
                onClick={() => stepLevel(1)}
                disabled={game.levelIndex >= game.highestUnlockedLevel || game.levelIndex >= TOTAL_LEVELS - 1}
              >
                下一关
              </button>
              <button type="button" className="sokoban-btn primary" onClick={undoMove} disabled={game.undoStack.length === 0}>
                撤销一步
              </button>
              <button type="button" className="sokoban-btn" onClick={restartLevel}>
                重开本关
              </button>
            </div>
          </section>

          <section className="sokoban-card">
            <div className="sokoban-section-title">关卡选择器</div>
            <div className="sokoban-section-subtitle">
              只开放到你当前已解锁的最高关卡，已通过的关卡会用更深的颜色标出来。
            </div>
            <div className="sokoban-level-grid">
              {Array.from({ length: TOTAL_LEVELS }, (_, index) => {
                const locked = index > game.highestUnlockedLevel
                const active = index === game.levelIndex
                const completed = index < game.highestUnlockedLevel

                return (
                  <button
                    key={index}
                    type="button"
                    className={`sokoban-level-btn${active ? ' active' : ''}${completed ? ' completed' : ''}${locked ? ' locked' : ''}`}
                    onClick={() => jumpToLevel(index)}
                    disabled={locked}
                    aria-label={`第 ${index + 1} 关`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
