/**
 * 代码块增强功能
 * - 文件名显示
 * - 一键复制按钮
 * - Diff 语法高亮
 * - 行号显示
 */

import type { MarkedExtension } from 'marked'

export interface CodeBlockOptions {
  showFileName?: boolean
  showCopyButton?: boolean
  showLineNumbers?: boolean
  enableDiff?: boolean
  className?: string
  copyButtonText?: string
  copiedButtonText?: string
}

export interface ParsedCodeBlock {
  language: string
  fileName: string | null
  code: string
  isDiff: boolean
  diffLines: DiffLine[]
}

export interface DiffLine {
  type: 'add' | 'remove' | 'unchanged'
  content: string
  lineNumber: number
}

/**
 * 解析代码块语法
 * 支持格式: ```language:filename 或 ```diff
 */
export function parseCodeBlock(raw: string): ParsedCodeBlock {
  const match = raw.match(/^```(\w+)?(?::([^\n]+))?\n([\s\S]*?)\n```$/)
  
  if (!match) {
    return {
      language: '',
      fileName: null,
      code: raw,
      isDiff: false,
      diffLines: [],
    }
  }

  const [, lang = '', fileName, code] = match
  const language = lang.toLowerCase()
  const isDiff = language === 'diff'

  let diffLines: DiffLine[] = []
  if (isDiff) {
    diffLines = parseDiffLines(code)
  }

  return {
    language,
    fileName: fileName?.trim() || null,
    code: code || '',
    isDiff,
    diffLines,
  }
}

/**
 * 解析 Diff 行
 */
export function parseDiffLines(code: string): DiffLine[] {
  const lines = code.split('\n')
  let lineNumber = 0

  return lines.map((line) => {
    lineNumber++
    if (line.startsWith('+') && !line.startsWith('+++')) {
      return { type: 'add', content: line.slice(1), lineNumber }
    }
    if (line.startsWith('-') && !line.startsWith('---')) {
      return { type: 'remove', content: line.slice(1), lineNumber }
    }
    return { type: 'unchanged', content: line, lineNumber }
  })
}

/**
 * 生成代码块 HTML
 */
export function renderEnhancedCodeBlock(
  parsed: ParsedCodeBlock,
  options: CodeBlockOptions = {},
): string {
  const {
    showFileName = true,
    showCopyButton = true,
    showLineNumbers = false,
    enableDiff = true,
    className = 'code-block-enhanced',
    copyButtonText = '复制',
    copiedButtonText = '已复制',
  } = options

  const escapedCode = escapeCodeHtml(parsed.code)
  const codeId = `code-${Date.now()}-${Math.random().toString(36).slice(2)}`

  let headerHtml = ''
  if (showFileName && parsed.fileName) {
    headerHtml = `<div class="${className}-header">
      <span class="${className}-filename">${parsed.fileName}</span>
      ${parsed.language ? `<span class="${className}-language">${parsed.language}</span>` : ''}
    </div>`
  }

  let copyButtonHtml = ''
  if (showCopyButton) {
    copyButtonHtml = `<button class="${className}-copy" data-code-id="${codeId}" data-copy-text="${copyButtonText}" data-copied-text="${copiedButtonText}">${copyButtonText}</button>`
  }

  let codeHtml: string
  if (parsed.isDiff && enableDiff) {
    codeHtml = renderDiffCode(parsed.diffLines, className, showLineNumbers)
  }
  else if (showLineNumbers) {
    codeHtml = renderCodeWithLineNumbers(escapedCode, className)
  }
  else {
    codeHtml = `<code class="language-${parsed.language}">${escapedCode}</code>`
  }

  return `
<div class="${className}" data-language="${parsed.language}">
  ${headerHtml}
  <div class="${className}-container">
    ${copyButtonHtml}
    <pre id="${codeId}">${codeHtml}</pre>
  </div>
</div>
`.trim()
}

/**
 * 渲染 Diff 代码
 */
export function renderDiffCode(
  diffLines: DiffLine[],
  className: string,
  showLineNumbers: boolean,
): string {
  const lines = diffLines.map((line) => {
    const lineClass = `${className}-line ${className}-line-${line.type}`
    const prefix = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '
    const lineNumberHtml = showLineNumbers
      ? `<span class="${className}-line-number">${line.lineNumber}</span>`
      : ''
    return `<span class="${lineClass}">${lineNumberHtml}<span class="${className}-line-prefix">${prefix}</span>${escapeCodeHtml(line.content)}</span>`
  })

  return `<code class="language-diff">${lines.join('\n')}</code>`
}

/**
 * 渲染带行号的代码
 */
export function renderCodeWithLineNumbers(code: string, className: string): string {
  const lines = code.split('\n')
  const numberedLines = lines.map((line, index) => {
    return `<span class="${className}-line"><span class="${className}-line-number">${index + 1}</span>${line}</span>`
  })

  return `<code>${numberedLines.join('\n')}</code>`
}

/**
 * HTML 转义（代码块专用）
 */
export function escapeCodeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}

/**
 * 代码块增强 Marked 扩展
 */
export function markedCodeBlockEnhanced(options: CodeBlockOptions = {}): MarkedExtension {
  return {
    extensions: [
      {
        name: 'codeBlockEnhanced',
        level: 'block',
        start(src: string) {
          return src.match(/^```/)?.index
        },
        tokenizer(src: string) {
          // 匹配带文件名的代码块: ```lang:filename
          const match = /^```(\w+)?(?::([^\n]+))?\n([\s\S]*?)\n```/.exec(src)
          if (match) {
            return {
              type: 'codeBlockEnhanced',
              raw: match[0],
              language: match[1] || '',
              fileName: match[2]?.trim() || null,
              code: match[3] || '',
            }
          }
        },
        renderer(token: any) {
          const parsed: ParsedCodeBlock = {
            language: token.language,
            fileName: token.fileName,
            code: token.code,
            isDiff: token.language === 'diff',
            diffLines: token.language === 'diff' ? parseDiffLines(token.code) : [],
          }
          return renderEnhancedCodeBlock(parsed, options)
        },
      },
    ],
  }
}

/**
 * 初始化代码复制功能（客户端调用）
 */
export function initCodeCopyButtons(containerSelector: string = 'body'): void {
  if (typeof document === 'undefined') return

  const container = document.querySelector(containerSelector)
  if (!container) return

  container.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement
    if (!target.classList.contains('code-block-enhanced-copy')) return

    const codeId = target.getAttribute('data-code-id')
    const copyText = target.getAttribute('data-copy-text') || '复制'
    const copiedText = target.getAttribute('data-copied-text') || '已复制'

    if (!codeId) return

    const codeEl = document.getElementById(codeId)
    if (!codeEl) return

    try {
      await navigator.clipboard.writeText(codeEl.textContent || '')
      target.textContent = copiedText
      target.classList.add('copied')

      setTimeout(() => {
        target.textContent = copyText
        target.classList.remove('copied')
      }, 2000)
    }
    catch (err) {
      console.error('Failed to copy code:', err)
    }
  })
}
