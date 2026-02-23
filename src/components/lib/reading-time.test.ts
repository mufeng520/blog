import { describe, expect, it } from 'vitest'
import { calculateReadingTime, stripMarkdown } from './reading-time'

describe('stripMarkdown', () => {
  describe('基本 Markdown 语法', () => {
    it('应该移除 frontmatter', () => {
      const markdown = `---
title: Test
date: 2024-01-01
---

This is content`
      expect(stripMarkdown(markdown).trim()).toBe('This is content')
    })

    it('应该移除代码块', () => {
      const markdown = `Some text

\`\`\`js
const foo = 'bar'
\`\`\`

More text`
      expect(stripMarkdown(markdown).trim()).toBe('Some text\n\n\n\nMore text')
    })

    it('应该移除行内代码', () => {
      expect(stripMarkdown('Use `console.log()` to debug')).toBe('Use  to debug')
      expect(stripMarkdown('The `npm install` command')).toBe('The  command')
    })

    it('应该移除标题标记', () => {
      expect(stripMarkdown('# Heading 1')).toBe('Heading 1')
      expect(stripMarkdown('## Heading 2')).toBe('Heading 2')
      expect(stripMarkdown('### Heading 3')).toBe('Heading 3')
      expect(stripMarkdown('###### Heading 6')).toBe('Heading 6')
    })

    it('应该移除强调标记', () => {
      expect(stripMarkdown('**bold text**')).toBe('bold text')
      expect(stripMarkdown('*italic text*')).toBe('italic text')
      expect(stripMarkdown('_italic text_')).toBe('italic text')
      expect(stripMarkdown('~~strikethrough~~')).toBe('strikethrough')
    })

    it('应该移除链接但保留文本', () => {
      expect(stripMarkdown('[Google](https://google.com)')).toBe('Google')
      expect(stripMarkdown('Visit [our site](https://example.com) here')).toBe(
        'Visit our site here',
      )
    })

    it('应该移除图片', () => {
      expect(stripMarkdown('![Alt text](image.jpg)')).toBe('')
      expect(stripMarkdown('Text ![image](pic.png) more')).toBe('Text  more')
    })

    it('应该移除引用标记', () => {
      expect(stripMarkdown('> This is a quote')).toBe('This is a quote')
      expect(stripMarkdown('> Quote line 1\n> Quote line 2')).toBe('Quote line 1\nQuote line 2')
    })

    it('应该移除列表标记', () => {
      const result1 = stripMarkdown('- Item 1\n- Item 2')
      expect(result1).toContain('Item 1')
      expect(result1).toContain('Item 2')
      expect(result1).not.toContain('- ')

      const result2 = stripMarkdown('* Item 1\n* Item 2')
      expect(result2).toContain('Item 1')
      expect(result2).toContain('Item 2')
      expect(result2).not.toContain('* ')

      const result3 = stripMarkdown('+ Item 1\n+ Item 2')
      expect(result3).toContain('Item 1')
      expect(result3).toContain('Item 2')
      expect(result3).not.toContain('+ ')

      const result4 = stripMarkdown('1. First\n2. Second')
      expect(result4).toContain('First')
      expect(result4).toContain('Second')
      expect(result4).not.toContain('1. ')
      expect(result4).not.toContain('2. ')
    })

    it('应该移除水平分割线', () => {
      expect(stripMarkdown('Text\n---\nMore text')).toBe('Text\n\nMore text')
      expect(stripMarkdown('Text\n***\nMore text')).toBe('Text\n\nMore text')
      expect(stripMarkdown('Text\n___\nMore text')).toBe('Text\n\nMore text')
    })

    it('应该移除 HTML 标签', () => {
      expect(stripMarkdown('<div>Hello</div>')).toBe('Hello')
      expect(stripMarkdown('Text <span>with</span> tags')).toBe('Text with tags')
    })
  })

  describe('复杂场景', () => {
    it('应该处理混合 Markdown 语法', () => {
      const markdown = `# Title

This is **bold** and *italic* text.

- Item 1
- Item 2

\`\`\`js
console.log('code')
\`\`\`

[Link](url) and ![image](pic.jpg)`

      const result = stripMarkdown(markdown)
      expect(result).toContain('Title')
      expect(result).toContain('bold')
      expect(result).toContain('italic')
      expect(result).toContain('Item 1')
      expect(result).not.toContain('**')
      expect(result).not.toContain('console.log')
    })

    it('应该处理中文 Markdown', () => {
      const markdown = `# 标题

这是**加粗**和*斜体*文本。

- 列表项 1
- 列表项 2

\`\`\`js
const foo = 'bar'
\`\`\``

      const result = stripMarkdown(markdown)
      expect(result).toContain('标题')
      expect(result).toContain('加粗')
      expect(result).toContain('斜体')
      expect(result).not.toContain('**')
      expect(result).not.toContain('const foo')
    })
  })
})

describe('calculateReadingTime', () => {
  describe('基本功能', () => {
    it('应该返回至少 1 分钟', () => {
      expect(calculateReadingTime('')).toBe(1)
      expect(calculateReadingTime('短文')).toBe(1)
      expect(calculateReadingTime('Short text')).toBe(1)
    })

    it('应该处理 null 和 undefined', () => {
      expect(calculateReadingTime(null as never)).toBe(1)
      expect(calculateReadingTime(undefined as never)).toBe(1)
    })
  })

  describe('纯中文内容', () => {
    it('应该正确计算短中文文章', () => {
      // 200 个汉字，约 0.5 分钟，应该向上取整为 1 分钟
      const text = '这是一篇测试文章。'.repeat(20) // 约 200 字
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('应该正确计算中等长度中文文章', () => {
      // 800 个汉字，约 2 分钟
      const text = '这是一篇测试文章，包含一些内容。'.repeat(50) // 约 800 字
      expect(calculateReadingTime(text)).toBe(2)
    })

    it('应该正确计算长中文文章', () => {
      // 2000 个汉字，约 5 分钟
      const text = '这是一篇较长的测试文章，包含很多内容和细节。'.repeat(100) // 约 2000 字
      expect(calculateReadingTime(text)).toBe(5)
    })
  })

  describe('纯英文内容', () => {
    it('应该正确计算短英文文章', () => {
      // 约 100 个单词，约 0.25 分钟，应该向上取整为 1 分钟
      const text = 'This is a test article with some content. '.repeat(10)
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('应该正确计算中等长度英文文章', () => {
      // 约 400 个单词，约 1 分钟
      const text = 'This is a test article with some content and details. '.repeat(40)
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('应该正确计算长英文文章', () => {
      // 约 800 个单词，按 400 字/分钟计算，约 2-3 分钟
      const text = 'This is a longer test article with lots of content and details. '.repeat(80)
      const minutes = calculateReadingTime(text)
      expect(minutes).toBeGreaterThanOrEqual(2)
      expect(minutes).toBeLessThanOrEqual(3)
    })
  })

  describe('中英文混合内容', () => {
    it('应该正确计算混合内容', () => {
      const text = `
        这是一篇中英文混合的文章。

        This article contains both Chinese and English content.

        我们使用 React 和 Next.js 构建现代化的 Web 应用。

        We use modern technologies to build scalable applications.
      `.repeat(20)

      const minutes = calculateReadingTime(text)
      expect(minutes).toBeGreaterThan(1)
      expect(minutes).toBeLessThan(10)
    })
  })

  describe('Markdown 内容', () => {
    it('应该忽略代码块', () => {
      const markdown = `
这是正文内容。

\`\`\`js
// 这是代码块，不应该计入阅读时间
const foo = 'bar'
const baz = 'qux'
function test() {
  return 'test'
}
\`\`\`

这是更多正文内容。
      `

      const minutes = calculateReadingTime(markdown)
      // 只统计正文，不统计代码
      expect(minutes).toBe(1)
    })

    it('应该忽略 frontmatter', () => {
      const markdown =
        `---
title: Test Article
date: 2024-01-01
tags: [test, article]
---

这是文章的实际内容。` + '这是文章的实际内容。'.repeat(100)

      const minutes = calculateReadingTime(markdown)
      expect(minutes).toBeGreaterThan(1)
    })

    it('应该移除 Markdown 语法后统计', () => {
      const markdown = `
# 文章标题

这是**加粗文本**和*斜体文本*。

- 列表项 1
- 列表项 2
- 列表项 3

访问 [我的网站](https://example.com) 了解更多。

![图片](image.jpg)

\`\`\`js
console.log('代码')
\`\`\`
      `.repeat(10)

      const minutes = calculateReadingTime(markdown)
      expect(minutes).toBeGreaterThanOrEqual(1)
    })
  })

  describe('真实场景', () => {
    it('应该正确计算技术博客文章', () => {
      const article = `
# 使用 React 19 构建现代应用

React 19 引入了许多新特性，包括 use() Hook 和 useOptimistic() Hook。

## 新特性介绍

### use() Hook

use() Hook 允许我们在组件中直接使用 Promise。

\`\`\`tsx
function Component() {
  const data = use(fetchData())
  return <div>{data}</div>
}
\`\`\`

### useOptimistic() Hook

useOptimistic() Hook 用于乐观更新。

\`\`\`tsx
function Component({ items }) {
  const [optimisticItems, addOptimistic] = useOptimistic(items)
  return <ul>{optimisticItems.map(item => <li key={item}>{item}</li>)}</ul>
}
\`\`\`

## 总结

React 19 带来了很多改进，让我们能够更好地构建现代化的 Web 应用。
      `.repeat(5)

      const minutes = calculateReadingTime(article)
      expect(minutes).toBeGreaterThanOrEqual(2)
      expect(minutes).toBeLessThan(15)
    })

    it('应该正确计算生活随笔', () => {
      const article = `
今天是个好天气，阳光明媚，微风轻拂。

我决定出门散步，走在熟悉的街道上，看着路边的树木随风摇曳。

路过公园时，看到很多人在锻炼身体，有的在跑步，有的在打太极，还有的在遛狗。

这让我想起了小时候的时光，那时候每天放学后都会和小伙伴们在公园里玩耍。

时光荏苒，如今我们都长大了，各自有了自己的生活。

但是这些美好的回忆，却永远留在了心中。
      `.repeat(10)

      const minutes = calculateReadingTime(article)
      expect(minutes).toBeGreaterThan(2)
      expect(minutes).toBeLessThan(10)
    })
  })

  describe('边界情况', () => {
    it('应该处理只包含空格的内容', () => {
      expect(calculateReadingTime('   \n\n\t\t  ')).toBe(1)
    })

    it('应该处理只包含 Markdown 语法的内容', () => {
      expect(calculateReadingTime('# \n## \n### ')).toBe(1)
      expect(calculateReadingTime('**  ** *  *')).toBe(1)
    })

    it('应该处理非常长的文章', () => {
      // 10000 个汉字，约 25 分钟
      const text = '这是一篇非常长的文章。'.repeat(1000)
      const minutes = calculateReadingTime(text)
      expect(minutes).toBeGreaterThan(20)
      expect(minutes).toBeLessThan(30)
    })
  })
})
