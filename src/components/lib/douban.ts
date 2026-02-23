// 豆瓣 API 数据类型定义

export interface DoubanItem {
  id: string
  title: string
  url: string
  cover: string
  date: string // YYYY-MM-DD 格式
}

export interface DoubanResponse {
  collect: DoubanItem[] // 读过/看过
  wish: DoubanItem[] // 想读/想看
  doings: DoubanItem[] // 在读/在看
}

export interface DoubanProfile {
  name: string
  avatar: string
  join_date: string
  join_date_at: number
  movies: {
    collect: number
    wish: number
    doings: number
    person: number
  }
  books: {
    collect: number
    wish: number
    doings: number
    person: number
  }
}

// 服务端数据获取函数

const DOUBAN_API_BASE = 'https://api.viki.moe/douban'

/**
 * 获取豆瓣书籍列表（服务端）
 * 用于 SSR 初始数据
 */
export async function getDoubanBooks(): Promise<DoubanResponse> {
  try {
    const response = await fetch(`${DOUBAN_API_BASE}/books`, {
      next: { revalidate: 3600 }, // 1 小时缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch douban books:', response.statusText)
      return { collect: [], wish: [], doings: [] }
    }

    const data: DoubanResponse = await response.json()
    return {
      collect: data.collect || [],
      wish: data.wish || [],
      doings: data.doings || [],
    }
  } catch (error) {
    console.error('Error fetching douban books:', error)
    return { collect: [], wish: [], doings: [] }
  }
}

/**
 * 获取豆瓣影视列表（服务端）
 * 用于 SSR 初始数据
 */
export async function getDoubanMovies(): Promise<DoubanResponse> {
  try {
    const response = await fetch(`${DOUBAN_API_BASE}/movies`, {
      next: { revalidate: 3600 }, // 1 小时缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch douban movies:', response.statusText)
      return { collect: [], wish: [], doings: [] }
    }

    const data: DoubanResponse = await response.json()
    return {
      collect: data.collect || [],
      wish: data.wish || [],
      doings: data.doings || [],
    }
  } catch (error) {
    console.error('Error fetching douban movies:', error)
    return { collect: [], wish: [], doings: [] }
  }
}

/**
 * 获取豆瓣个人资料（服务端）
 * 用于 SSR 初始数据
 */
export async function getDoubanProfile(): Promise<DoubanProfile | null> {
  try {
    const response = await fetch(`${DOUBAN_API_BASE}/profile`, {
      next: { revalidate: 3600 }, // 1 小时缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch douban profile:', response.statusText)
      return null
    }

    const data: DoubanProfile = await response.json()
    console.log('Douban profile data:', data)
    return data
  } catch (error) {
    console.error('Error fetching douban profile:', error)
    return null
  }
}
