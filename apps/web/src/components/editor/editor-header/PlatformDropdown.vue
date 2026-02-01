<script setup lang="ts">
import { Globe, Mail, MessageSquare, Code, Edit, FileText, Settings } from 'lucide-vue-next'
import type { PlatformType } from '@md/shared/types/platform'
import { presetOptions } from '@md/core/platform/presets'

const props = withDefaults(defineProps<{
  asSub?: boolean
}>(), {
  asSub: false,
})

const emit = defineEmits<{
  (e: 'change', platform: PlatformType): void
}>()

const { asSub } = toRefs(props)

// 当前选中的平台
const currentPlatform = ref<PlatformType>('wechat')

// 平台图标映射
const platformIcons: Record<string, any> = {
  wechat: MessageSquare,
  zhihu: FileText,
  email: Mail,
  semantic: Globe,
  medium: Edit,
  devto: Code,
  custom: Settings,
}

function selectPlatform(platform: PlatformType) {
  currentPlatform.value = platform
  emit('change', platform)
}

function getIcon(value: string) {
  return platformIcons[value] || Globe
}

// 获取当前平台的显示名称
const currentPlatformLabel = computed(() => {
  const option = presetOptions.find(o => o.value === currentPlatform.value)
  return option?.label || '微信公众号'
})
</script>

<template>
  <!-- 作为 MenubarSub 使用 -->
  <MenubarSub v-if="asSub">
    <MenubarSubTrigger>
      <Globe class="mr-2 h-4 w-4" />
      输出目标
    </MenubarSubTrigger>
    <MenubarSubContent align="start" class="min-w-[200px]">
      <MenubarRadioGroup :model-value="currentPlatform">
        <MenubarRadioItem
          v-for="option in presetOptions"
          :key="option.value"
          :value="option.value"
          @click="selectPlatform(option.value as PlatformType)"
        >
          <component :is="getIcon(option.value)" class="mr-2 h-4 w-4" />
          <div class="flex flex-col">
            <span>{{ option.label }}</span>
            <span class="text-xs text-muted-foreground">{{ option.desc }}</span>
          </div>
        </MenubarRadioItem>
      </MenubarRadioGroup>
    </MenubarSubContent>
  </MenubarSub>

  <!-- 作为 MenubarMenu 使用（默认） -->
  <MenubarMenu v-else>
    <MenubarTrigger>
      <Globe class="mr-1 h-4 w-4" />
      {{ currentPlatformLabel }}
    </MenubarTrigger>
    <MenubarContent align="start" class="min-w-[220px]">
      <MenubarLabel class="text-xs text-muted-foreground px-2 py-1">
        选择输出目标平台
      </MenubarLabel>
      <MenubarSeparator />
      <MenubarRadioGroup :model-value="currentPlatform">
        <MenubarRadioItem
          v-for="option in presetOptions"
          :key="option.value"
          :value="option.value"
          class="flex items-start gap-2 py-2"
          @click="selectPlatform(option.value as PlatformType)"
        >
          <component :is="getIcon(option.value)" class="mt-0.5 h-4 w-4 shrink-0" />
          <div class="flex flex-col gap-0.5">
            <span class="font-medium">{{ option.label }}</span>
            <span class="text-xs text-muted-foreground">{{ option.desc }}</span>
          </div>
        </MenubarRadioItem>
      </MenubarRadioGroup>
    </MenubarContent>
  </MenubarMenu>
</template>
