import type { BlogConfig, BlogPost, BlogStats, Category, PostFilter, PostMeta, PostStatus, Tag } from '@md/shared/types/blog'
import { v4 as uuidv4 } from 'uuid'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

/**
 * 博客本地管理 Store
 * md2pub 新增功能 - 支持草稿、分类、标签管理
 */
export const useBlogStore = defineStore('blog', () => {
  // ==================== 状态 ====================

  /** 文章列表 */
  const posts = store.reactive<BlogPost[]>(addPrefix('blog_posts'), [])

  /** 分类列表 */
  const categories = store.reactive<Category[]>(addPrefix('blog_categories'), [])

  /** 标签列表 */
  const tags = store.reactive<Tag[]>(addPrefix('blog_tags'), [])

  /** 博客配置 */
  const config = store.reactive<BlogConfig>(addPrefix('blog_config'), {
    autoSaveInterval: 30000,
    autoSaveEnabled: true,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    pageSize: 20,
  })

  /** 当前筛选条件 */
  const filter = ref<PostFilter>({
    status: 'all',
  })

  /** 当前编辑的文章 ID */
  const currentPostId = ref<string | null>(null)

  // ==================== 计算属性 ====================

  /** 博客统计 */
  const stats = computed<BlogStats>(() => ({
    totalPosts: posts.value.length,
    draftCount: posts.value.filter(p => p.status === 'draft').length,
    publishedCount: posts.value.filter(p => p.status === 'published').length,
    archivedCount: posts.value.filter(p => p.status === 'archived').length,
    totalWords: posts.value.reduce((sum, p) => sum + (p.wordCount || 0), 0),
    categoryCount: categories.value.length,
    tagCount: tags.value.length,
  }))

  /** 筛选后的文章列表 */
  const filteredPosts = computed(() => {
    let result = [...posts.value]

    // 状态筛选
    if (filter.value.status && filter.value.status !== 'all') {
      result = result.filter(p => p.status === filter.value.status)
    }

    // 分类筛选
    if (filter.value.category) {
      result = result.filter(p => p.category === filter.value.category)
    }

    // 标签筛选
    if (filter.value.tags && filter.value.tags.length > 0) {
      result = result.filter(p =>
        filter.value.tags!.some(tag => p.tags.includes(tag)),
      )
    }

    // 关键词搜索
    if (filter.value.keyword) {
      const keyword = filter.value.keyword.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(keyword)
        || p.content.toLowerCase().includes(keyword)
        || p.excerpt?.toLowerCase().includes(keyword),
      )
    }

    // 排序
    result.sort((a, b) => {
      const aVal = a[config.value.sortBy] || ''
      const bVal = b[config.value.sortBy] || ''
      const compare = aVal.localeCompare(bVal)
      return config.value.sortOrder === 'desc' ? -compare : compare
    })

    // 置顶文章排在前面
    result.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

    return result
  })

  /** 当前编辑的文章 */
  const currentPost = computed(() =>
    currentPostId.value
      ? posts.value.find(p => p.id === currentPostId.value)
      : null,
  )

  // ==================== 文章操作 ====================

  /** 创建新文章 */
  function createPost(title: string = '无标题文章'): BlogPost {
    const now = new Date().toISOString()
    const newPost: BlogPost = {
      id: uuidv4(),
      title,
      content: '',
      tags: [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    }
    posts.value.push(newPost)
    currentPostId.value = newPost.id
    return newPost
  }

  /** 更新文章 */
  function updatePost(id: string, updates: Partial<BlogPost>): boolean {
    const index = posts.value.findIndex(p => p.id === id)
    if (index === -1)
      return false

    posts.value[index] = {
      ...posts.value[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return true
  }

  /** 删除文章 */
  function deletePost(id: string): boolean {
    const index = posts.value.findIndex(p => p.id === id)
    if (index === -1)
      return false

    posts.value.splice(index, 1)
    if (currentPostId.value === id) {
      currentPostId.value = null
    }
    return true
  }

  /** 更新文章状态 */
  function updatePostStatus(id: string, status: PostStatus): boolean {
    const post = posts.value.find(p => p.id === id)
    if (!post)
      return false

    post.status = status
    post.updatedAt = new Date().toISOString()

    if (status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date().toISOString()
    }

    return true
  }

  /** 切换置顶状态 */
  function togglePin(id: string): boolean {
    const post = posts.value.find(p => p.id === id)
    if (!post)
      return false

    post.isPinned = !post.isPinned
    post.updatedAt = new Date().toISOString()
    return true
  }

  // ==================== 分类操作 ====================

  /** 创建分类 */
  function createCategory(name: string, description?: string, color?: string): Category {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      description,
      color,
      postCount: 0,
      createdAt: new Date().toISOString(),
    }
    categories.value.push(newCategory)
    return newCategory
  }

  /** 删除分类 */
  function deleteCategory(id: string): boolean {
    const index = categories.value.findIndex(c => c.id === id)
    if (index === -1)
      return false

    const category = categories.value[index]
    // 清除文章的分类引用
    posts.value.forEach((post) => {
      if (post.category === category.name) {
        post.category = undefined
      }
    })

    categories.value.splice(index, 1)
    return true
  }

  // ==================== 标签操作 ====================

  /** 创建标签 */
  function createTag(name: string, color?: string): Tag {
    const existing = tags.value.find(t => t.name === name)
    if (existing)
      return existing

    const newTag: Tag = {
      id: uuidv4(),
      name,
      color,
      postCount: 0,
    }
    tags.value.push(newTag)
    return newTag
  }

  /** 删除标签 */
  function deleteTag(id: string): boolean {
    const index = tags.value.findIndex(t => t.id === id)
    if (index === -1)
      return false

    const tag = tags.value[index]
    // 清除文章的标签引用
    posts.value.forEach((post) => {
      const tagIndex = post.tags.indexOf(tag.name)
      if (tagIndex !== -1) {
        post.tags.splice(tagIndex, 1)
      }
    })

    tags.value.splice(index, 1)
    return true
  }

  /** 更新标签统计 */
  function updateTagCounts(): void {
    tags.value.forEach((tag) => {
      tag.postCount = posts.value.filter(p => p.tags.includes(tag.name)).length
    })
  }

  /** 更新分类统计 */
  function updateCategoryCounts(): void {
    categories.value.forEach((category) => {
      category.postCount = posts.value.filter(p => p.category === category.name).length
    })
  }

  // ==================== 筛选操作 ====================

  /** 设置筛选条件 */
  function setFilter(newFilter: Partial<PostFilter>): void {
    filter.value = { ...filter.value, ...newFilter }
  }

  /** 重置筛选条件 */
  function resetFilter(): void {
    filter.value = { status: 'all' }
  }

  // ==================== 导入导出 ====================

  /** 导出所有数据 */
  function exportData(): string {
    return JSON.stringify({
      posts: posts.value,
      categories: categories.value,
      tags: tags.value,
      config: config.value,
      exportedAt: new Date().toISOString(),
    }, null, 2)
  }

  /** 导入数据 */
  function importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      if (data.posts)
        posts.value = data.posts
      if (data.categories)
        categories.value = data.categories
      if (data.tags)
        tags.value = data.tags
      if (data.config)
        Object.assign(config.value, data.config)
      return true
    }
    catch {
      return false
    }
  }

  return {
    // State
    posts,
    categories,
    tags,
    config,
    filter,
    currentPostId,

    // Computed
    stats,
    filteredPosts,
    currentPost,

    // Post Actions
    createPost,
    updatePost,
    deletePost,
    updatePostStatus,
    togglePin,

    // Category Actions
    createCategory,
    deleteCategory,

    // Tag Actions
    createTag,
    deleteTag,
    updateTagCounts,
    updateCategoryCounts,

    // Filter Actions
    setFilter,
    resetFilter,

    // Import/Export
    exportData,
    importData,
  }
})
