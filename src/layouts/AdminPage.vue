<template>
  <div class="common-layout app-header">
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '250px'" class="app-side">
        <menu-page :isCollapse="isCollapse"/>
      </el-aside>
      <el-container>
        <el-header>
          <HeaderPage :toggleCollapse="toggleCollapse"/>
        </el-header>
        <el-main>
            <tag-list-page :isCollapse="isCollapse"/>
            <router-view>

            </router-view>
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

const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

</script>



<style scoped>

.app-side {
  @apply bg-gray-900 text-gray-100 shadow-md select-none min-h-screen;
}
</style>
