<template>
  <div class="f-header">
    <el-tooltip effect="dark" content="收起" placement="bottom">
      <el-icon class="icon-btn" @click="toggleCollapse"><Fold /></el-icon>
    </el-tooltip>
    <el-tooltip effect="dark" content="刷新" placement="bottom">
      <el-icon class="icon-btn" @click="handleRefresh"><Refresh /></el-icon>
    </el-tooltip>
    <div class="ml-auto flex items-center">
      <el-dropdown class="dropdown" @command="handleCommand">
        <span class="flex items-center text-dark-50">
          <el-avatar class="mr-2" :size="25" :src="user_url" />
          {{ username }}
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="rePassword">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Fold, Refresh, ArrowDown } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { config } from '@/utils/config.ts'

const authStore = useAuthStore()

const username = ref('')

const user_url = ref('')
defineProps<{ toggleCollapse: () => void }>()


onMounted(async () => {
   username.value = localStorage.getItem('username') || ''

  const conf = await config.getConfig()
  const baseUrl = conf.baseUrl
  user_url.value = baseUrl + localStorage.getItem('user_url')
})



const handleRefresh = () => location.reload()

const handleCommand = (c: any) => {
  switch (c) {
    case 'logout':
      handleLogout()
      break
    case 'rePassword':
      console.log('修改密码')
      break
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定退出登录?', '退出登录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    authStore.logout()
  })
}
</script>

<style>
.f-header {
  @apply flex items-center bg-light-100 text-dark-50 top-0 left-0 right-0;
  height: 60px;
}

.logo {
  width: 250px;
  @apply flex justify-center items-center text-xl font-thin;
}

.icon-btn {
  @apply flex justify-center items-center;
  width: 42px;
  height: 64px;
  cursor: pointer;
}

.icon-btn:hover {
  @apply bg-neutral-200;
}

.f-header .dropdown {
  height: 64px;
  cursor: pointer;
  @apply flex justify-center items-center mx-5;
}
</style>
