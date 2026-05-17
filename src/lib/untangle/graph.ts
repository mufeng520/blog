export interface UntanglePoint {
  x: number
  y: number
}

export interface UntangleNode extends UntanglePoint {
  id: number
}

export interface UntangleEdge {
  from: number
  to: number
}

export interface UntangleGraph {
  nodes: UntangleNode[]
  edges: UntangleEdge[]
}

export interface IntersectionResult {
  edgeIndexes: Set<number>
  count: number
}

function cross(a: UntanglePoint, b: UntanglePoint, c: UntanglePoint): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
}

function segmentsShareEndpoint(first: UntangleEdge, second: UntangleEdge): boolean {
  return (
    first.from === second.from ||
    first.from === second.to ||
    first.to === second.from ||
    first.to === second.to
  )
}

function intersectsStrictly(a1: UntanglePoint, a2: UntanglePoint, b1: UntanglePoint, b2: UntanglePoint): boolean {
  const d1 = cross(a1, a2, b1)
  const d2 = cross(a1, a2, b2)
  const d3 = cross(b1, b2, a1)
  const d4 = cross(b1, b2, a2)

  return d1 * d2 < 0 && d3 * d4 < 0
}

export function cloneGraph(graph: UntangleGraph): UntangleGraph {
  return {
    nodes: graph.nodes.map((node) => ({ ...node })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  }
}

export function countEdgeIntersections(graph: UntangleGraph): IntersectionResult {
  const edgeIndexes = new Set<number>()
  let count = 0

  for (let firstIndex = 0; firstIndex < graph.edges.length; firstIndex += 1) {
    const firstEdge = graph.edges[firstIndex]
    const firstStart = graph.nodes[firstEdge.from]
    const firstEnd = graph.nodes[firstEdge.to]

    for (let secondIndex = firstIndex + 1; secondIndex < graph.edges.length; secondIndex += 1) {
      const secondEdge = graph.edges[secondIndex]

      if (segmentsShareEndpoint(firstEdge, secondEdge)) {
        continue
      }

      const secondStart = graph.nodes[secondEdge.from]
      const secondEnd = graph.nodes[secondEdge.to]

      if (intersectsStrictly(firstStart, firstEnd, secondStart, secondEnd)) {
        count += 1
        edgeIndexes.add(firstIndex)
        edgeIndexes.add(secondIndex)
      }
    }
  }

  return { edgeIndexes, count }
}

export function isSolved(graph: UntangleGraph): boolean {
  return countEdgeIntersections(graph).count === 0
}

export function updateNodePosition(
  graph: UntangleGraph,
  nodeId: number,
  nextPoint: UntanglePoint,
): UntangleGraph {
  const nextGraph = cloneGraph(graph)
  nextGraph.nodes[nodeId] = {
    ...nextGraph.nodes[nodeId],
    ...nextPoint,
  }

  return nextGraph
}
