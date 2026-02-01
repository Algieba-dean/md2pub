/**
 * 平台预设配置
 * md2pub - 多平台差异化渲染引擎
 */

import type { PlatformPreset, PlatformType } from '@md/shared/types/platform'

/**
 * 微信公众号预设
 * 特点：强内联 CSS，脚注转文末文本，Mac 风格代码块
 */
export const wechatPreset: PlatformPreset = {
  id: 'wechat',
  name: '微信公众号',
  description: '适用于微信公众号文章发布，强内联样式，兼容性最佳',
  icon: 'wechat',

  cssStrategy: 'inline-heavy',
  footnoteStrategy: 'inline-text',
  codeBlockStyle: 'mac-window',
  imageStyle: 'figure',

  typography: {
    autoPanguSpacing: true,
    baseFontSize: 16,
    lineHeight: 1.75,
    paragraphSpacing: 1.5,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif',
    codeFontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
    useSerif: false,
    textIndent: false,
    textJustify: true,
  },

  compatibility: {
    removeScripts: true,
    removeIframes: true,
    removeObjects: true,
    svgToImage: false,
    mathToImage: true,
    disabledCSSProperties: ['position:fixed', 'position:sticky', 'animation', 'transition'],
  },

  semantic: {
    useArticle: false,
    useSection: true,
    useFigure: true,
    useHeaderFooter: false,
    addAriaLabels: false,
  },
}

/**
 * 知乎预设
 * 特点：强内联 CSS，类似微信但有些许差异
 */
export const zhihuPreset: PlatformPreset = {
  id: 'zhihu',
  name: '知乎',
  description: '适用于知乎专栏文章发布',
  icon: 'zhihu',

  cssStrategy: 'inline-heavy',
  footnoteStrategy: 'inline-text',
  codeBlockStyle: 'plain',
  imageStyle: 'figure',

  typography: {
    autoPanguSpacing: true,
    baseFontSize: 16,
    lineHeight: 1.8,
    paragraphSpacing: 1.5,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif',
    codeFontFamily: 'Menlo, Monaco, Consolas, monospace',
    useSerif: false,
    textIndent: false,
    textJustify: false,
  },

  compatibility: {
    removeScripts: true,
    removeIframes: true,
    removeObjects: true,
    svgToImage: true,
    mathToImage: false,
    disabledCSSProperties: ['position:fixed', 'position:sticky'],
  },

  semantic: {
    useArticle: false,
    useSection: false,
    useFigure: true,
    useHeaderFooter: false,
    addAriaLabels: false,
  },
}

/**
 * 邮件订阅预设
 * 特点：极简内联 CSS，表格布局可选，最大兼容性
 */
export const emailPreset: PlatformPreset = {
  id: 'email',
  name: '邮件订阅',
  description: '适用于邮件 Newsletter，兼容 Outlook 等客户端',
  icon: 'mail',

  cssStrategy: 'inline-minimal',
  footnoteStrategy: 'inline-text',
  codeBlockStyle: 'plain',
  imageStyle: 'simple',

  typography: {
    autoPanguSpacing: true,
    baseFontSize: 16,
    lineHeight: 1.6,
    paragraphSpacing: 1.2,
    fontFamily: 'Georgia, "Times New Roman", serif',
    codeFontFamily: 'Courier, monospace',
    useSerif: true,
    textIndent: false,
    textJustify: false,
  },

  compatibility: {
    removeScripts: true,
    removeIframes: true,
    removeObjects: true,
    svgToImage: true,
    mathToImage: true,
    maxImageWidth: 600,
    disabledCSSProperties: ['position', 'float', 'flex', 'grid', 'transform', 'animation'],
  },

  semantic: {
    useArticle: false,
    useSection: false,
    useFigure: false,
    useHeaderFooter: false,
    addAriaLabels: false,
  },
}

/**
 * 通用博客/语义化 Web 预设
 * 特点：纯净类名模式，语义化 HTML，无内联样式
 */
export const semanticPreset: PlatformPreset = {
  id: 'semantic',
  name: '通用博客',
  description: '适用于 Ghost/Hugo/WordPress 等博客平台，输出干净的语义化 HTML',
  icon: 'globe',

  cssStrategy: 'class-based',
  footnoteStrategy: 'anchor-jump',
  codeBlockStyle: 'minimal',
  imageStyle: 'figure',

  typography: {
    autoPanguSpacing: true,
    baseFontSize: 16,
    lineHeight: 1.8,
    paragraphSpacing: 1.5,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    codeFontFamily: 'ui-monospace, monospace',
    useSerif: false,
    textIndent: false,
    textJustify: false,
  },

  compatibility: {
    removeScripts: false,
    removeIframes: false,
    removeObjects: false,
    svgToImage: false,
    mathToImage: false,
    disabledCSSProperties: [],
  },

  semantic: {
    useArticle: true,
    useSection: true,
    useFigure: true,
    useHeaderFooter: true,
    addAriaLabels: true,
  },

  classPrefix: 'md2pub-',
}

/**
 * Medium / 掘金预设
 * 特点：最小内联 CSS，适配平台默认字体栈
 */
export const mediumPreset: PlatformPreset = {
  id: 'medium',
  name: 'Medium / 掘金',
  description: '适用于 Medium、掘金等内容平台',
  icon: 'edit',

  cssStrategy: 'inline-minimal',
  footnoteStrategy: 'anchor-jump',
  codeBlockStyle: 'plain',
  imageStyle: 'figure',

  typography: {
    autoPanguSpacing: true,
    baseFontSize: 18,
    lineHeight: 1.9,
    paragraphSpacing: 1.8,
    fontFamily: 'charter, Georgia, Cambria, "Times New Roman", serif',
    codeFontFamily: 'Menlo, Monaco, "Courier New", monospace',
    useSerif: true,
    textIndent: false,
    textJustify: false,
  },

  compatibility: {
    removeScripts: true,
    removeIframes: true,
    removeObjects: true,
    svgToImage: false,
    mathToImage: false,
    disabledCSSProperties: [],
  },

  semantic: {
    useArticle: false,
    useSection: true,
    useFigure: true,
    useHeaderFooter: false,
    addAriaLabels: false,
  },
}

/**
 * Dev.to / GitHub 预设
 * 特点：最小样式，让平台处理高亮
 */
export const devtoPreset: PlatformPreset = {
  id: 'devto',
  name: 'Dev.to / GitHub',
  description: '适用于 Dev.to、GitHub 等开发者平台',
  icon: 'code',

  cssStrategy: 'class-based',
  footnoteStrategy: 'anchor-jump',
  codeBlockStyle: 'minimal',
  imageStyle: 'simple',

  typography: {
    autoPanguSpacing: false,
    baseFontSize: 16,
    lineHeight: 1.7,
    paragraphSpacing: 1.2,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    codeFontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    useSerif: false,
    textIndent: false,
    textJustify: false,
  },

  compatibility: {
    removeScripts: false,
    removeIframes: false,
    removeObjects: false,
    svgToImage: false,
    mathToImage: false,
    disabledCSSProperties: [],
  },

  semantic: {
    useArticle: true,
    useSection: false,
    useFigure: false,
    useHeaderFooter: false,
    addAriaLabels: false,
  },
}

/**
 * 所有预设映射
 */
export const platformPresets: Record<PlatformType, PlatformPreset> = {
  wechat: wechatPreset,
  zhihu: zhihuPreset,
  email: emailPreset,
  semantic: semanticPreset,
  medium: mediumPreset,
  devto: devtoPreset,
  custom: { ...semanticPreset, id: 'custom', name: '自定义', description: '自定义配置' },
}

/**
 * 获取预设
 */
export function getPreset(id: PlatformType): PlatformPreset {
  return platformPresets[id] || platformPresets.wechat
}

/**
 * 获取所有预设列表
 */
export function getAllPresets(): PlatformPreset[] {
  return Object.values(platformPresets)
}

/**
 * 预设选项（用于 UI 下拉框）
 */
export const presetOptions = [
  { label: '微信公众号', value: 'wechat', desc: '强内联样式，兼容性最佳' },
  { label: '知乎', value: 'zhihu', desc: '知乎专栏适配' },
  { label: '邮件订阅', value: 'email', desc: '兼容 Outlook 等客户端' },
  { label: '通用博客', value: 'semantic', desc: 'Ghost/Hugo/WordPress' },
  { label: 'Medium / 掘金', value: 'medium', desc: '内容平台适配' },
  { label: 'Dev.to / GitHub', value: 'devto', desc: '开发者平台' },
  { label: '自定义', value: 'custom', desc: '自定义配置' },
] as const
