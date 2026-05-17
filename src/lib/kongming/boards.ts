export type BoardVariant = 'cross' | 'triangle'

export interface PegPosition {
  id: number
  row: number
  col: number
}

export interface PegMove {
  from: number
  over: number
  to: number
}

export interface PegBoardDefinition {
  variant: BoardVariant
  label: string
  subtitle: string
  positions: PegPosition[]
  moves: PegMove[]
  startEmpty: number
}

function buildCrossBoard(): PegBoardDefinition {
  const positions: PegPosition[] = []
  const coordinateMap = new Map<string, number>()

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const inCorner = (row < 2 || row > 4) && (col < 2 || col > 4)

      if (!inCorner) {
        const id = positions.length
        positions.push({ id, row, col })
        coordinateMap.set(`${row},${col}`, id)
      }
    }
  }

  const moves: PegMove[] = []
  const directions = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
  ]

  for (const position of positions) {
    for (const direction of directions) {
      const over = coordinateMap.get(`${position.row + direction.row},${position.col + direction.col}`)
      const to = coordinateMap.get(`${position.row + direction.row * 2},${position.col + direction.col * 2}`)

      if (over !== undefined && to !== undefined) {
        moves.push({
          from: position.id,
          over,
          to,
        })
      }
    }
  }

  return {
    variant: 'cross',
    label: '经典十字盘',
    subtitle: '33 孔标准孔明棋',
    positions,
    moves,
    startEmpty: coordinateMap.get('3,3') ?? 16,
  }
}

function buildTriangleBoard(): PegBoardDefinition {
  const positions: PegPosition[] = []
  const coordinateMap = new Map<string, number>()

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col <= row; col += 1) {
      const id = positions.length
      positions.push({ id, row, col })
      coordinateMap.set(`${row},${col}`, id)
    }
  }

  const directions = [
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 1, col: 1 },
    { row: -1, col: -1 },
  ]

  const moves: PegMove[] = []

  for (const position of positions) {
    for (const direction of directions) {
      const over = coordinateMap.get(`${position.row + direction.row},${position.col + direction.col}`)
      const to = coordinateMap.get(`${position.row + direction.row * 2},${position.col + direction.col * 2}`)

      if (over !== undefined && to !== undefined) {
        moves.push({
          from: position.id,
          over,
          to,
        })
      }
    }
  }

  return {
    variant: 'triangle',
    label: '三角棋盘',
    subtitle: '15 孔三角孔明棋',
    positions,
    moves,
    startEmpty: 0,
  }
}

export const KONGMING_BOARDS: Record<BoardVariant, PegBoardDefinition> = {
  cross: buildCrossBoard(),
  triangle: buildTriangleBoard(),
}
