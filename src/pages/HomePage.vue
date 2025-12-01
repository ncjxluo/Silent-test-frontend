<template>
  <div>{{ data.message }} 但是我的主要功能还没有时间实现....</div>
</template>

<script setup lang="ts">
import { root } from '@/api/manager'
import { ref,reactive,onMounted } from 'vue'

const data = reactive({
  message: '' // 初始值
})


onMounted(async () => {
  try {
    const root1 = await root()
    // 将返回的数据赋值给响应式对象
    Object.assign(data, root1.data)
  } catch (error) {
    console.error('请求失败:', error)
  }
})

</script>

<style scoped></style>
