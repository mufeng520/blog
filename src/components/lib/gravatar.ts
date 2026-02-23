import type { MessageAuthor } from './messages'

/**
 * 获取作者名称（处理匿名用户）
 */
export function getAuthorName(author: MessageAuthor): string {
  return author.name?.trim() || '匿名'
}

/**
 * 获取作者头像（优先级：自定义 > Gravatar > 空字符串）
 * 返回空字符串时，渲染组件会使用文字头像（名字首字）
 */
export async function getAuthorAvatar(author: MessageAuthor): Promise<string> {
  if (author.avatar) return author.avatar
  if (author.email) return await generateAvatarUrl(author.email)
  return '' // 返回空字符串，让组件显示文字头像
}

/**
 * 使用 Web Crypto API 生成 SHA256 哈希
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * 头像生成逻辑
 * 使用 SHA256 哈希（Gravatar 官方推荐）
 */
const cache = new Map<string, string>()

export async function generateAvatarUrl(email: string): Promise<string> {
  if (!email) return ''

  // 使用缓存避免重复计算
  if (cache.has(email)) {
    return cache.get(email)!
  }

  let res = ''

  const qqMailPattern = /^([1-9][0-9]{4,10})@qq\.com$/i
  const qq = email.match(qqMailPattern)

  if (qq) {
    const qqNumber = qq[1] || ''
    res = `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`
  } else {
    // CRITICAL: Generate the SHA256 hash correctly for all Gravatar operations
    // Trim and lowercase the email - BOTH steps are required
    const normalizedEmail = email.trim().toLowerCase()
    const hash = await sha256(normalizedEmail)
    res = `https://gravatar.loli.net/avatar/${hash}?d=identicon&s=80`
  }

  cache.set(email, res)

  return res
}
