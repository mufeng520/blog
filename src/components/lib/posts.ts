import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { calculateReadingTime } from './reading-time.ts'
import { isDev } from './env.ts'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface PostMetadata {
  title: string
  date: string
  excerpt: string
  tags?: string[]
  author?: string
  slug: string
  draft?: boolean
  top?: boolean
  topImage?: string
  readingTime: number
}

export interface Post extends PostMetadata {
  content: string
}

/**
 * 递归获取目录下所有 .md 和 .mdx 文件的相对路径
 */
async function getAllMarkdownFiles(dir: string, baseDir: string = dir): Promise<string[]> {
  try {
    await fs.access(dir)
  } catch {
    return []
  }

  const files: string[] = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // 递归读取子目录
      const subFiles = await getAllMarkdownFiles(fullPath, baseDir)
      files.push(...subFiles)
    } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      // 获取相对于 posts 目录的路径
      const relativePath = path.relative(baseDir, fullPath)
      files.push(relativePath)
    }
  }

  return files
}

export async function getAllPosts(): Promise<PostMetadata[]> {
  const markdownFiles = await getAllMarkdownFiles(postsDirectory)

  const allPostsData: PostMetadata[] = await Promise.all(
    markdownFiles.map(async (relativePath) => {
      // 生成 slug: 只使用文件名部分，例如 "2022/css-history-and-perf.md" -> "css-history-and-perf"
      const fileName = path.basename(relativePath, path.extname(relativePath))
      const slug = fileName
      const fullPath = path.join(postsDirectory, relativePath)

      const fileContents = await fs.readFile(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title || slug,
        date: new Date(data.date).toISOString(),
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        author: data.author || '',
        draft: data.draft || false,
        top: data.top || false,
        topImage: data.top_image || undefined,
        readingTime: calculateReadingTime(content),
      }
    }),
  )

  // 开发模式下显示所有文章（包括草稿），生产环境下过滤草稿
  const filteredPosts = isDev ? allPostsData : allPostsData.filter((post) => !post.draft)

  return filteredPosts.toSorted((a, b) => (a.date < b.date ? 1 : -1))
}

/**
 * 获取所有文章（包含内容）
 * 用于需要访问文章内容的场景，如字数统计
 */
export async function getAllPostsWithContent(): Promise<Post[]> {
  const markdownFiles = await getAllMarkdownFiles(postsDirectory)

  const allPostsData: Post[] = await Promise.all(
    markdownFiles.map(async (relativePath) => {
      // 生成 slug: 只使用文件名部分，例如 "2022/css-history-and-perf.md" -> "css-history-and-perf"
      const fileName = path.basename(relativePath, path.extname(relativePath))
      return getPostBySlug(fileName) as Promise<Post>
    }),
  )

  // 开发模式下显示所有文章（包括草稿），生产环境下过滤草稿
  const filteredPosts = isDev ? allPostsData : allPostsData.filter((post) => !post.draft)

  return filteredPosts.toSorted((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // 在所有目录中查找匹配的文件名
    const markdownFiles = await getAllMarkdownFiles(postsDirectory)
    const matchingFile = markdownFiles.find((relativePath) => {
      const fileName = path.basename(relativePath, path.extname(relativePath))
      return fileName === slug
    })

    if (!matchingFile) {
      return null
    }

    const fullPath = path.join(postsDirectory, matchingFile)
    const fileContents = await fs.readFile(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || slug,
      date: new Date(data.date).toISOString(),
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      author: data.author || '',
      draft: data.draft || false,
      topImage: data.top_image || undefined,
      content,
      readingTime: calculateReadingTime(content),
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  const markdownFiles = await getAllMarkdownFiles(postsDirectory)

  const slugsWithDraft = await Promise.all(
    markdownFiles.map(async (relativePath) => {
      const fileName = path.basename(relativePath, path.extname(relativePath))
      const post = (await getPostBySlug(fileName)) as Post
      return { slug: post.slug || fileName, draft: post.draft || false }
    }),
  )

  return slugsWithDraft.filter((item) => !item.draft).map((item) => item.slug)
}

/**
 * 计算两个标签数组的相似度（Jaccard 相似系数）
 */
function calculateTagSimilarity(tags1: string[] = [], tags2: string[] = []): number {
  if (tags1.length === 0 || tags2.length === 0) return 0

  const set1 = new Set(tags1)
  const set2 = new Set(tags2)
  const intersection = new Set([...set1].filter((tag) => set2.has(tag)))
  const union = new Set([...set1, ...set2])

  return intersection.size / union.size
}

/**
 * 获取推荐文章
 * 策略：基于多维度评分的智能推荐算法
 * - 标签相似度（40%）：优先推荐标签相似的文章
 * - 时间新鲜度（30%）：倾向推荐较新的文章
 * - 时间接近度（20%）：推荐发布时间相近的文章
 * - 确定性随机（10%）：基于 slug 的伪随机性
 */
export async function getRecommendedPosts(
  currentSlug: string,
  count: number = 5,
): Promise<PostMetadata[]> {
  const allPosts = await getAllPosts()
  const currentPost = allPosts.find((p) => p.slug === currentSlug)

  if (!currentPost) {
    return allPosts.slice(0, count)
  }

  const otherPosts = allPosts.filter((p) => p.slug !== currentSlug)

  if (otherPosts.length === 0) {
    return []
  }

  // 计算每篇文章的推荐分数
  const currentDate = new Date(currentPost.date).getTime()
  const now = Date.now()
  const seed = currentSlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const scoredPosts = otherPosts.map((post, index) => {
    // 1. 标签相似度分数（0-1）
    const tagSimilarity = calculateTagSimilarity(currentPost.tags, post.tags)

    // 2. 时间新鲜度分数（0-1）：越新的文章分数越高
    const postDate = new Date(post.date).getTime()
    const daysSincePublish = (now - postDate) / (1000 * 60 * 60 * 24)
    const freshnessScore = Math.max(0, 1 - daysSincePublish / 365) // 1 年后衰减到 0

    // 3. 时间接近度分数（0-1）：发布时间越接近当前文章分数越高
    const timeDiff = Math.abs(postDate - currentDate)
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)
    const proximityScore = Math.max(0, 1 - daysDiff / 365) // 相差 1 年衰减到 0

    // 4. 确定性随机分数（0-1）：基于 slug 的伪随机
    const randomScore = (((seed + index) * 9301 + 49297) % 233280) / 233280

    // 综合评分（加权平均）
    const totalScore =
      tagSimilarity * 0.4 + freshnessScore * 0.3 + proximityScore * 0.2 + randomScore * 0.1

    return {
      post,
      score: totalScore,
    }
  })

  // 按分数降序排序，取前 N 篇
  const recommended = scoredPosts
    .toSorted((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ post }) => post)

  // 最终按发布时间倒序排列
  return recommended.toSorted((a, b) => (a.date < b.date ? 1 : -1))
}
