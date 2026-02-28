<template>
  <div class="dashboard-container" style="padding: 20px; background-color: #f5f7fa">
    <!-- 上半部分：待办事项 + 系统公告 (核心修复区) -->
    <el-row :gutter="20" class="top-section" style="margin-bottom: 20px">
      <el-col :span="16">
        <!-- 关键：添加 card-wrapper 并设置 display: flex -->
        <div class="card-wrapper">
          <el-card
            class="dashboard-card"
            shadow="never"
            body-style="flex: 1; display: flex; flex-direction: column;"
          >
            <template #header>
              <div class="card-header">
                <span class="card-title">待办事项</span>
                <span class="edit-btn" @click="add_memo()">编辑</span>
              </div>
            </template>
            <div class="card-body-db">
              <el-empty
                v-if="tableDatas.length === 0"
                description="暂无待办事项"
                :image-size="80"
              />
              <general-table
                v-else
                :filter-table-data="tableDatas"
                :column-data="columnDatas"
                :default-counts="defaultCounts"
                v-model:current-page="currentPage"
                v-model:default-count="defaultCount"
                :total-count="totalCount"
                :search-keys="searchKeys"
                :is_enable_selected="false"
                :is_enable="is_enable"
                @update:currentPage="changePage"
                @update:defaultCount="changeCount"
                @refresh="refreshDatas"
                @exportAllPage="exportAllData"
                is_enable_header="0"
                ref="GeneralTableRef"
              >
                <template #default="scope">
                  <el-button type="primary" text bg size="small" @click="handleEditor(scope.row)">
                    标记完成
                  </el-button>
                  <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
                    删除
                  </el-button>
                </template>
              </general-table>
            </div>
          </el-card>
        </div>
      </el-col>

      <el-col :span="8">
        <!-- 关键：保持和左侧完全一致的外层容器结构 -->
        <div class="card-wrapper">
          <el-card
            class="dashboard-card"
            shadow="never"
            body-style="flex: 1; display: flex; flex-direction: column;"
          >
            <template #header>
              <div class="card-header">
                <span class="card-title">系统里程碑</span>
              </div>
            </template>
            <!-- 关键：内容区自动填充，红框处不再留白 -->
            <div class="card-body">
              <el-timeline class="notice-timeline">
                <el-timeline-item
                  v-for="(item, index) in notices"
                  :key="index"
                  :timestamp="item.created_at"
                >
                  <el-tooltip
                    class="tooltip-item"
                    effect="dark"
                    :content="item.notice_content"
                    placement="top"
                  >
                    <div class="notice-text">{{ item.notice_title }}</div>
                  </el-tooltip>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="top-section" style="margin-bottom: 20px">
      <el-col :span="12">
        <!-- 关键：添加 card-wrapper 并设置 display: flex -->
        <div class="card-wrapper">
          <el-card
            class="dashboard-card"
            shadow="never"
            body-style="flex: 1; display: flex; flex-direction: column;"
          >
            <template #header>
              <div class="card-header">
                <span class="card-title">虚机统计</span>
              </div>
            </template>
            <!-- 关键：内容区自动填充，实现底部对齐 -->
            <div class="card-body">
              <div class="small-stat-card">
                <div class="stat-icon bg-blue"></div>
                <div class="stat-info">
                  <p class="stat-name">可连接</p>
                  <p class="stat-value">98</p>
                </div>
              </div>
              <div class="small-stat-card">
                <div class="stat-icon bg-red"></div>
                <div class="stat-info">
                  <p class="stat-name">无法连接</p>
                  <p class="stat-value">15</p>
                </div>
              </div>
              <div class="small-stat-card">
                <div class="stat-icon bg-gray"></div>
                <div class="stat-info">
                  <p class="stat-name">未测试</p>
                  <p class="stat-value">15</p>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>

      <el-col :span="12">
        <!-- 关键：保持和左侧完全一致的外层容器结构 -->
        <div class="card-wrapper">
          <el-card
            class="dashboard-card"
            shadow="never"
            body-style="flex: 1; display: flex; flex-direction: column;"
          >
            <template #header>
              <div class="card-header">
                <span class="card-title">用户统计</span>
              </div>
            </template>
            <!-- 关键：内容区自动填充，红框处不再留白 -->
            <div class="card-body">
              <div class="small-stat-card">
                <div class="stat-icon bg-purple"></div>
                <div class="stat-info">
                  <p class="stat-name">用户数</p>
                  <p class="stat-value">98</p>
                </div>
              </div>
              <div class="small-stat-card">
                <div class="stat-icon bg-green"></div>
                <div class="stat-info">
                  <p class="stat-name">在线用户数</p>
                  <p class="stat-value">15</p>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <el-card class="dashboard-card" shadow="never" style="margin-bottom: 20px">
      <template #header>
        <div class="card-header">
          <span class="card-title">接口自动化</span>
        </div>
      </template>
      <div class="card-body">
        <!-- 部署次数小卡片 -->
        <div class="small-stat-card">
          <div class="stat-icon bg-gray"></div>
          <div class="stat-info">
            <p class="stat-name">纳管接口数</p>
            <p class="stat-value">0</p>
          </div>
        </div>
        <div class="small-stat-card">
          <div class="stat-icon bg-orange"></div>
          <div class="stat-info">
            <p class="stat-name">纳管用例数</p>
            <p class="stat-value">15</p>
          </div>
        </div>
        <div class="small-stat-card">
          <div class="stat-icon bg-deploy"></div>
          <div class="stat-info">
            <p class="stat-name">执行任务数</p>
            <p class="stat-value">15</p>
          </div>
        </div>
        <div class="small-stat-card">
          <div class="stat-icon bg-purple"></div>
          <div class="stat-info">
            <p class="stat-name">最近一天bug数</p>
            <p class="stat-value">15</p>
          </div>
        </div>
      </div>

      <div class="chart-container">
        <p class="stat-name">自动化执行饼图(最近一天任务bug数)</p>
        <div ref="deployChartRef" style="width: 100%; height: 180px"></div>
      </div>
    </el-card>

    <el-card class="dashboard-card" shadow="never" style="margin-bottom: 20px">
      <template #header>
        <div class="card-header">
          <span class="card-title">UI自动化</span>
        </div>
      </template>
      <div class="deploy-content">
        <div class="card-body-db">
          <el-empty description="暂时没有实现UI相关的内容" :image-size="80" />
        </div>
      </div>
    </el-card>

    <!-- 操作日志 -->
    <el-card class="dashboard-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">操作日志</span>
        </div>
      </template>
      <el-table
        :data="operationLogs"
        border
        stripe
        style="width: 100%"
        :header-cell-style="{ background: '#f8f9fa' }"
      >
        <el-table-column prop="operateTime" label="操作时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="150" />
        <el-table-column prop="content" label="操作内容" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'" size="small">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
  <general-dialog
    ref="DelDialogRef"
    title="删除代办事项"
    :width="500"
    confirmText="确定"
    btype="danger"
    @confirm="delConfirm"
  >
    <div>确定删除吗？</div>
  </general-dialog>

  <general-dialog
    ref="EditDialogRef"
    title="标记代办事项"
    :width="500"
    confirmText="确定"
    btype="danger"
    @confirm="editConfirm"
  >
    <div>确定变更为已完成吗？</div>
  </general-dialog>

  <general-dialog
    ref="GeneralDialogRef"
    title="新增代办事项"
    :width="500"
    confirmText="新增"
    btype="primary"
    @confirm="handleNew"
  >
    <el-form :model="form" :rules="rules" label-width="auto" style="max-width: 600px" ref="formRef">
      <el-form-item label="标题" prop="memo_title">
        <el-input v-model="form.memo_title" />
      </el-form-item>
      <el-form-item label="内容" prop="memo_content">
        <el-input v-model="form.memo_content" type="textarea" />
      </el-form-item>
      <el-form-item label="优先级" prop="memo_level">
        <el-select v-model="form.memo_level" placeholder="选择等级" class="w-full" clearable>
          <el-option label="高" value="高" />
          <el-option label="中" value="中" />
          <el-option label="低" value="低" />
        </el-select>
      </el-form-item>
    </el-form>
  </general-dialog>
</template>

<script setup lang="ts">
import { h, ref, onMounted, reactive } from 'vue'
import { ElForm, ElMessage, ElTag } from 'element-plus'
import * as echarts from 'echarts'
import { str_dashboard } from '@/hooks/dashboard.ts'
import GeneralTable from '@/components/GeneralTable.vue'
import GeneralDialog from '@/components/GeneralDialog.vue'
const { getNotice, getMemo, addMemo, editMemo, delMemo } = str_dashboard()

// 代办事项模块
const is_enable = ref(true)
const defaultCounts = ref([30, 50, 100])
const currentPage = ref(1)
const defaultCount = ref(30)
const totalCount = ref(0)
const searchKeys = ref(['agent_name', 'agent_status'])

const fetchMemos = async (page: number, size: number) => {
  const res: Memos = await getMemo({
    current_page: page,
    current_count: size,
  })
  totalCount.value = res.total_count
  tableDatas.value = res.memos
}

interface MemoItem {
  memo_key: string
  memo_title: string
  memo_content: string
  memo_level: string
  memo_complete: string
  created_at: string | Date
}

interface Memos {
  total_count: number
  memos: MemoItem[]
}

const rules = {
  memo_title: [{ required: true, message: '请输入标题', trigger: 'submit' }],
  memo_content: [{ required: true, message: '请输入内容', trigger: 'submit' }],
  memo_level: [{ required: true, message: '请选择优先级', trigger: 'submit' }],
}

const tableDatas = ref<MemoItem[]>([])
const DelDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const EditDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const GeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const formRef = ref<InstanceType<typeof ElForm> | null>(null)

const form = reactive({
  memo_title: '',
  memo_content: '',
  memo_level: '中',
})

const columnDatas = ref([
  {
    label: '标题',
    prop: 'memo_title',
  },
  {
    label: '内容',
    prop: 'memo_content',
  },
  {
    label: '优先级',
    prop: 'memo_level',
  },
  {
    label: '状态',
    prop: 'memo_complete',
    customRender: (row: any) =>
      h(
        ElTag,
        {
          type: row.memo_complete === '未完成' ? 'danger' : 'success',
        },
        () => (row.memo_complete === '未完成' ? '未完成' : '完成'),
      ),
    customSearch: (row: any, searchText: string) => {
      const statusText = row.memo_complete === 0 ? '完成' : '未完成'
      return statusText.toLowerCase().includes(searchText)
    },
  },
  {
    label: '创建时间',
    prop: 'created_at',
  },
])

const changePage = async () => {}

const changeCount = async () => {}

const exportAllData = async () => {}

const refreshDatas = async () => {}

const add_memo = async () => {
  GeneralDialogRef.value?.open()
}

const handleNew = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const res = await addMemo({
        memo_title: form.memo_title,
        memo_content: form.memo_content,
        memo_level: form.memo_level,
        memo_complete: '未完成',
      })
      if (res.msg == '新增成功') {
        ElMessage.success(res.msg)
        GeneralDialogRef.value?.close()
        await fetchMemos(
          currentPage.value,
          defaultCount.value,
        )
      } else {
        ElMessage.error(res.msg)
      }
    }
  })
}

const handleEditor = async (row: any) => {
  EditDialogRef.value?.open(row)
}

const editConfirm = async (row: any) => {
  const res = await editMemo({
    memo_key: row.memo_key,
    memo_complete: '已完成',
  })
  if (res.msg == '编辑成功') {
    ElMessage.success(res.msg)
    EditDialogRef.value?.close()
    await fetchMemos(
      currentPage.value,
      defaultCount.value,
    )
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (row: any) => {
  DelDialogRef.value?.open(row)
}

const delConfirm = async (row: any) => {
  const res = await delMemo({
    memo_key: row.memo_key,
  })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fetchMemos(
      currentPage.value,
      defaultCount.value,
    )
  } else {
    ElMessage.error(res.msg)
  }
}

// const momoItem = ref('')

// 获取里程碑
interface NoticesItem {
  notice_title: string
  notice_content: string
  created_at: string | Date
}
const notices = ref<NoticesItem[]>()

const operationLogs = ref([
  {
    operateTime: '2026-02-27 09:05:30',
    operator: 'admin',
    operationType: '新增虚机',
    content: '新增测试环境虚机 node-10.0.0.12',
    status: '成功',
  },
  {
    operateTime: '2026-02-27 08:42:15',
    operator: 'test_user',
    operationType: '部署执行',
    content: '执行项目 xxx 的生产环境部署',
    status: '成功',
  },
  {
    operateTime: '2026-02-27 08:10:22',
    operator: 'admin',
    operationType: 'UI自动化测试',
    content: '执行登录模块UI自动化用例集',
    status: '失败',
  },
  {
    operateTime: '2026-02-27 07:50:18',
    operator: 'dev_user',
    operationType: '接口自动化测试',
    content: '执行支付接口自动化用例',
    status: '成功',
  },
  {
    operateTime: '2026-02-27 07:30:05',
    operator: 'admin',
    operationType: '新增用户',
    content: '新增用户 test01，权限：测试人员',
    status: '成功',
  },
])

// ECharts 初始化
const deployChartRef = ref<HTMLElement>()
onMounted(async () => {
  notices.value = await getNotice()

  if (deployChartRef.value) {
    const chart = echarts.init(deployChartRef.value)
    await fetchMemos(
      currentPage.value,
      defaultCount.value,
    )
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value' },
      series: [
        {
          name: '部署次数',
          type: 'pie',
          smooth: true,
          data: [8, 12, 5, 15, 9, 6, 1],
          itemStyle: { color: '#409eff' },
          areaStyle: { color: 'rgba(64, 158, 255, 0.1)' },
        },
      ],
    })
  }
})
</script>

<style scoped>
/* 1. 核心修复：强制卡片等高 */
.card-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%; /* 关键：撑满 el-col 的高度 */
}

.card-body-db {
  /* 关键：自动填充剩余空间，推动底部对齐 */
  align-items: center;
}

/* 2. 卡片内容区自动填充 */
.card-body {
  flex: 1; /* 关键：自动填充剩余空间，推动底部对齐 */
  display: flex;
  gap: 16px;
  align-items: stretch;
  padding: 10px 0;
}

/* 3. 通用样式 */
.dashboard-card {
  border-radius: 4px;
  box-shadow: none;
  height: 100%; /* 关键：卡片撑满 wrapper */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.edit-btn {
  font-size: 12px;
  color: #409eff;
  cursor: pointer;
}

/* 4. 系统公告时间轴 */
.notice-timeline {
  height: 200px;
  /* 2. 允许垂直方向溢出时显示滚动条 */
  overflow-y: auto;
  /* 可选：隐藏水平滚动条 */
  overflow-x: hidden;
  padding-left: 5px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.notice-text {
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

/* 5. 模块统计样式 (完全匹配截图) */
.stats-grid {
  padding: 10px 0;
}

.big-stat-card {
  background: #fff;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.big-card-title {
  font-size: 12px;
  color: #666;
  margin: 0 0 4px 8px;
}

.small-stat-card {
  display: flex;
  flex: 1px;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  gap: 12px;
}

.stat-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

/* 图标配色严格匹配截图 */
.bg-blue {
  background-color: #e8f4fc;
}
.bg-red {
  background-color: #fef0f0;
}
.bg-gray {
  background-color: #f0f2f5;
}
.bg-pink {
  background-color: #fde2e2;
}
.bg-pink-light {
  background-color: #fef0f7;
}
.bg-orange {
  background-color: #fdf2e9;
}
.bg-orange-light {
  background-color: #fef5e7;
}
.bg-purple {
  background-color: #f3e5f5;
}
.bg-green {
  background-color: #f0f9eb;
}
.bg-deploy {
  background-color: #e5f6ff;
}

.stat-info {
  flex: 1;
}

.stat-name {
  font-size: 11px;
  color: #666;
  margin: 0 0 2px 0;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 6. 部署统计 */
.deploy-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 8px;
}

.deploy-count-card {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  gap: 12px;
  width: 160px;
}

.chart-container {
  background: #fff;
  border-radius: 4px;
  padding: 10px;
  border: 1px solid #f0f0f0;
}
</style>
