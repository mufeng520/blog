import rawLevelSource from './mapdata100.js?raw'

export type TileValue = 0 | 1 | 2 | 3 | 4 | 5
export type LevelMap = TileValue[][]

const LEVEL_PATTERN = /levels\[(\d+)\]\s*=\s*(\[[\s\S]*?\]);/g

function parseLevels(source: string): LevelMap[] {
  const parsedEntries = Array.from(source.matchAll(LEVEL_PATTERN))
    .map(([_, indexText, mapLiteral]) => ({
      index: Number(indexText),
      map: JSON.parse(mapLiteral.replace(/\s+/g, '')) as LevelMap,
    }))
    .sort((left, right) => left.index - right.index)

  if (parsedEntries.length === 0) {
    throw new Error('Unable to parse any Sokoban levels from mapdata100.js')
  }

  const maxLevelIndex = parsedEntries[parsedEntries.length - 1].index
  const levels = Array.from({ length: maxLevelIndex + 1 }, () => null as LevelMap | null)

  for (const entry of parsedEntries) {
    levels[entry.index] = entry.map
  }

  const missingLevelIndex = levels.findIndex((level) => level === null)

  if (missingLevelIndex !== -1) {
    throw new Error(`Missing Sokoban level data at index ${missingLevelIndex}`)
  }

  return levels as LevelMap[]
}

export const SOKOBAN_LEVELS = parseLevels(rawLevelSource)
export const TOTAL_LEVELS = SOKOBAN_LEVELS.length
