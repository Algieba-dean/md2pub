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
})
