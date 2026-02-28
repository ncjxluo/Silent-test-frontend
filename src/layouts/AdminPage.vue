<template>
  <div class="common-layout app-header">
    <el-container style="height: 100vh; display: flex;">
      <el-aside :width="isCollapse ? '64px' : '250px'" class="app-side">
        <menu-page :isCollapse="isCollapse"/>
      </el-aside>
      <el-container style="flex: 1; display: flex; flex-direction: column;">
        <el-header style="height: 60px; padding: 0; flex-shrink: 0;">
          <HeaderPage :toggleCollapse="toggleCollapse"/>
        </el-header>
        <el-main style="padding: 0; flex: 1; overflow: hidden;">
            <tag-list-page :isCollapse="isCollapse"/>
            <div class="content-wrapper" :style="{height: '100%',padding: '16px',boxSizing: 'border-box'}">
              <router-view :key="route.fullPath"></router-view>
            </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import HeaderPage from '@/layouts/components/HeaderPage.vue'
import MenuPage from '@/layouts/components/MenuPage.vue'
import TagListPage from '@/layouts/components/TagListPage.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

</script>

<style scoped>

.app-side {
  @apply bg-gray-900 text-gray-100 shadow-md select-none min-h-screen;
  height: 100vh; /* 用height替代min-height，避免高度溢出 */
}

.content-wrapper {
  /* @apply bg-white;
  margin-top: 44px !important; */
  @apply bg-white p-4 box-border;
  margin-top: 44px;
  height: calc(100% - 44px); /* 精确扣除tab栏高度 */
  overflow-y: auto; /* 内容超出时允许垂直滚动 */
  overflow-x: auto; /* 处理横向溢出 */
}
</style>
