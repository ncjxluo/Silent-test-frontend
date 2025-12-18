<template>
  <el-dialog v-model="dialogVisible"
             :title="title"
             :width="width"
             draggable overflow
             @close="close">
    <slot></slot>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button :type="btype" @click="handleSubmit"> {{ confirmText }} </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const dialogVisible = ref(false)

  interface Props {
    title?: string
    width: number
    confirmText: string
    btype?: string
  }

  const props = defineProps<Props>()
  const payload = ref<any>(null)

  // 打开
  // const open = ()=> dialogVisible.value = true
  const open = (data?: any) => {
    payload.value = data
    dialogVisible.value = true
  }

  // 关闭
  const close = ()=>dialogVisible.value = false


  const emits = defineEmits([
    'confirm'
  ])

  const handleSubmit = () => {
    emits('confirm', payload.value)
  }

  defineExpose({
    open,
    close
  })

</script>

<style scoped></style>
