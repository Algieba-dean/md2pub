/**
 * 样式注入器
 * 根据不同的 CSS 注入策略处理 HTML 输出
 */

import type { CSSInjectionStrategy, PlatformPreset, RenderContext } from '@md/shared/types/platform'

/**
 * CSS 样式映射表 - 用于内联模式
 */
const baseStyles: Record<string, Record<string, string>> = {
  h1: {
    'font-weight': 'bold',
    'margin': '2em 0 1em',
  },
  h2: {
    'font-weight': 'bold',
    'margin': '1.8em 0 0.8em',
  },
  h3: {
    'font-weight': 'bold',
    'margin': '1.5em 0 0.6em',
  },
  h4: {
    'font-weight': 'bold',
    'margin': '1.2em 0 0.5em',
  },
  h5: {
    'font-weight': 'bold',
    'margin': '1em 0 0.4em',
  },
  h6: {
    'font-weight': 'bold',
    'margin': '1em 0 0.4em',
  },
  p: {
    'margin': '1em 0',
  },
  blockquote: {
    'margin': '1em 0',
    'padding': '0.5em 1em',
    'border-left': '4px solid',
  },
  ul: {
    'margin': '1em 0',
    'padding-left': '2em',
  },
  ol: {
    'margin': '1em 0',
    'padding-left': '2em',
  },
  li: {
    'margin': '0.3em 0',
  },
  code: {
    'padding': '0.2em 0.4em',
    'border-radius': '3px',
    'font-size': '0.9em',
  },
  pre: {
    'margin': '1em 0',
    'padding': '1em',
    'border-radius': '4px',
    'overflow-x': 'auto',
  },
  a: {
    'text-decoration': 'none',
  },
  img: {
    'max-width': '100%',
  },
  table: {
    'width': '100%',
    'border-collapse': 'collapse',
    'margin': '1em 0',
  },
  th: {
    'padding': '0.5em',
    'border': '1px solid #ddd',
    'font-weight': 'bold',
  },
  td: {
    'padding': '0.5em',
    'border': '1px solid #ddd',
  },
  hr: {
    'margin': '2em 0',
    'border': 'none',
    'border-top': '1px solid #eee',
  },
  strong: {
    'font-weight': 'bold',
  },
  em: {
    'font-style': 'italic',
  },
  figure: {
    'margin': '1.5em 0',
    'text-align': 'center',
  },
  figcaption: {
    'margin-top': '0.5em',
    'font-size': '0.9em',
    'color': '#666',
  },
}

/**
 * 生成内联样式字符串
 */
function generateInlineStyle(
  tag: string,
  preset: PlatformPreset,
  primaryColor: string,
): string {
  const styles: Record<string, string> = { ...baseStyles[tag] }
  const { typography } = preset

  // 应用排版配置
  if (['p', 'li', 'blockquote'].includes(tag)) {
    styles['font-size'] = `${typography.baseFontSize}px`
    styles['line-height'] = String(typography.lineHeight)
    styles['font-family'] = typography.fontFamily
  }

  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
    const scale = { h1: 1.5, h2: 1.3, h3: 1.1, h4: 1, h5: 1, h6: 0.9 }[tag] || 1
    styles['font-size'] = `${typography.baseFontSize * scale}px`
    styles['font-family'] = typography.fontFamily
  }

  if (tag === 'p' && typography.textIndent) {
    styles['text-indent'] = '2em'
  }

  if (tag === 'p' && typography.textJustify) {
    styles['text-align'] = 'justify'
  }

  if (tag === 'code' || tag === 'pre') {
    styles['font-family'] = typography.codeFontFamily
  }

  // 应用主题色
  if (tag === 'a') {
    styles['color'] = primaryColor
  }

  if (tag === 'blockquote') {
    styles['border-left-color'] = primaryColor
  }

  // 过滤禁用的 CSS 属性
  const disabled = preset.compatibility.disabledCSSProperties
  for (const prop of disabled) {
    const [key, value] = prop.split(':')
    if (value) {
      if (styles[key] === value) {
        delete styles[key]
      }
    }
    else {
      delete styles[key]
    }
  }

  return Object.entries(styles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * 内联样式注入 - 强内联模式
 */
function injectInlineStylesHeavy(html: string, context: RenderContext): string {
  const { preset, primaryColor } = context
  const tags = Object.keys(baseStyles)

  let result = html

  for (const tag of tags) {
    const style = generateInlineStyle(tag, preset, primaryColor)
    if (!style)
      continue

    // 匹配开始标签，添加或合并 style 属性
    const regex = new RegExp(`<${tag}([^>]*)>`, 'gi')
    result = result.replace(regex, (match, attrs) => {
      const existingStyle = attrs.match(/style="([^"]*)"/i)
      if (existingStyle) {
        const merged = `${existingStyle[1]}; ${style}`
        return `<${tag}${attrs.replace(existingStyle[0], `style="${merged}"`)}`
      }
      return `<${tag} style="${style}"${attrs}>`
    })
  }

  return result
}

/**
 * 内联样式注入 - 最小内联模式
 */
function injectInlineStylesMinimal(html: string, context: RenderContext): string {
  const { preset, primaryColor } = context
  const minimalTags = ['a', 'code', 'blockquote']

  let result = html

  for (const tag of minimalTags) {
    const style = generateInlineStyle(tag, preset, primaryColor)
    if (!style)
      continue

    const regex = new RegExp(`<${tag}([^>]*)>`, 'gi')
    result = result.replace(regex, (match, attrs) => {
      if (attrs.includes('style='))
        return match
      return `<${tag} style="${style}"${attrs}>`
    })
  }

  return result
}

/**
 * 类名模式 - 添加类名前缀
 */
function addClassPrefix(html: string, context: RenderContext): string {
  const { preset } = context
  const prefix = preset.classPrefix || 'md2pub-'

  // 为所有有 class 属性的元素添加前缀
  return html.replace(/class="([^"]*)"/gi, (match, classes) => {
    const prefixed = classes
      .split(' ')
      .filter(Boolean)
      .map((c: string) => c.startsWith(prefix) ? c : `${prefix}${c}`)
      .join(' ')
    return `class="${prefixed}"`
  })
}

/**
 * 表格布局模式 - 用于邮件兼容性
 */
function convertToTableLayout(html: string, _context: RenderContext): string {
  // 简化实现：主要内容区域用 table 包裹
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding: 20px;">
              ${html}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

/**
 * 根据策略注入样式
 */
export function injectStyles(
  html: string,
  context: RenderContext,
  strategy?: CSSInjectionStrategy,
): string {
  const cssStrategy = strategy || context.preset.cssStrategy

  switch (cssStrategy) {
    case 'inline-heavy':
      return injectInlineStylesHeavy(html, context)

    case 'inline-minimal':
      return injectInlineStylesMinimal(html, context)

    case 'class-based':
      return addClassPrefix(html, context)

    case 'table-layout':
      return convertToTableLayout(
        injectInlineStylesMinimal(html, context),
        context,
      )

    default:
      return html
  }
}

/**
 * 生成 CSS 变量声明
 */
export function generateCSSVariables(context: RenderContext): string {
  const { preset, primaryColor, darkMode } = context
  const { typography } = preset

  const vars: Record<string, string> = {
    '--md-primary-color': primaryColor,
    '--md-font-size': `${typography.baseFontSize}px`,
    '--md-line-height': String(typography.lineHeight),
    '--md-font-family': typography.fontFamily,
    '--md-code-font-family': typography.codeFontFamily,
    '--md-paragraph-spacing': `${typography.paragraphSpacing}em`,
    ...preset.cssVariables,
  }

  if (darkMode) {
    vars['--md-bg-color'] = '#1a1a1a'
    vars['--md-text-color'] = '#e0e0e0'
  }
  else {
    vars['--md-bg-color'] = '#ffffff'
    vars['--md-text-color'] = '#333333'
  }

  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';\n  ')
}
