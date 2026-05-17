import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'mufeng_twenty_four_progress_v1'
const TARGET = 24

type Operator = '+' | '-' | '*' | '/'

interface Puzzle {
  numbers: number[]
  solution: string
}

interface StoredProgress {
  version: 1
  solvedCount: number
  streak: number
  bestTimeSeconds: number | null
  lastPuzzleStartedAt: number | null
  currentPuzzle: Puzzle | null
}

interface ProgressState {
  solvedCount: number
  streak: number
  bestTimeSeconds: number | null
}

interface SolverNode {
  value: number
  expr: string
}

const componentStyles = `
  .twenty-four-app {
    display: grid;
    gap: 22px;
  }

  .twenty-four-hero,
  .twenty-four-card,
  .twenty-four-board-card {
    background: rgba(255, 255, 255, 0.78);
    border: 1px solid rgba(142, 175, 156, 0.18);
    border-radius: 28px;
    box-shadow: 0 22px 54px rgba(89, 124, 106, 0.08);
    backdrop-filter: blur(18px);
  }

  .twenty-four-hero {
    padding: 30px 28px;
    background:
      radial-gradient(circle at top right, rgba(179, 219, 196, 0.42), transparent 30%),
      linear-gradient(155deg, rgba(255,255,255,0.84), rgba(248,252,249,0.74));
  }

  .twenty-four-eyebrow {
    display: inline-flex;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(105, 179, 143, 0.12);
    color: #4d9273;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
  }

  .twenty-four-hero h1 {
    margin-top: 14px;
    font-family: "Noto Serif SC", serif;
    font-size: clamp(2rem, 4vw, 2.8rem);
    color: #24332d;
    line-height: 1.28;
  }

  .twenty-four-hero p {
    margin-top: 12px;
    max-width: 760px;
    color: #5f7469;
    line-height: 1.9;
    font-size: 0.98rem;
  }

  .twenty-four-hero-tags {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .twenty-four-hero-tag {
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.76);
    border: 1px solid rgba(142, 175, 156, 0.16);
    color: #6c7f75;
    font-size: 0.82rem;
  }

  .twenty-four-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(300px, 360px);
    gap: 18px;
    align-items: start;
  }

  .twenty-four-board-card {
    padding: 22px;
    background:
      linear-gradient(165deg, rgba(255,255,255,0.84), rgba(242,249,244,0.72)),
      radial-gradient(circle at top left, rgba(160, 205, 178, 0.18), transparent 28%);
  }

  .twenty-four-card {
    padding: 18px;
    display: grid;
    gap: 14px;
  }

  .twenty-four-sidebar {
    display: grid;
    gap: 16px;
  }

  .twenty-four-section-title {
    font-size: 0.98rem;
    font-weight: 700;
    color: #24332d;
  }

  .twenty-four-section-subtitle {
    color: #6c7f75;
    font-size: 0.82rem;
    line-height: 1.7;
  }

  .twenty-four-meta-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .twenty-four-chip {
    border-radius: 22px;
    padding: 14px 14px 12px;
    background: rgba(248, 252, 249, 0.88);
    border: 1px solid rgba(142, 175, 156, 0.16);
  }

  .twenty-four-chip-label {
    color: #74887d;
    font-size: 0.74rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .twenty-four-chip-value {
    margin-top: 6px;
    font-size: 1.1rem;
    font-weight: 700;
    color: #24332d;
  }

  .twenty-four-status {
    margin-top: 16px;
    padding: 12px 14px;
    border-radius: 18px;
    border: 1px solid rgba(142, 175, 156, 0.16);
    background: rgba(248, 252, 249, 0.84);
    color: #4f6258;
    font-size: 0.9rem;
    line-height: 1.75;
  }

  .twenty-four-status.success {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.16), rgba(255,255,255,0.8));
    border-color: rgba(105, 179, 143, 0.28);
    color: #35684f;
  }

  .twenty-four-status.warn {
    background: linear-gradient(135deg, rgba(214, 156, 90, 0.14), rgba(255,255,255,0.84));
    border-color: rgba(214, 156, 90, 0.24);
    color: #8b6330;
  }

  .twenty-four-board-shell {
    margin-top: 18px;
    padding: 18px;
    border-radius: 26px;
    background:
      linear-gradient(180deg, rgba(235, 244, 238, 0.96), rgba(226, 239, 230, 0.92)),
      linear-gradient(90deg, rgba(120, 161, 140, 0.06) 1px, transparent 1px),
      linear-gradient(rgba(120, 161, 140, 0.06) 1px, transparent 1px);
    border: 1px solid rgba(142, 175, 156, 0.2);
  }

  .twenty-four-cards {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .twenty-four-number-btn {
    border: 1px solid rgba(142, 175, 156, 0.18);
    border-radius: 24px;
    padding: 16px 12px 14px;
    min-height: 124px;
    background:
      linear-gradient(160deg, rgba(255,255,255,0.95), rgba(241,248,243,0.92)),
      radial-gradient(circle at top right, rgba(179, 219, 196, 0.24), transparent 35%);
    color: #24332d;
    cursor: pointer;
    transition:
      transform 0.24s ease,
      box-shadow 0.24s ease,
      border-color 0.24s ease,
      opacity 0.24s ease;
  }

  .twenty-four-number-btn:hover:enabled {
    transform: translateY(-2px);
    border-color: rgba(105, 179, 143, 0.36);
    box-shadow: 0 16px 30px rgba(89, 124, 106, 0.08);
  }

  .twenty-four-number-btn.used {
    opacity: 0.46;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .twenty-four-card-rank {
    font-family: "Noto Serif SC", serif;
    font-size: clamp(2rem, 5vw, 2.8rem);
    line-height: 1;
  }

  .twenty-four-card-value {
    margin-top: 10px;
    font-size: 0.86rem;
    color: #60756a;
  }

  .twenty-four-card-slot {
    margin-top: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 42px;
    min-height: 28px;
    border-radius: 999px;
    background: rgba(105, 179, 143, 0.12);
    color: #4d9273;
    font-size: 0.78rem;
  }

  .twenty-four-input-shell {
    margin-top: 18px;
    display: grid;
    gap: 12px;
  }

  .twenty-four-expression {
    width: 100%;
    min-height: 104px;
    border: 1px solid rgba(142, 175, 156, 0.2);
    border-radius: 22px;
    background: rgba(255,255,255,0.84);
    color: #24332d;
    padding: 16px 18px;
    font: inherit;
    font-size: 1rem;
    line-height: 1.8;
    resize: vertical;
  }

  .twenty-four-expression:focus {
    outline: none;
    border-color: rgba(105, 179, 143, 0.42);
    box-shadow: 0 0 0 4px rgba(105, 179, 143, 0.12);
  }

  .twenty-four-keypad {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .twenty-four-btn {
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

  .twenty-four-btn:hover:enabled {
    transform: translateY(-1px);
    border-color: rgba(105, 179, 143, 0.36);
    background: rgba(246, 251, 248, 0.96);
    box-shadow: 0 12px 26px rgba(89, 124, 106, 0.08);
  }

  .twenty-four-btn:disabled {
    opacity: 0.52;
    cursor: not-allowed;
  }

  .twenty-four-btn.primary {
    background: linear-gradient(135deg, rgba(105, 179, 143, 0.18), rgba(255,255,255,0.9));
    color: #35684f;
  }

  .twenty-four-btn.accent {
    background: linear-gradient(135deg, rgba(214, 156, 90, 0.15), rgba(255,255,255,0.92));
    color: #8b6330;
  }

  .twenty-four-control-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .twenty-four-used-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .twenty-four-used-chip {
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.76);
    border: 1px solid rgba(142, 175, 156, 0.16);
    color: #5e7267;
    font-size: 0.8rem;
  }

  .twenty-four-legend-list {
    display: grid;
    gap: 10px;
  }

  .twenty-four-legend-item {
    display: grid;
    grid-template-columns: 48px 1fr;
    gap: 12px;
    align-items: center;
    color: #51655b;
    font-size: 0.9rem;
  }

  .twenty-four-legend-icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(244, 250, 246, 0.92);
    border: 1px solid rgba(142, 175, 156, 0.18);
    color: #35684f;
    font-weight: 700;
  }

  .twenty-four-hint {
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(248, 252, 249, 0.88);
    border: 1px solid rgba(142, 175, 156, 0.16);
    color: #486355;
    line-height: 1.8;
    word-break: break-word;
  }

  @media (max-width: 980px) {
    .twenty-four-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .twenty-four-hero {
      padding: 24px 20px;
    }

    .twenty-four-board-card,
    .twenty-four-card {
      padding: 16px;
      border-radius: 24px;
    }

    .twenty-four-meta-grid,
    .twenty-four-cards,
    .twenty-four-keypad,
    .twenty-four-control-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`

function getRankLabel(value: number) {
  switch (value) {
    case 1:
      return 'A'
    case 11:
      return 'J'
    case 12:
      return 'Q'
    case 13:
      return 'K'
    default:
      return String(value)
  }
}

function formatCardLabel(value: number) {
  const rank = getRankLabel(value)
  return rank === String(value) ? rank : `${rank} (${value})`
}

function formatSeconds(totalSeconds: number | null) {
  if (totalSeconds === null) {
    return '--'
  }

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function normalizeNumberList(numbers: number[]) {
  return [...numbers].sort((a, b) => a - b).join(',')
}

function isFiniteNumber(value: number) {
  return Number.isFinite(value) && !Number.isNaN(value)
}

function solveTwentyFour(numbers: number[]): string | null {
  const nodes: SolverNode[] = numbers.map((number) => ({
    value: number,
    expr: String(number),
  }))

  function dfs(current: SolverNode[]): string | null {
    if (current.length === 1) {
      return Math.abs(current[0].value - TARGET) < 1e-6 ? current[0].expr : null
    }

    for (let leftIndex = 0; leftIndex < current.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < current.length; rightIndex += 1) {
        const left = current[leftIndex]
        const right = current[rightIndex]
        const remaining = current.filter((_, index) => index !== leftIndex && index !== rightIndex)

        const candidates: SolverNode[] = [
          { value: left.value + right.value, expr: `(${left.expr}+${right.expr})` },
          { value: left.value - right.value, expr: `(${left.expr}-${right.expr})` },
          { value: right.value - left.value, expr: `(${right.expr}-${left.expr})` },
          { value: left.value * right.value, expr: `(${left.expr}*${right.expr})` },
        ]

        if (Math.abs(right.value) > 1e-6) {
          candidates.push({ value: left.value / right.value, expr: `(${left.expr}/${right.expr})` })
        }

        if (Math.abs(left.value) > 1e-6) {
          candidates.push({ value: right.value / left.value, expr: `(${right.expr}/${left.expr})` })
        }

        for (const candidate of candidates) {
          if (!isFiniteNumber(candidate.value)) {
            continue
          }

          const solved = dfs([...remaining, candidate])
          if (solved) {
            return solved
          }
        }
      }
    }

    return null
  }

  return dfs(nodes)
}

function createPuzzle(): Puzzle {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const numbers = Array.from({ length: 4 }, () => Math.floor(Math.random() * 13) + 1)
    const solution = solveTwentyFour(numbers)

    if (solution) {
      return { numbers, solution }
    }
  }

  return {
    numbers: [3, 3, 8, 8],
    solution: '(8/(3-(8/3)))',
  }
}

function loadStoredState(): { progress: ProgressState; puzzle: Puzzle | null; startedAt: number | null } {
  if (typeof window === 'undefined') {
    return {
      progress: { solvedCount: 0, streak: 0, bestTimeSeconds: null },
      puzzle: null,
      startedAt: null,
    }
  }

  try {
    const rawValue = localStorage.getItem(STORAGE_KEY)
    if (!rawValue) {
      return {
        progress: { solvedCount: 0, streak: 0, bestTimeSeconds: null },
        puzzle: null,
        startedAt: null,
      }
    }

    const parsed = JSON.parse(rawValue) as Partial<StoredProgress>
    const currentPuzzle =
      parsed.currentPuzzle &&
      Array.isArray(parsed.currentPuzzle.numbers) &&
      parsed.currentPuzzle.numbers.length === 4 &&
      typeof parsed.currentPuzzle.solution === 'string'
        ? parsed.currentPuzzle
        : null

    return {
      progress: {
        solvedCount: typeof parsed.solvedCount === 'number' ? parsed.solvedCount : 0,
        streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
        bestTimeSeconds: typeof parsed.bestTimeSeconds === 'number' ? parsed.bestTimeSeconds : null,
      },
      puzzle: currentPuzzle,
      startedAt: typeof parsed.lastPuzzleStartedAt === 'number' ? parsed.lastPuzzleStartedAt : null,
    }
  } catch (error) {
    console.warn('Failed to load twenty four progress', error)
    return {
      progress: { solvedCount: 0, streak: 0, bestTimeSeconds: null },
      puzzle: null,
      startedAt: null,
    }
  }
}

function extractNumbers(expression: string) {
  const matches = expression.match(/\d+/g)
  return matches ? matches.map((item) => Number(item)) : []
}

function getUsedFlags(numbers: number[], expression: string) {
  const tokens = extractNumbers(expression)
  const counts = new Map<number, number>()

  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1)
  }

  return numbers.map((number) => {
    const current = counts.get(number) ?? 0
    if (current <= 0) {
      return false
    }

    counts.set(number, current - 1)
    return true
  })
}

function validateExpression(expression: string, numbers: number[]) {
  const trimmed = expression.trim()

  if (!trimmed) {
    return '先写一个表达式再验证。'
  }

  if (!/^[\d+\-*/()\s]+$/.test(trimmed)) {
    return '只能使用数字、括号和 + - * /。'
  }

  const usedNumbers = extractNumbers(trimmed)

  if (usedNumbers.length !== numbers.length) {
    return '四张牌都要各用一次，不能多也不能少。'
  }

  if (normalizeNumberList(usedNumbers) !== normalizeNumberList(numbers)) {
    return '表达式里的数字必须和当前四张牌完全一致。'
  }

  return null
}

export default function TwentyFourGame() {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => createPuzzle())
  const [expression, setExpression] = useState('')
  const [hintVisible, setHintVisible] = useState(false)
  const [status, setStatus] = useState<{ tone: 'default' | 'success' | 'warn'; text: string }>({
    tone: 'default',
    text: '点击数字卡牌和运算符，把四张牌凑成 24。',
  })
  const [progress, setProgress] = useState<ProgressState>({
    solvedCount: 0,
    streak: 0,
    bestTimeSeconds: null,
  })
  const [puzzleStartedAt, setPuzzleStartedAt] = useState<number>(() => Date.now())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = loadStoredState()
    const nextPuzzle = stored.puzzle ?? createPuzzle()

    setPuzzle(nextPuzzle)
    setProgress(stored.progress)
    setPuzzleStartedAt(stored.startedAt ?? Date.now())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return
    }

    const payload: StoredProgress = {
      version: 1,
      solvedCount: progress.solvedCount,
      streak: progress.streak,
      bestTimeSeconds: progress.bestTimeSeconds,
      lastPuzzleStartedAt: puzzleStartedAt,
      currentPuzzle: puzzle,
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('Failed to save twenty four progress', error)
    }
  }, [hydrated, progress, puzzle, puzzleStartedAt])

  const usedFlags = useMemo(
    () => getUsedFlags(puzzle.numbers, expression),
    [expression, puzzle.numbers],
  )

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - puzzleStartedAt) / 1000))

  function pushText(text: string) {
    setExpression((current) => `${current}${text}`)
  }

  function startNextPuzzle() {
    setPuzzle(createPuzzle())
    setExpression('')
    setHintVisible(false)
    setPuzzleStartedAt(Date.now())
    setStatus({
      tone: 'default',
      text: '新牌组已发好，继续试试这四张。',
    })
  }

  function handleUseCard(index: number) {
    if (usedFlags[index]) {
      return
    }

    pushText(String(puzzle.numbers[index]))
  }

  function handleCheck() {
    const validationMessage = validateExpression(expression, puzzle.numbers)

    if (validationMessage) {
      setStatus({
        tone: 'warn',
        text: validationMessage,
      })
      return
    }

    try {
      const result = Function(`"use strict"; return (${expression})`)() as number

      if (!isFiniteNumber(result)) {
        setStatus({
          tone: 'warn',
          text: '这个表达式没有得到有效结果，检查一下括号和除法。',
        })
        return
      }

      if (Math.abs(result - TARGET) < 1e-6) {
        const finishedSeconds = Math.max(1, Math.floor((Date.now() - puzzleStartedAt) / 1000))

        setProgress((current) => ({
          solvedCount: current.solvedCount + 1,
          streak: current.streak + 1,
          bestTimeSeconds:
            current.bestTimeSeconds === null
              ? finishedSeconds
              : Math.min(current.bestTimeSeconds, finishedSeconds),
        }))

        setStatus({
          tone: 'success',
          text: `命中 24。当前用时 ${formatSeconds(finishedSeconds)}，可以直接下一局。`,
        })
        return
      }

      setProgress((current) => ({
        ...current,
        streak: 0,
      }))

      setStatus({
        tone: 'warn',
        text: `结果是 ${Number(result.toFixed(6))}，还没到 24，再换一种算路。`,
      })
    } catch (error) {
      console.warn('Failed to evaluate twenty four expression', error)
      setStatus({
        tone: 'warn',
        text: '表达式暂时算不通，检查一下括号是否配对。',
      })
    }
  }

  function revealHint() {
    setHintVisible(true)
    setStatus({
      tone: 'default',
      text: '提示已展开。先看结构，再自己把表达式敲出来会更有手感。',
    })
  }

  const statusClass =
    status.tone === 'success' ? ' success' : status.tone === 'warn' ? ' warn' : ''

  return (
    <div className="twenty-four-app">
      <style>{componentStyles}</style>

      <section className="twenty-four-hero">
        <div className="twenty-four-eyebrow">Toolbox · 24 点</div>
        <h1>把四张数字牌拧成一条算式，让结果稳稳落在 24。</h1>
        <p>
          沿用站内小游戏的玻璃卡片和轻几何风格，做成一局一局可连打的 24 点。
          每次都会发出一组可解牌面，支持提示、连胜统计和本地进度保存。
        </p>
        <div className="twenty-four-hero-tags">
          <span className="twenty-four-hero-tag">可解牌组随机发牌</span>
          <span className="twenty-four-hero-tag">提示 + 连胜 + 最快记录</span>
          <span className="twenty-four-hero-tag">A / J / Q / K 牌面映射</span>
        </div>
      </section>

      <div className="twenty-four-layout">
        <section className="twenty-four-board-card">
          <div className="twenty-four-meta-grid">
            <div className="twenty-four-chip">
              <div className="twenty-four-chip-label">目标</div>
              <div className="twenty-four-chip-value">24</div>
            </div>
            <div className="twenty-four-chip">
              <div className="twenty-four-chip-label">已解</div>
              <div className="twenty-four-chip-value">{progress.solvedCount}</div>
            </div>
            <div className="twenty-four-chip">
              <div className="twenty-four-chip-label">连胜</div>
              <div className="twenty-four-chip-value">{progress.streak}</div>
            </div>
            <div className="twenty-four-chip">
              <div className="twenty-four-chip-label">最佳</div>
              <div className="twenty-four-chip-value">{formatSeconds(progress.bestTimeSeconds)}</div>
            </div>
          </div>

          <div className={`twenty-four-status${statusClass}`}>{status.text}</div>

          <div className="twenty-four-board-shell">
            <div className="twenty-four-cards">
              {puzzle.numbers.map((number, index) => (
                <button
                  key={`${number}-${index}`}
                  type="button"
                  className={`twenty-four-number-btn${usedFlags[index] ? ' used' : ''}`}
                  onClick={() => handleUseCard(index)}
                  disabled={usedFlags[index]}
                  aria-label={`使用第 ${index + 1} 张牌 ${formatCardLabel(number)}`}
                >
                  <div className="twenty-four-card-rank">{getRankLabel(number)}</div>
                  <div className="twenty-four-card-value">数值 {number}</div>
                  <div className="twenty-four-card-slot">{usedFlags[index] ? '已使用' : `牌 ${index + 1}`}</div>
                </button>
              ))}
            </div>

            <div className="twenty-four-input-shell">
              <textarea
                className="twenty-four-expression"
                value={expression}
                onChange={(event) => setExpression(event.target.value)}
                placeholder="例如：(8 / (3 - 8 / 3))"
                aria-label="24 点表达式输入框"
              />

              <div className="twenty-four-keypad">
                {(['+', '-', '*', '/'] as Operator[]).map((operator) => (
                  <button
                    key={operator}
                    type="button"
                    className="twenty-four-btn"
                    onClick={() => pushText(` ${operator} `)}
                  >
                    {operator}
                  </button>
                ))}
                <button type="button" className="twenty-four-btn" onClick={() => pushText('(')}>
                  (
                </button>
                <button type="button" className="twenty-four-btn" onClick={() => pushText(')')}>
                  )
                </button>
                <button
                  type="button"
                  className="twenty-four-btn"
                  onClick={() => setExpression((current) => current.slice(0, -1))}
                  disabled={expression.length === 0}
                >
                  退一格
                </button>
                <button
                  type="button"
                  className="twenty-four-btn"
                  onClick={() => setExpression('')}
                  disabled={expression.length === 0}
                >
                  清空
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="twenty-four-sidebar">
          <section className="twenty-four-card">
            <div className="twenty-four-section-title">操作</div>
            <div className="twenty-four-section-subtitle">
              点击卡牌可自动把数字填进表达式。校验时必须四张牌各用一次，顺序不限。
            </div>
            <div className="twenty-four-control-grid">
              <button type="button" className="twenty-four-btn primary" onClick={handleCheck}>
                验证结果
              </button>
              <button type="button" className="twenty-four-btn" onClick={startNextPuzzle}>
                下一局
              </button>
              <button type="button" className="twenty-four-btn accent" onClick={revealHint}>
                查看提示
              </button>
              <button
                type="button"
                className="twenty-four-btn"
                onClick={() => {
                  setExpression('')
                  setHintVisible(false)
                  setStatus({
                    tone: 'default',
                    text: '已清空本局输入，可以重新组织算式。',
                  })
                }}
              >
                重来这局
              </button>
            </div>
          </section>

          <section className="twenty-four-card">
            <div className="twenty-four-section-title">当前牌面</div>
            <div className="twenty-four-section-subtitle">
              牌面显示采用扑克牌习惯，但计算时按右侧数字值参与四则运算。
            </div>
            <div className="twenty-four-used-row">
              {puzzle.numbers.map((number, index) => (
                <span key={`${number}-${index}-summary`} className="twenty-four-used-chip">
                  {getRankLabel(number)} = {number}
                </span>
              ))}
              <span className="twenty-four-used-chip">本局计时 {formatSeconds(elapsedSeconds)}</span>
            </div>
            {hintVisible ? (
              <div className="twenty-four-hint">
                参考解：{puzzle.solution}
              </div>
            ) : null}
          </section>

          <section className="twenty-four-card">
            <div className="twenty-four-section-title">规则</div>
            <div className="twenty-four-legend-list">
              <div className="twenty-four-legend-item">
                <div className="twenty-four-legend-icon">24</div>
                <div>目标固定是 24，只能使用四则运算和括号。</div>
              </div>
              <div className="twenty-four-legend-item">
                <div className="twenty-four-legend-icon">4 张</div>
                <div>四张牌必须全部使用，而且每张只能使用一次。</div>
              </div>
              <div className="twenty-four-legend-item">
                <div className="twenty-four-legend-icon">A/J</div>
                <div>A 记作 1，J/Q/K 分别记作 11、12、13。</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
