import { visit } from 'unist-util-visit'
import emojiPacks from '../data/emoji-packs.json'
import { getEmojiPackSize } from './emoji-packs'

import type { Plugin } from 'unified'
import type { EmojiPacks } from './emoji-packs'
import type { Root, Text, Html, PhrasingContent } from 'mdast'

/** 插件选项 */
export interface RemarkEmojiPackOptions {
  /** 表情包配置 */
  packs?: EmojiPacks
  /** CSS 类名（图片表情） */
  className?: string
  /** 文字表情 CSS 类名 */
  textClassName?: string
}

/**
 * remark 插件：将 :collection_name: 转换为对应内容
 *
 * @example
 * :face_微笑: → <img class="emoji" src="https://..." alt="微笑" title="微笑" loading="lazy" />
 * :kaomoji_开心: → (´▽`)
 */
const remarkEmojiPack: Plugin<[RemarkEmojiPackOptions?], Root> = (options = {}) => {
  const { packs = emojiPacks as EmojiPacks, className = 'emoji' } = options

  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || typeof index !== 'number') return

      const { value } = node
      // 匹配 :collection_name: 格式
      const regex = /:([a-zA-Z0-9_]+)_([^:]+):/g

      const newNodes: PhrasingContent[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = regex.exec(value)) !== null) {
        const [fullMatch, collection, name] = match

        // 添加前面的普通文本
        if (match.index > lastIndex) {
          newNodes.push({
            type: 'text',
            value: value.slice(lastIndex, match.index),
          })
        }

        // 查找表情包
        const pack = packs[collection]
        const emojiData = pack?.items[name]

        if (emojiData) {
          if (pack.type === 'image') {
            // 图片表情 - 生成 HTML
            const size = getEmojiPackSize(pack)
            const htmlValue = `<img class="${className}" src="${emojiData}" alt="${name}" title="${name}" width="${size}" height="${size}" loading="lazy" referrerpolicy="no-referrer" />`
            newNodes.push({
              type: 'html',
              value: htmlValue,
            } as Html)
          } else {
            // 文字表情 - 直接插入文本
            newNodes.push({
              type: 'text',
              value: emojiData,
            })
          }
        } else {
          // 表情未找到，保留原文
          newNodes.push({
            type: 'text',
            value: fullMatch,
          })
        }

        lastIndex = match.index + fullMatch.length
      }

      // 添加剩余文本
      if (lastIndex < value.length) {
        newNodes.push({
          type: 'text',
          value: value.slice(lastIndex),
        })
      }

      // 替换节点
      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes)
        return index + newNodes.length
      }
    })
  }
}

export default remarkEmojiPack
