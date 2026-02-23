// Bilibili 番剧 API 数据类型定义

export interface BangumiItem {
  season_id: number
  media_id: number
  title: string
  cover: string
  evaluate: string
  summary: string
  horizontal_cover_16_9?: string
  horizontal_cover_16_910?: string
  square_cover?: string
  url: string
  badge?: string
  badge_info?: {
    text: string
    bg_color: string
    bg_color_night: string
  }
  badge_type?: number
  rating?: {
    score: number
    count: number
  }
  progress?: string
  total_count?: number
  is_finish?: number
  new_ep?: {
    id: number
    index_show: string
    cover: string
  }
  season_type_name?: string
  areas?: {
    id: string
    name: string
  }[]
  styles?: string[]
  subtitle?: string
  /**
   * 追番状态：1=想看，2=在看，3=看过
   */
  follow_status?: 1 | 2 | 3
}

// 服务端数据获取函数

const BANGUMI_API_BASE = 'https://api.viki.moe/bili/bangumi'

/**
 * 获取 B 站追番列表（服务端）
 * 用于 SSR 初始数据
 */
export async function getBangumiList(): Promise<BangumiItem[]> {
  try {
    const response = await fetch(BANGUMI_API_BASE, {
      next: { revalidate: 3600 }, // 1 小时缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch bangumi list:', response.statusText)
      return []
    }

    const data: BangumiItem[] = await response.json()
    return data || []
  } catch (error) {
    console.error('Error fetching bangumi list:', error)
    return []
  }
}
