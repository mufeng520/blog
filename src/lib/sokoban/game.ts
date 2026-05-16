import { SOKOBAN_LEVELS, type LevelMap, type TileValue } from './levels'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Point {
  row: number
  col: number
}

export interface GameSnapshot {
  map: LevelMap
  player: Point
  direction: Direction
  moves: number
}

const DIRECTION_DELTAS: Record<Direction, Point> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
}

export function cloneLevel(level: LevelMap): LevelMap {
  return level.map((row) => [...row])
}

export function isTargetValue(value: TileValue): boolean {
  return value === 2 || value === 5
}

export function isBoxValue(value: TileValue): boolean {
  return value === 3 || value === 5
}

function isInside(map: LevelMap, point: Point): boolean {
  return (
    point.row >= 0 &&
    point.row < map.length &&
    point.col >= 0 &&
    point.col < map[0].length
  )
}

function restoreBaseTile(value: TileValue): TileValue {
  return isTargetValue(value) ? 2 : 0
}

export function findPlayer(map: LevelMap): Point {
  for (let rowIndex = 0; rowIndex < map.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < map[rowIndex].length; columnIndex += 1) {
      if (map[rowIndex][columnIndex] === 4) {
        return { row: rowIndex, col: columnIndex }
      }
    }
  }

  throw new Error('Unable to find the Sokoban player in the current map')
}

export function createLevelSnapshot(levelIndex: number, direction: Direction = 'down'): GameSnapshot {
  const map = cloneLevel(SOKOBAN_LEVELS[levelIndex])

  return {
    map,
    player: findPlayer(map),
    direction,
    moves: 0,
  }
}

export function countTargets(levelIndex: number): number {
  const baseLevel = SOKOBAN_LEVELS[levelIndex]
  let total = 0

  for (let rowIndex = 0; rowIndex < baseLevel.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < baseLevel[rowIndex].length; columnIndex += 1) {
      if (isTargetValue(baseLevel[rowIndex][columnIndex])) {
        total += 1
      }
    }
  }

  return total
}

export function countSatisfiedTargets(levelIndex: number, map: LevelMap): number {
  const baseLevel = SOKOBAN_LEVELS[levelIndex]
  let total = 0

  for (let rowIndex = 0; rowIndex < baseLevel.length; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < baseLevel[rowIndex].length; columnIndex += 1) {
      if (isTargetValue(baseLevel[rowIndex][columnIndex]) && isBoxValue(map[rowIndex][columnIndex])) {
        total += 1
      }
    }
  }

  return total
}

export function hasLevelCompleted(levelIndex: number, map: LevelMap): boolean {
  const targetCount = countTargets(levelIndex)

  if (targetCount === 0) {
    return false
  }

  return countSatisfiedTargets(levelIndex, map) === targetCount
}

export function attemptMove(
  levelIndex: number,
  snapshot: GameSnapshot,
  direction: Direction,
): { moved: boolean; snapshot: GameSnapshot } {
  const delta = DIRECTION_DELTAS[direction]
  const nextPoint: Point = {
    row: snapshot.player.row + delta.row,
    col: snapshot.player.col + delta.col,
  }

  if (!isInside(snapshot.map, nextPoint)) {
    return {
      moved: false,
      snapshot: {
        ...snapshot,
        direction,
      },
    }
  }

  const nextValue = snapshot.map[nextPoint.row][nextPoint.col]

  if (nextValue === 1) {
    return {
      moved: false,
      snapshot: {
        ...snapshot,
        direction,
      },
    }
  }

  const map = cloneLevel(snapshot.map)

  if (isBoxValue(nextValue)) {
    const pushPoint: Point = {
      row: nextPoint.row + delta.row,
      col: nextPoint.col + delta.col,
    }

    if (!isInside(map, pushPoint)) {
      return {
        moved: false,
        snapshot: {
          ...snapshot,
          direction,
        },
      }
    }

    const pushValue = map[pushPoint.row][pushPoint.col]

    if (pushValue === 1 || isBoxValue(pushValue)) {
      return {
        moved: false,
        snapshot: {
          ...snapshot,
          direction,
        },
      }
    }

    map[pushPoint.row][pushPoint.col] = 3
  }

  map[nextPoint.row][nextPoint.col] = 4
  map[snapshot.player.row][snapshot.player.col] = restoreBaseTile(
    SOKOBAN_LEVELS[levelIndex][snapshot.player.row][snapshot.player.col],
  )

  return {
    moved: true,
    snapshot: {
      map,
      player: nextPoint,
      direction,
      moves: snapshot.moves + 1,
    },
  }
}
