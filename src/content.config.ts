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
const dogs = defineCollection({ /* ... */ });

// 5. 导出一个 `collections` 对象来注册你的集合
export const collections = { blog, dogs };