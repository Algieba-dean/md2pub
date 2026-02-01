import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'

// 处理 ?raw 导入的插件
function rawPlugin() {
  return {
    name: 'raw-loader',
    transform(code: string, id: string) {
      if (id.endsWith('?raw')) {
        const filePath = id.replace('?raw', '')
        try {
          const content = readFileSync(filePath, 'utf-8')
          return `export default ${JSON.stringify(content)}`
        }
        catch {
          return `export default ''`
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [rawPlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'apps/web/src'),
      '@md/core': resolve(__dirname, 'packages/core/src'),
      '@md/shared': resolve(__dirname, 'packages/shared/src'),
    },
  },
})
