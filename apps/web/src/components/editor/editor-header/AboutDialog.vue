<script setup lang="ts">
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([`close`])

function onUpdate(val: boolean) {
  if (!val) {
    emit(`close`)
  }
}

const features = [
  { icon: '✨', title: '智能排版', desc: '一键美化，多平台适配' },
  { icon: '🎨', title: '主题定制', desc: '丰富主题，自由配色' },
  { icon: '☁️', title: '多图床', desc: '支持 12+ 种云存储' },
  { icon: '📱', title: '响应式', desc: '桌面移动全兼容' },
]
</script>

<template>
  <Dialog :open="props.visible" @update:open="onUpdate">
    <DialogContent class="max-w-md">
      <DialogHeader class="text-center">
        <DialogTitle class="text-xl font-bold">md2pub</DialogTitle>
        <p class="text-sm text-muted-foreground">Markdown 内容发布工具</p>
      </DialogHeader>

      <div class="grid grid-cols-2 gap-3 my-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <span class="text-2xl mb-1">{{ feature.icon }}</span>
          <span class="font-medium text-sm">{{ feature.title }}</span>
          <span class="text-xs text-muted-foreground">{{ feature.desc }}</span>
        </div>
      </div>

      <DialogFooter class="flex-col gap-2">
        <p class="text-xs text-center text-muted-foreground w-full">
          版本 2.0 · 让创作自然流动
        </p>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
