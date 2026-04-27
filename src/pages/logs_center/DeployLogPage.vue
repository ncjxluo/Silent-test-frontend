<template>
  <div class="bg-gray-100 p-4" style="height: 100%">
    <!-- 顶部搜索区 -->
    <div class="bg-white p-4 rounded mb-4 flex items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="text-gray-700">部署应用：</span>
        <el-input v-model="app_name" placeholder="请输入" class="w-64" style="width: 150px" />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-700">部署时间：</span>
        <el-date-picker
          v-model="select_time"
          type="daterange"
          range-separator="To"
          start-placeholder="Start date"
          end-placeholder="End date"
          size="default"
        />
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-700">虚机名称：</span>
        <el-input v-model="vm_name" placeholder="请输入" class="w-64" style="width: 150px" />
      </div>
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="search"> 搜索 </el-button>
      </div>
    </div>
    <!-- 应用列表区 -->
    <div class="bg-white rounded p-4"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const app_name = ref('')
const select_time = ref('')
const vm_name = ref('')

const search = async () => {}


onMounted(() => {

})
</script>

<style scoped></style>
