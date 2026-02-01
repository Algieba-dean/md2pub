/**
 * 本地历史回溯功能
 * 使用 IndexedDB 存储编辑历史，支持"时光机"回滚
 */

export interface HistoryEntry {
  id: string
  content: string
  timestamp: number
  title?: string
  wordCount: number
  checksum: string
}

export interface HistoryOptions {
  dbName?: string
  storeName?: string
  maxEntries?: number
  autoSaveInterval?: number
  minChangeThreshold?: number
}

const DEFAULT_OPTIONS: Required<HistoryOptions> = {
  dbName: 'md2pub-history',
  storeName: 'documents',
  maxEntries: 100,
  autoSaveInterval: 30000,
  minChangeThreshold: 10,
}

let db: IDBDatabase | null = null

/**
 * 计算内容校验和
 */
export function calculateChecksum(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * 计算字数
 */
export function countWords(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = content.replace(/[\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0).length
  return chineseChars + englishWords
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * 初始化 IndexedDB
 */
export async function initHistoryDB(options: HistoryOptions = {}): Promise<IDBDatabase> {
  const { dbName, storeName } = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'))
      return
    }

    const request = indexedDB.open(dbName, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(storeName)) {
        const store = database.createObjectStore(storeName, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('checksum', 'checksum', { unique: false })
      }
    }
  })
}

/**
 * 获取数据库实例
 */
export async function getDB(options: HistoryOptions = {}): Promise<IDBDatabase> {
  if (db) return db
  return initHistoryDB(options)
}

/**
 * 保存历史记录
 */
export async function saveHistory(
  content: string,
  title?: string,
  options: HistoryOptions = {},
): Promise<HistoryEntry> {
  const { storeName, maxEntries, minChangeThreshold } = { ...DEFAULT_OPTIONS, ...options }
  const database = await getDB(options)

  const checksum = calculateChecksum(content)
  const wordCount = countWords(content)

  // 检查是否与最近的记录相同
  const latestEntries = await getRecentHistory(1, options)
  if (latestEntries.length > 0) {
    const latest = latestEntries[0]
    if (latest.checksum === checksum) {
      return latest
    }
    // 检查变化是否足够大
    const charDiff = Math.abs(content.length - (latest.wordCount || 0))
    if (charDiff < minChangeThreshold) {
      return latest
    }
  }

  const entry: HistoryEntry = {
    id: generateId(),
    content,
    timestamp: Date.now(),
    title,
    wordCount,
    checksum,
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)

    const request = store.add(entry)
    request.onsuccess = async () => {
      // 清理旧记录
      await cleanupOldEntries(maxEntries, options)
      resolve(entry)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 获取最近的历史记录
 */
export async function getRecentHistory(
  limit: number = 10,
  options: HistoryOptions = {},
): Promise<HistoryEntry[]> {
  const { storeName } = { ...DEFAULT_OPTIONS, ...options }
  const database = await getDB(options)

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index('timestamp')

    const entries: HistoryEntry[] = []
    const request = index.openCursor(null, 'prev')

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor && entries.length < limit) {
        entries.push(cursor.value)
        cursor.continue()
      }
      else {
        resolve(entries)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 获取指定时间范围的历史记录
 */
export async function getHistoryByTimeRange(
  startTime: number,
  endTime: number,
  options: HistoryOptions = {},
): Promise<HistoryEntry[]> {
  const { storeName } = { ...DEFAULT_OPTIONS, ...options }
  const database = await getDB(options)

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index('timestamp')
    const range = IDBKeyRange.bound(startTime, endTime)

    const entries: HistoryEntry[] = []
    const request = index.openCursor(range, 'prev')

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        entries.push(cursor.value)
        cursor.continue()
      }
      else {
        resolve(entries)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 获取指定 ID 的历史记录
 */
export async function getHistoryById(
  id: string,
  options: HistoryOptions = {},
): Promise<HistoryEntry | null> {
  const { storeName } = { ...DEFAULT_OPTIONS, ...options }
  const database = await getDB(options)

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

/**
 * 删除指定 ID 的历史记录
 */
export async function deleteHistory(
  id: string,
  options: HistoryOptions = {},
): Promise<void> {
  const { storeName } = { ...DEFAULT_OPTIONS, ...options }
  const database = await getDB(options)

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * 清理旧的历史记录
 */
export async function cleanupOldEntries(
  maxEntries: number,
  options: HistoryOptions = {},
): Promise<number> {
  const { storeName } = { ...DEFAULT_OPTIONS, ...options }
  const database = await getDB(options)

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const index = store.index('timestamp')

    const countRequest = store.count()
    countRequest.onsuccess = () => {
      const count = countRequest.result
      if (count <= maxEntries) {
        resolve(0)
        return
      }

      const deleteCount = count - maxEntries
      let deleted = 0

      const cursorRequest = index.openCursor()
      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor && deleted < deleteCount) {
          cursor.delete()
          deleted++
          cursor.continue()
        }
        else {
          resolve(deleted)
        }
      }
      cursorRequest.onerror = () => reject(cursorRequest.error)
    }
    countRequest.onerror = () => reject(countRequest.error)
  })
}

/**
 * 清空所有历史记录
 */
export async function clearAllHistory(options: HistoryOptions = {}): Promise<void> {
  const { storeName } = { ...DEFAULT_OPTIONS, ...options }
  const database = await getDB(options)

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * 获取历史记录统计
 */
export async function getHistoryStats(options: HistoryOptions = {}): Promise<{
  totalEntries: number
  oldestTimestamp: number | null
  newestTimestamp: number | null
}> {
  const { storeName } = { ...DEFAULT_OPTIONS, ...options }
  const database = await getDB(options)

  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index('timestamp')

    const countRequest = store.count()
    let oldest: number | null = null
    let newest: number | null = null

    // Get oldest
    const oldestRequest = index.openCursor()
    oldestRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        oldest = cursor.value.timestamp
      }
    }

    // Get newest
    const newestRequest = index.openCursor(null, 'prev')
    newestRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        newest = cursor.value.timestamp
      }
    }

    transaction.oncomplete = () => {
      resolve({
        totalEntries: countRequest.result,
        oldestTimestamp: oldest,
        newestTimestamp: newest,
      })
    }
    transaction.onerror = () => reject(transaction.error)
  })
}

/**
 * 格式化时间戳为可读字符串
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp

  // 1分钟内
  if (diff < 60000) {
    return '刚刚'
  }
  // 1小时内
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  }
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  // 其他
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 自动保存管理器
 */
export class AutoSaveManager {
  private intervalId: ReturnType<typeof setInterval> | null = null
  private lastContent: string = ''
  private options: Required<HistoryOptions>

  constructor(options: HistoryOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  start(getContent: () => string, getTitle?: () => string): void {
    if (this.intervalId) return

    this.intervalId = setInterval(async () => {
      const content = getContent()
      if (content !== this.lastContent) {
        await saveHistory(content, getTitle?.(), this.options)
        this.lastContent = content
      }
    }, this.options.autoSaveInterval)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  async saveNow(content: string, title?: string): Promise<HistoryEntry> {
    this.lastContent = content
    return saveHistory(content, title, this.options)
  }
}
