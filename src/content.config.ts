// 1. 从 `astro:content` 导入工具函数
import { defineCollection } from 'astro:content';

// 2. 导入加载器
import { glob, file } from 'astro/loaders';

// 3. 导入 Zod
import { z } from 'astro/zod';

// 4. 定义你的集合
const blog = defineCollection({ 
    loader: glob({ pattern: "**/*.md", base: "./src/page/posts" }), // 使用 glob 加载器
    schema: z.object({
      title: z.string(),
      description: z.string(),
      // ... 其他字段
    }),
 });

// 定义 quotes 集合 - 从 JSON 文件加载
const quotes = defineCollection({
  loader: file("src/data/quotes.json"),
  schema: z.object({
    id: z.string(),
    text: z.string(),
    author: z.string(),
  }),
});

/** 星穹铁道遗器规则：与 Reliquary Archiver 导出中的 character id、套装英文 name 对齐；每角色多套方案 */
const relicLoadoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  cavernSets: z.array(z.string()).default([]),
  planarSets: z.array(z.string()).default([]),
  /** 有效副词条：Archiver 的 key（如 CRIT Rate_）或中文简称（如 暴击率），用于标注与「有效 count」统计 */
  effectiveSubstats: z.array(z.string()).default([]),
});

/** 单一配置文件：src/data/star-rail-relic-rules.json（根为数组，每项一名角色） */
const starRailRelicRules = defineCollection({
  loader: file('src/data/star-rail-relic-rules.json'),
  schema: z.object({
    /** file 加载器要求：条目 slug，建议稳定且唯一（可用拼音或中文） */
    id: z.string(),
    /** Reliquary Archiver 导出里该角色的 id（数字字符串） */
    characterId: z.string(),
    displayName: z.string().optional(),
    /** 可选：写给自己看的说明，不参与逻辑 */
    note: z.string().optional(),
    loadouts: z.array(relicLoadoutSchema),
  }),
});

// 5. 导出一个 `collections` 对象来注册你的集合
export const collections = { blog, quotes, starRailRelicRules };