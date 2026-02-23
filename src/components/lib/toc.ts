/**
 * Table of Contents (TOC) 工具函数
 */

export interface TocHeading {
  /** 标题 ID（用于锚点跳转） */
  id: string
  /** 标题文本 */
  text: string
  /** 标题层级（2 = h2, 3 = h3） */
  level: number
}

/**
 * 从 DOM 中提取文章标题
 * 仅在客户端使用
 */
export function extractHeadings(container: HTMLElement): TocHeading[] {
  const headingElements = container.querySelectorAll('h2, h3')
  const headings: TocHeading[] = []

  headingElements.forEach((heading) => {
    const id = heading.id
    // 移除 # 锚点符号，只保留文本内容
    const text = heading.textContent?.replace(/^#\s*/, '').trim() || ''
    const level = parseInt(heading.tagName[1], 10)

    if (id && text) {
      headings.push({ id, text, level })
    }
  })

  return headings
}
