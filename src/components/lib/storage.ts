/**
 * localStorage 工具函数
 * Local Storage Utilities
 */

const STORAGE_KEYS = {
  MESSAGE_AUTHOR: 'message_author_info',
} as const

export interface MessageAuthorInfo {
  name: string
  email: string
  website: string
}

/**
 * 保存留言作者信息到 localStorage
 */
export function saveMessageAuthor(info: MessageAuthorInfo): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGE_AUTHOR, JSON.stringify(info))
  } catch (error) {
    console.warn('保存作者信息失败:', error)
  }
}

/**
 * 从 localStorage 读取留言作者信息
 */
export function loadMessageAuthor(): MessageAuthorInfo | null {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGE_AUTHOR)
    if (!data) return null

    return JSON.parse(data) as MessageAuthorInfo
  } catch (error) {
    console.warn('读取作者信息失败:', error)
    return null
  }
}

/**
 * 清除留言作者信息
 */
export function clearMessageAuthor(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEYS.MESSAGE_AUTHOR)
  } catch (error) {
    console.warn('清除作者信息失败:', error)
  }
}
