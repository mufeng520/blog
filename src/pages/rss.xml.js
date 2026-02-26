import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
export async function GET(context) {
  // 获取所有文章
  const blog = await getCollection('posts');
  return rss({
    // RSS Feed 标题
    title: '木风的博客',
    // RSS Feed 描述
    description: '记录生活，分享技术，木风的个人博客',
    // 网站地址
    site: context.site || 'https://rita.cc.cd',
    // 文章列表
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      // 从 `id` 属性计算出 RSS 链接
      // 这个例子假设所有的文章都被渲染为 `/blog/[id]` 路由
      link: `/blog/${post.id}/`,
    })),
    // 自定义命名空间
    customData: `<language>zh-CN</language>`,
  });
}
