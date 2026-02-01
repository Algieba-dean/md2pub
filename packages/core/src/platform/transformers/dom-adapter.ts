/**
 * DOM 结构适配器
 * 根据不同平台处理 HTML 结构差异
 */

import type {
  CodeBlockStyle,
  FootnoteItem,
  FootnoteStrategy,
  ImageContainerStyle,
  RenderContext,
} from '@md/shared/types/platform'

/**
 * Mac 风格代码块 SVG 图标
 */
const macCodeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
  <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
  <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
  <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
</svg>
`.trim()

/**
 * 处理脚注 - 根据策略转换
 */
export function transformFootnotes(
  html: string,
  footnotes: FootnoteItem[],
  strategy: FootnoteStrategy,
): string {
  if (footnotes.length === 0)
    return html

  switch (strategy) {
    case 'inline-text':
      return transformFootnotesToInlineText(html, footnotes)

    case 'anchor-jump':
      return transformFootnotesToAnchorJump(html, footnotes)

    case 'tooltip':
      return transformFootnotesToTooltip(html, footnotes)

    case 'sidenote':
      return transformFootnotesToSidenote(html, footnotes)

    default:
      return html
  }
}

/**
 * 脚注转文末文本（微信模式）
 * 不使用超链接跳转
 */
function transformFootnotesToInlineText(html: string, footnotes: FootnoteItem[]): string {
  // 移除所有脚注锚点链接
  let result = html.replace(/<a[^>]*href="#fn[^"]*"[^>]*>(\[\d+\])<\/a>/gi, '<sup>$1</sup>')

  // 移除脚注定义区域的锚点
  result = result.replace(/<a[^>]*id="fn[^"]*"[^>]*>/gi, '')
  result = result.replace(/<\/a>(\s*↩)/gi, '$1')

  // 构建文末参考资料列表
  const footnoteList = footnotes
    .map((fn) => {
      const display = fn.link === fn.title
        ? `<code style="font-size: 90%; opacity: 0.6;">[${fn.index}]</code>: <i style="word-break: break-all">${fn.title}</i>`
        : `<code style="font-size: 90%; opacity: 0.6;">[${fn.index}]</code> ${fn.title}: <i style="word-break: break-all">${fn.link}</i>`
      return display
    })
    .join('<br/>\n')

  // 如果 HTML 中没有脚注区域，添加到末尾
  if (!result.includes('class="footnotes"')) {
    result += `
      <section class="footnotes">
        <h4>参考资料</h4>
        <p style="font-size: 90%; color: #666;">${footnoteList}</p>
      </section>
    `
  }

  return result
}

/**
 * 脚注锚点跳转（标准 Web）
 */
function transformFootnotesToAnchorJump(html: string, footnotes: FootnoteItem[]): string {
  // 保持标准的锚点跳转结构
  let result = html

  // 确保脚注引用有正确的锚点
  footnotes.forEach((fn) => {
    const refPattern = new RegExp(`\\[\\^${fn.id}\\](?!:)`, 'g')
    result = result.replace(
      refPattern,
      `<sup><a href="#fn-${fn.id}" id="fnref-${fn.id}">[${fn.index}]</a></sup>`,
    )
  })

  return result
}

/**
 * 脚注悬浮提示
 */
function transformFootnotesToTooltip(html: string, footnotes: FootnoteItem[]): string {
  let result = html

  footnotes.forEach((fn) => {
    const tooltipContent = fn.link === fn.title ? fn.title : `${fn.title}: ${fn.link}`
    const refPattern = new RegExp(`<sup[^>]*>\\s*\\[${fn.index}\\]\\s*</sup>`, 'gi')
    result = result.replace(
      refPattern,
      `<sup class="footnote-tooltip" data-tooltip="${tooltipContent}">[${fn.index}]</sup>`,
    )
  })

  return result
}

/**
 * 脚注边注
 */
function transformFootnotesToSidenote(html: string, footnotes: FootnoteItem[]): string {
  let result = html

  footnotes.forEach((fn) => {
    const sidenoteContent = fn.link === fn.title ? fn.title : `${fn.title}: ${fn.link}`
    const refPattern = new RegExp(`<sup[^>]*>\\s*<a[^>]*>\\[${fn.index}\\]</a>\\s*</sup>`, 'gi')
    result = result.replace(
      refPattern,
      `<span class="sidenote-ref">[${fn.index}]<span class="sidenote">${sidenoteContent}</span></span>`,
    )
  })

  return result
}

/**
 * 处理代码块 - 根据样式转换
 */
export function transformCodeBlocks(html: string, style: CodeBlockStyle): string {
  switch (style) {
    case 'mac-window':
      return transformCodeBlocksToMacWindow(html)

    case 'line-numbers':
      return transformCodeBlocksWithLineNumbers(html)

    case 'plain':
      return transformCodeBlocksToPlain(html)

    case 'minimal':
      return transformCodeBlocksToMinimal(html)

    default:
      return html
  }
}

/**
 * Mac 风格代码块
 */
function transformCodeBlocksToMacWindow(html: string): string {
  return html.replace(
    /<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
    (match, preAttrs, codeAttrs, content) => {
      const macSign = `<span class="mac-sign" style="padding: 10px 14px 0;">${macCodeSvg}</span>`
      return `<pre${preAttrs} class="hljs code__pre">${macSign}<code${codeAttrs}>${content}</code></pre>`
    },
  )
}

/**
 * 带行号的代码块
 */
function transformCodeBlocksWithLineNumbers(html: string): string {
  return html.replace(
    /<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/gi,
    (match, preAttrs, codeAttrs, content) => {
      const lines = content.split('\n')
      const numberedLines = lines
        .map((line: string, i: number) => `<span class="line-number">${i + 1}</span>${line}`)
        .join('\n')
      return `<pre${preAttrs} class="line-numbers"><code${codeAttrs}>${numberedLines}</code></pre>`
    },
  )
}

/**
 * 纯净代码块
 */
function transformCodeBlocksToPlain(html: string): string {
  // 移除 Mac 风格装饰
  return html
    .replace(/<span class="mac-sign"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/class="hljs code__pre"/gi, 'class="code-block"')
}

/**
 * 最小样式代码块（让平台处理高亮）
 */
function transformCodeBlocksToMinimal(html: string): string {
  return html
    .replace(/<span class="mac-sign"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<pre[^>]*>/gi, '<pre>')
    .replace(/<code[^>]*class="[^"]*"[^>]*>/gi, (match) => {
      // 保留语言类名
      const langMatch = match.match(/class="[^"]*language-(\w+)[^"]*"/)
      if (langMatch) {
        return `<code class="language-${langMatch[1]}">`
      }
      return '<code>'
    })
}

/**
 * 处理图片容器 - 根据样式转换
 */
export function transformImageContainers(html: string, style: ImageContainerStyle): string {
  switch (style) {
    case 'figure':
      return transformImagesToFigure(html)

    case 'simple':
      return transformImagesToSimple(html)

    case 'responsive':
      return transformImagesToResponsive(html)

    default:
      return html
  }
}

/**
 * 图片使用 figure 容器
 */
function transformImagesToFigure(html: string): string {
  // 如果已经是 figure，保持不变
  if (html.includes('<figure>'))
    return html

  // 将独立的 img 包裹在 figure 中
  return html.replace(
    /<p>\s*(<img[^>]*>)\s*<\/p>/gi,
    '<figure>$1</figure>',
  )
}

/**
 * 简单图片标签
 */
function transformImagesToSimple(html: string): string {
  // 移除 figure 包裹
  return html
    .replace(/<figure>\s*(<img[^>]*>)\s*<figcaption>[\s\S]*?<\/figcaption>\s*<\/figure>/gi, '<p>$1</p>')
    .replace(/<figure>\s*(<img[^>]*>)\s*<\/figure>/gi, '<p>$1</p>')
}

/**
 * 响应式图片容器
 */
function transformImagesToResponsive(html: string): string {
  return html.replace(
    /<img([^>]*)>/gi,
    '<div class="responsive-image"><img$1 style="max-width: 100%; height: auto;"></div>',
  )
}

/**
 * 移除不兼容的 HTML 元素
 */
export function removeIncompatibleElements(html: string, context: RenderContext): string {
  const { compatibility } = context.preset
  let result = html

  if (compatibility.removeScripts) {
    result = result.replace(/<script[\s\S]*?<\/script>/gi, '')
  }

  if (compatibility.removeIframes) {
    result = result.replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    result = result.replace(/<iframe[^>]*\/>/gi, '')
  }

  if (compatibility.removeObjects) {
    result = result.replace(/<object[\s\S]*?<\/object>/gi, '')
    result = result.replace(/<embed[^>]*>/gi, '')
  }

  // 限制图片最大宽度
  if (compatibility.maxImageWidth) {
    result = result.replace(
      /<img([^>]*)>/gi,
      `<img$1 style="max-width: ${compatibility.maxImageWidth}px;">`,
    )
  }

  return result
}

/**
 * 添加语义化 HTML 包装
 */
export function addSemanticWrapper(html: string, context: RenderContext): string {
  const { semantic } = context.preset
  let result = html

  if (semantic.useArticle) {
    result = `<article class="md2pub-article">${result}</article>`
  }

  if (semantic.addAriaLabels) {
    // 为标题添加 aria-level
    result = result.replace(/<h(\d)([^>]*)>/gi, '<h$1$2 role="heading" aria-level="$1">')
  }

  return result
}

/**
 * 应用所有 DOM 转换
 */
export function applyDOMTransformations(html: string, context: RenderContext): string {
  const { preset, footnotes } = context
  let result = html

  // 1. 移除不兼容元素
  result = removeIncompatibleElements(result, context)

  // 2. 转换脚注
  result = transformFootnotes(result, footnotes, preset.footnoteStrategy)

  // 3. 转换代码块
  result = transformCodeBlocks(result, preset.codeBlockStyle)

  // 4. 转换图片容器
  result = transformImageContainers(result, preset.imageStyle)

  // 5. 添加语义化包装
  result = addSemanticWrapper(result, context)

  return result
}
