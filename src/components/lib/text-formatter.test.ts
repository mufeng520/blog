import { describe, it, expect } from 'vitest'
import { formatText, formatContentField } from './text-formatter'

describe('formatText', () => {
  describe('基础功能', () => {
    it('应该正确处理空字符串', () => {
      expect(formatText('')).toBe('')
    })

    it('应该正确处理 null/undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatText(null as any)).toBe(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatText(undefined as any)).toBe(undefined)
    })

    it('应该正确处理纯中文', () => {
      expect(formatText('这是一段中文')).toBe('这是一段中文')
    })

    it('应该正确处理纯英文', () => {
      expect(formatText('This is English')).toBe('This is English')
    })
  })

  describe('盘古之白（中英文混排）', () => {
    it('应该在中文和英文之间添加空格', () => {
      expect(formatText('使用React开发')).toBe('使用 React 开发')
      expect(formatText('今天学习TypeScript')).toBe('今天学习 TypeScript')
    })

    it('应该在中文和数字之间添加空格', () => {
      expect(formatText('距今已365天')).toBe('距今已 365 天')
      expect(formatText('这是第1次')).toBe('这是第 1 次')
    })

    it('应该在多个中英文混排场景中正确添加空格', () => {
      expect(formatText('使用React和TypeScript开发Next.js应用')).toBe(
        '使用 React 和 TypeScript 开发 Next.js 应用',
      )
    })
  })

  describe('名词大小写规范化', () => {
    it('应该规范化 Viki', () => {
      expect(formatText('viki 的博客')).toBe('Viki 的博客')
      expect(formatText('VIKI 的博客')).toBe('Viki 的博客')
    })

    it('应该规范化 Mio', () => {
      expect(formatText('mio 说')).toBe('Mio 说')
      expect(formatText('MIO 说')).toBe('Mio 说')
    })

    it('应该规范化 React', () => {
      expect(formatText('使用react开发')).toBe('使用 React 开发')
      expect(formatText('使用REACT开发')).toBe('使用 React 开发')
    })

    it('应该规范化 Next.js', () => {
      expect(formatText('使用nextjs框架')).toBe('使用 Next.js 框架')
      expect(formatText('使用next.js框架')).toBe('使用 Next.js 框架')
      expect(formatText('使用NEXTJS框架')).toBe('使用 Next.js 框架')
    })

    it('应该规范化 TypeScript', () => {
      expect(formatText('学习typescript')).toBe('学习 TypeScript')
      expect(formatText('学习TYPESCRIPT')).toBe('学习 TypeScript')
    })

    it('应该规范化 JavaScript', () => {
      expect(formatText('学习javascript')).toBe('学习 JavaScript')
      expect(formatText('学习JAVASCRIPT')).toBe('学习 JavaScript')
    })

    it('应该规范化 GitHub', () => {
      expect(formatText('访问github')).toBe('访问 GitHub')
      expect(formatText('访问GITHUB')).toBe('访问 GitHub')
    })

    it('应该规范化 VSCode（注意：VSCode 会被 pangu 分成 VS Code）', () => {
      expect(formatText('使用vscode编辑器')).toBe('使用 VS Code 编辑器')
      expect(formatText('使用VSCODE编辑器')).toBe('使用 VS Code 编辑器')
    })

    it('应该规范化 Node.js', () => {
      expect(formatText('使用nodejs运行')).toBe('使用 Node.js 运行')
      expect(formatText('使用node.js运行')).toBe('使用 Node.js 运行')
      expect(formatText('使用NODEJS运行')).toBe('使用 Node.js 运行')
    })

    it('应该只替换完整单词，不影响单词的一部分', () => {
      expect(formatText('reactivity')).toBe('reactivity')
      // 注意：javascript-core 中的 javascript 会被规范化，因为正则 \b 在连字符处匹配
      expect(formatText('javascript-core')).toBe('JavaScript-core')
    })
  })

  describe('Markdown 语法保护', () => {
    it('应该保护行内代码（注意：pangu 不在中文和标记之间加空格）', () => {
      expect(formatText('使用`React`开发')).toBe('使用`React`开发')
      expect(formatText('代码`const a=1`很简单')).toBe('代码`const a=1`很简单')
    })

    it('应该保护加粗语法', () => {
      expect(formatText('这是**加粗文本**内容')).toBe('这是**加粗文本**内容')
      expect(formatText('使用**React**开发')).toBe('使用**React**开发')
    })

    it('应该保护斜体语法', () => {
      expect(formatText('这是*斜体*内容')).toBe('这是*斜体*内容')
      expect(formatText('使用*TypeScript*开发')).toBe('使用*TypeScript*开发')
    })

    it('应该保护删除线语法', () => {
      expect(formatText('这是~~删除线~~内容')).toBe('这是~~删除线~~内容')
    })

    it('应该保护图片语法', () => {
      const input = '这是图片![示例图片](https://example.com/image.png)内容'
      const expected = '这是图片![示例图片](https://example.com/image.png)内容'
      expect(formatText(input)).toBe(expected)
    })

    it('应该保护链接语法', () => {
      const input = '访问[GitHub](https://github.com)了解更多'
      const expected = '访问[GitHub](https://github.com)了解更多'
      expect(formatText(input)).toBe(expected)
    })

    it('应该保护嵌套的 Markdown 语法', () => {
      expect(formatText('使用**`React`**开发')).toBe('使用**`React`**开发')
      expect(formatText('访问[**GitHub**](https://github.com)了解更多')).toBe(
        '访问[**GitHub**](https://github.com)了解更多',
      )
    })

    it('应该保护多个 Markdown 标记', () => {
      const input = '使用`React`和**TypeScript**开发[Next.js](https://nextjs.org)应用'
      const expected = '使用`React`和**TypeScript**开发[Next.js](https://nextjs.org)应用'
      expect(formatText(input)).toBe(expected)
    })
  })

  describe('综合场景', () => {
    it('应该正确处理混合场景 1：中英文 + 名词规范化', () => {
      const input = '我使用react和typescript开发应用'
      const expected = '我使用 React 和 TypeScript 开发应用'
      expect(formatText(input)).toBe(expected)
    })

    it('应该正确处理混合场景 2：中英文 + Markdown', () => {
      const input = '使用`React`开发应用'
      const expected = '使用`React`开发应用'
      expect(formatText(input)).toBe(expected)
    })

    it('应该正确处理混合场景 3：中英文 + 名词 + Markdown', () => {
      const input = '我在github上使用**react**和`typescript`开发nextjs应用'
      const expected = '我在 GitHub 上使用**react**和`typescript`开发 Next.js 应用'
      expect(formatText(input)).toBe(expected)
    })

    it('应该正确处理混合场景 4：多行文本', () => {
      const input = '第一行：使用react开发\n第二行：学习typescript\n第三行：访问github'
      const expected = '第一行：使用 React 开发\n第二行：学习 TypeScript\n第三行：访问 GitHub'
      expect(formatText(input)).toBe(expected)
    })

    it('应该正确处理混合场景 5：复杂的真实文本', () => {
      const input =
        '本文发布于2025年1月1日,距今已100天,使用react和typescript开发nextjs应用,访问[github](https://github.com)了解更多。'
      const expected =
        '本文发布于 2025 年 1 月 1 日, 距今已 100 天, 使用 React 和 TypeScript 开发 Next.js 应用, 访问[github](https://github.com)了解更多。'
      expect(formatText(input)).toBe(expected)
    })
  })

  describe('换行符统一', () => {
    it('应该将 Windows 换行符（\\r\\n）统一为 \\n', () => {
      const input = '第一行\r\n第二行\r\n第三行'
      const expected = '第一行\n第二行\n第三行'
      expect(formatText(input)).toBe(expected)
    })

    it('应该将旧版 Mac 换行符（\\r）统一为 \\n', () => {
      const input = '第一行\r第二行\r第三行'
      const expected = '第一行\n第二行\n第三行'
      expect(formatText(input)).toBe(expected)
    })

    it('应该同时处理混合的换行符', () => {
      const input = '第一行\r\n第二行\r第三行\n第四行'
      const expected = '第一行\n第二行\n第三行\n第四行'
      expect(formatText(input)).toBe(expected)
    })

    it('应该在统一换行符后正确应用其他格式化规则', () => {
      const input = '使用react开发\r\n学习typescript\r访问github'
      const expected = '使用 React 开发\n学习 TypeScript\n访问 GitHub'
      expect(formatText(input)).toBe(expected)
    })
  })

  describe('边界情况', () => {
    it('应该处理只有空格的字符串', () => {
      expect(formatText('   ')).toBe('   ')
    })

    it('应该处理特殊字符', () => {
      expect(formatText('符号：!@#$%^&*()')).toBe('符号：!@#$%^&*()')
    })

    it('应该处理 emoji', () => {
      expect(formatText('使用react开发😊')).toBe('使用 React 开发😊')
    })

    it('应该处理 HTML 标签（HTML 标签内的文本也会被规范化）', () => {
      const input = '使用<strong>react</strong>开发'
      const expected = '使用<strong>React</strong>开发'
      expect(formatText(input)).toBe(expected)
    })
  })
})

describe('formatContentField', () => {
  it('应该格式化包含 content 字段的对象', () => {
    const obj = { id: 1, content: '使用react开发' }
    const result = formatContentField(obj)
    expect(result.content).toBe('使用 React 开发')
    expect(result.id).toBe(1)
  })

  it('应该保持对象的其他字段不变', () => {
    const obj = {
      id: 1,
      title: '标题',
      content: '使用typescript开发',
      author: 'Viki',
    }
    const result = formatContentField(obj)
    expect(result).toEqual({
      id: 1,
      title: '标题',
      content: '使用 TypeScript 开发',
      author: 'Viki',
    })
  })

  it('应该正确处理空 content', () => {
    const obj = { id: 1, content: '' }
    const result = formatContentField(obj)
    expect(result.content).toBe('')
  })

  it('应该正确处理只有空格的 content', () => {
    const obj = { id: 1, content: '   ' }
    const result = formatContentField(obj)
    expect(result.content).toBe('   ')
  })

  it('应该正确处理没有 content 字段的对象', () => {
    const obj = { id: 1, title: '标题' }
    // @ts-expect-error 测试没有 content 字段的情况
    const result = formatContentField(obj)
    expect(result).toEqual({ id: 1, title: '标题' })
  })

  it('应该正确处理 content 为 undefined 的对象', () => {
    const obj = { id: 1, content: undefined }
    const result = formatContentField(obj)
    expect(result).toEqual({ id: 1, content: undefined })
  })
})
