import rss, { pagesGlobToRssItems } from '@astrojs/rss';
export async function GET(context) {
  return rss({
    // RSS Feed 标题
    title: '木风的博客',
    // RSS Feed 描述
    description: '记录生活，分享技术，木风的个人博客',
    // 网站地址
    site: context.site || 'https://rita.cc.cd',
    // 文章列表
    items: await pagesGlobToRssItems(
      import.meta.glob('./posts/*.md', { eager: true }),
    ),
    // 自定义命名空间
    customData: `<language>zh-CN</language>`,
  });
}
