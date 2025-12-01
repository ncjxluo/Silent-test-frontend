<template>
  <header :class="{ 'app-header': !isCollapse, 'app-header-hide': isCollapse }">
    <span v-if="!isCollapse" class="logo">
      <el-icon class="logo-icon">
        <ElemeFilled />
      </el-icon>
      <span class="logo-text">Silent TR</span>
    </span>
    <span v-else class="logo">
      <el-icon class="logo-icon">
        <ElemeFilled />
      </el-icon>
    </span>
  </header>
  <div class="f-menu" :style="{ width: div_width }">
    <el-menu
      class="border-0"
      active-text-color="#ffd04b"
      background-color="#111827"
      text-color="#fff"
      :collapse="isCollapse"
      :collapse-transition="false"

      unique-opened
      router
    >
      <template v-for="item in menuTree" :key="item.menu_key">
        <el-sub-menu v-if="item.children?.length " :index="item.menu_path">
          <template #title>
            <el-icon>
              <Icon :icon="item.menu_icon || 'default-icon'" class="mr-2 text-1xl"></Icon>
            </el-icon>
            <span>
              {{ item.menu_name }}
            </span>
          </template>
          <el-menu-item
            v-for="child in item.children"
            :key="child.menu_key"
            :index="getPath(item.menu_path, child.menu_path)"
          >
            <el-icon>
              <Icon :icon="child.menu_icon || 'default-icon'" class="mr-2 text-1xl"></Icon>
            </el-icon>
            <span>
              {{ child.menu_name }}
            </span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item v-else :index="item.menu_path">
          <el-icon>
            <Icon :icon="item.menu_icon || 'default-icon'" class="mr-2 text-1xl"></Icon>
          </el-icon>
          <span>
            {{ item.menu_name }}
          </span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { ElemeFilled } from '@element-plus/icons-vue'
import { defineProps, onMounted,ref } from 'vue'
import type { MenuItem } from '@/types/menu_type.ts'
import { useMenu } from '@/hooks/useMenu.ts'
import { Icon } from '@iconify/vue'
import { computed } from 'vue'


const menuTree = ref<MenuItem[]>([])

const props = defineProps({
  isCollapse: Boolean,
})

const { buildTree, filterTree, fetchMenu } = useMenu()

const div_width = computed(() => (props.isCollapse ? '64px' : '250px'))

const getPath = (parentPath:string, childPath:string) => {
  // 拼接完整路径并处理双斜杠
  return `/${parentPath}/${childPath}`.replace(/\/\//g, '/')
}

onMounted(async () => {
  try {
    let menus = await fetchMenu()
    let menus_tree = buildTree(menus)
    menuTree.value = filterTree(menus_tree)
    // addDynamicRoutes(menuTree.value)
  } catch (error) {
    console.error('请求失败:', error)
  }
})

</script>

<style scoped>
.app-header {
  position: sticky;
  @apply flex items-center pr-4 h-14 bg-gray-900 text-gray-100 shadow-md select-none;
}

.app-header-hide {
  @apply flex items-center pl-1 h-14 bg-gray-900 text-gray-100 shadow-md select-none;
}

.logo {
  @apply flex items-center font-semibold text-lg tracking-wide;
}

.logo-icon {
  @apply text-amber-400 mr-2 text-xl;
}

.logo-text {
  @apply text-white hover:text-amber-300 transition-colors duration-200;
}

.f-menu {
  top: 64px;
  bottom: 0;
  left: 0;
  overflow: auto;
  overflow-x: hidden;
  @apply shadow-md fixed bg-gray-900;
}
</style>
