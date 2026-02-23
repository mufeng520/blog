import { countWords } from './word-count.ts'

/**
 * 移除 Markdown 语法标记，保留纯文本内容
 *
 * @param markdown - Markdown 格式的文本
 * @returns 移除 Markdown 语法后的纯文本
 */
export function stripMarkdown(markdown: string): string {
  return (
    markdown
      // 移除 frontmatter
      .replace(/^---[\s\S]*?---/m, '')
      // 移除代码块
      .replace(/```[\s\S]*?```/g, '')
      // 移除行内代码
      .replace(/`[^`]+`/g, '')
      // 移除图片（必须在链接之前处理）
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // 移除链接，保留文本
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // 移除标题标记
      .replace(/#{1,6}\s+/g, '')
      // 移除强调标记（加粗、斜体、删除线）
      .replace(/[*_~]{1,2}([^*_~]+)[*_~]{1,2}/g, '$1')
      // 移除引用标记
      .replace(/^>\s*/gm, '')
      // 移除无序列表标记
      .replace(/^[-*+]\s+/gm, '')
      // 移除有序列表标记
      .replace(/^\d+\.\s+/gm, '')
      // 移除水平分割线
      .replace(/^[-*_]{3,}$/gm, '')
      // 移除 HTML 标签
      .replace(/<[^>]+>/g, '')
  )
}

/**
 * 计算阅读时间（分钟）
 *
 * 基于科学的阅读速度研究：
 * - 中文阅读速度：每分钟 300-500 字，取平均值 400 字/分钟
 * - 英文阅读速度：每分钟 200-250 词，取平均值 225 词/分钟
 * - 数字阅读速度：与英文单词相同，每分钟 225 个数字组
 *
 * 注意：
 * - 代码块不计入阅读时间（代码需要理解和思考，不是简单阅读）
 * - Markdown 语法标记会被移除，只统计实际文本内容
 * - 最少返回 1 分钟（即使内容很少）
 *
 * @param content - Markdown 格式的文章内容
 * @returns 预计阅读时间（分钟）
 *
 * @example
 * ```ts
 * calculateReadingTime('这是一篇中文文章') // 1
 * calculateReadingTime('This is an English article') // 1
 * ```
 */
export function calculateReadingTime(content: string): number {
  if (!content || typeof content !== 'string') {
    return 1
  }

  // 移除 Markdown 语法，获取纯文本
  const plainText = stripMarkdown(content)

  // 使用通用的字数统计函数
  const wordCount = countWords(plainText)

  // 根据阅读速度计算时间
  // 假设平均阅读速度为 400 字/分钟（混合中英文的情况）
  // 这个值是中文（400 字/分钟）和英文（225 词/分钟）的折中
  const readingTime = Math.ceil(wordCount / 400)

  // 至少 1 分钟
  return Math.max(1, readingTime)
}

/**
 * 从纯文本计算阅读时间（分钟）
 *
 * 适用于已渲染的 HTML 提取出的文本内容，或无需 stripMarkdown 的场景。
 *
 * @param plainText - 纯文本内容
 * @returns 预计阅读时间（分钟）
 */
export function calculateReadingTimeFromText(plainText: string): number {
  if (!plainText || typeof plainText !== 'string') {
    return 1
  }
  const wordCount = countWords(plainText)
  const readingTime = Math.ceil(wordCount / 400)
  return Math.max(1, readingTime)
}
