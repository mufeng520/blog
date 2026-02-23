// 调试脚本：查看import.meta.glob返回的post对象结构
const posts = Object.values(import.meta.glob('./src/pages/posts/*.md', { eager: true }));

console.log('Post objects structure:');
posts.forEach((post, index) => {
  console.log(`\nPost ${index + 1}:`);
  console.log('Keys:', Object.keys(post));
  console.log('Has frontmatter:', !!post.frontmatter);
  console.log('Has content:', !!post.content);
  console.log('Has source:', !!post.source);
  if (post.source) {
    console.log('Source keys:', Object.keys(post.source));
  }
  console.log('Has rawContent:', !!post.rawContent);
  console.log('Has markdown:', !!post.markdown);
  console.log('Title:', post.frontmatter?.title);
});
