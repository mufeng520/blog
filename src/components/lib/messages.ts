/**
 * GitHub API 封装 - 留言板数据层
 * 使用私有仓库的 GitHub Issues 存储留言数据
 */

import matter from 'gray-matter'
import { cache } from 'react'
import { botOctokit } from './github-app'
import { getAuthorAvatar, getAuthorName } from './gravatar'
import { truncateText, cleanMarkdownContent } from './markdown'

// 仓库配置
const OWNER = process.env.MESSAGES_REPO_OWNER || 'vikiboss'
const REPO = process.env.MESSAGES_REPO_NAME || 'blog-messages'

/**
 * 检测异常 User-Agent（机器人、爬虫等）
 */
export function isSuspiciousUA(uaString: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java(?!script)/i,
    /scrapy/i,
    /axios/i,
    /postman/i,
  ]
  return suspiciousPatterns.some((pattern) => pattern.test(uaString))
}

/**
 * 创建留言（创建 GitHub Issue）
 */
export async function createMessage(
  author: MessageAuthor,
  content: string,
  ua?: string,
): Promise<number> {
  const authorName = getAuthorName(author)

  // 构建 Front Matter
  const frontMatterData: Record<string, unknown> = {}

  frontMatterData.name = authorName

  if (author.email) frontMatterData.email = author.email
  if (author.website) frontMatterData.website = author.website
  if (ua) frontMatterData.ua = ua

  frontMatterData.created_at = new Date().toISOString()

  // 序列化 Front Matter + 内容
  const body = matter.stringify(content, frontMatterData)

  // 生成 Issue title
  const title = `${authorName}：${truncateText(cleanMarkdownContent(content), 30)}`

  // 创建 Issue
  const { data } = await botOctokit.issues.create({
    owner: OWNER,
    repo: REPO,
    title,
    body,
    labels: ['message'],
  })

  return data.number
}

/**
 * 创建回复（创建 GitHub Issue Comment）
 */
export async function createReply(
  issueNumber: number,
  author: MessageAuthor,
  content: string,
  ua?: string,
): Promise<number> {
  const authorName = getAuthorName(author)

  // 构建 Front Matter
  const frontMatterData: Record<string, unknown> = {
    name: authorName,
    created_at: new Date().toISOString(),
  }

  if (author.email) frontMatterData.email = author.email
  if (author.website) frontMatterData.website = author.website
  if (ua) frontMatterData.ua = ua

  // 序列化 Front Matter + 内容
  const body = matter.stringify(content, frontMatterData)

  // 创建 Comment
  const { data } = await botOctokit.issues.createComment({
    owner: OWNER,
    repo: REPO,
    issue_number: issueNumber,
    body,
  })

  return data.id
}

/**
 * 获取留言列表
 */
export const getMessages = cache(async function getMessages(
  page = 1,
  perPage = 10,
  withReplies = false,
): Promise<{ messages: Message[]; total: number }> {
  // 使用 Search API 获取准确的总数
  const response = await botOctokit.search.issuesAndPullRequests({
    q: `repo:${OWNER}/${REPO} is:issue is:open label:message label:approved`,
    sort: 'created',
    order: 'desc',
    page,
    per_page: perPage,
  })

  const issues = response.data.items
  const total = response.data.total_count

  // 并发获取并解析留言内容
  const messages: Message[] = await Promise.all(
    issues.map(async (issue) => {
      const { data: frontMatter, content: issueContent } = matter(issue.body || '')

      const message: Message = {
        id: String(issue.number),
        author: {
          name: frontMatter.name,
          email: frontMatter.email,
          website: frontMatter.website,
          avatar: frontMatter.avatar || (await getAuthorAvatar(frontMatter)),
        },
        content: issueContent,
        createdAt: frontMatter.created_at,
        replyCount: issue.comments,
      }

      // 可选：保存原始 UA 字符串
      if (frontMatter.ua) {
        message.ua = frontMatter.ua as string
      }

      // 可选：加载回复
      if (withReplies && issue.comments > 0) {
        message.replies = await getReplies(issue.number)
        message.replyCount = message.replies.length
      }

      return message
    }),
  )

  return { messages, total }
})

/**
 * 获取回复列表
 */
export const getReplies = cache(async function getReplies(
  issueNumber: number,
): Promise<MessageReply[]> {
  const { data: comments } = await botOctokit.issues.listComments({
    owner: OWNER,
    repo: REPO,
    issue_number: issueNumber,
  })

  return await Promise.all(
    comments
      .filter((e) => (e.reactions?.['+1'] || 0) > 0)
      .map(async (comment) => {
        const { data: frontMatter, content: commentContent } = matter(comment.body || '')

        const reply: MessageReply = {
          id: String(comment.id),
          author: {
            name: frontMatter.name,
            email: frontMatter.email,
            website: frontMatter.website,
            avatar: frontMatter.avatar || (await getAuthorAvatar(frontMatter)),
          },
          content: commentContent,
          createdAt: frontMatter.created_at,
        }

        // 可选：保存原始 UA 字符串
        if (frontMatter.ua) {
          reply.ua = frontMatter.ua as string
        }

        return reply
      }),
  )
})

/**
 * 留言板类型定义
 * Messages Type Definitions
 */

/** 留言作者信息 */
export interface MessageAuthor {
  name?: string // 可选，默认 "匿名"
  email?: string // 可选
  website?: string // 可选
  avatar?: string // 可选，默认基于 email 的 Gravatar
}

/** 留言主体 */
export interface Message {
  id: string // Issue number
  author: MessageAuthor
  content: string // Markdown 内容（必填）
  createdAt: string // ISO 8601
  replyCount: number
  ua?: string // 原始 User-Agent 字符串（渲染时解析）
  replies?: MessageReply[] // 回复列表（可选加载）
}

/** 回复 */
export interface MessageReply {
  id: string // Comment ID
  author: MessageAuthor
  content: string // Markdown 内容
  createdAt: string // ISO 8601
  ua?: string // 原始 User-Agent 字符串（渲染时解析）
}

/** 留言列表响应 */
export interface GetMessagesResponse {
  messages: Message[]
  total: number
  page: number
  perPage: number
}

/** 创建留言请求 */
export interface CreateMessageRequest {
  name?: string
  email?: string
  website?: string
  avatar?: string
  content: string
}

/** 创建回复请求 */
export interface CreateReplyRequest {
  messageId: string
  name?: string
  email?: string
  website?: string
  avatar?: string
  content: string
}

/** API 响应 */
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}
