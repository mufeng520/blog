import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
// import rehypeShiki from '@shikijs/rehype'
import remarkBreaks from 'remark-breaks'
import remarkRehype from 'remark-rehype'
import remarkSpoiler from './remark-spoiler'
import rehypeZoomImage from './rehype-zoom-image'
import remarkEmojiPack from './remark-emoji-pack'
import rehypeStringify from 'rehype-stringify'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

/**
 * 统一的 Markdown 解析器（基于 unified）
 *
 * 相比 next-mdx-remote 的优势：
 * 1. 更轻量：不需要 MDX 编译器，纯 Markdown 处理
 * 2. 更快：unified 直接处理，无 JSX 转换开销
 * 3. 更简单：单一处理链，易于理解和维护
 * 4. 缓存友好：可缓存编译结果
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBreaks)
  .use(remarkSpoiler)
  .use(remarkEmojiPack)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      img: [
        ...(defaultSchema.attributes?.img || []),
        ['loading', 'lazy', 'eager'],
        ['className', 'emoji', 'spoiler'],
        ['referrerPolicy'],
        ['width'],
        ['height'],
        ['crossOrigin'],
      ],
    },
  })
  // .use(rehypeShiki, {
  //   themes: {
  //     light: 'one-light',
  //     dark: 'one-dark-pro',
  //   },
  //   defaultColor: false,
  //   cssVariablePrefix: '--shiki-',
  //   lazy: true,
  // })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: 'prepend',
    properties: {
      className: ['heading-anchor'],
      ariaHidden: true,
      tabIndex: -1,
    },
  })
  .use(rehypeZoomImage)
  .use(rehypeExternalLinks, {
    target: '_blank',
    rel: ['noopener', 'noreferrer'],
  })
  .use(rehypeStringify)

/**
 * 解析 Markdown 为 HTML
 * 用于碎碎念、Mio 说等短内容（启用换行，无标题锚点）
 */
export async function parseMarkdown(content: string): Promise<string> {
  if (!content || content.trim() === '') {
    return ''
  }

  // const t = content.slice(0, 10).replace(/\s+/g, '_')
  // console.time(`s-${t}`)
  const result = await processor.process(content)
  // console.timeEnd(`s-${t}`)

  return String(result)
}

/**
 * 解析博客文章 Markdown 为 HTML
 * 用于博客文章（不启用换行，有标题锚点）
 */
export async function parseArticle(content: string): Promise<string> {
  if (!content || content.trim() === '') {
    return ''
  }

  const result = await processor.process(content)

  return String(result)
}

/**
 * 批量解析 Markdown（并行处理）
 */
export async function parseMarkdownBatch(contents: string[]): Promise<string[]> {
  return Promise.all(contents.map((content) => parseMarkdown(content)))
}

/**
 * 解析留言板 Markdown 为 HTML
 * 用于留言板（启用换行、表情包、剧透、安全过滤）
 */
export async function parseMessage(content: string): Promise<string> {
  if (!content || content.trim() === '') {
    return ''
  }

  // const t = content.slice(0, 10).replace(/\s+/g, '_')
  // console.time(`s-${t}`)
  const result = await processor.process(content)
  // console.timeEnd(`s-${t}`)

  return String(result)
}

/**
 * 清洗 Markdown 内容，移除语法保留纯文本
 */
export function cleanMarkdownContent(markdown: string): string {
  let content = markdown

  // 移除 Front Matter
  content = content.replace(/^---[\s\S]*?---\n/m, '')

  // 移除表格的分隔行和语法字符，保留表格内容
  content = content.replace(/^\s*\|?(\s*[:-]+[-| :]*\|)+\s*$/gm, '')

  // 移除代码块（``` 或 ~~~）
  content = content.replace(/```[\s\S]*?```/g, '[代码块]')
  content = content.replace(/~~~[\s\S]*?~~~/g, '[代码块]')

  // 移除内联代码
  content = content.replace(/`[^`]+`/g, '')

  // 移除图片（![alt](url)）
  content = content.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '[图片]')

  // 移除链接保留文本（[text](url) → text）
  content = content.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')

  // 移除 HTML 标签
  content = content.replace(/<[^>]+>/g, '')

  // 移除粗体（**text** 或 __text__）保留文本
  content = content.replace(/\*\*([^\*]+)\*\*/g, '$1')
  content = content.replace(/__([^_]+)__/g, '$1')

  // 移除斜体（*text* 或 _text_）保留文本
  content = content.replace(/\*([^\*]+)\*/g, '$1')
  content = content.replace(/_([^_]+)_/g, '$1')

  // 移除删除线（~~text~~）保留文本
  content = content.replace(/~~([^~]+)~~/g, '$1')

  // 移除剧透标记（||text||）保留文本
  content = content.replace(/\|\|([^\|]+)\|\|/g, '$1')

  // 移除任务列表标记（- [ ] 或 - [x]）
  content = content.replace(/^[\s]*-\s*\[[x\s]\]\s+/gim, '')

  // 移除标题标记（# ## ###）
  content = content.replace(/^#{1,6}\s+/gm, '')

  // 移除列表标记（- * +）
  content = content.replace(/^[\s]*[-*+]\s+/gm, '')

  // 移除数字列表标记（1. 2. 3.）
  content = content.replace(/^[\s]*\d+\.\s+/gm, '')

  // 移除引用标记（>）
  content = content.replace(/^>\s+/gm, '')

  // 移除水平线（--- *** ___）
  content = content.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '')

  // 移除多余的空白行（保留单个换行符）
  content = content.replace(/\n{3,}/g, '\n\n')

  // 移除首尾空白
  content = content.trim()

  return content
}

/**
 * 截断文本到指定长度
 */
export function truncateText(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}
