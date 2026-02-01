/**
 * 排版处理器
 * 处理中西文间距、行高字号等排版微调
 */

import type { RenderContext } from '@md/shared/types/platform'

/**
 * 中文字符范围
 */
const CJK_RANGE = '\u2e80-\u2eff\u2f00-\u2fdf\u3040-\u309f\u30a0-\u30ff\u3100-\u312f\u3200-\u32ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\ufe30-\ufe4f'

/**
 * 半角字符范围
 */
const HALF_WIDTH_RANGE = 'A-Za-z0-9'

/**
 * Pangu.js 核心逻辑 - 在中英文之间添加空格
 * 参考: https://github.com/vinta/pangu.js
 */
export function addPanguSpacing(text: string): string {
  if (!text)
    return text

  // CJK 与半角字符之间添加空格
  const cjkAndHalf = new RegExp(`([${CJK_RANGE}])([${HALF_WIDTH_RANGE}])`, 'g')
  const halfAndCjk = new RegExp(`([${HALF_WIDTH_RANGE}])([${CJK_RANGE}])`, 'g')

  // CJK 与引号之间
  const cjkQuote = new RegExp(`([${CJK_RANGE}])([\`"'])`, 'g')
  const quoteCjk = new RegExp(`([\`"'])([${CJK_RANGE}])`, 'g')

  // CJK 与括号之间
  const cjkBracketLeft = new RegExp(`([${CJK_RANGE}])([\\(\\[\\{<])`, 'g')
  const bracketRightCjk = new RegExp(`([\\)\\]\\}>])([${CJK_RANGE}])`, 'g')

  let result = text
    .replace(cjkAndHalf, '$1 $2')
    .replace(halfAndCjk, '$1 $2')
    .replace(cjkQuote, '$1 $2')
    .replace(quoteCjk, '$1 $2')
    .replace(cjkBracketLeft, '$1 $2')
    .replace(bracketRightCjk, '$1 $2')

  // 避免重复空格
  result = result.replace(/\s+/g, ' ')

  return result
}

/**
 * 在 HTML 中应用 Pangu 间距
 * 只处理文本节点，不处理标签内容
 */
export function applyPanguToHtml(html: string): string {
  // 匹配 HTML 标签
  const tagRegex = /<[^>]+>/g
  const parts: string[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // eslint-disable-next-line no-cond-assign
  while ((match = tagRegex.exec(html)) !== null) {
    // 处理标签之前的文本
    if (match.index > lastIndex) {
      const textContent = html.slice(lastIndex, match.index)
      parts.push(addPanguSpacing(textContent))
    }
    // 保留标签原样
    parts.push(match[0])
    lastIndex = match.index + match[0].length
  }

  // 处理最后的文本
  if (lastIndex < html.length) {
    parts.push(addPanguSpacing(html.slice(lastIndex)))
  }

  return parts.join('')
}

/**
 * 应用排版规则
 */
export function applyTypography(html: string, context: RenderContext): string {
  const { preset } = context
  const { typography } = preset
  let result = html

  // 应用 Pangu 间距
  if (typography.autoPanguSpacing) {
    result = applyPanguToHtml(result)
  }

  return result
}

/**
 * 生成排版相关的内联样式
 */
export function getTypographyStyles(context: RenderContext): Record<string, string> {
  const { typography } = context.preset

  return {
    'font-size': `${typography.baseFontSize}px`,
    'line-height': String(typography.lineHeight),
    'font-family': typography.fontFamily,
    ...(typography.textIndent ? { 'text-indent': '2em' } : {}),
    ...(typography.textJustify ? { 'text-align': 'justify' } : {}),
  }
}

/**
 * 检测文本是否包含中文
 */
export function containsChinese(text: string): boolean {
  return new RegExp(`[${CJK_RANGE}]`).test(text)
}

/**
 * 计算阅读时间
 * 中文按 300 字/分钟，英文按 200 词/分钟
 */
export function calculateReadingTime(text: string): { minutes: number, words: number } {
  // 移除 HTML 标签
  const plainText = text.replace(/<[^>]+>/g, '')

  // 统计中文字符
  const chineseChars = (plainText.match(new RegExp(`[${CJK_RANGE}]`, 'g')) || []).length

  // 统计英文单词
  const englishWords = (plainText.match(/[A-Za-z]+/g) || []).length

  // 计算总字数（中文字符 + 英文单词）
  const totalWords = chineseChars + englishWords

  // 计算阅读时间（中文 300 字/分钟，英文 200 词/分钟）
  const chineseTime = chineseChars / 300
  const englishTime = englishWords / 200
  const minutes = Math.ceil(chineseTime + englishTime)

  return { minutes: Math.max(1, minutes), words: totalWords }
}
