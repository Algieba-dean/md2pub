/**
 * 图表导出功能
 * 将 Mermaid/Echarts 等动态图表转换为静态图片
 */

export interface ChartExportOptions {
  format?: 'png' | 'jpeg' | 'svg' | 'base64'
  quality?: number
  scale?: number
  backgroundColor?: string
}

export interface ChartExportResult {
  success: boolean
  data?: string
  error?: string
  format: string
}

/**
 * 将 SVG 元素转换为 Base64 图片
 */
export async function svgToBase64(
  svgElement: SVGElement,
  options: ChartExportOptions = {},
): Promise<ChartExportResult> {
  const {
    format = 'png',
    quality = 0.92,
    scale = 2,
    backgroundColor = 'white',
  } = options

  try {
    // 获取 SVG 尺寸
    const svgRect = svgElement.getBoundingClientRect()
    const width = svgRect.width * scale
    const height = svgRect.height * scale

    // 序列化 SVG
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)

    // 如果只需要 SVG 格式
    if (format === 'svg') {
      const base64 = btoa(unescape(encodeURIComponent(svgString)))
      URL.revokeObjectURL(svgUrl)
      return {
        success: true,
        data: `data:image/svg+xml;base64,${base64}`,
        format: 'svg',
      }
    }

    // 创建 Canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      return { success: false, error: 'Failed to get canvas context', format }
    }

    // 填充背景色
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    // 加载 SVG 到 Image
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(svgUrl)

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
        const dataUrl = canvas.toDataURL(mimeType, quality)

        resolve({
          success: true,
          data: dataUrl,
          format,
        })
      }
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl)
        resolve({ success: false, error: 'Failed to load SVG', format })
      }
      img.src = svgUrl
    })
  }
  catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      format,
    }
  }
}

/**
 * 将 Canvas 元素转换为 Base64 图片
 */
export function canvasToBase64(
  canvas: HTMLCanvasElement,
  options: ChartExportOptions = {},
): ChartExportResult {
  const { format = 'png', quality = 0.92 } = options

  try {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const dataUrl = canvas.toDataURL(mimeType, quality)

    return {
      success: true,
      data: dataUrl,
      format,
    }
  }
  catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      format,
    }
  }
}

/**
 * 导出 Mermaid 图表为图片
 */
export async function exportMermaidChart(
  container: HTMLElement,
  options: ChartExportOptions = {},
): Promise<ChartExportResult> {
  const svgElement = container.querySelector('svg')
  if (!svgElement) {
    return { success: false, error: 'No SVG found in container', format: options.format || 'png' }
  }

  return svgToBase64(svgElement as SVGElement, options)
}

/**
 * 导出 Echarts 图表为图片
 */
export function exportEchartsChart(
  chartInstance: any,
  options: ChartExportOptions = {},
): ChartExportResult {
  const { format = 'png', quality = 0.92, backgroundColor = 'white' } = options

  try {
    // Echarts 内置的 getDataURL 方法
    const dataUrl = chartInstance.getDataURL({
      type: format === 'jpeg' ? 'jpeg' : 'png',
      pixelRatio: options.scale || 2,
      backgroundColor,
      quality,
    })

    return {
      success: true,
      data: dataUrl,
      format,
    }
  }
  catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      format,
    }
  }
}

/**
 * 批量导出页面中的所有图表
 */
export async function exportAllCharts(
  containerSelector: string = 'body',
  options: ChartExportOptions = {},
): Promise<Map<string, ChartExportResult>> {
  const results = new Map<string, ChartExportResult>()
  const container = document.querySelector(containerSelector)

  if (!container) {
    return results
  }

  // 导出 Mermaid 图表
  const mermaidContainers = container.querySelectorAll('.mermaid-diagram')
  for (let i = 0; i < mermaidContainers.length; i++) {
    const el = mermaidContainers[i] as HTMLElement
    const result = await exportMermaidChart(el, options)
    results.set(`mermaid-${i}`, result)
  }

  return results
}

/**
 * 将 HTML 中的动态图表替换为静态图片
 */
export async function replaceChartsWithImages(
  html: string,
  options: ChartExportOptions = {},
): Promise<string> {
  if (typeof document === 'undefined') {
    return html
  }

  // 创建临时容器
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  tempDiv.style.position = 'absolute'
  tempDiv.style.left = '-9999px'
  document.body.appendChild(tempDiv)

  try {
    // 等待图表渲染
    await new Promise(resolve => setTimeout(resolve, 500))

    // 替换 Mermaid 图表
    const mermaidContainers = tempDiv.querySelectorAll('.mermaid-diagram')
    for (const container of mermaidContainers) {
      const result = await exportMermaidChart(container as HTMLElement, options)
      if (result.success && result.data) {
        const img = document.createElement('img')
        img.src = result.data
        img.alt = 'Chart'
        img.className = 'chart-image'
        container.replaceWith(img)
      }
    }

    return tempDiv.innerHTML
  }
  finally {
    document.body.removeChild(tempDiv)
  }
}

/**
 * 下载图表为文件
 */
export function downloadChartAsFile(
  dataUrl: string,
  filename: string = 'chart',
): void {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
