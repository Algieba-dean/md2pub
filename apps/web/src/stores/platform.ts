/**
 * 平台渲染 Store
 * 管理输出目标平台的状态
 */

import type { PlatformPreset, PlatformType, RenderResult } from '@md/shared/types/platform'
import { createPlatformRenderer, getPreset } from '@md/core/platform'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

export const usePlatformStore = defineStore('platform', () => {
  // ==================== 状态 ====================

  /** 当前选中的平台 */
  const currentPlatform = store.ref<PlatformType>(addPrefix('output_platform'), 'wechat')

  /** 暗色模式 */
  const darkMode = ref(false)

  /** 主题色 */
  const primaryColor = ref('#1a73e8')

  /** 最后一次渲染结果 */
  const lastRenderResult = ref<RenderResult | null>(null)

  // ==================== 计算属性 ====================

  /** 当前平台预设 */
  const currentPreset = computed<PlatformPreset>(() => {
    return getPreset(currentPlatform.value)
  })

  /** 当前平台名称 */
  const currentPlatformName = computed(() => {
    return currentPreset.value.name
  })

  /** 当前 CSS 策略 */
  const currentCSSStrategy = computed(() => {
    return currentPreset.value.cssStrategy
  })

  /** 是否使用内联样式 */
  const useInlineStyles = computed(() => {
    return currentPreset.value.cssStrategy === 'inline-heavy'
      || currentPreset.value.cssStrategy === 'inline-minimal'
  })

  // ==================== 渲染器 ====================

  const renderer = createPlatformRenderer(currentPlatform.value)

  // ==================== 方法 ====================

  /**
   * 设置平台
   */
  function setPlatform(platform: PlatformType) {
    currentPlatform.value = platform
    renderer.setPreset(platform)
  }

  /**
   * 设置暗色模式
   */
  function setDarkMode(dark: boolean) {
    darkMode.value = dark
  }

  /**
   * 设置主题色
   */
  function setPrimaryColor(color: string) {
    primaryColor.value = color
  }

  /**
   * 渲染 Markdown
   */
  function render(markdown: string): RenderResult {
    const result = renderer.render(markdown, {
      darkMode: darkMode.value,
      primaryColor: primaryColor.value,
    })
    lastRenderResult.value = result
    return result
  }

  /**
   * 获取当前预设的完整配置
   */
  function getPresetConfig(): PlatformPreset {
    return renderer.getPreset()
  }

  /**
   * 重置为默认平台
   */
  function reset() {
    currentPlatform.value = 'wechat'
    renderer.setPreset('wechat')
  }

  return {
    // State
    currentPlatform,
    darkMode,
    primaryColor,
    lastRenderResult,

    // Computed
    currentPreset,
    currentPlatformName,
    currentCSSStrategy,
    useInlineStyles,

    // Methods
    setPlatform,
    setDarkMode,
    setPrimaryColor,
    render,
    getPresetConfig,
    reset,
  }
})
