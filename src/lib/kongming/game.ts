import { KONGMING_BOARDS, type BoardVariant, type PegBoardDefinition, type PegMove } from './boards'

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

const CROSS_SYMMETRIES = [
  (row: number, col: number): [number, number] => [row, col],
  (row: number, col: number): [number, number] => [col, 6 - row],
  (row: number, col: number): [number, number] => [6 - row, 6 - col],
  (row: number, col: number): [number, number] => [6 - col, row],
  (row: number, col: number): [number, number] => [row, 6 - col],
  (row: number, col: number): [number, number] => [6 - row, col],
  (row: number, col: number): [number, number] => [col, row],
  (row: number, col: number): [number, number] => [6 - col, 6 - row],
]

const TRIANGLE_SYMMETRIES = [
  (row: number, col: number): [number, number] => [row, col],
  (row: number, col: number): [number, number] => [row, row - col],
  (row: number, col: number): [number, number] => [4 - row + col, col],
  (row: number, col: number): [number, number] => [4 - col, row - col],
  (row: number, col: number): [number, number] => [4 - row + col, 4 - row],
  (row: number, col: number): [number, number] => [4 - col, 4 - row],
]

const symmetryPermutations: Record<BoardVariant, number[][]> = {
  cross: buildSymmetryPermutations(KONGMING_BOARDS.cross, CROSS_SYMMETRIES),
  triangle: buildSymmetryPermutations(KONGMING_BOARDS.triangle, TRIANGLE_SYMMETRIES),
}

function buildSymmetryPermutations(
  board: PegBoardDefinition,
  transforms: Array<(row: number, col: number) => [number, number]>,
): number[][] {
  const coordinateMap = new Map(board.positions.map((position) => [`${position.row},${position.col}`, position.id]))

  return transforms.map((transform) =>
    board.positions.map((position) => {
      const [row, col] = transform(position.row, position.col)
      const mapped = coordinateMap.get(`${row},${col}`)

      if (mapped === undefined) {
        throw new Error(`Missing symmetry mapping for ${board.variant} at ${row},${col}`)
      }

      return mapped
    }),
  )
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
  const permutations = symmetryPermutations[variant]
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

const solverCaches: Record<
  BoardVariant,
  {
    wins: Map<string, PegMove[]>
    dead: Set<string>
  }
> = {
  cross: {
    wins: new Map(),
    dead: new Set(),
  },
  triangle: {
    wins: new Map(),
    dead: new Set(),
  },
}

function serializeCanonicalMask(variant: BoardVariant, occupiedMask: bigint): string {
  return canonicalizeMask(variant, occupiedMask).toString(36)
}

function sortMovesForHint(variant: BoardVariant, moves: PegMove[]): PegMove[] {
  const board = KONGMING_BOARDS[variant]
  const center =
    variant === 'cross'
      ? { row: 3, col: 3 }
      : { row: 2, col: 1 }

  return [...moves].sort((left, right) => {
    const leftPosition = board.positions[left.to]
    const rightPosition = board.positions[right.to]
    const leftDistance = Math.abs(leftPosition.row - center.row) + Math.abs(leftPosition.col - center.col)
    const rightDistance = Math.abs(rightPosition.row - center.row) + Math.abs(rightPosition.col - center.col)

    return leftDistance - rightDistance
  })
}

function solveVariant(variant: BoardVariant, snapshot: PegGameSnapshot): PegMove[] | null {
  const cache = solverCaches[variant]
  const cacheKey = serializeCanonicalMask(variant, snapshot.occupiedMask)

  if (cache.wins.has(cacheKey)) {
    return cache.wins.get(cacheKey) ?? null
  }

  if (cache.dead.has(cacheKey)) {
    return null
  }

  if (hasSolved(snapshot)) {
    return []
  }

  const legalMoves = sortMovesForHint(variant, getLegalMoves(variant, snapshot))

  if (legalMoves.length === 0) {
    cache.dead.add(cacheKey)
    return null
  }

  for (const move of legalMoves) {
    const solution = solveVariant(variant, applyMove(snapshot, move))

    if (solution) {
      const fullPath = [move, ...solution]
      cache.wins.set(cacheKey, fullPath)
      return fullPath
    }
  }

  cache.dead.add(cacheKey)
  return null
}

export function getHintMove(variant: BoardVariant, snapshot: PegGameSnapshot): PegMove | null {
  const solution = solveVariant(variant, snapshot)

  return solution?.[0] ?? null
}

export function isMoveMatchingHint(move: PegMove, hintMove: PegMove | null): boolean {
  if (!hintMove) {
    return false
  }

  return move.from === hintMove.from && move.over === hintMove.over && move.to === hintMove.to
}
