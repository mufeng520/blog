import { cloneGraph, countEdgeIntersections, type UntangleEdge, type UntangleGraph, type UntangleNode } from './graph'

export interface GraphBounds {
  width: number
  height: number
  padding: number
}

const DEFAULT_BOUNDS: GraphBounds = {
  width: 760,
  height: 520,
  padding: 56,
}

function createRng(seed: number): () => number {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function shuffleArray<T>(items: T[], rng: () => number): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(rng() * (index + 1))
    ;[result[index], result[nextIndex]] = [result[nextIndex], result[index]]
  }

  return result
}

function distance(a: UntangleNode, b: UntangleNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function buildEdgeKey(from: number, to: number): string {
  return from < to ? `${from}:${to}` : `${to}:${from}`
}

function pointInBounds(node: UntangleNode, bounds: GraphBounds): boolean {
  return (
    node.x >= bounds.padding &&
    node.x <= bounds.width - bounds.padding &&
    node.y >= bounds.padding &&
    node.y <= bounds.height - bounds.padding
  )
}

function generateNodeLayout(nodeCount: number, bounds: GraphBounds, rng: () => number): UntangleNode[] {
  const centerX = bounds.width / 2
  const centerY = bounds.height / 2
  const radiusBase = Math.min(bounds.width, bounds.height) * 0.28
  const nodes: UntangleNode[] = []

  for (let index = 0; index < nodeCount; index += 1) {
    const angle = (index / nodeCount) * Math.PI * 2 + rng() * 0.35
    const radius = radiusBase + (rng() - 0.5) * 40
    nodes.push({
      id: index,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    })
  }

  return nodes
}

function createInitialPlanarEdges(nodes: UntangleNode[]): UntangleEdge[] {
  const edges: UntangleEdge[] = []

  for (let index = 0; index < nodes.length; index += 1) {
    edges.push({
      from: index,
      to: (index + 1) % nodes.length,
    })
  }

  return edges
}

function tryAddEdge(graph: UntangleGraph, edge: UntangleEdge): boolean {
  const edgeKey = buildEdgeKey(edge.from, edge.to)
  const existingKeys = new Set(graph.edges.map((item) => buildEdgeKey(item.from, item.to)))

  if (existingKeys.has(edgeKey)) {
    return false
  }

  const nextGraph: UntangleGraph = {
    nodes: graph.nodes,
    edges: [...graph.edges, edge],
  }

  return countEdgeIntersections(nextGraph).count === 0
}

export function generatePlanarGraph(
  nodeCount: number,
  seed = Date.now(),
  bounds: GraphBounds = DEFAULT_BOUNDS,
): UntangleGraph {
  const rng = createRng(seed)
  const nodes = generateNodeLayout(nodeCount, bounds, rng)
  const graph: UntangleGraph = {
    nodes,
    edges: createInitialPlanarEdges(nodes),
  }

  const candidatePairs: Array<[number, number]> = []

  for (let from = 0; from < nodeCount; from += 1) {
    for (let to = from + 1; to < nodeCount; to += 1) {
      if (Math.abs(from - to) <= 1 || Math.abs(from - to) >= nodeCount - 1) {
        continue
      }

      candidatePairs.push([from, to])
    }
  }

  const desiredEdges = Math.min(nodeCount * 2, nodeCount + 6)

  for (const [from, to] of shuffleArray(candidatePairs, rng)) {
    if (graph.edges.length >= desiredEdges) {
      break
    }

    if (tryAddEdge(graph, { from, to })) {
      graph.edges.push({ from, to })
    }
  }

  return graph
}

export function shuffleNodePositions(
  graph: UntangleGraph,
  seed = Date.now(),
  bounds: GraphBounds = DEFAULT_BOUNDS,
): UntangleGraph {
  const rng = createRng(seed)
  const baseNodes = graph.nodes.map((node) => ({ ...node }))
  const nextGraph = cloneGraph(graph)

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const order = shuffleArray(baseNodes.map((node) => node.id), rng)

    for (let index = 0; index < nextGraph.nodes.length; index += 1) {
      const sourceNode = baseNodes[order[index]]
      const jitterX = (rng() - 0.5) * 60
      const jitterY = (rng() - 0.5) * 60

      nextGraph.nodes[index] = {
        ...nextGraph.nodes[index],
        x: sourceNode.x + jitterX,
        y: sourceNode.y + jitterY,
      }
    }

    const inBounds = nextGraph.nodes.every((node) => pointInBounds(node, bounds))
    const enoughSpacing = nextGraph.nodes.every((node, index) =>
      nextGraph.nodes.every((otherNode, otherIndex) => {
        if (index === otherIndex) {
          return true
        }

        return distance(node, otherNode) > 40
      }),
    )

    const intersectionCount = countEdgeIntersections(nextGraph).count

    if (inBounds && enoughSpacing && intersectionCount > 0) {
      return cloneGraph(nextGraph)
    }
  }

  return cloneGraph(graph)
}
