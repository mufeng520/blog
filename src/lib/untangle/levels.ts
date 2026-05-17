import { generatePlanarGraph, shuffleNodePositions, type GraphBounds } from './generator'
import type { UntangleGraph } from './graph'

export interface UntangleLevel {
  id: string
  title: string
  nodeCount: number
  graph: UntangleGraph
}

const PRESET_COUNTS = [6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14]

const PRESET_BOUNDS: GraphBounds = {
  width: 760,
  height: 520,
  padding: 56,
}

function createPresetLevel(index: number, nodeCount: number): UntangleLevel {
  const graph = shuffleNodePositions(
    generatePlanarGraph(nodeCount, 20260517 + index * 97, PRESET_BOUNDS),
    20260517 + index * 131,
    PRESET_BOUNDS,
  )

  return {
    id: `preset-${index + 1}`,
    title: `第 ${index + 1} 关`,
    nodeCount,
    graph,
  }
}

export const UNTANGLE_LEVELS: UntangleLevel[] = PRESET_COUNTS.map((nodeCount, index) =>
  createPresetLevel(index, nodeCount),
)
