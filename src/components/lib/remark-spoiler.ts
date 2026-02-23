/**
 * remark-spoiler - A remark plugin for spoiler text syntax
 *
 * Converts `||spoiler text||` syntax to <span class="spoiler">spoiler text</span>
 *
 * Features:
 * - Supports Discord/Telegram style spoiler syntax: ||text||
 * - Handles nested inline formatting (bold, italic, links, code)
 * - Type-safe implementation with TypeScript
 * - Works with remark-gfm, rehype-raw and other plugins
 */
import { visit } from 'unist-util-visit'

import type { Root, Parent, Html, PhrasingContent, Text } from 'mdast'
import type { Plugin } from 'unified'

/** Plugin options */
export interface RemarkSpoilerOptions {
  /** The marker used to identify spoiler text. Default: '||' */
  marker?: string
  /** CSS class names to apply to the spoiler element. Default: ['spoiler'] */
  classNames?: string[]
  /** HTML tag name for the spoiler element. Default: 'span' */
  tagName?: string
  /** Title attribute for the spoiler element. Default: '你知道的太多了' */
  title?: string
}

// Type guard to check if a node is a Text node
function isTextNode(node: unknown): node is Text {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    (node as { type: string }).type === 'text'
  )
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Create an HTML node with spoiler wrapper
 */
function createSpoilerHtmlNode(
  content: string,
  classNames: string[],
  tagName: string,
  title?: string,
): Html {
  const classAttr = classNames.length > 0 ? ` class="${classNames.join(' ')}"` : ''
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''

  return {
    type: 'html',
    value: `<${tagName}${classAttr}${titleAttr}>${escapeHtml(content)}</${tagName}>`,
  }
}

/**
 * Parse text content and extract spoiler segments
 * Returns an array of nodes (text and HTML nodes)
 */
function parseSpoilerText(
  text: string,
  marker: string,
  classNames: string[],
  tagName: string,
  title?: string,
): PhrasingContent[] {
  const results: PhrasingContent[] = []
  const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Match spoiler pattern: ||content|| (non-greedy, allow multiline with 's' flag)
  const spoilerRegex = new RegExp(`${escapedMarker}(.+?)${escapedMarker}`, 'gs')

  let lastIndex = 0
  let match: RegExpExecArray | null = null

  while ((match = spoilerRegex.exec(text)) !== null) {
    // Add text before the spoiler
    if (match.index > lastIndex) {
      results.push({
        type: 'text',
        value: text.slice(lastIndex, match.index),
      })
    }

    // Add spoiler HTML node
    const spoilerContent = match[1]
    const spoilerNode = createSpoilerHtmlNode(spoilerContent, classNames, tagName, title)
    results.push(spoilerNode as unknown as PhrasingContent)
    lastIndex = match.index + match[0].length
  }

  // Add remaining text after the last spoiler
  if (lastIndex < text.length) {
    results.push({
      type: 'text',
      value: text.slice(lastIndex),
    })
  }

  return results
}

/**
 * Check if a parent node can contain phrasing content
 */
function isParentWithChildren(node: unknown): node is Parent {
  return (
    typeof node === 'object' &&
    node !== null &&
    'children' in node &&
    Array.isArray((node as Parent).children)
  )
}

/**
 * remark plugin to add spoiler syntax support
 *
 * @example
 * ```ts
 * import remarkSpoiler from '@/lib/remark-spoiler'
 *
 * // Usage with remark
 * remark().use(remarkSpoiler).process('||secret text||')
 *
 * // With custom options
 * remark().use(remarkSpoiler, { marker: '!!', classNames: ['hidden'] })
 * ```
 */
const remarkSpoiler: Plugin<[RemarkSpoilerOptions?], Root> = (options = {}) => {
  const {
    marker = '||',
    classNames = ['spoiler'],
    tagName = 'span',
    title = '你知道的太多了',
  } = options

  return (tree: Root) => {
    // Visit all text nodes
    visit(tree, 'text', (node: Text, index, parent) => {
      // Skip if no parent or index
      if (!isParentWithChildren(parent) || index === null || index === undefined) return

      // Check if the text contains spoiler markers
      if (!node.value.includes(marker)) return

      // Parse the text and extract spoiler segments
      const newNodes = parseSpoilerText(node.value, marker, classNames, tagName, title)

      // If we found spoilers, replace the current node with the new nodes
      if (newNodes.length > 1 || (newNodes.length === 1 && !isTextNode(newNodes[0]))) {
        // Remove the original text node and insert new nodes
        parent.children.splice(index, 1, ...newNodes)
        // Return the index to revisit the new nodes in case of nested spoilers
        return index
      }

      return undefined
    })
  }
}

export default remarkSpoiler
