/**
 * 导出工具函数（纯函数，不依赖浏览器 API）
 */

export interface LongImageOptions {
  scale?: number
  backgroundColor?: string
  padding?: number
  maxWidth?: number
  quality?: number
  format?: 'png' | 'jpeg'
  watermark?: {
    text: string
    fontSize?: number
    color?: string
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  }
}

export interface PDFOptions {
  title?: string
  author?: string
  subject?: string
  pageSize?: 'A4' | 'Letter' | 'Legal'
  margin?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  showTOC?: boolean
  showPageNumbers?: boolean
  showHeader?: boolean
  showFooter?: boolean
  headerText?: string
  footerText?: string
  fontSize?: number
  lineHeight?: number
}

export interface ExportResult {
  success: boolean
  data?: Blob | string
  error?: string
  filename?: string
}

/**
 * 生成导出文件名
 */
export function generateExportFilename(
  title: string,
  extension: string,
): string {
  const sanitized = title
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50)
  const timestamp = new Date().toISOString().slice(0, 10)
  return `${sanitized}_${timestamp}.${extension}`
}

/**
 * 导出为 Markdown 文件
 */
export function exportAsMarkdown(
  content: string,
  title: string = 'document',
): ExportResult {
  if (typeof Blob === 'undefined') {
    return { success: false, error: 'Blob not supported' }
  }
  try {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    return {
      success: true,
      data: blob,
      filename: generateExportFilename(title, 'md'),
    }
  }
  catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 导出为 HTML 文件
 */
export function exportAsHTML(
  html: string,
  title: string = 'document',
  includeStyles: boolean = true,
): ExportResult {
  if (typeof Blob === 'undefined') {
    return { success: false, error: 'Blob not supported' }
  }
  try {
    let fullHtml = html

    if (includeStyles) {
      fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    img { max-width: 100%; height: auto; }
    pre { background: #f5f5f5; padding: 16px; overflow-x: auto; border-radius: 4px; }
    code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
    blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
${html}
</body>
</html>`
    }

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    return {
      success: true,
      data: blob,
      filename: generateExportFilename(title, 'html'),
    }
  }
  catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * 下载文件
 */
export function downloadFile(blob: Blob, filename: string): void {
  if (typeof document === 'undefined') return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 复制 HTML 到剪贴板
 */
export async function copyHTMLToClipboard(html: string): Promise<boolean> {
  if (typeof document === 'undefined') return false
  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const blob = new Blob([html], { type: 'text/html' })
      const item = new ClipboardItem({ 'text/html': blob })
      await navigator.clipboard.write([item])
      return true
    }

    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = html
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const result = document.execCommand('copy')
    document.body.removeChild(textarea)
    return result
  }
  catch {
    return false
  }
}
