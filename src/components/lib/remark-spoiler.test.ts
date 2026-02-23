import { describe, it, expect } from 'vitest'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import remarkSpoiler from './remark-spoiler'

describe('remarkSpoiler', () => {
  // Helper function to process markdown and return HTML
  // Note: allowDangerousHtml is required for HTML nodes to pass through
  async function processMarkdown(
    markdown: string,
    options?: Parameters<typeof remarkSpoiler>[0],
  ): Promise<string> {
    const result = await remark()
      .use(remarkGfm)
      .use(remarkSpoiler, options)
      .use(remarkHtml, { allowDangerousHtml: true, sanitize: false })
      .process(markdown)
    return String(result).trim()
  }

  describe('基础功能', () => {
    it('应该将 ||text|| 转换为 spoiler span', async () => {
      const result = await processMarkdown('这是 ||剧透内容|| 文本')
      expect(result).toContain('class="spoiler"')
      expect(result).toContain('>剧透内容</span>')
    })

    it('应该处理多个剧透标记', async () => {
      const result = await processMarkdown('||第一个|| 和 ||第二个||')
      expect(result).toContain('>第一个</span>')
      expect(result).toContain('>第二个</span>')
      expect(result).toMatch(/class="spoiler".*class="spoiler"/)
    })

    it('应该处理没有剧透标记的文本', async () => {
      const result = await processMarkdown('普通文本')
      expect(result).toBe('<p>普通文本</p>')
    })

    it('应该处理空字符串', async () => {
      const result = await processMarkdown('')
      expect(result).toBe('')
    })

    it('应该处理只有剧透内容的文本', async () => {
      const result = await processMarkdown('||全部都是剧透||')
      expect(result).toContain('class="spoiler"')
      expect(result).toContain('>全部都是剧透</span>')
    })
  })

  describe('边界情况', () => {
    it('应该处理相邻的剧透标记', async () => {
      const result = await processMarkdown('||第一个||||第二个||')
      expect(result).toContain('>第一个</span>')
      expect(result).toContain('>第二个</span>')
    })

    it('应该忽略单个 || 标记', async () => {
      const result = await processMarkdown('这是 || 单个标记')
      expect(result).not.toContain('class="spoiler"')
      expect(result).toContain('||')
    })

    it('应该忽略不完整的剧透标记', async () => {
      const result = await processMarkdown('||没有结束标记')
      expect(result).not.toContain('class="spoiler"')
      expect(result).toContain('||')
    })

    it('应该处理中英文混合的剧透内容', async () => {
      const result = await processMarkdown('||This is 中文混合 content||')
      expect(result).toContain('class="spoiler"')
      expect(result).toContain('>This is 中文混合 content</span>')
    })

    it('应该处理包含空格的剧透内容', async () => {
      const result = await processMarkdown('||  带空格的内容  ||')
      expect(result).toContain('class="spoiler"')
      expect(result).toContain('>  带空格的内容  </span>')
    })

    it('应该处理多行段落中的剧透', async () => {
      const result = await processMarkdown('第一行 ||剧透|| 内容\n\n第二行 ||另一个剧透||')
      expect(result).toContain('>剧透</span>')
      expect(result).toContain('>另一个剧透</span>')
    })
  })

  describe('嵌套语法', () => {
    // 注意：当 spoiler 内部包含其他 Markdown 语法（如粗体、链接）时，
    // Markdown 解析器会先解析这些语法，导致 || 标记被分散到不同的文本节点中。
    // 这是 Markdown 解析的固有限制。
    // 推荐的用法是：**||剧透内容||** 而不是 ||**剧透内容**||

    it('应该处理粗体包裹剧透的情况', async () => {
      // 推荐用法：粗体在外面
      const result = await processMarkdown('**||粗体剧透||**')
      expect(result).toContain('spoiler')
      expect(result).toContain('粗体剧透')
    })

    it('应该处理斜体包裹剧透的情况', async () => {
      // 推荐用法：斜体在外面
      const result = await processMarkdown('*||斜体剧透||*')
      expect(result).toContain('spoiler')
      expect(result).toContain('斜体剧透')
    })

    it('应该处理剧透外的链接', async () => {
      // 链接中包含剧透
      const result = await processMarkdown('[||链接剧透||](https://example.com)')
      expect(result).toContain('spoiler')
      expect(result).toContain('链接剧透')
    })

    it('应该处理删除线包裹剧透的情况', async () => {
      const result = await processMarkdown('~~||删除线剧透||~~')
      expect(result).toContain('spoiler')
      expect(result).toContain('删除线剧透')
    })

    it('应该处理复杂嵌套：粗斜体包裹剧透', async () => {
      const result = await processMarkdown('***||粗斜体剧透||***')
      expect(result).toContain('spoiler')
      expect(result).toContain('粗斜体剧透')
    })

    it('应该处理剧透与普通文本的混合嵌套', async () => {
      const result = await processMarkdown('**粗体开始 ||剧透|| 粗体结束**')
      expect(result).toContain('spoiler')
      expect(result).toContain('<strong>')
    })
  })

  describe('自定义选项', () => {
    it('应该支持自定义标记符', async () => {
      const result = await processMarkdown('!!秘密内容!!', { marker: '!!' })
      expect(result).toContain('class="spoiler"')
      expect(result).toContain('>秘密内容</span>')
    })

    it('应该支持自定义 CSS 类名', async () => {
      const result = await processMarkdown('||隐藏内容||', { classNames: ['hidden', 'blur'] })
      expect(result).toContain('class="hidden blur"')
      expect(result).toContain('>隐藏内容</span>')
    })

    it('应该支持自定义标签名', async () => {
      const result = await processMarkdown('||剧透||', { tagName: 'mark' })
      expect(result).toContain('<mark')
      expect(result).toContain('class="spoiler"')
      expect(result).toContain('>剧透</mark>')
    })

    it('应该支持组合自定义选项', async () => {
      const result = await processMarkdown('??神秘??', {
        marker: '??',
        classNames: ['mystery'],
        tagName: 'span',
      })
      expect(result).toContain('class="mystery"')
      expect(result).toContain('>神秘</span>')
    })

    it('应该支持空类名数组', async () => {
      const result = await processMarkdown('||内容||', { classNames: [] })
      // 当 classNames 为空时，不添加 class 属性
      expect(result).toContain('<span')
      expect(result).toContain('>内容</span>')
      expect(result).not.toContain('class=')
    })

    it('应该支持自定义 title 属性', async () => {
      const result = await processMarkdown('||秘密||', { title: '悬停查看' })
      expect(result).toContain('title="悬停查看"')
      expect(result).toContain('>秘密</span>')
    })

    it('应该支持禁用 title 属性', async () => {
      const result = await processMarkdown('||内容||', { title: '' })
      expect(result).not.toContain('title=')
      expect(result).toContain('>内容</span>')
    })
  })

  describe('真实场景测试', () => {
    it('应该处理 thoughts.json 中的真实剧透示例', async () => {
      // 使用纯文本内容测试（不含粗体语法，因为粗体会导致 || 被分散）
      const content =
        '（剧透提示：||这个 Bug 是由于浮点运算精度变化导致的。2004 年编译用 32 位精度，2013 年用 64 位精度。||）'
      const result = await processMarkdown(content)
      expect(result).toContain('spoiler')
      expect(result).toContain('浮点运算精度变化')
    })

    it('应该处理列表中的剧透', async () => {
      const content = '- 项目一 ||隐藏内容||\\n- 项目二'
      const result = await processMarkdown(content)
      expect(result).toContain('spoiler')
    })

    it('应该处理引用块中的剧透', async () => {
      const content = '> 引用内容 ||剧透|| 继续'
      const result = await processMarkdown(content)
      expect(result).toContain('spoiler')
      expect(result).toContain('blockquote')
    })

    it('应该正确处理表格中的剧透', async () => {
      const content = '| 列1 | 列2 |\\n| --- | --- |\\n| ||隐藏|| | 普通 |'
      const result = await processMarkdown(content)
      expect(result).toContain('spoiler')
    })
  })

  describe('特殊字符处理', () => {
    it('应该处理包含特殊正则字符的内容', async () => {
      const result = await processMarkdown('||包含 $100 和 (括号)||')
      expect(result).toContain('spoiler')
      expect(result).toContain('$100')
    })

    it('应该处理包含 HTML 特殊字符的内容', async () => {
      const result = await processMarkdown('||包含 < 和 > 字符||')
      expect(result).toContain('spoiler')
      // 特殊字符会被转义
      expect(result).toContain('&lt;')
      expect(result).toContain('&gt;')
    })

    it('应该处理包含换行符的单行内容', async () => {
      // 行内元素不应跨行
      const result = await processMarkdown('||第一行\\n第二行||')
      expect(result).toContain('spoiler')
    })

    it('应该处理 Unicode 字符', async () => {
      const result = await processMarkdown('||🎉 庆祝 🎊||')
      expect(result).toContain('spoiler')
      expect(result).toContain('🎉')
    })

    it('应该处理中文标点', async () => {
      const result = await processMarkdown('||这是「剧透」内容！||')
      expect(result).toContain('spoiler')
      expect(result).toContain('「剧透」')
    })
  })
})
