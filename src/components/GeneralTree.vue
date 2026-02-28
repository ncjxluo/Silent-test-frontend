<template>
  <div
    v-show="visible"
    class="context-menu"
    :style="{ left: x + 'px', top: y + 'px' }"
  >
    <el-card shadow="hover" body-style="padding: 4px 0">
      <div
        v-for="item in actions"
        :key="item.key"
        class="menu-item"
        :class="{ danger: item.danger }"
        @click="onClick(item)"
      >
        {{ item.label }}
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

export interface ContextMenuAction {
  key: string
  label: string
  danger?: boolean
}

defineProps<{
  visible: boolean
  x: number
  y: number
  actions: ContextMenuAction[]
}>()

const emit = defineEmits<{
  (e: 'select', key: string): void
  (e: 'close'): void
}>()

const onClick = (item: ContextMenuAction) => {
  emit('select', item.key)
  emit('close')
}

// 点击页面其他地方关闭
const handleClickOutside = () => {
  emit('close')
}

document.addEventListener('click', handleClickOutside)

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 3000;
  min-width: 140px;
}

.menu-item {
  padding: 6px 14px;
  cursor: pointer;
  font-size: 14px;
}

.menu-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.menu-item.danger {
  color: var(--el-color-danger);
}
</style>

