import { describe, expect, it } from 'vitest'
import { baseCSSContent, themeMap } from '@md/shared/configs/theme'

describe('Theme System', () => {
  describe('Theme Map', () => {
    it('should have base CSS content', () => {
      expect(baseCSSContent).toBeDefined()
      expect(typeof baseCSSContent).toBe('string')
      expect(baseCSSContent.length).toBeGreaterThan(0)
    })

    it('should have default theme', () => {
      expect(themeMap.default).toBeDefined()
      expect(typeof themeMap.default).toBe('string')
    })

    it('should have grace theme', () => {
      expect(themeMap.grace).toBeDefined()
      expect(typeof themeMap.grace).toBe('string')
    })

    it('should have simple theme', () => {
      expect(themeMap.simple).toBeDefined()
      expect(typeof themeMap.simple).toBe('string')
    })
  })

  describe('Theme CSS Content', () => {
    it('default theme should contain h1 styles', () => {
      expect(themeMap.default).toContain('h1')
    })

    it('default theme should contain h2 styles', () => {
      expect(themeMap.default).toContain('h2')
    })

    it('default theme should use CSS variables', () => {
      expect(themeMap.default).toContain('var(--md-primary-color)')
    })
  })
})
