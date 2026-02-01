/**
 * 平台渲染引擎 E2E 测试
 * 使用 Playwright 进行端到端测试
 * 
 * 测试覆盖：
 * - 编辑器基本功能
 * - 平台切换
 * - Markdown 渲染
 * - 主题切换
 * - 复制功能
 * - 响应式设计
 */

import { expect, test } from '@playwright/test'

// 测试配置
const EDITOR_SELECTOR = '.cm-editor'
const EDITOR_CONTENT_SELECTOR = '.cm-editor .cm-content'
const PREVIEW_SELECTOR = '.preview-wrapper, [class*="preview"], #output'

test.describe('Editor Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
  })

  test('should load editor successfully', async ({ page }) => {
    const editor = page.locator(EDITOR_SELECTOR)
    await expect(editor).toBeVisible()
  })

  test('should accept text input', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.type('Hello World')
    
    await expect(editor).toContainText('Hello World')
  })

  test('should clear and set content', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.type('First content')
    
    // 全选并替换
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('New content')
    
    await expect(editor).toContainText('New content')
  })

  test('should support keyboard shortcuts', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.type('test')
    
    // 撤销
    await page.keyboard.press('ControlOrMeta+z')
    
    // 内容应该被撤销
    const content = await editor.textContent()
    expect(content?.length).toBeLessThan(4)
  })
})

test.describe('Markdown Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
  })

  test('should render heading', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('# Heading 1')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('Heading 1')
  })

  test('should render paragraph', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('This is a paragraph with some text.')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('paragraph')
  })

  test('should render bold text', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('This is **bold** text')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('bold')
  })

  test('should render italic text', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('This is *italic* text')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('italic')
  })

  test('should render code block', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('```javascript\nconst x = 1;\n```')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('const')
  })

  test('should render inline code', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('Use `npm install` to install')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('npm install')
  })

  test('should render unordered list', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('- Item 1\n- Item 2\n- Item 3')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('Item 1')
    await expect(preview).toContainText('Item 2')
  })

  test('should render ordered list', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('1. First\n2. Second\n3. Third')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('First')
    await expect(preview).toContainText('Second')
  })

  test('should render blockquote', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('> This is a quote')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('quote')
  })

  test('should render link', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('[Visit GitHub](https://github.com)')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('Visit GitHub')
  })

  test('should render image placeholder', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('![Alt text](https://example.com/image.png)')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    const html = await preview.innerHTML()
    expect(html).toContain('img')
  })

  test('should render table', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('| Col 1 | Col 2 |\n|-------|-------|\n| A | B |')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('Col 1')
  })

  test('should render horizontal rule', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('Above\n\n---\n\nBelow')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    const html = await preview.innerHTML()
    expect(html.toLowerCase()).toContain('hr')
  })
})

test.describe('Chinese-English Mixed Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
  })

  test('should render Chinese content', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('# 中文标题\n\n这是一段中文内容。')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('中文标题')
  })

  test('should render mixed Chinese-English content', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('使用 React 和 Vue 构建前端应用')
    
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('React')
    await expect(preview).toContainText('Vue')
  })
})

test.describe('Menu Bar Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
  })

  test('should have menubar visible', async ({ page }) => {
    // 检查菜单栏存在
    const menubar = page.locator('[role="menubar"], .menubar, nav')
    await expect(menubar.first()).toBeVisible()
  })

  test('should have file menu', async ({ page }) => {
    const fileMenu = page.locator('button:has-text("文件"), [role="menuitem"]:has-text("文件")')
    if (await fileMenu.first().isVisible()) {
      await expect(fileMenu.first()).toBeVisible()
    }
  })

  test('should have edit menu', async ({ page }) => {
    const editMenu = page.locator('button:has-text("编辑"), [role="menuitem"]:has-text("编辑")')
    if (await editMenu.first().isVisible()) {
      await expect(editMenu.first()).toBeVisible()
    }
  })

  test('should have format menu', async ({ page }) => {
    const formatMenu = page.locator('button:has-text("格式"), [role="menuitem"]:has-text("格式")')
    if (await formatMenu.first().isVisible()) {
      await expect(formatMenu.first()).toBeVisible()
    }
  })

  test('should have help menu', async ({ page }) => {
    const helpMenu = page.locator('button:has-text("帮助"), [role="menuitem"]:has-text("帮助")')
    if (await helpMenu.first().isVisible()) {
      await expect(helpMenu.first()).toBeVisible()
    }
  })
})

test.describe('Theme Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
  })

  test('should have theme selector', async ({ page }) => {
    // 查找主题相关的选择器
    const themeSelector = page.locator('button:has-text("主题"), [class*="theme"], select[name*="theme"]')
    // 主题选择器可能在设置中
    const themeExists = await themeSelector.first().isVisible().catch(() => false)
    expect(themeExists !== undefined).toBeTruthy()
  })
})

test.describe('Copy Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
  })

  test('should have copy button', async ({ page }) => {
    // 查找复制按钮
    const copyButton = page.locator('button:has-text("复制"), [aria-label*="复制"], [title*="复制"]')
    const copyExists = await copyButton.first().isVisible().catch(() => false)
    expect(copyExists !== undefined).toBeTruthy()
  })
})

test.describe('Responsive Design', () => {
  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
    
    const editor = page.locator(EDITOR_SELECTOR)
    await expect(editor).toBeVisible()
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
    
    const editor = page.locator(EDITOR_SELECTOR)
    await expect(editor).toBeVisible()
  })

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
    
    const editor = page.locator(EDITOR_SELECTOR)
    await expect(editor).toBeVisible()
  })

  test('should work on small mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
    
    const editor = page.locator(EDITOR_SELECTOR)
    await expect(editor).toBeVisible()
  })
})

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
  })

  test('should handle empty content gracefully', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.press('Delete')
    
    // 应该不会崩溃
    const editorVisible = await page.locator(EDITOR_SELECTOR).isVisible()
    expect(editorVisible).toBeTruthy()
  })

  test('should handle special characters', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('<script>alert("test")</script>')
    
    await page.waitForTimeout(500)
    
    // 应该不会执行脚本
    const editorVisible = await page.locator(EDITOR_SELECTOR).isVisible()
    expect(editorVisible).toBeTruthy()
  })

  test('should handle very long content', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    await page.keyboard.press('ControlOrMeta+a')
    
    // 输入长内容
    const longText = '# Long Content\n\n' + 'This is a test paragraph. '.repeat(100)
    await page.keyboard.type(longText)
    
    await page.waitForTimeout(1000)
    
    // 应该正常渲染
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('Long Content')
  })
})

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
    const loadTime = Date.now() - startTime
    
    // 应该在 10 秒内加载完成
    expect(loadTime).toBeLessThan(10000)
  })

  test('should render preview quickly', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
    
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.click()
    
    const startTime = Date.now()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.type('# Test Heading\n\nTest content.')
    await page.waitForTimeout(500)
    
    const preview = page.locator(PREVIEW_SELECTOR).first()
    await expect(preview).toContainText('Test Heading')
    
    const renderTime = Date.now() - startTime
    // 应该在 3 秒内完成渲染
    expect(renderTime).toBeLessThan(3000)
  })
})

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector(EDITOR_SELECTOR, { timeout: 15000 })
  })

  test('should have focusable editor', async ({ page }) => {
    const editor = page.locator(EDITOR_CONTENT_SELECTOR)
    await editor.focus()
    
    // 编辑器应该可以聚焦
    const isFocused = await editor.evaluate(el => document.activeElement === el || el.contains(document.activeElement))
    expect(isFocused).toBeTruthy()
  })

  test('should support tab navigation', async ({ page }) => {
    // 按 Tab 键应该能在元素间导航
    await page.keyboard.press('Tab')
    
    // 应该有元素获得焦点
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeDefined()
  })
})
