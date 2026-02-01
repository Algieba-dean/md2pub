/**
 * 常用片段管理功能
 * 允许用户保存和复用常用的文本片段
 */

export interface Snippet {
  id: string
  name: string
  content: string
  category: string
  shortcut?: string
  tags: string[]
  createdAt: number
  updatedAt: number
  usageCount: number
}

export interface SnippetCategory {
  id: string
  name: string
  icon?: string
  order: number
}

export interface SnippetsOptions {
  storageKey?: string
  categoriesKey?: string
  maxSnippets?: number
}

const DEFAULT_OPTIONS: Required<SnippetsOptions> = {
  storageKey: 'md2pub-snippets',
  categoriesKey: 'md2pub-snippet-categories',
  maxSnippets: 500,
}

const DEFAULT_CATEGORIES: SnippetCategory[] = [
  { id: 'intro', name: '开头引导', icon: '📝', order: 1 },
  { id: 'outro', name: '文末结语', icon: '🏁', order: 2 },
  { id: 'qrcode', name: '二维码', icon: '📱', order: 3 },
  { id: 'ad', name: '广告位', icon: '📢', order: 4 },
  { id: 'template', name: '模板', icon: '📋', order: 5 },
  { id: 'other', name: '其他', icon: '📁', order: 99 },
]

/**
 * 生成唯一 ID
 */
export function generateSnippetId(): string {
  return `snippet-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * 获取存储
 */
function getStorage(): Storage | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage
  }
  return null
}

/**
 * 获取所有片段
 */
export function getAllSnippets(options: SnippetsOptions = {}): Snippet[] {
  const { storageKey } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage()
  if (!storage) return []

  try {
    const data = storage.getItem(storageKey)
    return data ? JSON.parse(data) : []
  }
  catch {
    return []
  }
}

/**
 * 保存所有片段
 */
export function saveAllSnippets(snippets: Snippet[], options: SnippetsOptions = {}): void {
  const { storageKey, maxSnippets } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage()
  if (!storage) return

  // 限制数量
  const limitedSnippets = snippets.slice(0, maxSnippets)
  storage.setItem(storageKey, JSON.stringify(limitedSnippets))
}

/**
 * 创建新片段
 */
export function createSnippet(
  data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>,
  options: SnippetsOptions = {},
): Snippet {
  const snippet: Snippet = {
    ...data,
    id: generateSnippetId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    usageCount: 0,
  }

  const snippets = getAllSnippets(options)
  snippets.unshift(snippet)
  saveAllSnippets(snippets, options)

  return snippet
}

/**
 * 更新片段
 */
export function updateSnippet(
  id: string,
  updates: Partial<Omit<Snippet, 'id' | 'createdAt'>>,
  options: SnippetsOptions = {},
): Snippet | null {
  const snippets = getAllSnippets(options)
  const index = snippets.findIndex(s => s.id === id)

  if (index === -1) return null

  snippets[index] = {
    ...snippets[index],
    ...updates,
    updatedAt: Date.now(),
  }

  saveAllSnippets(snippets, options)
  return snippets[index]
}

/**
 * 删除片段
 */
export function deleteSnippet(id: string, options: SnippetsOptions = {}): boolean {
  const snippets = getAllSnippets(options)
  const filtered = snippets.filter(s => s.id !== id)

  if (filtered.length === snippets.length) return false

  saveAllSnippets(filtered, options)
  return true
}

/**
 * 获取单个片段
 */
export function getSnippetById(id: string, options: SnippetsOptions = {}): Snippet | null {
  const snippets = getAllSnippets(options)
  return snippets.find(s => s.id === id) || null
}

/**
 * 按分类获取片段
 */
export function getSnippetsByCategory(
  category: string,
  options: SnippetsOptions = {},
): Snippet[] {
  const snippets = getAllSnippets(options)
  return snippets.filter(s => s.category === category)
}

/**
 * 按标签搜索片段
 */
export function searchSnippetsByTag(
  tag: string,
  options: SnippetsOptions = {},
): Snippet[] {
  const snippets = getAllSnippets(options)
  const lowerTag = tag.toLowerCase()
  return snippets.filter(s =>
    s.tags.some(t => t.toLowerCase().includes(lowerTag)),
  )
}

/**
 * 搜索片段
 */
export function searchSnippets(
  query: string,
  options: SnippetsOptions = {},
): Snippet[] {
  const snippets = getAllSnippets(options)
  const lowerQuery = query.toLowerCase()

  return snippets.filter(s =>
    s.name.toLowerCase().includes(lowerQuery)
    || s.content.toLowerCase().includes(lowerQuery)
    || s.tags.some(t => t.toLowerCase().includes(lowerQuery)),
  )
}

/**
 * 记录片段使用
 */
export function recordSnippetUsage(id: string, options: SnippetsOptions = {}): void {
  const snippets = getAllSnippets(options)
  const index = snippets.findIndex(s => s.id === id)

  if (index !== -1) {
    snippets[index].usageCount++
    snippets[index].updatedAt = Date.now()
    saveAllSnippets(snippets, options)
  }
}

/**
 * 获取常用片段
 */
export function getFrequentSnippets(
  limit: number = 10,
  options: SnippetsOptions = {},
): Snippet[] {
  const snippets = getAllSnippets(options)
  return [...snippets]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
}

/**
 * 获取最近使用的片段
 */
export function getRecentSnippets(
  limit: number = 10,
  options: SnippetsOptions = {},
): Snippet[] {
  const snippets = getAllSnippets(options)
  return [...snippets]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, limit)
}

/**
 * 获取所有分类
 */
export function getAllCategories(options: SnippetsOptions = {}): SnippetCategory[] {
  const { categoriesKey } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage()
  if (!storage) return DEFAULT_CATEGORIES

  try {
    const data = storage.getItem(categoriesKey)
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES
  }
  catch {
    return DEFAULT_CATEGORIES
  }
}

/**
 * 保存分类
 */
export function saveCategories(
  categories: SnippetCategory[],
  options: SnippetsOptions = {},
): void {
  const { categoriesKey } = { ...DEFAULT_OPTIONS, ...options }
  const storage = getStorage()
  if (!storage) return

  storage.setItem(categoriesKey, JSON.stringify(categories))
}

/**
 * 添加分类
 */
export function addCategory(
  category: Omit<SnippetCategory, 'id'>,
  options: SnippetsOptions = {},
): SnippetCategory {
  const categories = getAllCategories(options)
  const newCategory: SnippetCategory = {
    ...category,
    id: `cat-${Date.now()}`,
  }

  categories.push(newCategory)
  saveCategories(categories, options)

  return newCategory
}

/**
 * 删除分类
 */
export function deleteCategory(id: string, options: SnippetsOptions = {}): boolean {
  const categories = getAllCategories(options)
  const filtered = categories.filter(c => c.id !== id)

  if (filtered.length === categories.length) return false

  saveCategories(filtered, options)

  // 将该分类下的片段移到"其他"
  const snippets = getAllSnippets(options)
  const updated = snippets.map(s =>
    s.category === id ? { ...s, category: 'other' } : s,
  )
  saveAllSnippets(updated, options)

  return true
}

/**
 * 导出片段
 */
export function exportSnippets(options: SnippetsOptions = {}): string {
  const snippets = getAllSnippets(options)
  const categories = getAllCategories(options)

  return JSON.stringify({
    version: 1,
    exportedAt: Date.now(),
    snippets,
    categories,
  }, null, 2)
}

/**
 * 导入片段
 */
export function importSnippets(
  jsonString: string,
  merge: boolean = true,
  options: SnippetsOptions = {},
): { imported: number; errors: string[] } {
  const errors: string[] = []
  let imported = 0

  try {
    const data = JSON.parse(jsonString)

    if (!data.snippets || !Array.isArray(data.snippets)) {
      errors.push('Invalid format: missing snippets array')
      return { imported, errors }
    }

    const existingSnippets = merge ? getAllSnippets(options) : []
    const existingIds = new Set(existingSnippets.map(s => s.id))

    for (const snippet of data.snippets) {
      if (!snippet.name || !snippet.content) {
        errors.push(`Skipped invalid snippet: ${snippet.name || 'unnamed'}`)
        continue
      }

      // 生成新 ID 如果已存在
      if (existingIds.has(snippet.id)) {
        snippet.id = generateSnippetId()
      }

      existingSnippets.push({
        ...snippet,
        createdAt: snippet.createdAt || Date.now(),
        updatedAt: Date.now(),
        usageCount: snippet.usageCount || 0,
        tags: snippet.tags || [],
        category: snippet.category || 'other',
      })
      imported++
    }

    saveAllSnippets(existingSnippets, options)

    // 导入分类
    if (data.categories && Array.isArray(data.categories)) {
      const existingCategories = getAllCategories(options)
      const existingCatIds = new Set(existingCategories.map(c => c.id))

      for (const cat of data.categories) {
        if (!existingCatIds.has(cat.id)) {
          existingCategories.push(cat)
        }
      }

      saveCategories(existingCategories, options)
    }
  }
  catch (e) {
    errors.push(`Parse error: ${e instanceof Error ? e.message : String(e)}`)
  }

  return { imported, errors }
}

/**
 * 按快捷键查找片段
 */
export function getSnippetByShortcut(
  shortcut: string,
  options: SnippetsOptions = {},
): Snippet | null {
  const snippets = getAllSnippets(options)
  return snippets.find(s => s.shortcut === shortcut) || null
}

/**
 * 预设片段模板
 */
export const PRESET_SNIPPETS: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>[] = [
  {
    name: '公众号引导关注',
    content: `> 👋 如果觉得文章不错，欢迎**点赞、收藏、转发**支持一下！
> 
> 🔔 关注公众号，第一时间获取更新推送！`,
    category: 'outro',
    tags: ['公众号', '引导', '关注'],
  },
  {
    name: '文章开头问候',
    content: `大家好，我是 **[作者名]**！

今天我们来聊聊...`,
    category: 'intro',
    tags: ['开头', '问候'],
  },
  {
    name: '技术文章免责声明',
    content: `---

**声明**：本文仅供学习交流，请勿用于非法用途。如有侵权，请联系删除。`,
    category: 'outro',
    tags: ['声明', '免责'],
  },
  {
    name: '代码仓库链接',
    content: `📦 **完整代码已上传至 GitHub**：[仓库地址](https://github.com/username/repo)

欢迎 Star ⭐️ 支持！`,
    category: 'template',
    tags: ['GitHub', '代码', '链接'],
  },
]

/**
 * 初始化预设片段
 */
export function initPresetSnippets(options: SnippetsOptions = {}): void {
  const snippets = getAllSnippets(options)

  // 如果已有片段，跳过初始化
  if (snippets.length > 0) return

  for (const preset of PRESET_SNIPPETS) {
    createSnippet(preset, options)
  }
}
