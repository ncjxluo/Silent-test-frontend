<template>
  <!-- 主布局：左右分栏 -->
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="flex gap-6">
      <!-- 左侧：部署配置区域 -->
      <div class="w-[460px] flex-shrink-0">
        <h2 class="text-20 font-bold mb-4">部署任务执行</h2>

        <!-- 部署策略卡片 -->
        <el-card class="mb-4 shadow-sm">
          <template #header>
            <span>选择部署策略</span>
          </template>

          <el-form label-width="auto" style="max-width: 600px">
            <el-form-item label="部署策略" prop="desc">
              <el-select
                v-model="deploy_selectd"
                placeholder="Select"
                style="width: 150px"
                @change="deployChange"
                value-key="strategy_key"
              >
                <el-option
                  v-for="item in tableDatas"
                  :key="item.strategy_key"
                  :label="item.strategy_name"
                  :value="item"

                >
                  <span style="float: left">{{ item.strategy_name }}</span>
                  <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                    {{ item.virtual_name }}
                  </span>
                </el-option>
              </el-select>
              <el-tooltip placement="top" effect="dark">
                <template #content>
                  未设置时按照策略中模式进行, 设置后会临时覆盖部署模式, 相同命令的非标准服务不要使用并行部署
                </template>
                  <el-button-group style="margin-left: 6px" size="small">
                    <el-button :type="process_mode === '无' ? 'primary' : 'default'" @click="process_mode = '无'">无</el-button>
                    <el-button :type="process_mode === '串行' ? 'primary' : 'default'" @click="process_mode = '串行'">串行</el-button>
                    <el-button :type="process_mode === '并行' ? 'primary' : 'default'" @click="process_mode = '并行'">并行</el-button>
                  </el-button-group>
              </el-tooltip>
            </el-form-item>
            <el-form-item prop="desc">
              <template #label>
              <span style="display: flex; align-items: center; gap: 4px">
                执行命令
                <el-tooltip placement="top" effect="dark">
                  <template #content>
                    指的是在部署结束后，是否执行其他的命令，如升级命令
                  </template>
                  <el-icon size="16" color="#909399" style="cursor: help">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </span>
              </template>
              <el-input type="textarea" v-model="exec_cmd"/>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 动态渲染表单卡片 -->
        <el-card class="mb-4 shadow-sm">
          <template #header>
            <div style="display: flex; align-items: center; width: 100%">
              <span>部署表单</span>
              <!-- 操作按钮 -->
              <div style="margin-left: auto; margin-right: 10px">
                <el-button size="small" type="primary" @click="deploy"> 执行部署 </el-button>
              </div>
            </div>
          </template>
          <el-form label-width="150px" style="max-width: 600px; margin: 0 auto">
            <template v-for="item in sortedAppConfigList" :key="item.id">
              <el-form-item :label="item.field_name">
                <el-input
                  v-model="dynamicForm[item.app_nickname]"
                  :placeholder="`请输入 ${item.field_name}`"
                />
              </el-form-item> </template
          ></el-form>
        </el-card>
      </div>

      <!-- 右侧：日志面板（点击查看日志才显示） -->
      <div class="flex-1" transition="fade">
        <h2 class="text-20 font-bold mb-4">部署实时日志</h2>
        <div class="demo-collapse">
          <el-collapse v-model="activeCollapse">
            <el-collapse-item
              v-for="(item, idx) in deploy_task"
              :name="item.app_nickname"
              :key="item.app_id"
            >
              <template #title="">
                <div style="display: flex; align-items: center; width: 100%">
                  <span class="ml-1">部署应用:{{ item.app_nickname }}</span>
                  <el-progress
                    :percentage="item.app_progress"
                    :stroke-width="10"
                    striped
                    :show-text="false"
                    style="width: 500px; margin-left: auto; margin-right: 10px"
                  />
                </div>
              </template>
              <div
                :ref="el => (logRefs[idx] = el)"
                class="bg-gray-900 text-white p-4 rounded h-[220px] overflow-y-auto font-mono text-sm log-scrollbar"
              >
                <pre style="white-space: pre; word-break: break-all; font-size: 12px; line-height: 1.3; margin: 0">{{ item.app_content }}</pre>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { deploy_strategy } from '@/hooks/deployment/deploystrategy.ts'
import { deploy_task_operation } from '@/hooks/deployment/deploytask.ts'
import { ElMessage } from 'element-plus'
import { QuestionFilled } from '@element-plus/icons-vue'

const { fetchDeployStrategy } = deploy_strategy()
const { execDeployTask, getDeployResult } = deploy_task_operation()

// 获取部署策略的内容
interface DeployStrategyItem {
  strategy_key: number
  strategy_name: string
  process_mode: string
  app_product_line: string
  virtual_key: string
  virtual_name: string
  app_config: string
  deployment_path: string
  deployment_config_content: string
  message_config: string
  created_at: string | Date
  updated_at: string | Date
}

interface DeployStrategys {
  total_count: number
  deploy_strategys: DeployStrategyItem[]
}

const tableDatas = ref<DeployStrategyItem[]>([])

const fetchDeployStrategys = async (ds_name: string, page: number, size: number) => {
  const res: DeployStrategys = await fetchDeployStrategy({
    strategy_name: ds_name,
    current_page: page,
    current_count: size,
  })
  tableDatas.value = res.deploy_strategys
}

// 选择部署策略下拉框
const deploy_selectd = ref()

const sortedAppConfigList = computed(() => {
  return [...appConfigList.value].sort((a, b) => {
    return Number(a.field_order || 0) - Number(b.field_order || 0)
  })
})

const process_mode = ref('无')

interface AppConfig {
  id: ''
  app_nickname: ''
  field_name: ''
  field_order: ''
  app_deploy_name: ''
  exec_cmd: ''
  verify_cmd: ''
}

const appConfigList = ref<AppConfig[]>([])

const deployChange = () => {
  // console.log(deploy_selectd.value)
  appConfigList.value = JSON.parse(deploy_selectd.value.app_config)
}

//渲染表单

const dynamicForm = reactive<{ [key: string]: string }>({})

onMounted(async () => {
  await fetchDeployStrategys('', 1, 1000000)
})

// 开始部署

interface DeployTaskItem {
  app_id: string
  app_nickname: string
  version: string
  app_progress: number
  app_content: string
}

const deploy_task = ref<DeployTaskItem[]>([])
const activeCollapse = ref<string[]>([])

const exec_cmd = ref('')

const deploy = async () => {
  const stay_deploy_task = appConfigList.value
    .filter((item) => dynamicForm[item.app_nickname])
    .map((item) => ({
      app_id: item.id,
      app_nickname: item.app_nickname,
      app_deploy_name: item.app_deploy_name,
      version: dynamicForm[item.app_nickname] || '',
      app_progress: 0,
      app_content: `准备下载${item.app_nickname}-${dynamicForm[item.app_nickname]}应用包`,
      exec_cmd: item.exec_cmd,
      verify_cmd: item.verify_cmd,
    }))
  if (stay_deploy_task.length > 0) {
    const finalProcessMode = process_mode.value === '无'
      ? deploy_selectd.value.process_mode
      : process_mode.value
    if (finalProcessMode=== '串行') {
      activeCollapse.value.push(stay_deploy_task[0]?.app_nickname || '')
    } else {
      activeCollapse.value = stay_deploy_task.map((item) => item.app_nickname)
    }
    deploy_task.value = stay_deploy_task
    // console.log(deploy_selectd.value)
    const res = await execDeployTask({
      strategy_key: deploy_selectd.value.strategy_key,
      strategy_name: deploy_selectd.value.strategy_name,
      process_mode: finalProcessMode,
      app_product_line: deploy_selectd.value.app_product_line,
      virtual_key: deploy_selectd.value.virtual_key,
      virtual_name: deploy_selectd.value.virtual_name,
      app_config: stay_deploy_task,
      deployment_path: deploy_selectd.value.deployment_path,
      deployment_config_content: deploy_selectd.value.deployment_config_content,
      message_config: deploy_selectd.value.message_config,
      deploy_cmd: exec_cmd.value
    })
    ElMessage.success("部署任务已下发")
    await startPoll(res.task_id)
  } else {
    ElMessage.warning('没有监测到有需要部署的应用')
  }
}

const logRefs = ref<any[]>([])

watch(
  deploy_task,
  async () => {
    await nextTick()
    setTimeout(() => {
      logRefs.value.forEach((el) => {
        if (!el) return
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10
        if (isNearBottom) {
          el.scrollTop = el.scrollHeight

        }
        // el.scrollTop = el.scrollHeight
        // console.log("✅ 最终滚动：", el.scrollTop)
      })
    }, 50)
  },
  { deep: true }
)

let pollTimer: number | null = null
let current_task_id = ''

const getResult = async () => {
  try {
    const res = await getDeployResult({ task_id: current_task_id })

    if (
      res.sign === '1' &&
      res.logs.every(
        (v: any) =>
          v.content.includes('silent test run deploy task success') ||
          v.content.includes('silent test run deploy task fail'),
      )
    ) {
      ElMessage.success("部署任务已全部完成")
      stopPoll()
      deploy_task.value = res.logs.map((item: any) => ({
        app_id: item.task_id,
        app_nickname: item.app_name,
        version: '',
        app_progress: Number(item.progress),
        app_content: item.content,
      }))
      return
    }
    deploy_task.value = res.logs.map((item: any) => ({
      app_id: item.task_id,
      app_nickname: item.app_name,
      version: '',
      app_progress: Number(item.progress),
      app_content: item.content,
    }))
    pollTimer = setTimeout(getResult, 1000)
  } catch (error) {
    console.error('轮询失败', error)
    stopPoll()
  }
}

const startPoll = async (task_id: string) => {
  stopPoll()
  current_task_id = task_id
  await getResult() // 第一次立即执行
}

// 3. 停止轮询
const stopPoll = () => {
  if (pollTimer) clearTimeout(pollTimer)
  pollTimer = null
}

onUnmounted(() => {
  stopPoll()
})
</script>

<style scoped>
:deep(.log-scrollbar)::-webkit-scrollbar {
  width: 6px; /* 滚动条宽度 */
}

:deep(.log-scrollbar)::-webkit-scrollbar-track {
  background: #1f2937; /* 轨道背景（深色） */
  border-radius: 3px;
}

:deep(.log-scrollbar)::-webkit-scrollbar-thumb {
  background: #4b5563; /* 滑块颜色 */
  border-radius: 3px;
}

:deep(.log-scrollbar)::-webkit-scrollbar-thumb:hover {
  background: #6b7280; /* hover 变亮 */
}


.fade-enter-active {
  transition: all 0.3s ease;
}
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

:deep(.el-collapse-item__wrap) {
  padding-bottom: 0 !important;
}
/* 让内容区和黑色日志框高度一致 */
:deep(.el-collapse-item__content) {
  padding-bottom: 0 !important;
}
</style>
