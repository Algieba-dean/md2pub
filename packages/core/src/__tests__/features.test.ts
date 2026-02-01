/**
 * 功能增强模块单元测试
 * TDD 模式 - 测试优先
 */

import { describe, expect, it, beforeEach, vi } from 'vitest'

// 链接卡片测试
import {
  parseLinkCardSyntax,
  renderLinkCard,
  clearLinkCardCache,
  type LinkCardData,
} from '../features/link-card'

// 代码块增强测试
import {
  parseCodeBlock,
  parseDiffLines,
  renderEnhancedCodeBlock,
  escapeCodeHtml,
  type ParsedCodeBlock,
} from '../features/code-block'

// 本地历史测试
import {
  calculateChecksum,
  countWords,
  generateId,
  formatTimestamp,
} from '../features/local-history'

// 片段管理测试
import {
  generateSnippetId,
  PRESET_SNIPPETS,
} from '../features/snippets'

// 导出功能测试 - 从不依赖 html2canvas/jspdf 的模块导入
import {
  generateExportFilename,
} from '../features/export-utils'

describe('Link Card Feature', () => {
  beforeEach(() => {
    clearLinkCardCache()
  })

  describe('parseLinkCardSyntax', () => {
    it('should parse [card](url) syntax', () => {
      const result = parseLinkCardSyntax('[card](https://example.com)')
      expect(result).not.toBeNull()
      expect(result?.url).toBe('https://example.com')
      expect(result?.isCard).toBe(true)
    })

    it('should parse @[card](url) syntax', () => {
      const result = parseLinkCardSyntax('@[card](https://example.com/path)')
      expect(result).not.toBeNull()
      expect(result?.url).toBe('https://example.com/path')
    })

    it('should return null for regular links', () => {
      const result = parseLinkCardSyntax('[Link](https://example.com)')
      expect(result).toBeNull()
    })

    it('should return null for invalid URLs', () => {
      const result = parseLinkCardSyntax('[card](not-a-url)')
      expect(result).toBeNull()
    })

    it('should handle URLs with query parameters', () => {
      const result = parseLinkCardSyntax('[card](https://example.com?foo=bar&baz=qux)')
      expect(result).not.toBeNull()
      expect(result?.url).toBe('https://example.com?foo=bar&baz=qux')
    })
  })

  describe('renderLinkCard', () => {
    const mockData: LinkCardData = {
      url: 'https://example.com',
      title: 'Example Site',
      description: 'This is an example description',
      image: 'https://example.com/image.png',
      siteName: 'Example',
      favicon: 'https://example.com/favicon.ico',
    }

    it('should render card with all fields', () => {
      const html = renderLinkCard(mockData)
      expect(html).toContain('link-card')
      expect(html).toContain('Example Site')
      expect(html).toContain('This is an example description')
      expect(html).toContain('https://example.com/image.png')
    })

    it('should use custom className', () => {
      const html = renderLinkCard(mockData, 'custom-card')
      expect(html).toContain('custom-card')
      expect(html).not.toContain('link-card-')
    })

    it('should handle missing image', () => {
      const dataWithoutImage = { ...mockData, image: '' }
      const html = renderLinkCard(dataWithoutImage)
      expect(html).not.toContain('link-card-image')
    })

    it('should handle missing description', () => {
      const dataWithoutDesc = { ...mockData, description: '' }
      const html = renderLinkCard(dataWithoutDesc)
      expect(html).not.toContain('link-card-description')
    })

    it('should include target="_blank" for security', () => {
      const html = renderLinkCard(mockData)
      expect(html).toContain('target="_blank"')
      expect(html).toContain('rel="noopener noreferrer"')
    })
  })
})

describe('Code Block Enhancement', () => {
  describe('parseCodeBlock', () => {
    it('should parse simple code block', () => {
      const raw = '```javascript\nconst x = 1;\n```'
      const result = parseCodeBlock(raw)
      expect(result.language).toBe('javascript')
      expect(result.code).toBe('const x = 1;')
      expect(result.fileName).toBeNull()
    })

    it('should parse code block with filename', () => {
      const raw = '```typescript:app.ts\nconst x: number = 1;\n```'
      const result = parseCodeBlock(raw)
      expect(result.language).toBe('typescript')
      expect(result.fileName).toBe('app.ts')
      expect(result.code).toBe('const x: number = 1;')
    })

    it('should parse diff code block', () => {
      const raw = '```diff\n+added line\n-removed line\n unchanged\n```'
      const result = parseCodeBlock(raw)
      expect(result.language).toBe('diff')
      expect(result.isDiff).toBe(true)
      expect(result.diffLines.length).toBe(3)
    })

    it('should handle empty code block', () => {
      const raw = '```\n\n```'
      const result = parseCodeBlock(raw)
      expect(result.language).toBe('')
      // Empty code block returns the raw input when regex doesn't match
      expect(result.code).toBeDefined()
    })
  })

  describe('parseDiffLines', () => {
    it('should identify added lines', () => {
      const lines = parseDiffLines('+new code')
      expect(lines[0].type).toBe('add')
      expect(lines[0].content).toBe('new code')
    })

    it('should identify removed lines', () => {
      const lines = parseDiffLines('-old code')
      expect(lines[0].type).toBe('remove')
      expect(lines[0].content).toBe('old code')
    })

    it('should identify unchanged lines', () => {
      const lines = parseDiffLines(' same code')
      expect(lines[0].type).toBe('unchanged')
      expect(lines[0].content).toBe(' same code')
    })

    it('should skip diff headers', () => {
      const lines = parseDiffLines('--- a/file.txt\n+++ b/file.txt\n+added')
      expect(lines[0].type).toBe('unchanged') // --- is header, treated as unchanged
      expect(lines[1].type).toBe('unchanged') // +++ is header
      expect(lines[2].type).toBe('add')
    })

    it('should assign line numbers', () => {
      const lines = parseDiffLines('+line1\n-line2\n line3')
      expect(lines[0].lineNumber).toBe(1)
      expect(lines[1].lineNumber).toBe(2)
      expect(lines[2].lineNumber).toBe(3)
    })
  })

  describe('renderEnhancedCodeBlock', () => {
    const parsed: ParsedCodeBlock = {
      language: 'javascript',
      fileName: 'test.js',
      code: 'const x = 1;',
      isDiff: false,
      diffLines: [],
    }

    it('should render with filename', () => {
      const html = renderEnhancedCodeBlock(parsed, { showFileName: true })
      expect(html).toContain('test.js')
      expect(html).toContain('code-block-enhanced-filename')
    })

    it('should render with copy button', () => {
      const html = renderEnhancedCodeBlock(parsed, { showCopyButton: true })
      expect(html).toContain('code-block-enhanced-copy')
      expect(html).toContain('复制')
    })

    it('should render without copy button when disabled', () => {
      const html = renderEnhancedCodeBlock(parsed, { showCopyButton: false })
      expect(html).not.toContain('code-block-enhanced-copy')
    })

    it('should use custom class name', () => {
      const html = renderEnhancedCodeBlock(parsed, { className: 'my-code' })
      expect(html).toContain('my-code')
    })

    it('should render diff with highlighting', () => {
      const diffParsed: ParsedCodeBlock = {
        language: 'diff',
        fileName: null,
        code: '+added\n-removed',
        isDiff: true,
        diffLines: [
          { type: 'add', content: 'added', lineNumber: 1 },
          { type: 'remove', content: 'removed', lineNumber: 2 },
        ],
      }
      const html = renderEnhancedCodeBlock(diffParsed, { enableDiff: true })
      expect(html).toContain('line-add')
      expect(html).toContain('line-remove')
    })
  })

  describe('escapeCodeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeCodeHtml('<div>')).toBe('&lt;div&gt;')
      expect(escapeCodeHtml('"quoted"')).toBe('&quot;quoted&quot;')
      expect(escapeCodeHtml("'single'")).toBe('&#039;single&#039;')
      expect(escapeCodeHtml('a & b')).toBe('a &amp; b')
    })

    it('should handle empty string', () => {
      expect(escapeCodeHtml('')).toBe('')
    })

    it('should handle string without special chars', () => {
      expect(escapeCodeHtml('normal text')).toBe('normal text')
    })
  })
})

describe('Local History Feature', () => {
  describe('calculateChecksum', () => {
    it('should generate consistent checksum for same content', () => {
      const content = 'Hello World'
      const checksum1 = calculateChecksum(content)
      const checksum2 = calculateChecksum(content)
      expect(checksum1).toBe(checksum2)
    })

    it('should generate different checksums for different content', () => {
      const checksum1 = calculateChecksum('Hello')
      const checksum2 = calculateChecksum('World')
      expect(checksum1).not.toBe(checksum2)
    })

    it('should handle empty string', () => {
      const checksum = calculateChecksum('')
      expect(checksum).toBe('0')
    })

    it('should handle unicode characters', () => {
      const checksum = calculateChecksum('你好世界')
      expect(checksum).toBeDefined()
      expect(typeof checksum).toBe('string')
    })
  })

  describe('countWords', () => {
    it('should count Chinese characters', () => {
      expect(countWords('你好世界')).toBe(4)
    })

    it('should count English words', () => {
      expect(countWords('Hello World')).toBe(2)
    })

    it('should count mixed content', () => {
      const count = countWords('Hello 你好 World 世界')
      expect(count).toBe(6) // 2 English + 4 Chinese
    })

    it('should handle empty string', () => {
      expect(countWords('')).toBe(0)
    })

    it('should handle multiple spaces', () => {
      expect(countWords('Hello    World')).toBe(2)
    })
  })

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateId())
      }
      expect(ids.size).toBe(100)
    })

    it('should include timestamp', () => {
      const id = generateId()
      const timestamp = id.split('-')[0]
      expect(Number(timestamp)).toBeGreaterThan(0)
    })
  })

  describe('formatTimestamp', () => {
    it('should format recent timestamp as "刚刚"', () => {
      const now = Date.now()
      expect(formatTimestamp(now)).toBe('刚刚')
    })

    it('should format minutes ago', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      expect(formatTimestamp(fiveMinutesAgo)).toBe('5 分钟前')
    })

    it('should format today with time', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
      const result = formatTimestamp(twoHoursAgo)
      expect(result).toContain('今天')
    })
  })
})

describe('Snippets Feature', () => {
  describe('generateSnippetId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateSnippetId()
      const id2 = generateSnippetId()
      expect(id1).not.toBe(id2)
    })

    it('should start with "snippet-"', () => {
      const id = generateSnippetId()
      expect(id.startsWith('snippet-')).toBe(true)
    })
  })

  describe('PRESET_SNIPPETS', () => {
    it('should have predefined snippets', () => {
      expect(PRESET_SNIPPETS.length).toBeGreaterThan(0)
    })

    it('should have required fields', () => {
      PRESET_SNIPPETS.forEach((snippet) => {
        expect(snippet.name).toBeDefined()
        expect(snippet.content).toBeDefined()
        expect(snippet.category).toBeDefined()
        expect(snippet.tags).toBeDefined()
      })
    })

    it('should have valid categories', () => {
      const validCategories = ['intro', 'outro', 'qrcode', 'ad', 'template', 'other']
      PRESET_SNIPPETS.forEach((snippet) => {
        expect(validCategories).toContain(snippet.category)
      })
    })
  })
})

describe('Export Feature', () => {
  describe('generateExportFilename', () => {
    it('should generate valid filename', () => {
      const filename = generateExportFilename('My Document', 'pdf')
      expect(filename).toContain('My_Document')
      expect(filename).toContain('.pdf')
    })

    it('should sanitize special characters', () => {
      const filename = generateExportFilename('File<>:"/\\|?*Name', 'pdf')
      expect(filename).not.toContain('<')
      expect(filename).not.toContain('>')
      expect(filename).not.toContain(':')
    })

    it('should include date', () => {
      const filename = generateExportFilename('Test', 'pdf')
      const dateRegex = /\d{4}-\d{2}-\d{2}/
      expect(filename).toMatch(dateRegex)
    })

    it('should truncate long titles', () => {
      const longTitle = 'A'.repeat(100)
      const filename = generateExportFilename(longTitle, 'pdf')
      expect(filename.length).toBeLessThan(100)
    })

    it('should handle Chinese titles', () => {
      const filename = generateExportFilename('中文文档标题', 'pdf')
      expect(filename).toContain('中文文档标题')
    })

    it('should handle empty title', () => {
      const filename = generateExportFilename('', 'pdf')
      expect(filename).toContain('.pdf')
    })

    it('should handle different extensions', () => {
      expect(generateExportFilename('Test', 'md')).toContain('.md')
      expect(generateExportFilename('Test', 'html')).toContain('.html')
      expect(generateExportFilename('Test', 'png')).toContain('.png')
    })
  })
})

describe('Integration Tests', () => {
  describe('Code Block with Link Card', () => {
    it('should handle code block containing URL', () => {
      const code = 'const url = "https://example.com";'
      const parsed = parseCodeBlock(`\`\`\`javascript\n${code}\n\`\`\``)
      expect(parsed.code).toBe(code)
      // URL in code should not be converted to link card
      const linkResult = parseLinkCardSyntax(code)
      expect(linkResult).toBeNull()
    })
  })

  describe('Filename Generation with Special Content', () => {
    it('should generate filename for Chinese content', () => {
      const filename = generateExportFilename('中文文档', 'md')
      expect(filename).toContain('中文文档')
      expect(filename).toContain('.md')
    })

    it('should generate filename for content with spaces', () => {
      const filename = generateExportFilename('My Document Title', 'pdf')
      expect(filename).toContain('My_Document_Title')
    })
  })
})
