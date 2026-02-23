/**
 * 计算文本的字数
 *
 * 统计规则：
 * - 汉字（CJK 字符）：每个汉字算 1 个字
 * - 英文单词：连续的字母算 1 个单词
 * - 数字：连续的数字算 1 个单位
 * - 中文标点符号：不计入字数
 * - 英文标点符号：不计入字数
 * - 空格和换行符：不计入字数
 *
 * @param text - 要统计的文本
 * @returns 字数
 *
 * @example
 * ```ts
 * countWords('Hello World') // 2
 * countWords('你好世界') // 4
 * countWords('Hello 世界 123') // 4 (1 个单词 + 2 个汉字 + 1 个数字)
 * ```
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0
  }

  let count = 0

  // 移除所有空白字符（空格、制表符、换行符等）
  const trimmed = text.trim()

  if (trimmed.length === 0) {
    return 0
  }

  // 遍历字符串
  let i = 0
  while (i < trimmed.length) {
    const char = trimmed[i]
    const code = char.charCodeAt(0)

    // 汉字（CJK 统一表意文字）
    // Unicode 范围：
    // - 基本汉字：U+4E00 - U+9FFF
    // - 扩展 A：U+3400 - U+4DBF
    // - 扩展 B 及以上：U+20000 - U+2A6DF（需要处理代理对）
    if (
      (code >= 0x4e00 && code <= 0x9fff) || // 基本汉字
      (code >= 0x3400 && code <= 0x4dbf) || // 扩展 A
      (code >= 0xf900 && code <= 0xfaff) || // 兼容汉字
      (code >= 0x3000 && code <= 0x303f) // CJK 符号和标点（部分）
    ) {
      // 排除中文标点符号
      const excludePunctuation = [
        0x3000, 0x3001, 0x3002, 0x3003, 0x3008, 0x3009, 0x300a, 0x300b, 0x300c, 0x300d, 0x300e,
        0x300f, 0x3010, 0x3011, 0x3014, 0x3015, 0x3016, 0x3017, 0xff0c, 0xff0e, 0xff01, 0xff1f,
        0xff1b, 0xff1a, 0xff08, 0xff09, 0xff3b, 0xff3d, 0xff5b, 0xff5d,
      ]

      if (!excludePunctuation.includes(code)) {
        count++
      }
      i++
      continue
    }

    // 英文字母（连续的字母算一个单词）
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      count++
      // 跳过后续连续的字母
      while (
        i + 1 < trimmed.length &&
        ((trimmed.charCodeAt(i + 1) >= 65 && trimmed.charCodeAt(i + 1) <= 90) ||
          (trimmed.charCodeAt(i + 1) >= 97 && trimmed.charCodeAt(i + 1) <= 122))
      ) {
        i++
      }
      i++
      continue
    }

    // 数字（连续的数字算一个单位）
    if (code >= 48 && code <= 57) {
      count++
      // 跳过后续连续的数字
      while (
        i + 1 < trimmed.length &&
        trimmed.charCodeAt(i + 1) >= 48 &&
        trimmed.charCodeAt(i + 1) <= 57
      ) {
        i++
      }
      i++
      continue
    }

    // 其他字符（标点符号、空格等）不计入字数
    i++
  }

  return count
}
