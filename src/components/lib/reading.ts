/**
 * 岛读 API 相关类型和函数
 */

import { Lunar } from 'lunar-typescript'

export interface ReadingComment {
  id: string
  nickname: string
  avatar: string
  like_count: number
  content: string
}

export interface ReadingData {
  id: string
  date: string // YYYY-MM-DD
  name: string // 作品名称
  name_formatted: string // 格式化的名称（如《秋夜》）
  author: string // 作者
  content: string // 正文内容
  tip: string // 提示语（如"宜观细微"）
  like_count: number
  comment_count: number
  comments: ReadingComment[]
}

const BASE_URL = 'https://api.viki.moe/reading'

/**
 * 获取今日阅读
 */
export async function getTodayReading(): Promise<ReadingData> {
  const res = await fetch(`${BASE_URL}/today`, {
    next: { revalidate: 3600 }, // 1 小时重新验证
  })

  if (!res.ok) {
    throw new Error('Failed to fetch today reading')
  }

  return res.json()
}

/**
 * 获取特定日期的阅读
 */
export async function getReadingByDate(date?: string): Promise<ReadingData> {
  // 如果是 today，调用今日接口
  if (!date) {
    return getTodayReading()
  }

  const res = await fetch(`${BASE_URL}/${date}`, {
    next: { revalidate: 86400 }, // 历史数据 24 小时重新验证
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch reading for date: ${date}`)
  }

  return res.json()
}

/**
 * 生成当月日期列表（用于月历导航）
 */
export function generateMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = []
  const lastDay = new Date(year, month, 0)

  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push(new Date(year, month - 1, day))
  }

  return dates
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取农历信息
 */
export function getLunarInfo(date: Date): {
  year: string
  month: string
  day: string
  festival?: string
} {
  const lunar = Lunar.fromDate(date)

  return {
    year: lunar.getYearInChinese(),
    month: lunar.getMonthInChinese(),
    day: lunar.getDayInChinese(),
    festival: lunar.getFestivals().join('·') || undefined,
  }
}
