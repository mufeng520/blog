import { visit } from 'unist-util-visit'

import type { Root, Element } from 'hast'

/**
 * Rehype 插件：为图片添加 zoom 支持
 *
 * 给所有 img 标签添加 data-zoomable 属性，
 * 供客户端 medium-zoom 初始化使用
 */
export default function rehypeZoomImage() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const isEmoji =
        Array.isArray(node.properties.className) && node.properties.className.includes('emoji')

      if (node.tagName === 'img' && !isEmoji) {
        node.properties = node.properties || {}

        node.properties['dataZoomable'] = true
        node.properties['referrerPolicy'] = 'no-referrer'

        const src = node.properties['src'] || ''

        if (src) {
          node.properties['dataZoomSrc'] = src
        }
      }
    })
  }
}
