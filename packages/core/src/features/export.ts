/**
 * 导出功能
 * - 长图导出 (HTML to Canvas to PNG)
 * - PDF 导出 (带目录和页码)
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
 * 将 HTML 转换为长图
 * 注意: 需要安装 html2canvas 依赖
 */
export async function htmlToLongImage(
  html: string,
  options: LongImageOptions = {},
): Promise<ExportResult> {
  const {
    scale = 2,
    backgroundColor = '#ffffff',
    padding = 40,
    maxWidth = 800,
    quality = 0.92,
    format = 'png',
    watermark,
  } = options

  if (typeof document === 'undefined') {
    return { success: false, error: 'Not in browser environment' }
  }

  try {
    // 动态导入 html2canvas (需要安装: pnpm add html2canvas)
    let html2canvas: any
    try {
      html2canvas = (await import('html2canvas')).default
    }
    catch {
      return { success: false, error: 'html2canvas not installed. Run: pnpm add html2canvas' }
    }

    // 创建临时容器
    const container = document.createElement('div')
    container.innerHTML = html
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: ${maxWidth}px;
      padding: ${padding}px;
      background-color: ${backgroundColor};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `
    document.body.appendChild(container)

    // 等待图片加载
    await waitForImages(container)

    // 渲染为 Canvas
    const canvas = await html2canvas(container, {
      scale,
      backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
    })

    // 移除临时容器
    document.body.removeChild(container)

    // 添加水印
    if (watermark) {
      addWatermark(canvas, watermark)
    }

    // 转换为 Blob
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('Failed to create blob'))
        },
        mimeType,
        quality,
      )
    })

    return {
      success: true,
      data: blob,
      filename: `export.${format}`,
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
 * 等待容器中的所有图片加载完成
 */
async function waitForImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img')
  const promises: Promise<void>[] = []

  images.forEach((img) => {
    if (!img.complete) {
      promises.push(
        new Promise((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
      )
    }
  })

  await Promise.all(promises)
}

/**
 * 添加水印
 */
function addWatermark(
  canvas: HTMLCanvasElement,
  watermark: NonNullable<LongImageOptions['watermark']>,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const {
    text,
    fontSize = 14,
    color = 'rgba(0, 0, 0, 0.3)',
    position = 'bottom-right',
  } = watermark

  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = color

  const textWidth = ctx.measureText(text).width
  const padding = 20

  let x: number
  let y: number

  switch (position) {
    case 'top-left':
      x = padding
      y = padding + fontSize
      break
    case 'top-right':
      x = canvas.width - textWidth - padding
      y = padding + fontSize
      break
    case 'bottom-left':
      x = padding
      y = canvas.height - padding
      break
    case 'center':
      x = (canvas.width - textWidth) / 2
      y = canvas.height / 2
      break
    case 'bottom-right':
    default:
      x = canvas.width - textWidth - padding
      y = canvas.height - padding
      break
  }

  ctx.fillText(text, x, y)
}

/**
 * 将 HTML 转换为 PDF
 */
export async function htmlToPDF(
  html: string,
  options: PDFOptions = {},
): Promise<ExportResult> {
  const {
    title = 'Document',
    author = '',
    pageSize = 'A4',
    margin = { top: 40, right: 40, bottom: 40, left: 40 },
    showTOC = true,
    showPageNumbers = true,
    showHeader = false,
    showFooter = true,
    headerText = '',
    footerText = '',
    fontSize = 12,
    lineHeight = 1.6,
  } = options

  if (typeof document === 'undefined') {
    return { success: false, error: 'Not in browser environment' }
  }

  try {
    // 动态导入 jspdf 和 html2canvas (需要安装依赖)
    let jsPDF: any
    let html2canvas: any
    try {
      const [jspdfModule, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      jsPDF = jspdfModule.default
      html2canvas = html2canvasModule.default
    }
    catch {
      return { success: false, error: 'Dependencies not installed. Run: pnpm add jspdf html2canvas' }
    }

    // 页面尺寸（毫米）
    const pageSizes: Record<string, { width: number; height: number }> = {
      A4: { width: 210, height: 297 },
      Letter: { width: 216, height: 279 },
      Legal: { width: 216, height: 356 },
    }

    const { width: pageWidth, height: pageHeight } = pageSizes[pageSize]

    // 创建 PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageWidth, pageHeight],
    })

    // 设置元数据
    pdf.setProperties({
      title,
      author,
      subject: options.subject || '',
      creator: 'md2pub',
    })

    // 创建临时容器
    const container = document.createElement('div')
    container.innerHTML = html
    container.style.cssText = `
      position: absolute;
      left: -9999px;
      top: 0;
      width: ${(pageWidth - margin.left - margin.right) * 3.78}px;
      font-size: ${fontSize}px;
      line-height: ${lineHeight};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `
    document.body.appendChild(container)

    // 等待图片加载
    await waitForImages(container)

    // 提取目录
    let tocItems: { level: number; text: string; page: number }[] = []
    if (showTOC) {
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach((heading) => {
        const level = Number.parseInt(heading.tagName.slice(1))
        tocItems.push({
          level,
          text: heading.textContent || '',
          page: 1, // 将在渲染后更新
        })
      })
    }

    // 渲染为 Canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      logging: false,
    })

    // 移除临时容器
    document.body.removeChild(container)

    // 计算页面
    const imgWidth = pageWidth - margin.left - margin.right
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const contentHeight = pageHeight - margin.top - margin.bottom

    let heightLeft = imgHeight
    let position = margin.top
    let currentPage = 1

    // 添加目录页（如果有）
    if (showTOC && tocItems.length > 0) {
      pdf.setFontSize(18)
      pdf.text('目录', margin.left, margin.top + 10)

      pdf.setFontSize(12)
      let tocY = margin.top + 25

      tocItems.forEach((item, index) => {
        const indent = (item.level - 1) * 5
        pdf.text(`${'  '.repeat(item.level - 1)}${item.text}`, margin.left + indent, tocY)
        tocY += 7

        if (tocY > pageHeight - margin.bottom) {
          pdf.addPage()
          tocY = margin.top
        }
      })

      pdf.addPage()
      currentPage++
    }

    // 添加内容页
    const imgData = canvas.toDataURL('image/png')

    // 第一页
    pdf.addImage(imgData, 'PNG', margin.left, position, imgWidth, imgHeight)
    heightLeft -= contentHeight

    // 添加页码
    if (showPageNumbers) {
      addPageNumber(pdf, currentPage, pageWidth, pageHeight, margin)
    }

    // 添加页眉页脚
    if (showHeader && headerText) {
      pdf.setFontSize(9)
      pdf.text(headerText, pageWidth / 2, margin.top / 2, { align: 'center' })
    }
    if (showFooter && footerText) {
      pdf.setFontSize(9)
      pdf.text(footerText, pageWidth / 2, pageHeight - margin.bottom / 2, { align: 'center' })
    }

    // 后续页面
    while (heightLeft > 0) {
      position = position - contentHeight
      pdf.addPage()
      currentPage++
      pdf.addImage(imgData, 'PNG', margin.left, position, imgWidth, imgHeight)
      heightLeft -= contentHeight

      if (showPageNumbers) {
        addPageNumber(pdf, currentPage, pageWidth, pageHeight, margin)
      }
    }

    // 生成 Blob
    const blob = pdf.output('blob')

    return {
      success: true,
      data: blob,
      filename: generateExportFilename(title, 'pdf'),
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
 * 添加页码
 */
function addPageNumber(
  pdf: any,
  pageNumber: number,
  pageWidth: number,
  pageHeight: number,
  margin: PDFOptions['margin'],
): void {
  pdf.setFontSize(10)
  pdf.text(
    `${pageNumber}`,
    pageWidth / 2,
    pageHeight - (margin?.bottom || 40) / 2,
    { align: 'center' },
  )
}

/**
 * 下载文件
 */
export function downloadFile(blob: Blob, filename: string): void {
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
 * 导出为 Markdown 文件
 */
export function exportAsMarkdown(
  content: string,
  title: string = 'document',
): ExportResult {
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
 * 复制 HTML 到剪贴板
 */
export async function copyHTMLToClipboard(html: string): Promise<boolean> {
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
