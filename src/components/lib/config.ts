/**
 * 站点配置
 * 统一管理网站的基本信息、元数据和常量
 */

import siteData from '@/data/site.json'
import { isDev } from './env'

export const websiteUrl = 'https://blog.viki.moe'

const url = isDev ? 'http://localhost:3000' : websiteUrl

// 重新组装配置，处理动态内容和引用
export const siteConfig = {
  ...siteData,
  url,
  copyright: {
    ...siteData.copyright,
    year: {
      start: siteData.copyright.year.start,
      end: new Date().getFullYear(),
    },
  },
}

export type SiteConfig = typeof siteConfig
