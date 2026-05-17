import { KONGMING_BOARDS, type BoardGeometry, type BoardVariant, type PegBoardDefinition, type PegMove } from './boards'

export interface PegGameSnapshot {
  occupiedMask: bigint
  moveCount: number
}

export interface PegStoredVariantState {
  snapshot: PegGameSnapshot
  undoStack: PegGameSnapshot[]
  selectedPeg: number | null
  hintMove: PegMove | null
  solved: boolean
}

interface SearchBudget {
  remaining: number
}

interface SymmetryTransformSet {
  geometry: BoardGeometry
  transforms: Array<(row: number, col: number, order: number) => [number, number]>
}

const ORTHOGONAL_SYMMETRIES: SymmetryTransformSet = {
  geometry: 'orthogonal',
  transforms: [
    (row, col) => [row, col],
    (row, col, order) => [col, order - row],
    (row, col, order) => [order - row, order - col],
    (row, col, order) => [order - col, row],
    (row, col, order) => [row, order - col],
    (row, col, order) => [order - row, col],
    (row, col) => [col, row],
    (row, col, order) => [order - col, order - row],
  ],
}

const TRIANGLE_SYMMETRIES: SymmetryTransformSet = {
  geometry: 'triangle',
  transforms: [
    (row, col) => [row, col],
    (row, col) => [row, row - col],
    (row, col, order) => [order - 1 - row + col, col],
    (row, col, order) => [order - 1 - col, row - col],
    (row, col, order) => [order - 1 - row + col, order - 1 - row],
    (row, col, order) => [order - 1 - col, order - 1 - row],
  ],
}

const symmetryPermutations = new Map<BoardVariant, number[][]>()
const solverCaches = new Map<
  BoardVariant,
  {
    canonicalWins: Set<string>
    canonicalDead: Set<string>
  }
>()

for (const [variant, board] of Object.entries(KONGMING_BOARDS) as Array<[BoardVariant, PegBoardDefinition]>) {
  symmetryPermutations.set(variant, buildSymmetryPermutations(board))
  solverCaches.set(variant, {
    canonicalWins: new Set(),
    canonicalDead: new Set(),
  })
}

function getSymmetrySet(board: PegBoardDefinition): SymmetryTransformSet {
  return board.geometry === 'triangle' ? TRIANGLE_SYMMETRIES : ORTHOGONAL_SYMMETRIES
}

function buildSymmetryPermutations(board: PegBoardDefinition): number[][] {
  const { transforms } = getSymmetrySet(board)
  const order = Math.max(board.bounds.rows, board.bounds.cols) - 1
  const coordinateMap = new Map(board.positions.map((position) => [`${position.row},${position.col}`, position.id]))

  const permutations = transforms
    .map((transform) => {
      const permutation: number[] = []

      for (const position of board.positions) {
        const [row, col] = transform(position.row, position.col, order)
        const mapped = coordinateMap.get(`${row},${col}`)

        if (mapped === undefined) {
          return null
        }

        permutation[position.id] = mapped
      }

      return permutation
    })
    .filter((value): value is number[] => Array.isArray(value))

  return permutations.length > 0 ? permutations : [board.positions.map((position) => position.id)]
}

export function bitForPosition(positionId: number): bigint {
  return 1n << BigInt(positionId)
}

export function isPegOccupied(snapshot: PegGameSnapshot, positionId: number): boolean {
  return (snapshot.occupiedMask & bitForPosition(positionId)) !== 0n
}

export function createInitialSnapshot(variant: BoardVariant): PegGameSnapshot {
  const board = KONGMING_BOARDS[variant]
  let occupiedMask = 0n

  for (const position of board.positions) {
    if (position.id !== board.startEmpty) {
      occupiedMask |= bitForPosition(position.id)
    }
  }

  return {
    occupiedMask,
    moveCount: 0,
  }
}

export function countPegs(snapshot: PegGameSnapshot): number {
  let mask = snapshot.occupiedMask
  let count = 0

  while (mask !== 0n) {
    mask &= mask - 1n
    count += 1
  }

  return count
}

export function getLegalMoves(variant: BoardVariant, snapshot: PegGameSnapshot): PegMove[] {
  const board = KONGMING_BOARDS[variant]

  return board.moves.filter((move) => {
    const fromBit = bitForPosition(move.from)
    const overBit = bitForPosition(move.over)
    const toBit = bitForPosition(move.to)

    return (
      (snapshot.occupiedMask & fromBit) !== 0n &&
      (snapshot.occupiedMask & overBit) !== 0n &&
      (snapshot.occupiedMask & toBit) === 0n
    )
  })
}

export function getLegalMovesFromPeg(
  variant: BoardVariant,
  snapshot: PegGameSnapshot,
  pegId: number,
): PegMove[] {
  return getLegalMoves(variant, snapshot).filter((move) => move.from === pegId)
}

export function applyMove(snapshot: PegGameSnapshot, move: PegMove): PegGameSnapshot {
  const occupiedMask =
    snapshot.occupiedMask ^
    bitForPosition(move.from) ^
    bitForPosition(move.over) ^
    bitForPosition(move.to)

  return {
    occupiedMask,
    moveCount: snapshot.moveCount + 1,
  }
}

export function hasSolved(snapshot: PegGameSnapshot): boolean {
  return countPegs(snapshot) === 1
}

export function hasNoMoves(variant: BoardVariant, snapshot: PegGameSnapshot): boolean {
  return getLegalMoves(variant, snapshot).length === 0
}

function canonicalizeMask(variant: BoardVariant, occupiedMask: bigint): bigint {
  const permutations = symmetryPermutations.get(variant) ?? []
  let best: bigint | null = null

  for (const permutation of permutations) {
    let transformed = 0n

    for (let index = 0; index < permutation.length; index += 1) {
      if ((occupiedMask & bitForPosition(index)) !== 0n) {
        transformed |= bitForPosition(permutation[index])
      }
    }

    if (best === null || transformed < best) {
      best = transformed
    }
  }

  return best ?? occupiedMask
}

function serializeCanonicalMask(variant: BoardVariant, occupiedMask: bigint): string {
  return canonicalizeMask(variant, occupiedMask).toString(36)
}

function getBoardCenter(board: PegBoardDefinition) {
  if (board.geometry === 'triangle') {
    const row = (board.bounds.rows - 1) / 2
    return {
      row,
      col: row / 2,
    }
  }

  return {
    row: (board.bounds.rows - 1) / 2,
    col: (board.bounds.cols - 1) / 2,
  }
}

function getDistanceToCenter(board: PegBoardDefinition, positionId: number) {
  const position = board.positions[positionId]
  const center = getBoardCenter(board)
  return Math.abs(position.row - center.row) + Math.abs(position.col - center.col)
}

function sortMovesForHint(variant: BoardVariant, moves: PegMove[]): PegMove[] {
  const board = KONGMING_BOARDS[variant]

  return [...moves].sort((left, right) => {
    const leftDistance = getDistanceToCenter(board, left.to)
    const rightDistance = getDistanceToCenter(board, right.to)

    if (leftDistance !== rightDistance) {
      return leftDistance - rightDistance
    }

    return left.from - right.from || left.to - right.to
  })
}

function getOrderedCandidateMoves(variant: BoardVariant, snapshot: PegGameSnapshot): PegMove[] {
  return sortMovesForHint(variant, getLegalMoves(variant, snapshot))
}

function countOccupiedInZone(
  board: PegBoardDefinition,
  snapshot: PegGameSnapshot,
  predicate: (row: number, col: number) => boolean,
): number {
  let count = 0

  for (const position of board.positions) {
    if (predicate(position.row, position.col) && isPegOccupied(snapshot, position.id)) {
      count += 1
    }
  }

  return count
}

function countIsolatedPegs(board: PegBoardDefinition, snapshot: PegGameSnapshot): number {
  let isolated = 0

  for (const position of board.positions) {
    if (!isPegOccupied(snapshot, position.id)) {
      continue
    }

    let hasNeighbor = false

    for (const move of board.moves) {
      if (move.from !== position.id && move.over !== position.id && move.to !== position.id) {
        continue
      }

      for (const relatedId of [move.from, move.over, move.to]) {
        if (relatedId !== position.id && isPegOccupied(snapshot, relatedId)) {
          hasNeighbor = true
          break
        }
      }

      if (hasNeighbor) {
        break
      }
    }

    if (!hasNeighbor) {
      isolated += 1
    }
  }

  return isolated
}

function scoreHintMove(variant: BoardVariant, snapshot: PegGameSnapshot, move: PegMove): number {
  const board = KONGMING_BOARDS[variant]
  const from = board.positions[move.from]
  const over = board.positions[move.over]
  const to = board.positions[move.to]
  const nextSnapshot = applyMove(snapshot, move)
  const nextLegalMoves = getLegalMoves(variant, nextSnapshot)
  const center = getBoardCenter(board)
  const centerDistance = Math.abs(to.row - center.row) + Math.abs(to.col - center.col)
  const fromDistance = Math.abs(from.row - center.row) + Math.abs(from.col - center.col)
  const overDistance = Math.abs(over.row - center.row) + Math.abs(over.col - center.col)
  const isolatedPegCount = countIsolatedPegs(board, nextSnapshot)

  let score = 0
  score += nextLegalMoves.length * 10
  score -= centerDistance * 9
  score += (fromDistance - centerDistance) * 6
  score += (overDistance - centerDistance) * 3
  score -= isolatedPegCount * 12

  if (board.geometry === 'orthogonal') {
    const edgePegCount = countOccupiedInZone(
      board,
      nextSnapshot,
      (row, col) => row === 0 || row === board.bounds.rows - 1 || col === 0 || col === board.bounds.cols - 1,
    )
    score -= edgePegCount * 4
  }

  if (hasSolved(nextSnapshot)) {
    score += 500
  }

  if (nextLegalMoves.length === 0) {
    score -= 1000
  }

  return score
}

function getHeuristicHintMove(variant: BoardVariant, snapshot: PegGameSnapshot): PegMove | null {
  const legalMoves = getLegalMoves(variant, snapshot)

  if (legalMoves.length === 0) {
    return null
  }

  let bestMove = legalMoves[0]
  let bestScore = Number.NEGATIVE_INFINITY

  for (const move of legalMoves) {
    const score = scoreHintMove(variant, snapshot, move)

    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

function getOrderedMovesByScore(variant: BoardVariant, snapshot: PegGameSnapshot): PegMove[] {
  return [...getLegalMoves(variant, snapshot)].sort(
    (left, right) => scoreHintMove(variant, snapshot, right) - scoreHintMove(variant, snapshot, left),
  )
}

function canSolveVariant(
  variant: BoardVariant,
  snapshot: PegGameSnapshot,
  budget?: SearchBudget,
): boolean | null {
  if (budget) {
    budget.remaining -= 1

    if (budget.remaining < 0) {
      return null
    }
  }

  const cache = solverCaches.get(variant)
  if (!cache) {
    return null
  }

  const canonicalKey = serializeCanonicalMask(variant, snapshot.occupiedMask)

  if (cache.canonicalWins.has(canonicalKey)) {
    return true
  }

  if (cache.canonicalDead.has(canonicalKey)) {
    return false
  }

  if (hasSolved(snapshot)) {
    cache.canonicalWins.add(canonicalKey)
    return true
  }

  const legalMoves = getOrderedMovesByScore(variant, snapshot)

  if (legalMoves.length === 0) {
    cache.canonicalDead.add(canonicalKey)
    return false
  }

  for (const move of legalMoves) {
    const result = canSolveVariant(variant, applyMove(snapshot, move), budget)

    if (result === null) {
      return null
    }

    if (result) {
      cache.canonicalWins.add(canonicalKey)
      return true
    }
  }

  cache.canonicalDead.add(canonicalKey)
  return false
}

function getSearchBudgetForBoard(board: PegBoardDefinition) {
  switch (board.hintTier) {
    case 'exact':
      return 12000
    case 'guided':
      return 3500
    case 'fast':
      return 1200
    default:
      return 1500
  }
}

export function getHintMove(variant: BoardVariant, snapshot: PegGameSnapshot): PegMove | null {
  const board = KONGMING_BOARDS[variant]
  const legalMoves = getOrderedMovesByScore(variant, snapshot)

  if (legalMoves.length === 0) {
    return null
  }

  const budgetLimit = getSearchBudgetForBoard(board)

  for (const move of legalMoves) {
    const result = canSolveVariant(variant, applyMove(snapshot, move), { remaining: budgetLimit })

    if (result) {
      return move
    }
  }

  return getHeuristicHintMove(variant, snapshot)
}

export function isMoveMatchingHint(move: PegMove, hintMove: PegMove | null): boolean {
  if (!hintMove) {
    return false
  }

  return move.from === hintMove.from && move.over === hintMove.over && move.to === hintMove.to
}
