/**
 * 链接卡片功能
 * 将普通链接转换为带有 og:image 和 description 的预览卡片
 */

import type { MarkedExtension } from 'marked'

export interface LinkCardData {
  url: string
  title: string
  description: string
  image: string
  siteName: string
  favicon: string
}

export interface LinkCardOptions {
  className?: string
  fetchMetadata?: (url: string) => Promise<LinkCardData | null>
  cacheEnabled?: boolean
  fallbackImage?: string
}

const metadataCache = new Map<string, LinkCardData>()

/**
 * 从 URL 提取元数据（默认实现）
 */
export async function fetchLinkMetadata(url: string): Promise<LinkCardData | null> {
  try {
    // 在浏览器环境中使用 CORS 代理或后端 API
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl)
    const data = await response.json()
    const html = data.contents

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const getMetaContent = (selectors: string[]): string => {
      for (const selector of selectors) {
        const el = doc.querySelector(selector)
        if (el) {
          return el.getAttribute('content') || el.textContent || ''
        }
      }
      return ''
    }

    const title = getMetaContent([
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title',
    ])

    const description = getMetaContent([
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ])

    const image = getMetaContent([
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ])

    const siteName = getMetaContent([
      'meta[property="og:site_name"]',
    ]) || new URL(url).hostname

    const faviconLink = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]')
    const favicon = faviconLink?.getAttribute('href') || `${new URL(url).origin}/favicon.ico`

    return {
      url,
      title: title || url,
      description: description || '',
      image: image || '',
      siteName,
      favicon: favicon.startsWith('http') ? favicon : `${new URL(url).origin}${favicon}`,
    }
  }
  catch (error) {
    console.error('Failed to fetch link metadata:', error)
    return null
  }
}

/**
 * 生成链接卡片 HTML
 */
export function renderLinkCard(data: LinkCardData, className: string = 'link-card'): string {
  const imageHtml = data.image
    ? `<div class="${className}-image"><img src="${data.image}" alt="${data.title}" loading="lazy" /></div>`
    : ''

  return `
<a href="${data.url}" class="${className}" target="_blank" rel="noopener noreferrer">
  ${imageHtml}
  <div class="${className}-content">
    <div class="${className}-title">${data.title}</div>
    ${data.description ? `<div class="${className}-description">${data.description}</div>` : ''}
    <div class="${className}-meta">
      <img class="${className}-favicon" src="${data.favicon}" alt="" width="16" height="16" />
      <span class="${className}-site">${data.siteName}</span>
    </div>
  </div>
</a>
`.trim()
}

/**
 * 解析链接卡片语法 [card](url) 或 @[card](url)
 */
export function parseLinkCardSyntax(text: string): { url: string; isCard: boolean } | null {
  const cardMatch = text.match(/^@?\[card\]\((https?:\/\/[^\s)]+)\)$/)
  if (cardMatch) {
    return { url: cardMatch[1], isCard: true }
  }
  return null
}

/**
 * 链接卡片 Marked 扩展
 */
export function markedLinkCard(options: LinkCardOptions = {}): MarkedExtension {
  const {
    className = 'link-card',
    fetchMetadata = fetchLinkMetadata,
    cacheEnabled = true,
  } = options

  return {
    extensions: [
      {
        name: 'linkCard',
        level: 'inline',
        start(src: string) {
          return src.match(/@?\[card\]/)?.index
        },
        tokenizer(src: string) {
          const match = /^@?\[card\]\((https?:\/\/[^\s)]+)\)/.exec(src)
          if (match) {
            return {
              type: 'linkCard',
              raw: match[0],
              url: match[1],
            }
          }
        },
        renderer(token: any) {
          const { url } = token
          const cacheKey = url
          
          // 检查缓存
          if (cacheEnabled && metadataCache.has(cacheKey)) {
            const cached = metadataCache.get(cacheKey)!
            return renderLinkCard(cached, className)
          }

          // 生成占位符，异步加载后更新
          const placeholderId = `link-card-${Date.now()}-${Math.random().toString(36).slice(2)}`
          
          // 异步获取元数据
          if (typeof window !== 'undefined') {
            fetchMetadata(url).then((data) => {
              if (data) {
                if (cacheEnabled) {
                  metadataCache.set(cacheKey, data)
                }
                const el = document.getElementById(placeholderId)
                if (el) {
                  el.outerHTML = renderLinkCard(data, className)
                }
              }
            })
          }

          // 返回简单的链接作为占位符
          return `<div id="${placeholderId}" class="${className} ${className}-loading">
            <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
          </div>`
        },
      },
    ],
  }
}

/**
 * 清除链接卡片缓存
 */
export function clearLinkCardCache(): void {
  metadataCache.clear()
}

/**
 * 获取缓存的链接卡片数据
 */
export function getCachedLinkCard(url: string): LinkCardData | undefined {
  return metadataCache.get(url)
}
