// 王者荣耀皮肤数据类型定义

export interface HokSkin {
  hero_id: number
  hero_name: string
  hero_type: string
  hero_alias: string
  hero_icon: string
  hero_cover: string
  skin_id: number
  skin_name: string
  skin_cover: string
  skin_cover_small: string
  level: string // B, A, S, SR, SSR, SSSR
  level_desc: string
  price: number
  append_prop: string
  qualities: string[]
  quality_label: string
  published: string
  published_at: number
  acquired: string
  acquired_at: number
}

export interface HokSummary {
  count: string
  worth: string
  not_for_sale_count: string
  total_count: string
  types: {
    activity_limited: number
    total_activity_limited: number
    annual_limited: number
    total_annual_limited: number
    battle_pass: number
    total_battle_pass: number
    epic: number
    total_epic: number
    glory: number
    total_glory: number
    legend: number
    total_legend: number
    seasonal: number
    total_seasonal: number
    warrior: number
    total_warrior: number
  }
}

export interface HokResponse {
  summary: HokSummary
  assets_base: string
  skins: HokSkin[]
}

// 服务端数据获取函数

const HOK_API_BASE = 'https://api.viki.moe/hok'

/**
 * 获取王者荣耀皮肤数据（服务端）
 * 用于 SSR 初始数据
 */
export async function getHokSkins(): Promise<HokResponse | null> {
  try {
    const response = await fetch(`${HOK_API_BASE}/skins`, {
      next: { revalidate: 3600 }, // 1 小时缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch HOK skins:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching HOK skins:', error)
    return null
  }
}
