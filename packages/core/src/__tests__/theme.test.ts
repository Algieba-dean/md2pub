import { describe, expect, it } from 'vitest'
import { themeOptions, themeOptionsMap } from '@md/shared/configs/theme'

describe('Theme System', () => {
  describe('Theme Options', () => {
    it('should have theme options defined', () => {
      expect(themeOptions).toBeDefined()
      expect(Array.isArray(themeOptions)).toBe(true)
      expect(themeOptions.length).toBeGreaterThan(0)
    })

    it('should have default theme option', () => {
      const defaultTheme = themeOptions.find(t => t.value === 'default')
      expect(defaultTheme).toBeDefined()
      expect(defaultTheme?.label).toBe('经典')
    })

    it('should have grace theme option', () => {
      const graceTheme = themeOptions.find(t => t.value === 'grace')
      expect(graceTheme).toBeDefined()
      expect(graceTheme?.label).toBe('优雅')
    })

    it('should have simple theme option', () => {
      const simpleTheme = themeOptions.find(t => t.value === 'simple')
      expect(simpleTheme).toBeDefined()
      expect(simpleTheme?.label).toBe('简洁')
    })

    it('should have minimal theme option', () => {
      const minimalTheme = themeOptions.find(t => t.value === 'minimal')
      expect(minimalTheme).toBeDefined()
      expect(minimalTheme?.label).toBe('极简')
    })

    it('should have tech theme option', () => {
      const techTheme = themeOptions.find(t => t.value === 'tech')
      expect(techTheme).toBeDefined()
      expect(techTheme?.label).toBe('技术')
    })
  })

  describe('Theme Options Map', () => {
    it('should have all themes in options map', () => {
      expect(themeOptionsMap.default).toBeDefined()
      expect(themeOptionsMap.grace).toBeDefined()
      expect(themeOptionsMap.simple).toBeDefined()
      expect(themeOptionsMap.minimal).toBeDefined()
      expect(themeOptionsMap.tech).toBeDefined()
    })

    it('should have correct structure for each theme', () => {
      Object.values(themeOptionsMap).forEach((theme) => {
        expect(theme).toHaveProperty('label')
        expect(theme).toHaveProperty('value')
        expect(typeof theme.label).toBe('string')
        expect(typeof theme.value).toBe('string')
      })
    })
  })
})
