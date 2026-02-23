// Steam API 数据类型定义

export interface PlatformPlaytime {
  platform: string
  total_minutes: number
  total_desc: string
}

export interface GameImage {
  icon: string
  logo: string
  header: string
  hero: string
  background: string
  library_hero: string
  library_hero_2x: string
  capsule_sm_120: string
  capsule_184x69: string
  capsule_231x87: string
  capsule_616x353: string
  library_600x900: string
  library_600x900_2x: string
}

export interface LibraryGame {
  appid: number
  name: string
  store_url: string
  playtime: {
    total_minutes: number
    total_desc: string
    recent_minutes: number | null
    recent_desc: string | null
    platforms?: PlatformPlaytime[]
  }
  image: GameImage
  has_community_visible_stats: boolean | null
  content_descriptors: string[]
}

export interface RecentGame {
  appid: number
  name: string
  store_url: string
  playtime: {
    recent_minutes: number
    recent_desc: string
    total_minutes?: number
    total_desc?: string
    platforms?: PlatformPlaytime[]
  }
  image: GameImage
}

export interface GameInfo {
  appid: number
  name: string
  store_url: string
  image: GameImage
  server_ip: string | null
}

export interface SteamProfile {
  steam_id: string
  persona_name: string
  avatar: {
    small: string
    medium: string
    full: string
  }
  level: number
  level_desc: string
  account_age_years: number
  account_age_years_desc: string
  games_owned: number
  games_played: number
  games_never_played: number
  games_total_playtime: number
  games_total_playtime_desc: string
  profile_url: string
  profile_state: number
  visibility: number
  visibility_desc: string
  is_online: boolean
  online_status_desc: string
  last_logoff: number | null
  last_logoff_at: number | null
  last_logoff_desc: string | null
  comment_permission: number | null
  real_name: string | null
  primary_clan_id: string | null
  time_created: number | null
  time_created_at: number | null
  time_created_desc: string | null
  country_code: string | null
  location: string | null
  persona_state: number
  persona_state_desc: string
  game_info: GameInfo | null
}

export interface CS2InventoryItem {
  asset_id: string
  class_id: string
  instance_id: string
  amount: number
  market_hash_name: string
  name: string
  plain_name: string
  stat_trak: boolean
  name_color: string
  description: string
  type: string
  rarity: string | null
  rarity_color: string | null
  quality: string | null
  quality_color: string | null
  exterior: string | null
  exterior_short: string | null
  defindex: number | null
  exterior_wear: number | null
  stattrak_score: number | null
  icon_url: string
  icon_url_large: string | null
  market_url: string | null
  tradable: boolean
  marketable: boolean
  commodity: boolean
  market_tradable_restriction: number
  market_marketable_restriction: number
}

// 服务端数据获取函数

const STEAM_API_BASE = 'https://api.viki.moe/steam'

/**
 * 获取 Steam 个人资料（服务端）
 * 用于 SSR 初始数据
 */
export async function getSteamProfile(): Promise<SteamProfile | null> {
  try {
    const response = await fetch(`${STEAM_API_BASE}/summary`, {
      next: { revalidate: 60 }, // 1 分钟缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch Steam profile:', response.statusText)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Steam profile:', error)
    return null
  }
}

/**
 * 获取游戏库（服务端）
 * 用于 SSR 初始数据
 */
export async function getLibraryGames(): Promise<LibraryGame[]> {
  try {
    const response = await fetch(`${STEAM_API_BASE}/games`, {
      next: { revalidate: 3600 }, // 1 小时缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch Steam games:', response.statusText)
      return []
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Steam games:', error)
    return []
  }
}

/**
 * 获取最近玩过的游戏（服务端）
 * 用于 SSR 初始数据
 */
export async function getRecentlyPlayed(): Promise<RecentGame[]> {
  try {
    const response = await fetch(`${STEAM_API_BASE}/recently-played`, {
      next: { revalidate: 3600 }, // 1 小时缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch recently played games:', response.statusText)
      return []
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching recently played games:', error)
    return []
  }
}

/**
 * 获取 CS2 库存（服务端）
 * 用于 SSR 初始数据
 */
export async function getCS2Inventory(): Promise<CS2InventoryItem[]> {
  try {
    const response = await fetch(`${STEAM_API_BASE}/cs2/inventory`, {
      next: { revalidate: 3600 }, // 1 小时缓存
    })

    if (!response.ok) {
      console.error('Failed to fetch CS2 inventory:', response.statusText)
      return []
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching CS2 inventory:', error)
    return []
  }
}

/**
 * 客户端刷新用的 API 调用（不带缓存）
 */
// export async function fetchSteamProfile(): Promise<SteamProfile | null> {
//   try {
//     const response = await fetch(`${STEAM_API_BASE}/summary`)
//     if (!response.ok) return null
//     return await response.json()
//   } catch (error) {
//     console.error('Error fetching Steam profile:', error)
//     return null
//   }
// }

// export async function fetchLibraryGames(): Promise<LibraryGame[]> {
//   try {
//     const response = await fetch(`${STEAM_API_BASE}/games`)
//     if (!response.ok) return []
//     return await response.json()
//   } catch (error) {
//     console.error('Error fetching Steam games:', error)
//     return []
//   }
// }

// export async function fetchRecentlyPlayed(): Promise<RecentGame[]> {
//   try {
//     const response = await fetch(`${STEAM_API_BASE}/recently-played`)
//     if (!response.ok) return []
//     return await response.json()
//   } catch (error) {
//     console.error('Error fetching recently played games:', error)
//     return []
//   }
// }
