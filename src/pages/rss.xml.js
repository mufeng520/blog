import rss from '@astrojs/rss';

export async function GET(context) {
  // 获取所有文章
  const posts = Object.values(import.meta.glob('./posts/*.md', { eager: true }))
    .map((post) => ({
      ...post,
      frontmatter: post.frontmatter || {},
    }))
    .sort((a, b) => {
      const dateA = a.frontmatter.pubdate ? new Date(a.frontmatter.pubdate).getTime() : 0;
      const dateB = b.frontmatter.pubdate ? new Date(b.frontmatter.pubdate).getTime() : 0;
      return dateB - dateA;
    });

  return rss({
    // RSS Feed 标题
    title: '木风的博客',
    // RSS Feed 描述
    description: '记录生活，分享技术，木风的个人博客',
    // 网站地址
    site: context.site || 'https://rita.cc.cd',
    // 文章列表
    items: posts.map((post) => {
      const frontmatter = post.frontmatter || {};
      return {
        // 文章标题
        title: frontmatter.title || '无标题',
        // 文章链接
        link: `/posts/${frontmatter.slug || ''}/`,
        // 发布日期
        pubDate: frontmatter.pubdate ? new Date(frontmatter.pubdate) : new Date(),
        // 文章描述/摘要
        description: frontmatter.description || '',
        // 文章分类
        categories: frontmatter.category ? [frontmatter.category] : [],
        // 作者
        author: '木风',
      };
    }),
    // 自定义命名空间
    customData: `<language>zh-CN</language>`,
  });
}
