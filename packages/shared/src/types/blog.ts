/**
 * 博客本地管理类型定义
 * md2pub 新增功能
 */

/**
 * 博客文章状态
 */
export type PostStatus = 'draft' | 'published' | 'archived'

/**
 * 博客文章元数据
 */
export interface PostMeta {
  /** 唯一标识 */
  id: string
  /** 文章标题 */
  title: string
  /** 文章摘要 */
  excerpt?: string
  /** 分类 */
  category?: string
  /** 标签列表 */
  tags: string[]
  /** 文章状态 */
  status: PostStatus
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 发布时间 */
  publishedAt?: string
  /** 字数统计 */
  wordCount?: number
  /** 预计阅读时间（分钟） */
  readingTime?: number
  /** 封面图片 */
  coverImage?: string
  /** 是否置顶 */
  isPinned?: boolean
}

/**
 * 博客文章完整数据
 */
export interface BlogPost extends PostMeta {
  /** Markdown 内容 */
  content: string
  /** 渲染后的 HTML */
  html?: string
}

/**
 * 博客分类
 */
export interface Category {
  /** 分类 ID */
  id: string
  /** 分类名称 */
  name: string
  /** 分类描述 */
  description?: string
  /** 分类颜色 */
  color?: string
  /** 文章数量 */
  postCount: number
  /** 创建时间 */
  createdAt: string
}

/**
 * 博客标签
 */
export interface Tag {
  /** 标签 ID */
  id: string
  /** 标签名称 */
  name: string
  /** 标签颜色 */
  color?: string
  /** 文章数量 */
  postCount: number
}

/**
 * 博客配置
 */
export interface BlogConfig {
  /** 默认分类 */
  defaultCategory?: string
  /** 自动保存间隔（毫秒） */
  autoSaveInterval: number
  /** 是否启用自动保存 */
  autoSaveEnabled: boolean
  /** 排序方式 */
  sortBy: 'createdAt' | 'updatedAt' | 'title'
  /** 排序顺序 */
  sortOrder: 'asc' | 'desc'
  /** 每页显示数量 */
  pageSize: number
}

/**
 * 博客筛选条件
 */
export interface PostFilter {
  /** 状态筛选 */
  status?: PostStatus | 'all'
  /** 分类筛选 */
  category?: string
  /** 标签筛选 */
  tags?: string[]
  /** 搜索关键词 */
  keyword?: string
  /** 时间范围开始 */
  dateFrom?: string
  /** 时间范围结束 */
  dateTo?: string
}

/**
 * 博客统计数据
 */
export interface BlogStats {
  /** 总文章数 */
  totalPosts: number
  /** 草稿数 */
  draftCount: number
  /** 已发布数 */
  publishedCount: number
  /** 归档数 */
  archivedCount: number
  /** 总字数 */
  totalWords: number
  /** 分类数 */
  categoryCount: number
  /** 标签数 */
  tagCount: number
}
