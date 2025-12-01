<template>
  <div class="background_style">
    <el-row class="h-full">
      <el-col :span="13" class="flex items-center justify-center"></el-col>
      <el-col :span="11" class="flex items-center justify-center bg-white/10">
        <!-- 发光登录框 -->
        <div class="login-container">
          <!-- 背景光晕 -->
          <div class="login-glow-top-right"></div>
          <div class="login-glow-bottom-left"></div>

          <div class="login-content">
            <div class="login-header">
              <h2 class="login-title">用户登录</h2>
            </div>

            <div class="login-divider">
              <span class="divider-line divider-line-left"></span>
              <span class="divider-text">Welcome to the Silent TR</span>
              <span class="divider-line divider-line-right"></span>
            </div>

            <el-form :model="form" :rules="rules" ref="formRef" class="login-form">
              <el-form-item prop="username">
                <el-input
                  v-model="form.username"
                  ref="usernameInputRef"
                  placeholder="请输入用户名"
                  size="large"
                  :prefix-icon="User"
                  class="login-input"
                  @keydown.enter="focusPassword"
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="form.password"
                  ref="passwordInputRef"
                  placeholder="请输入密码"
                  type="password"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  class="login-input"
                  @keydown.enter="handleLogin"
                />
              </el-form-item>
              <el-form-item class="login-button-item">
                <el-button
                  @click="handleLogin"
                  round
                  class="login-button"
                  type="primary"
                  size="large"
                >
                  登 录
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import { reactive, ref,onMounted,nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { login } from '@/api/manager'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { ElInput } from 'element-plus'


const router = useRouter()
const formRef = ref<FormInstance>()
const authStore = useAuthStore()
const usernameInputRef = ref<InstanceType<typeof ElInput>>()
const passwordInputRef = ref<InstanceType<typeof ElInput>>()

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

onMounted(() => {
  nextTick(() => {
    // 调用 ElInput 的 focus 方法
    usernameInputRef.value?.focus()
  })
})

const focusPassword = () => {
  // 用户名输入框按回车时聚焦到密码框
  passwordInputRef.value?.focus()
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate()
  const res = await login(form.username, form.password)
  if (res.data.message === '登录成功') {
    ElMessage.success(res.data.message)
    const payload = {
      accessToken: res.data.data.access_token,
      username: res.data.data.username,
    }
    authStore.setTokens(payload)
    localStorage.setItem("username", res.data.data.username)
    localStorage.setItem("user_url", res.data.data.user_url)
    await router.push({name: '/home'})
  }else {
    ElMessage.error(res.data.message)
  }
}
</script>

<style scoped>
/* 背景样式 */
.background_style {
  @apply w-full h-full fixed top-0 left-0 bg-cover bg-center bg-no-repeat;
  background-image: url('@/assets/images/background.png');
}

/* 登录容器 */
.login-container {
  @apply backdrop-blur-lg bg-white/95 rounded-3xl p-10 mx-4 border border-white/30 shadow-2xl shadow-blue-500/25 relative overflow-hidden;
  backdrop-filter: blur(16px);
  box-shadow:
    0 25px 50px -12px rgba(59, 130, 246, 0.25),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
}

/* 光晕效果 */
.login-glow-top-right {
  @apply absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 rounded-full blur-xl;
}

.login-glow-bottom-left {
  @apply absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-xl;
}

/* 内容区域 */
.login-content {
  @apply relative z-10;
}

/* 标题区域 */
.login-header {
  @apply text-center mb-8;
}

.login-title {
  @apply font-bold text-3xl text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
}

/* 分割线区域 */
.login-divider {
  @apply flex items-center justify-center my-6 text-gray-400 space-x-2;
}

.divider-line {
  @apply h-[1px] w-16;
}

.divider-line-left {
  @apply bg-gradient-to-r from-transparent to-gray-300;
}

.divider-line-right {
  @apply bg-gradient-to-r from-gray-300 to-transparent;
}

.divider-text {
  @apply text-sm;
}

/* 表单区域 */
.login-form {
  @apply w-[300px] space-y-6;
}

/* 输入框 */
.login-input {
  @apply rounded-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:shadow-lg;
}

/* 登录按钮 */
.login-button-item {
  @apply mt-8;
}

.login-button {
  @apply w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300;
}
</style>
