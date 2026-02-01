/**
 * 平台渲染器
 * md2pub 核心功能 - 多平台差异化 Markdown 渲染引擎
 */

import type {
  ASTTransformer,
  FootnoteItem,
  ImageItem,
  PlatformPreset,
  PlatformRendererAPI,
  PlatformType,
  RenderContext,
  RenderResult,
  TocItem,
} from '@md/shared/types/platform'
import { marked } from 'marked'
import { getAllPresets, getPreset } from './presets'
import { applyDOMTransformations } from './transformers/dom-adapter'
import { injectStyles } from './transformers/style-injector'
import { applyTypography, calculateReadingTime } from './transformers/typography'

/**
 * 创建平台渲染器
 */
export function createPlatformRenderer(
  initialPreset: PlatformType = 'wechat',
): PlatformRendererAPI {
  let currentPreset: PlatformPreset = getPreset(initialPreset)
  const transformers: ASTTransformer[] = []

  /**
   * 设置平台预设
   */
  function setPreset(preset: PlatformType | PlatformPreset): void {
    if (typeof preset === 'string') {
      currentPreset = getPreset(preset)
    }
    else {
      currentPreset = preset
    }
  }

  /**
   * 获取当前预设
   */
  function getPresetConfig(): PlatformPreset {
    return currentPreset
  }

  /**
   * 注册自定义转换器
   */
  function registerTransformer(transformer: ASTTransformer): void {
    transformers.push(transformer)
    // 按优先级排序
    transformers.sort((a, b) => a.priority - b.priority)
  }

  /**
   * 提取脚注
   */
  function extractFootnotes(markdown: string): FootnoteItem[] {
    const footnotes: FootnoteItem[] = []
    const regex = /\[\^(\w+)\]:\s*(.+)/g
    let match: RegExpExecArray | null
    let index = 1

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(markdown)) !== null) {
      const [, id, content] = match
      // 检查是否是 URL
      const urlMatch = content.match(/<?([^>\s]+)>?\s*(.*)/)
      if (urlMatch) {
        footnotes.push({
          id,
          index: index++,
          link: urlMatch[1],
          title: urlMatch[2] || urlMatch[1],
        })
      }
      else {
        footnotes.push({
          id,
          index: index++,
          link: content,
          title: content,
        })
      }
    }

    return footnotes
  }

  /**
   * 提取目录
   */
  function extractToc(html: string): TocItem[] {
    const toc: TocItem[] = []
    const regex = /<h(\d)[^>]*(?:id="([^"]*)")?[^>]*>([\s\S]*?)<\/h\1>/gi
    let match: RegExpExecArray | null

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(html)) !== null) {
      const level = Number.parseInt(match[1], 10)
      const id = match[2] || `heading-${toc.length + 1}`
      const text = match[3].replace(/<[^>]+>/g, '') // 移除内部标签

      toc.push({ id, level, text })
    }

    return toc
  }

  /**
   * 提取图片
   */
  function extractImages(html: string): ImageItem[] {
    const images: ImageItem[] = []
    const regex = /<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*(?:title="([^"]*)")?[^>]*>/gi
    let match: RegExpExecArray | null

    // eslint-disable-next-line no-cond-assign
    while ((match = regex.exec(html)) !== null) {
      images.push({
        src: match[1],
        alt: match[2] || '',
        title: match[3],
      })
    }

    return images
  }

  /**
   * 提取元数据（从 frontmatter）
   */
  function extractMeta(markdown: string): Record<string, any> {
    const meta: Record<string, any> = {}

    // 简单的 frontmatter 解析
    const fmMatch = markdown.match(/^---\n([\s\S]*?)\n---/)
    if (fmMatch) {
      const fmContent = fmMatch[1]
      const lines = fmContent.split('\n')

      for (const line of lines) {
        const colonIndex = line.indexOf(':')
        if (colonIndex > 0) {
          const key = line.slice(0, colonIndex).trim()
          let value = line.slice(colonIndex + 1).trim()

          // 处理数组
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, '')) as any
          }
          // 处理引号
          else if ((value.startsWith('"') && value.endsWith('"'))
            || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1) as any
          }

          meta[key] = value
        }
      }
    }

    return meta
  }

  /**
   * 移除 frontmatter
   */
  function removeFrontmatter(markdown: string): string {
    return markdown.replace(/^---\n[\s\S]*?\n---\n*/, '')
  }

  /**
   * 渲染 Markdown 到目标平台 HTML
   */
  function render(
    markdown: string,
    options?: Partial<RenderContext>,
  ): RenderResult {
    // 提取元数据
    const meta = extractMeta(markdown)
    const cleanMarkdown = removeFrontmatter(markdown)

    // 提取脚注
    const footnotes = extractFootnotes(cleanMarkdown)

    // 创建渲染上下文
    const context: RenderContext = {
      preset: currentPreset,
      footnotes,
      toc: [],
      images: [],
      darkMode: options?.darkMode ?? false,
      primaryColor: options?.primaryColor ?? '#1a73e8',
      ...options,
    }

    // 使用 marked 渲染基础 HTML
    let html = marked.parse(cleanMarkdown) as string

    // 提取 TOC 和图片
    context.toc = extractToc(html)
    context.images = extractImages(html)

    // 应用自定义转换器
    for (const transformer of transformers) {
      html = transformer.transform(html, context)
    }

    // 应用 DOM 转换（脚注、代码块、图片容器）
    html = applyDOMTransformations(html, context)

    // 应用排版规则
    html = applyTypography(html, context)

    // 应用样式注入
    html = injectStyles(html, context)

    // 计算阅读时间
    const { minutes, words } = calculateReadingTime(cleanMarkdown)

    return {
      html,
      meta: {
        title: meta.title,
        description: meta.description || meta.excerpt,
        tags: meta.tags,
        readingTime: minutes,
        wordCount: words,
      },
      toc: context.toc,
      footnotes: context.footnotes,
      images: context.images,
      preset: currentPreset.id,
    }
  }

  return {
    setPreset,
    getPreset: getPresetConfig,
    getAllPresets,
    registerTransformer,
    render,
  }
}

/**
 * 默认渲染器实例
 */
export const platformRenderer = createPlatformRenderer()

/**
 * 快捷渲染函数
 */
export function renderForPlatform(
  markdown: string,
  platform: PlatformType,
  options?: Partial<RenderContext>,
): RenderResult {
  const renderer = createPlatformRenderer(platform)
  return renderer.render(markdown, options)
}
