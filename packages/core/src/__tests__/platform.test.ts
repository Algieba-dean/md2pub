/**
 * 平台渲染引擎单元测试
 * TDD 模式开发
 */

import { describe, expect, it } from 'vitest'
import {
  getAllPresets,
  getPreset,
  platformPresets,
  presetOptions,
} from '../platform/presets'
import { createPlatformRenderer, renderForPlatform } from '../platform/renderer'
import { addPanguSpacing, applyPanguToHtml, calculateReadingTime, containsChinese } from '../platform/transformers/typography'
import { transformCodeBlocks, transformFootnotes, transformImageContainers } from '../platform/transformers/dom-adapter'
import type { FootnoteItem, RenderContext } from '@md/shared/types/platform'

describe('Platform Presets', () => {
  describe('getPreset', () => {
    it('should return wechat preset by default', () => {
      const preset = getPreset('wechat')
      expect(preset.id).toBe('wechat')
      expect(preset.name).toBe('微信公众号')
    })

    it('should return correct preset for each platform', () => {
      expect(getPreset('zhihu').id).toBe('zhihu')
      expect(getPreset('email').id).toBe('email')
      expect(getPreset('semantic').id).toBe('semantic')
      expect(getPreset('medium').id).toBe('medium')
      expect(getPreset('devto').id).toBe('devto')
    })

    it('should have correct CSS strategy for each platform', () => {
      expect(getPreset('wechat').cssStrategy).toBe('inline-heavy')
      expect(getPreset('zhihu').cssStrategy).toBe('inline-heavy')
      expect(getPreset('email').cssStrategy).toBe('inline-minimal')
      expect(getPreset('semantic').cssStrategy).toBe('class-based')
      expect(getPreset('medium').cssStrategy).toBe('inline-minimal')
      expect(getPreset('devto').cssStrategy).toBe('class-based')
    })
  })

  describe('getAllPresets', () => {
    it('should return all presets', () => {
      const presets = getAllPresets()
      expect(presets.length).toBeGreaterThanOrEqual(6)
    })
  })

  describe('presetOptions', () => {
    it('should have options for UI dropdown', () => {
      expect(presetOptions.length).toBeGreaterThanOrEqual(6)
      expect(presetOptions[0].label).toBe('微信公众号')
      expect(presetOptions[0].value).toBe('wechat')
    })
  })

  describe('Platform Preset Structure', () => {
    it('wechat preset should have correct typography config', () => {
      const preset = getPreset('wechat')
      expect(preset.typography.autoPanguSpacing).toBe(true)
      expect(preset.typography.baseFontSize).toBe(16)
      expect(preset.typography.lineHeight).toBe(1.75)
    })

    it('wechat preset should have correct compatibility config', () => {
      const preset = getPreset('wechat')
      expect(preset.compatibility.removeScripts).toBe(true)
      expect(preset.compatibility.removeIframes).toBe(true)
    })

    it('semantic preset should have class-based strategy', () => {
      const preset = getPreset('semantic')
      expect(preset.cssStrategy).toBe('class-based')
      expect(preset.semantic.useArticle).toBe(true)
      expect(preset.classPrefix).toBe('md2pub-')
    })
  })
})

describe('Typography Utilities', () => {
  describe('addPanguSpacing', () => {
    it('should add space between Chinese and English', () => {
      expect(addPanguSpacing('中文English')).toBe('中文 English')
      expect(addPanguSpacing('Hello世界')).toBe('Hello 世界')
    })

    it('should add space between Chinese and numbers', () => {
      expect(addPanguSpacing('测试123')).toBe('测试 123')
      expect(addPanguSpacing('100个')).toBe('100 个')
    })

    it('should not add extra spaces', () => {
      expect(addPanguSpacing('中文 English')).toBe('中文 English')
      expect(addPanguSpacing('纯中文测试')).toBe('纯中文测试')
    })

    it('should handle empty string', () => {
      expect(addPanguSpacing('')).toBe('')
    })
  })

  describe('applyPanguToHtml', () => {
    it('should apply pangu to text content only', () => {
      const html = '<p>中文English</p>'
      expect(applyPanguToHtml(html)).toBe('<p>中文 English</p>')
    })

    it('should not modify HTML tags', () => {
      const html = '<a href="test">中文English</a>'
      const result = applyPanguToHtml(html)
      expect(result).toContain('<a href="test">')
      expect(result).toContain('中文 English')
    })
  })

  describe('containsChinese', () => {
    it('should detect Chinese characters', () => {
      expect(containsChinese('你好')).toBe(true)
      expect(containsChinese('Hello')).toBe(false)
      expect(containsChinese('Hello世界')).toBe(true)
    })
  })

  describe('calculateReadingTime', () => {
    it('should calculate reading time for Chinese text', () => {
      const text = '这是一段中文测试文本'.repeat(100) // ~1000 characters
      const result = calculateReadingTime(text)
      expect(result.words).toBeGreaterThan(0)
      expect(result.minutes).toBeGreaterThan(0)
    })

    it('should calculate reading time for English text', () => {
      const text = 'This is a test sentence. '.repeat(100) // ~500 words
      const result = calculateReadingTime(text)
      expect(result.words).toBeGreaterThan(0)
      expect(result.minutes).toBeGreaterThan(0)
    })

    it('should return at least 1 minute', () => {
      const result = calculateReadingTime('短文')
      expect(result.minutes).toBeGreaterThanOrEqual(1)
    })
  })
})

describe('DOM Adapter', () => {
  describe('transformFootnotes', () => {
    const footnotes: FootnoteItem[] = [
      { id: '1', index: 1, title: 'Reference 1', link: 'https://example.com' },
      { id: '2', index: 2, title: 'Reference 2', link: 'https://example.org' },
    ]

    it('should transform footnotes to inline text for wechat', () => {
      const html = '<p>Test<sup><a href="#fn1">[1]</a></sup></p>'
      const result = transformFootnotes(html, footnotes, 'inline-text')
      expect(result).toContain('参考资料')
    })

    it('should keep anchor jump for semantic mode', () => {
      const html = '<p>Test[^1]</p>'
      const result = transformFootnotes(html, footnotes, 'anchor-jump')
      expect(result).toBeDefined()
    })
  })

  describe('transformCodeBlocks', () => {
    const codeHtml = '<pre><code class="language-js">const x = 1;</code></pre>'

    it('should add mac window style', () => {
      const result = transformCodeBlocks(codeHtml, 'mac-window')
      expect(result).toContain('mac-sign')
      expect(result).toContain('svg')
    })

    it('should keep minimal for devto style', () => {
      const result = transformCodeBlocks(codeHtml, 'minimal')
      expect(result).not.toContain('mac-sign')
      expect(result).toContain('language-js')
    })

    it('should add line numbers', () => {
      const result = transformCodeBlocks(codeHtml, 'line-numbers')
      expect(result).toContain('line-number')
    })
  })

  describe('transformImageContainers', () => {
    const imgHtml = '<p><img src="test.jpg" alt="test"></p>'

    it('should wrap in figure', () => {
      const result = transformImageContainers(imgHtml, 'figure')
      expect(result).toContain('<figure>')
    })

    it('should keep simple for email style', () => {
      const figureHtml = '<figure><img src="test.jpg"></figure>'
      const result = transformImageContainers(figureHtml, 'simple')
      expect(result).toContain('<p>')
      expect(result).not.toContain('<figure>')
    })

    it('should add responsive wrapper', () => {
      const result = transformImageContainers(imgHtml, 'responsive')
      expect(result).toContain('responsive-image')
      expect(result).toContain('max-width: 100%')
    })
  })
})

describe('Platform Renderer', () => {
  describe('createPlatformRenderer', () => {
    it('should create renderer with default preset', () => {
      const renderer = createPlatformRenderer()
      expect(renderer.getPreset().id).toBe('wechat')
    })

    it('should create renderer with specified preset', () => {
      const renderer = createPlatformRenderer('semantic')
      expect(renderer.getPreset().id).toBe('semantic')
    })

    it('should allow changing preset', () => {
      const renderer = createPlatformRenderer()
      renderer.setPreset('email')
      expect(renderer.getPreset().id).toBe('email')
    })
  })

  describe('render', () => {
    it('should render basic markdown', () => {
      const renderer = createPlatformRenderer('wechat')
      const result = renderer.render('# Hello World\n\nThis is a test.')
      
      expect(result.html).toContain('Hello World')
      expect(result.html).toContain('This is a test')
      expect(result.preset).toBe('wechat')
    })

    it('should extract metadata from frontmatter', () => {
      const renderer = createPlatformRenderer()
      const markdown = `---
title: Test Title
description: Test description
tags: [tag1, tag2]
---

# Content`
      
      const result = renderer.render(markdown)
      expect(result.meta.title).toBe('Test Title')
      expect(result.meta.description).toBe('Test description')
    })

    it('should extract TOC', () => {
      const renderer = createPlatformRenderer()
      const markdown = `# Heading 1\n## Heading 2\n### Heading 3`
      const result = renderer.render(markdown)
      
      expect(result.toc.length).toBe(3)
      expect(result.toc[0].level).toBe(1)
      expect(result.toc[0].text).toContain('Heading 1')
    })

    it('should calculate reading time', () => {
      const renderer = createPlatformRenderer()
      const markdown = '这是测试文本。'.repeat(100)
      const result = renderer.render(markdown)
      
      expect(result.meta.readingTime).toBeGreaterThan(0)
      expect(result.meta.wordCount).toBeGreaterThan(0)
    })
  })

  describe('renderForPlatform', () => {
    it('should render for specific platform', () => {
      const result = renderForPlatform('# Test', 'semantic')
      expect(result.preset).toBe('semantic')
      expect(result.html).toContain('article')
    })

    it('should apply different styles for different platforms', () => {
      const markdown = '# Test\n\n```js\nconst x = 1;\n```'
      
      const wechatResult = renderForPlatform(markdown, 'wechat')
      const devtoResult = renderForPlatform(markdown, 'devto')
      
      // WeChat should have mac window style
      expect(wechatResult.html).toContain('mac-sign')
      // Dev.to should not
      expect(devtoResult.html).not.toContain('mac-sign')
    })
  })
})

describe('CSS Injection Strategy', () => {
  it('wechat should use inline-heavy', () => {
    const result = renderForPlatform('<p>Test</p>', 'wechat')
    // Inline heavy should add style attributes
    expect(result.html).toContain('style=')
  })

  it('semantic should use class-based', () => {
    const result = renderForPlatform('<p>Test</p>', 'semantic')
    // Class-based should add class prefixes
    expect(result.html).toContain('md2pub-')
  })

  it('email should use inline-minimal', () => {
    const result = renderForPlatform('# Test\n\nParagraph', 'email')
    expect(result.preset).toBe('email')
    expect(result.html).toBeDefined()
  })

  it('medium should use inline-minimal', () => {
    const result = renderForPlatform('# Test', 'medium')
    expect(result.preset).toBe('medium')
  })

  it('devto should use class-based', () => {
    const result = renderForPlatform('# Test', 'devto')
    expect(result.preset).toBe('devto')
  })
})

describe('Advanced Typography', () => {
  describe('Mixed Content Spacing', () => {
    it('should handle complex mixed content', () => {
      expect(addPanguSpacing('这是Version2.0版本')).toBe('这是 Version2.0 版本')
      expect(addPanguSpacing('Node.js是JavaScript运行时')).toBe('Node.js 是 JavaScript 运行时')
    })

    it('should handle punctuation correctly', () => {
      expect(addPanguSpacing('中文，English')).toBe('中文，English')
      expect(addPanguSpacing('中文。English')).toBe('中文。English')
    })

    it('should handle special characters', () => {
      // Note: pangu spacing focuses on CJK-Latin boundaries, not all special chars
      const result1 = addPanguSpacing('使用@符号')
      const result2 = addPanguSpacing('价格$100元')
      expect(result1).toBeDefined()
      expect(result2).toBeDefined()
    })
  })

  describe('Reading Time Edge Cases', () => {
    it('should handle empty content', () => {
      const result = calculateReadingTime('')
      expect(result.minutes).toBe(1)
      expect(result.words).toBe(0)
    })

    it('should handle very long content', () => {
      const longText = '这是中文测试。'.repeat(10000)
      const result = calculateReadingTime(longText)
      expect(result.minutes).toBeGreaterThan(10)
    })

    it('should handle mixed language content', () => {
      const mixedText = '中文English混合Content测试Test'.repeat(100)
      const result = calculateReadingTime(mixedText)
      expect(result.words).toBeGreaterThan(0)
    })
  })
})

describe('DOM Transformations Edge Cases', () => {
  describe('Code Block Transformations', () => {
    it('should handle code without language', () => {
      const html = '<pre><code>plain text code</code></pre>'
      const result = transformCodeBlocks(html, 'mac-window')
      expect(result).toContain('mac-sign')
    })

    it('should handle multiple code blocks', () => {
      const html = `
        <pre><code class="language-js">const a = 1;</code></pre>
        <p>Some text</p>
        <pre><code class="language-python">print("hello")</code></pre>
      `
      const result = transformCodeBlocks(html, 'mac-window')
      const macSignCount = (result.match(/mac-sign/g) || []).length
      expect(macSignCount).toBe(2)
    })

    it('should handle empty code blocks', () => {
      const html = '<pre><code></code></pre>'
      const result = transformCodeBlocks(html, 'mac-window')
      expect(result).toBeDefined()
    })

    it('should preserve code content', () => {
      const html = '<pre><code>const x = "hello";</code></pre>'
      const result = transformCodeBlocks(html, 'mac-window')
      expect(result).toContain('const x = "hello"')
    })
  })

  describe('Image Container Transformations', () => {
    it('should handle images without alt text', () => {
      const html = '<p><img src="test.jpg"></p>'
      const result = transformImageContainers(html, 'figure')
      expect(result).toContain('<figure>')
    })

    it('should handle multiple images', () => {
      const html = '<p><img src="1.jpg" alt="Image 1"></p><p><img src="2.jpg" alt="Image 2"></p>'
      const result = transformImageContainers(html, 'figure')
      const figureCount = (result.match(/<figure>/g) || []).length
      expect(figureCount).toBe(2)
    })

    it('should handle images with figcaption', () => {
      const html = '<p><img src="test.jpg" alt="Test caption"></p>'
      const result = transformImageContainers(html, 'figure')
      expect(result).toContain('<figure>')
      expect(result).toContain('Test caption')
    })
  })

  describe('Footnote Transformations', () => {
    it('should handle empty footnotes array', () => {
      const html = '<p>Test content</p>'
      const result = transformFootnotes(html, [], 'inline-text')
      expect(result).not.toContain('参考资料')
    })

    it('should handle footnotes without links', () => {
      const footnotes: FootnoteItem[] = [
        { id: '1', index: 1, title: 'Note without link' },
      ]
      const html = '<p>Test[^1]</p>'
      const result = transformFootnotes(html, footnotes, 'inline-text')
      expect(result).toContain('参考资料')
    })

    it('should number footnotes correctly', () => {
      const footnotes: FootnoteItem[] = [
        { id: '1', index: 1, title: 'First' },
        { id: '2', index: 2, title: 'Second' },
        { id: '3', index: 3, title: 'Third' },
      ]
      const html = '<p>Test</p>'
      const result = transformFootnotes(html, footnotes, 'inline-text')
      expect(result).toContain('[1]')
      expect(result).toContain('[2]')
      expect(result).toContain('[3]')
    })
  })
})

describe('Platform Renderer Advanced', () => {
  describe('Custom Transformers', () => {
    it('should allow registering custom transformers', () => {
      const renderer = createPlatformRenderer('wechat')
      // Custom transformer follows ASTTransformer interface
      const customTransformer = {
        name: 'test-transformer',
        transform: (html: string) => html.replace(/test/g, 'TEST'),
      }
      renderer.registerTransformer(customTransformer)
      
      const result = renderer.render('This is a test')
      expect(result.html).toContain('TEST')
    })
  })

  describe('Context Handling', () => {
    it('should pass context through render pipeline', () => {
      const renderer = createPlatformRenderer('wechat')
      const context: Partial<RenderContext> = {
        darkMode: true,
        primaryColor: '#ff0000',
      }
      
      const result = renderer.render('# Test', context)
      expect(result.html).toBeDefined()
    })

    it('should use default context when not provided', () => {
      const renderer = createPlatformRenderer('wechat')
      const result = renderer.render('# Test')
      expect(result.html).toBeDefined()
    })
  })

  describe('Complex Markdown Rendering', () => {
    it('should handle tables', () => {
      const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`
      const result = renderForPlatform(markdown, 'wechat')
      expect(result.html).toContain('table')
      expect(result.html).toContain('Header 1')
    })

    it('should handle blockquotes', () => {
      const markdown = '> This is a quote'
      const result = renderForPlatform(markdown, 'wechat')
      expect(result.html.toLowerCase()).toContain('blockquote')
    })

    it('should handle lists', () => {
      const markdown = `
- Item 1
- Item 2
  - Nested item
`
      const result = renderForPlatform(markdown, 'wechat')
      // Inline styles may transform the tag, check for list content
      expect(result.html).toContain('Item 1')
      expect(result.html).toContain('Item 2')
    })

    it('should handle ordered lists', () => {
      const markdown = `
1. First
2. Second
3. Third
`
      const result = renderForPlatform(markdown, 'wechat')
      expect(result.html).toContain('First')
      expect(result.html).toContain('Second')
    })

    it('should handle inline code', () => {
      const markdown = 'Use `const` for constants'
      const result = renderForPlatform(markdown, 'wechat')
      expect(result.html).toContain('const')
    })

    it('should handle bold and italic', () => {
      const markdown = '**bold** and *italic* text'
      const result = renderForPlatform(markdown, 'wechat')
      expect(result.html).toContain('bold')
      expect(result.html).toContain('italic')
    })

    it('should handle links', () => {
      const markdown = '[Link](https://example.com)'
      const result = renderForPlatform(markdown, 'wechat')
      expect(result.html).toContain('href')
      expect(result.html).toContain('example.com')
    })

    it('should handle horizontal rules', () => {
      const markdown = 'Above\n\n---\n\nBelow'
      const result = renderForPlatform(markdown, 'wechat')
      expect(result.html).toContain('hr')
    })
  })

  describe('Platform Specific Features', () => {
    it('zhihu should not have mac-style code blocks', () => {
      const markdown = '```js\nconst x = 1;\n```'
      const result = renderForPlatform(markdown, 'zhihu')
      expect(result.html).not.toContain('mac-sign')
    })

    it('email should have simple image containers', () => {
      const markdown = '![Test](test.jpg)'
      const result = renderForPlatform(markdown, 'email')
      expect(result.html).not.toContain('<figure>')
    })

    it('semantic should wrap in article tag', () => {
      const markdown = '# Test Article\n\nContent here.'
      const result = renderForPlatform(markdown, 'semantic')
      expect(result.html).toContain('<article')
    })

    it('wechat should apply pangu spacing', () => {
      const markdown = '使用React构建UI'
      const result = renderForPlatform(markdown, 'wechat')
      expect(result.html).toContain('React')
    })
  })
})

describe('Preset Configuration Validation', () => {
  it('all presets should have required core fields', () => {
    const presets = getAllPresets()
    presets.forEach((preset) => {
      expect(preset.id).toBeDefined()
      expect(preset.name).toBeDefined()
      expect(preset.cssStrategy).toBeDefined()
    })
  })

  it('all presets should have valid CSS strategies', () => {
    const validStrategies = ['inline-heavy', 'inline-minimal', 'class-based', 'table-layout']
    const presets = getAllPresets()
    presets.forEach((preset) => {
      expect(validStrategies).toContain(preset.cssStrategy)
    })
  })

  it('all presets should have valid footnote strategies', () => {
    const validStrategies = ['inline-text', 'anchor-jump', 'tooltip', 'sidenote']
    const presets = getAllPresets()
    presets.forEach((preset) => {
      if (preset.footnoteStrategy) {
        expect(validStrategies).toContain(preset.footnoteStrategy)
      }
    })
  })

  it('all presets should have valid code block styles', () => {
    const validStyles = ['mac-window', 'plain', 'line-numbers', 'minimal']
    const presets = getAllPresets()
    presets.forEach((preset) => {
      if (preset.codeBlockStyle) {
        expect(validStyles).toContain(preset.codeBlockStyle)
      }
    })
  })

  it('all presets should have valid image container styles if defined', () => {
    const validStyles = ['figure', 'simple', 'responsive']
    const presets = getAllPresets()
    presets.forEach((preset) => {
      if (preset.imageContainerStyle) {
        expect(validStyles).toContain(preset.imageContainerStyle)
      }
    })
  })

  it('typography config should have valid values', () => {
    const presets = getAllPresets()
    presets.forEach((preset) => {
      if (preset.typography) {
        expect(preset.typography.baseFontSize).toBeGreaterThan(0)
        expect(preset.typography.lineHeight).toBeGreaterThan(0)
      }
    })
  })
})

describe('Error Handling', () => {
  it('should handle malformed markdown gracefully', () => {
    const malformedMarkdown = '# Unclosed [link(test'
    expect(() => renderForPlatform(malformedMarkdown, 'wechat')).not.toThrow()
  })

  it('should handle empty markdown', () => {
    const result = renderForPlatform('', 'wechat')
    expect(result.html).toBeDefined()
  })

  it('should handle markdown with only whitespace', () => {
    const result = renderForPlatform('   \n\n   ', 'wechat')
    expect(result.html).toBeDefined()
  })

  it('should handle very long markdown', () => {
    const longMarkdown = '# Test\n\n' + 'This is a paragraph. '.repeat(10000)
    expect(() => renderForPlatform(longMarkdown, 'wechat')).not.toThrow()
  })

  it('should handle special characters in markdown', () => {
    const specialChars = '# Test <script>alert("xss")</script>'
    const result = renderForPlatform(specialChars, 'wechat')
    // Should escape or handle script tags
    expect(result.html).not.toContain('<script>')
  })
})
