import { describe, expect, it } from 'vitest'
import { countWords } from './word-count'

describe('countWords', () => {
  describe('基本功能', () => {
    it('应该返回 0 对于空字符串', () => {
      expect(countWords('')).toBe(0)
    })

    it('应该返回 0 对于只包含空格的字符串', () => {
      expect(countWords('   ')).toBe(0)
      expect(countWords('\n\n\n')).toBe(0)
      expect(countWords('\t\t\t')).toBe(0)
      expect(countWords('  \n  \t  ')).toBe(0)
    })

    it('应该返回 0 对于 null 或 undefined', () => {
      expect(countWords(null as never)).toBe(0)
      expect(countWords(undefined as never)).toBe(0)
    })
  })

  describe('汉字统计', () => {
    it('应该正确统计单个汉字', () => {
      expect(countWords('你')).toBe(1)
      expect(countWords('好')).toBe(1)
    })

    it('应该正确统计多个汉字', () => {
      expect(countWords('你好')).toBe(2)
      expect(countWords('你好世界')).toBe(4)
      expect(countWords('春眠不觉晓')).toBe(5)
    })

    it('应该正确统计包含空格的汉字', () => {
      expect(countWords('你 好')).toBe(2)
      expect(countWords('你  好  世界')).toBe(4)
    })

    it('应该正确统计包含换行的汉字', () => {
      expect(countWords('你好\n世界')).toBe(4)
      expect(countWords('春眠不觉晓\n处处闻啼鸟')).toBe(10)
    })
  })

  describe('英文单词统计', () => {
    it('应该正确统计单个英文单词', () => {
      expect(countWords('Hello')).toBe(1)
      expect(countWords('world')).toBe(1)
    })

    it('应该正确统计多个英文单词', () => {
      expect(countWords('Hello World')).toBe(2)
      expect(countWords('The quick brown fox')).toBe(4)
    })

    it('应该正确统计大小写混合的单词', () => {
      expect(countWords('Hello WORLD')).toBe(2)
      expect(countWords('iPhone MacBook')).toBe(2)
    })

    it('应该正确统计包含多个空格的单词', () => {
      expect(countWords('Hello  World')).toBe(2)
      expect(countWords('a   b   c')).toBe(3)
    })
  })

  describe('数字统计', () => {
    it('应该正确统计单个数字', () => {
      expect(countWords('1')).toBe(1)
      expect(countWords('0')).toBe(1)
    })

    it('应该正确统计连续数字为一个单位', () => {
      expect(countWords('123')).toBe(1)
      expect(countWords('2024')).toBe(1)
      expect(countWords('123456789')).toBe(1)
    })

    it('应该正确统计分隔的数字', () => {
      expect(countWords('1 2 3')).toBe(3)
      expect(countWords('2024 2025')).toBe(2)
    })
  })

  describe('中文标点符号', () => {
    it('不应该统计中文标点符号', () => {
      expect(countWords('你好,世界')).toBe(4)
      expect(countWords('你好,世界!')).toBe(4)
      expect(countWords('你好,世界。')).toBe(4)
      expect(countWords('你好,世界?')).toBe(4)
      expect(countWords('你好,世界;')).toBe(4)
      expect(countWords('你好,世界:')).toBe(4)
    })

    it('不应该统计中文引号和括号', () => {
      expect(countWords('「你好」')).toBe(2)
      expect(countWords('『你好』')).toBe(2)
      expect(countWords('(你好)')).toBe(2)
      expect(countWords('【你好】')).toBe(2)
    })
  })

  describe('英文标点符号', () => {
    it('不应该统计英文标点符号', () => {
      expect(countWords('Hello, World')).toBe(2)
      expect(countWords('Hello! World')).toBe(2)
      expect(countWords('Hello. World')).toBe(2)
      expect(countWords('Hello? World')).toBe(2)
      expect(countWords('Hello; World')).toBe(2)
      expect(countWords('Hello: World')).toBe(2)
    })

    it('不应该统计英文引号和括号', () => {
      expect(countWords('"Hello"')).toBe(1)
      expect(countWords("'Hello'")).toBe(1)
      expect(countWords('(Hello)')).toBe(1)
      expect(countWords('[Hello]')).toBe(1)
      expect(countWords('{Hello}')).toBe(1)
    })
  })

  describe('中英文混合', () => {
    it('应该正确统计中英文混合文本', () => {
      expect(countWords('Hello 世界')).toBe(3) // 1 单词 + 2 汉字
      expect(countWords('我爱 JavaScript')).toBe(3) // 2 汉字 + 1 单词
      expect(countWords('React 是一个 UI 框架')).toBe(7) // 1 + 1 + 1 + 1 + 1 + 2
    })

    it('应该正确统计包含数字的中英文混合', () => {
      expect(countWords('我有 3 个苹果')).toBe(6) // 我 有 3 个 苹 果
      expect(countWords('2024 年是龙年')).toBe(5) // 2024 年 是 龙 年
    })

    it('应该正确统计包含标点的中英文混合', () => {
      expect(countWords('Hello, 世界!')).toBe(3)
      expect(countWords('我爱 JavaScript, 你呢?')).toBe(5)
    })
  })

  describe('真实场景', () => {
    it('应该正确统计博客文章标题', () => {
      // 使 用 React 19 和 Next.js 16 构 建 现 代 博 客 = 2 + 1 + 1 + 1 + 2 + 1 + 1 + 3 + 1 + 1 = 14
      expect(countWords('使用 React 19 和 Next.js 16 构建现代博客')).toBe(14)
      // 2024 年 终 总 结 = 1 + 1 + 1 + 1 + 1 = 5
      expect(countWords('2024 年终总结')).toBe(5)
    })

    it('应该正确统计碎碎念内容', () => {
      // 今 天 天 气 真 好 适 合 出 去 玩 = 11 个汉字
      expect(countWords('今天天气真好,适合出去玩!')).toBe(11)
      // 学 习 了 新 的 TypeScript 技 巧 很 有 用 = 7 + 1 + 3 = 11
      expect(countWords('学习了新的 TypeScript 技巧,很有用。')).toBe(11)
    })

    it('应该正确统计技术文章段落', () => {
      const text = `
        React 19 引入了很多新特性,包括 use() Hook 和 useOptimistic()。
        这些特性让我们能够更好地处理异步数据和乐观更新。
      `
      // React 19 引 入 了 很 多 新 特 性 包 括 use Hook 和 useOptimistic
      // 这 些 特 性 让 我 们 能 够 更 好 地 处 理 异 步 数 据 和 乐 观 更 新
      // 1 + 1 + 9 + 2 + 1 + 1 + 1 + 2 + 1 + 1 + 12 + 6 + 1 = 39
      expect(countWords(text)).toBe(39)
    })

    it('应该正确统计包含代码的文本', () => {
      // 使 用 useState 来 管 理 状 态 = 2 + 1 + 4 + 1 = 8
      expect(countWords('使用 useState 来管理状态')).toBe(8)
      // 调 用 API 接 口 api posts 获 取 数 据 = 2 + 1 + 2 + 1 + 1 + 4 = 11
      expect(countWords('调用 API 接口 /api/posts 获取数据')).toBe(11)
    })

    it('应该正确统计多行诗歌', () => {
      const poem = `
        春眠不觉晓
        处处闻啼鸟
        夜来风雨声
        花落知多少
      `
      expect(countWords(poem)).toBe(20)
    })
  })

  describe('边界情况', () => {
    it('应该处理只包含标点符号的字符串', () => {
      expect(countWords('!!!')).toBe(0)
      expect(countWords('...')).toBe(0)
      expect(countWords(',,,,')).toBe(0)
      expect(countWords('???')).toBe(0)
    })

    it('应该处理特殊字符', () => {
      expect(countWords('@#$%^&*()')).toBe(0)
      expect(countWords('+-*/=')).toBe(0)
    })

    it('应该处理 emoji', () => {
      // emoji 不计入字数
      expect(countWords('😊')).toBe(0)
      expect(countWords('Hello 😊')).toBe(1)
      expect(countWords('你好 😊')).toBe(2)
    })

    it('应该处理很长的文本', () => {
      const longText = '你好'.repeat(1000)
      expect(countWords(longText)).toBe(2000)
    })

    it('应该处理包含制表符的文本', () => {
      expect(countWords('Hello\tWorld')).toBe(2)
      expect(countWords('你好\t世界')).toBe(4)
    })
  })
})
