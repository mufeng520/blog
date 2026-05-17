export type BoardGeometry = 'orthogonal' | 'triangle'

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
  variant: string
  label: string
  subtitle: string
  geometry: BoardGeometry
  positions: PegPosition[]
  moves: PegMove[]
  startEmpty: number
  bounds: {
    rows: number
    cols: number
  }
  hintTier: 'exact' | 'guided' | 'fast'
}

function buildBoardFromCells(
  variant: string,
  label: string,
  subtitle: string,
  geometry: BoardGeometry,
  cells: Array<[number, number]>,
  directions: Array<{ row: number; col: number }>,
  startEmptyCell?: [number, number],
  hintTier: PegBoardDefinition['hintTier'] = 'guided',
): PegBoardDefinition {
  const positions: PegPosition[] = []
  const coordinateMap = new Map<string, number>()
  let maxRow = 0
  let maxCol = 0

  for (const [row, col] of cells) {
    const id = positions.length
    positions.push({ id, row, col })
    coordinateMap.set(`${row},${col}`, id)
    maxRow = Math.max(maxRow, row)
    maxCol = Math.max(maxCol, col)
  }

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

  const fallbackStartEmpty = positions[Math.floor(positions.length / 2)]?.id ?? 0
  const startEmpty =
    startEmptyCell ? (coordinateMap.get(`${startEmptyCell[0]},${startEmptyCell[1]}`) ?? fallbackStartEmpty) : fallbackStartEmpty

  return {
    variant,
    label,
    subtitle,
    geometry,
    positions,
    moves,
    startEmpty,
    bounds: {
      rows: maxRow + 1,
      cols: maxCol + 1,
    },
    hintTier,
  }
}

function buildOrthogonalBoard(
  variant: string,
  label: string,
  subtitle: string,
  cells: Array<[number, number]>,
  startEmptyCell?: [number, number],
  hintTier: PegBoardDefinition['hintTier'] = 'guided',
) {
  return buildBoardFromCells(
    variant,
    label,
    subtitle,
    'orthogonal',
    cells,
    [
      { row: 1, col: 0 },
      { row: -1, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: -1 },
    ],
    startEmptyCell,
    hintTier,
  )
}

function buildTriangleBoard(order: number) {
  const cells: Array<[number, number]> = []

  for (let row = 0; row < order; row += 1) {
    for (let col = 0; col <= row; col += 1) {
      cells.push([row, col])
    }
  }

  const hintTier: PegBoardDefinition['hintTier'] =
    order <= 5 ? 'exact' : order <= 7 ? 'guided' : 'fast'

  return buildBoardFromCells(
    `triangle-${order}`,
    `${order} 阶三角盘`,
    `${(order * (order + 1)) / 2} 孔三角孔明棋`,
    'triangle',
    cells,
    [
      { row: 0, col: 1 },
      { row: 0, col: -1 },
      { row: 1, col: 0 },
      { row: -1, col: 0 },
      { row: 1, col: 1 },
      { row: -1, col: -1 },
    ],
    [0, 0],
    hintTier,
  )
}

function buildDiamondBoard(size: number, variant: string, label: string, subtitle: string, hintTier: PegBoardDefinition['hintTier'] = 'guided') {
  const cells: Array<[number, number]> = []
  const mid = size - 1
  const span = size * 2 - 1

  for (let row = 0; row < span; row += 1) {
    const width = size - Math.abs(mid - row)
    const start = mid - width + 1
    const end = mid + width - 1

    for (let col = start; col <= end; col += 1) {
      cells.push([row, col])
    }
  }

  return buildOrthogonalBoard(variant, label, subtitle, cells, [mid, mid], hintTier)
}

function buildEuropeanBoard() {
  const cells: Array<[number, number]> = []

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const inCorner = (row < 2 || row > 4) && (col < 2 || col > 4)

      if (!inCorner || row === 1 || row === 5 || col === 1 || col === 5) {
        cells.push([row, col])
      }
    }
  }

  return buildOrthogonalBoard('european', '欧式孔明棋', '37 孔圆角菱形变种', cells, [3, 3], 'guided')
}

function buildEnglishBoard() {
  const cells: Array<[number, number]> = []

  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const inCorner = (row < 2 || row > 4) && (col < 2 || col > 4)

      if (!inCorner) {
        cells.push([row, col])
      }
    }
  }

  return buildOrthogonalBoard('english', '英式孔明棋', '33 孔标准十字盘', cells, [3, 3], 'exact')
}

function buildWieglebBoard() {
  const cells: Array<[number, number]> = []

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const inCorner = (row < 3 || row > 5) && (col < 3 || col > 5)

      if (!inCorner) {
        cells.push([row, col])
      }
    }
  }

  return buildOrthogonalBoard('wiegleb', '加长十字盘', '45 孔长臂十字盘', cells, [4, 4], 'fast')
}

function buildAsymmetricBoard() {
  const cells: Array<[number, number]> = []

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const allowed =
        (row >= 2 && row <= 5) ||
        (col >= 2 && col <= 4) ||
        (row === 1 && col >= 2 && col <= 4) ||
        (row === 6 && col >= 1 && col <= 5) ||
        (row === 7 && col >= 2 && col <= 4)

      if (allowed) {
        cells.push([row, col])
      }
    }
  }

  return buildOrthogonalBoard('asymmetric', '不对称十字盘', '39 孔偏移十字盘', cells, [3, 3], 'guided')
}

function buildDiamondPlusBoard() {
  const base = new Set<string>()
  const mid = 4

  for (let row = 0; row < 9; row += 1) {
    const width = 5 - Math.abs(mid - row)
    const start = mid - width + 1
    const end = mid + width - 1

    for (let col = start; col <= end; col += 1) {
      base.add(`${row},${col}`)
    }
  }

  base.add(`${mid},0`)
  base.add(`${mid},8`)
  base.add(`0,${mid}`)
  base.add(`8,${mid}`)

  const cells = [...base].map((value) => value.split(',').map(Number) as [number, number])
  return buildOrthogonalBoard('diamond-plus', '菱形十字盘', '41 孔菱形扩展盘', cells, [4, 4], 'guided')
}

function buildRhombusBoard() {
  return buildDiamondBoard(4, 'rhombus', '欧式菱形盘', '25 孔紧凑菱形盘', 'guided')
}

const triangleBoards = Array.from({ length: 8 }, (_, index) => buildTriangleBoard(index + 3))

export const KONGMING_BOARD_LIST: PegBoardDefinition[] = [
  buildEuropeanBoard(),
  buildWieglebBoard(),
  buildAsymmetricBoard(),
  buildEnglishBoard(),
  buildDiamondPlusBoard(),
  buildRhombusBoard(),
  ...triangleBoards,
]

export const KONGMING_BOARDS = Object.fromEntries(
  KONGMING_BOARD_LIST.map((board) => [board.variant, board]),
) as Record<string, PegBoardDefinition>

export type BoardVariant = keyof typeof KONGMING_BOARDS

export const KONGMING_BOARD_VARIANTS = KONGMING_BOARD_LIST.map((board) => board.variant) as BoardVariant[]
