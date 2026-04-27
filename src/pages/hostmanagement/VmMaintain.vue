<template>
  <div class=" bg-gray-50 flex">
  <!-- 左侧 -->
  <div class="w-2/3 bg-white p-1 flex flex-col">
    <el-form :model="form" label-width="100px" label-position="top" class="flex-1 flex flex-col">
      <!-- 目标主机 -->
      <el-form-item label="目标主机" required>
        <el-button plain>
          <el-icon class="mr-1"><Plus /></el-icon>
          添加目标主机
        </el-button>
      </el-form-item>

      <!-- 执行命令 -->
      <el-form-item label="执行命令" required>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <el-radio-group v-model="commandType">
              <el-radio-button value="shell">Shell</el-radio-button>
              <el-radio-button value="python">Python</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <!-- 编辑器 -->
        <div class="w-full mt-3">
          <div class="border-gray-200 rounded-md overflow-hidden pl-2">
            <general-code
              v-model="code"
              language="shell"
              theme="vs"
              style="width: 780px; height: 320px"
              :options="{ fontSize: 14, minimap: { enabled: false } }"
            />
          </div>
        </div>
      </el-form-item>
      <!-- 开始执行 -->
      <el-form-item class="mt-2">
        <el-button type="primary">
          <el-icon><Lightning /></el-icon>
          开始执行
        </el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- 右侧执行记录 -->
  <div class="w-1/3 bg-gray-50 border-l border-gray-200 p-6">
    <div class="flex items-center gap-2 mb-4">
      <span class="font-medium text-gray-700">执行记录</span>
      <el-tooltip content="执行记录说明">
        <el-icon class="text-gray-400 cursor-pointer">
          <QuestionFilled />
        </el-icon>
      </el-tooltip>
    </div>
    <!-- 记录 -->
    <div class="space-y-3">
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-3">
          <el-tag size="small">成功-sh</el-tag>
          <span>1</span>
          <span class="font-mono text-gray-700">echo "123"</span>
        </div>
        <span class="text-gray-400">03.06 16:45</span>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QuestionFilled, Plus, Lightning } from '@element-plus/icons-vue'
import GeneralCode from '@/components/GeneralCode.vue'
const code = ref('')

const form = ref({
  targetHosts: [],
  command: 'echo "123"'
})

const commandType = ref('shell')
</script>

<style scoped>
.page {

}
</style>
