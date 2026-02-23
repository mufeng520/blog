

/**
 * 高亮文本部分类型
 */
export interface HighlightPart {
  type: 'text' | 'mark'
  text: string
  key: number
}

/**
 * 高亮关键词
 */
export function highlightKeywords(text: string, keywords: string[]): HighlightPart[] {
  if (!keywords.length || !text) return [{ type: 'text', text, key: 0 }]

  // 过滤空关键词并转义特殊字符
  const validKeywords = keywords
    .filter((k) => k.trim().length > 0)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

  if (!validKeywords.length) return [{ type: 'text', text, key: 0 }]

  try {
    // 创建正则表达式匹配所有关键词（不区分大小写）
    const regex = new RegExp(`(${validKeywords.join('|')})`, 'gi')

    // 分割文本
    const parts = text.split(regex)

    // 返回高亮部分数组
    return parts.map((part, i) => {
      // 检查是否匹配关键词（不区分大小写）
      const isKeyword = validKeywords.some(
        (k) => k.toLowerCase() === part.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      )

      if (isKeyword && part) {
        return {
          type: 'mark' as const,
          key: i,
          text: part,
        }
      }

      return {
        type: 'text' as const,
        key: i,
        text: part,
      }
    })
  } catch (error) {
    // 正则表达式错误，返回原文本
    console.error('highlightKeywords error:', error)
    return [{ type: 'text', text, key: 0 }]
  }
}

/**
 * 提取搜索关键词（分词）
 */
export function extractKeywords(query: string): string[] {
  // 移除多余空白并分割
  const keywords = query
    .trim()
    .split(/\s+/)
    .filter((k) => k.length > 0)

  // 去重
  return Array.from(new Set(keywords))
}

/**
 * 格式化日期为相对时间
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '现在'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`
  return `${Math.floor(diffDays / 365)} 年前`
}

/**
 * 从文本中提取包含关键词的片段
 * @param text 完整文本
 * @param keywords 关键词数组
 * @param maxLength 片段最大长度
 * @returns 包含关键词的文本片段
 */
export function extractMatchingSnippet(
  text: string,
  keywords: string[],
  maxLength: number = 160,
): string {
  if (!text || !keywords.length) return text.slice(0, maxLength)

  // 过滤空关键词
  const validKeywords = keywords.filter((k) => k.trim().length > 0)
  if (!validKeywords.length) return text.slice(0, maxLength)

  // 查找第一个匹配的关键词位置
  let firstMatchIndex = -1
  let firstMatchedKeyword = ''

  for (const keyword of validKeywords) {
    const index = text.toLowerCase().indexOf(keyword.toLowerCase())
    if (index !== -1 && (firstMatchIndex === -1 || index < firstMatchIndex)) {
      firstMatchIndex = index
      firstMatchedKeyword = keyword
    }
  }

  // 如果没有找到匹配，返回开头
  if (firstMatchIndex === -1) {
    return text.slice(0, maxLength) + (text.length > maxLength ? '...' : '')
  }

  // 计算片段的起始和结束位置，让关键词居中
  // 策略：确保关键词前后各有足够的上下文（至少 20%）
  const keywordLength = firstMatchedKeyword.length
  const keywordCenter = firstMatchIndex + Math.floor(keywordLength / 2)
  const halfLength = Math.floor(maxLength / 2)

  // 从关键词中心向两边各扩展 halfLength
  let idealStart = keywordCenter - halfLength
  let idealEnd = keywordCenter + halfLength

  // 处理边界情况
  if (idealEnd > text.length) {
    // 右边超出边界
    const overflow = idealEnd - text.length
    idealEnd = text.length

    // 尝试从左边补偿，但确保关键词后至少有 20% 的内容
    const minAfterKeyword = Math.floor(maxLength * 0.2)
    const currentAfterKeyword = idealEnd - (firstMatchIndex + keywordLength)

    if (currentAfterKeyword >= minAfterKeyword) {
      // 关键词后已经有足够的内容，可以从左边补偿
      const canCompensate = Math.min(overflow, idealStart)
      idealStart = Math.max(0, idealStart - canCompensate)
    }
    // 否则宁可片段短一点，也不补偿
  }

  if (idealStart < 0) {
    // 左边超出边界
    const overflow = -idealStart
    idealStart = 0

    // 尝试从右边补偿，但确保关键词前至少有 20% 的内容
    const minBeforeKeyword = Math.floor(maxLength * 0.2)
    const currentBeforeKeyword = firstMatchIndex - idealStart

    if (currentBeforeKeyword >= minBeforeKeyword) {
      // 关键词前已经有足够的内容，可以从右边补偿
      const canCompensate = overflow
      idealEnd = Math.min(text.length, idealEnd + canCompensate)
    }
    // 否则宁可片段短一点，也不补偿
  }

  // 实际范围
  const startIndex = Math.max(0, idealStart)
  const endIndex = Math.min(text.length, idealEnd)

  // 提取片段
  let snippet = text.slice(startIndex, endIndex)

  // 添加省略号
  if (startIndex > 0) snippet = '...' + snippet
  if (endIndex < text.length) snippet = snippet + '...'

  return snippet
}
