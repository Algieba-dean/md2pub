/**
 * 多平台差异化 Markdown 渲染引擎类型定义
 * md2pub 核心功能 - 全平台发布助手
 */

/**
 * 目标平台类型
 */
export type PlatformType =
  | 'wechat'      // 微信公众号
  | 'email'       // 邮件订阅
  | 'semantic'    // 通用博客 (Ghost/Hugo/WordPress)
  | 'medium'      // Medium / 掘金
  | 'zhihu'       // 知乎
  | 'devto'       // Dev.to / GitHub
  | 'custom'      // 自定义

/**
 * 样式注入策略
 */
export type CSSInjectionStrategy =
  | 'inline-heavy'   // 强内联模式 - 所有样式写入 style 属性
  | 'inline-minimal' // 最小内联 - 只内联必要样式
  | 'class-based'    // 纯净类名模式 - 不内联样式，只用 class
  | 'table-layout'   // 表格布局模式 - 用于邮件客户端兼容

/**
 * 脚注处理策略
 */
export type FootnoteStrategy =
  | 'inline-text'    // 文末文本列表（微信模式）
  | 'anchor-jump'    // 锚点跳转（标准 Web）
  | 'tooltip'        // 悬浮提示
  | 'sidenote'       // 边注

/**
 * 代码块样式
 */
export type CodeBlockStyle =
  | 'mac-window'     // Mac 风格窗口（带圆点）
  | 'plain'          // 纯净代码块
  | 'line-numbers'   // 带行号
  | 'minimal'        // 最小样式（让平台处理高亮）

/**
 * 图片容器样式
 */
export type ImageContainerStyle =
  | 'figure'         // <figure> + <figcaption>
  | 'simple'         // 简单 <img>
  | 'responsive'     // 响应式容器

/**
 * 排版规则配置
 */
export interface TypographyConfig {
  /** 中西文间距 - 使用 pangu.js 逻辑 */
  autoPanguSpacing: boolean
  /** 基础字号 (px) */
  baseFontSize: number
  /** 行高倍数 */
  lineHeight: number
  /** 段落间距 (em) */
  paragraphSpacing: number
  /** 字体栈 */
  fontFamily: string
  /** 代码字体栈 */
  codeFontFamily: string
  /** 是否使用衬线体 */
  useSerif: boolean
  /** 首行缩进 */
  textIndent: boolean
  /** 两端对齐 */
  textJustify: boolean
}

/**
 * 平台兼容性配置
 */
export interface CompatibilityConfig {
  /** 移除 script 标签 */
  removeScripts: boolean
  /** 移除 iframe 标签 */
  removeIframes: boolean
  /** 移除 object/embed 标签 */
  removeObjects: boolean
  /** SVG 转图片 */
  svgToImage: boolean
  /** 数学公式转图片 */
  mathToImage: boolean
  /** 最大图片宽度 */
  maxImageWidth?: number
  /** 禁用的 CSS 属性 */
  disabledCSSProperties: string[]
  /** 支持的 HTML 标签白名单 */
  allowedTags?: string[]
}

/**
 * 语义化 HTML 配置
 */
export interface SemanticConfig {
  /** 使用 article 标签包裹 */
  useArticle: boolean
  /** 使用 section 标签 */
  useSection: boolean
  /** 使用 figure 标签包裹图片 */
  useFigure: boolean
  /** 使用 header/footer */
  useHeaderFooter: boolean
  /** 添加 ARIA 属性 */
  addAriaLabels: boolean
}

/**
 * 平台预设配置
 */
export interface PlatformPreset {
  /** 预设 ID */
  id: PlatformType
  /** 显示名称 */
  name: string
  /** 描述 */
  description: string
  /** 图标 */
  icon?: string

  /** 样式注入策略 */
  cssStrategy: CSSInjectionStrategy
  /** 脚注处理策略 */
  footnoteStrategy: FootnoteStrategy
  /** 代码块样式 */
  codeBlockStyle: CodeBlockStyle
  /** 图片容器样式 */
  imageStyle: ImageContainerStyle

  /** 排版配置 */
  typography: TypographyConfig
  /** 兼容性配置 */
  compatibility: CompatibilityConfig
  /** 语义化配置 */
  semantic: SemanticConfig

  /** 自定义 CSS 变量 */
  cssVariables?: Record<string, string>
  /** 自定义类名前缀 */
  classPrefix?: string
}

/**
 * 渲染上下文 - 传递给各个处理器
 */
export interface RenderContext {
  /** 当前平台预设 */
  preset: PlatformPreset
  /** 脚注收集器 */
  footnotes: FootnoteItem[]
  /** 目录收集器 */
  toc: TocItem[]
  /** 图片收集器 */
  images: ImageItem[]
  /** 是否为暗色模式 */
  darkMode: boolean
  /** 主题色 */
  primaryColor: string
}

/**
 * 脚注项
 */
export interface FootnoteItem {
  id: string
  index: number
  title: string
  link: string
}

/**
 * 目录项
 */
export interface TocItem {
  id: string
  level: number
  text: string
}

/**
 * 图片项
 */
export interface ImageItem {
  src: string
  alt: string
  title?: string
}

/**
 * AST 转换器接口
 */
export interface ASTTransformer {
  name: string
  /** 优先级，数字越小越先执行 */
  priority: number
  /** 转换函数 */
  transform: (html: string, context: RenderContext) => string
}

/**
 * 平台渲染器 API
 */
export interface PlatformRendererAPI {
  /** 设置平台预设 */
  setPreset: (preset: PlatformType | PlatformPreset) => void
  /** 获取当前预设 */
  getPreset: () => PlatformPreset
  /** 获取所有可用预设 */
  getAllPresets: () => PlatformPreset[]
  /** 注册自定义转换器 */
  registerTransformer: (transformer: ASTTransformer) => void
  /** 渲染 Markdown 到目标平台 HTML */
  render: (markdown: string, options?: Partial<RenderContext>) => RenderResult
}

/**
 * 渲染结果
 */
export interface RenderResult {
  /** 渲染后的 HTML */
  html: string
  /** 提取的元数据 */
  meta: {
    title?: string
    description?: string
    tags?: string[]
    readingTime?: number
    wordCount?: number
  }
  /** 目录 */
  toc: TocItem[]
  /** 脚注 */
  footnotes: FootnoteItem[]
  /** 图片列表 */
  images: ImageItem[]
  /** 使用的平台预设 */
  preset: PlatformType
}
