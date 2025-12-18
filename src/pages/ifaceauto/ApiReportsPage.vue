<template>
  <el-container class="bg-white rounded bl-2" :style="{ height: (h + 'px') }">
    <el-aside width="320px" class="image-aside">
      <div class="flex justify-between mb-4 ">
        <span class="mr-4">测试任务</span>
        <el-switch
          v-model="autoUpdate"
          inline-prompt
          active-text="自动更新"
          inactive-text="手动更新"
        />
      </div>
      <div class="top">
        <div class="demo-collapse-position">
          <el-collapse :expand-icon-position="position">
            <el-collapse-item :title="date" v-for="(suites, date) in grouped" :key="date">
              <div
                v-for="(suite,index) in suites"
                :key="suite.suite_key"
                class="suite-panel"
                :class="getProgressClass(suite.progress)"
                :style="{ '--progress': suite.progress + '%' }"
              >
                <div class="progress-container">
                  <div class="circular-progress"></div>
                  <div class="suite-content">
                    <div class="suite-name" @click="handleSuiteClick(suite.suite_key)">
                      {{ suites.length - index }} - {{ suite.suite_name }} | {{ suite.created_at }}
                    </div>
                    <div class="suite-status">
                      {{ suite.status }}
                    </div>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      <div class="bottom"></div>
    </el-aside>
    <el-main class="image-main">
      <el-card shadow="never" class="search-wrapper">
        <el-form ref="searchFormRef" :inline="true">
          <el-form-item prop="username" label="测试计划名">
            <el-input placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="phone" label="创建时间">
            <el-input placeholder="请输入" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search">
              查询
            </el-button>
            <el-button :icon="Refresh">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card shadow="never">
        <div class="toolbar-wrapper">
          <div>
            <el-input v-model="search" size="small" placeholder="Type to search" />
          </div>
          <div>
            <el-tooltip content="下载">
              <el-button type="primary" :icon="Download" circle />
            </el-tooltip>
            <el-tooltip content="刷新当前页">
              <el-button type="primary" :icon="RefreshRight" circle />
            </el-tooltip>
          </div>
        </div>
        <div class="table-wrapper">
          <el-table :data="filterTableData">
            <el-table-column prop="plan_name" label="测试计划名" align="center" />
            <el-table-column prop="status" label="计划状态" align="center" />
            <el-table-column prop="plan_task_sum" label="测试计划总数" align="center" />
            <el-table-column prop="failed_case_num" label="失败case数" align="center" />
            <el-table-column label="通过率" align="center" >
              <template #default="scope">
                <el-tag
                  :type="getTagType(scope.row)"
                  size="small"
                >
                  {{ getPassRate(scope.row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" align="center" />
            <el-table-column prop="updated_at" label="完成时间" align="center" />
            <el-table-column fixed="right" label="操作" width="300" align="center">
              <template #default="scope">
                <el-button type="primary" text bg size="small" @click="detailClick(scope.row.suite_key, scope.row.plan_key)">
                  执行详情
                </el-button>
                <el-button type="primary" text bg size="small" @click="reportClick(scope.row.suite_key, scope.row.plan_key)">
                  性能报告
                </el-button>
                <el-button type="primary" text bg size="small">
                  对比分析
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pager-wrapper">
          <el-pagination
            :page-sizes="defaultCounts"
            v-model:current-page="currentPage"
            v-model:page-size="defaultCount"
            size="small"
            :default-page-size="defaultCount"
            layout="prev, pager, next, total, sizes"
            :total="totalCount"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </el-main>
  </el-container>
  <el-dialog v-model="dialogTableVisible" title="基础报告" width="1200" draggable>
    <el-row :gutter="16" style="margin-bottom: 30px">
      <el-col :xs="24" :sm="12" :md="6" class="text-center mb-4">
        <el-statistic title="总用例数" :value="casesStatistics.total_cases" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" class="text-center mb-4">
        <el-statistic title="成功用例数" :value="casesStatistics.success_cases" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" class="text-center mb-4">
        <el-statistic title="失败用例数" :value="casesStatistics.fail_cases" />
      </el-col>
      <el-col :xs="24" :sm="12" :md="6" class="text-center mb-4">
        <el-statistic title="通过率" :value="casesStatistics.pass_rate_percent" />
      </el-col>
    </el-row>
    <el-table :data="casesStatistics.case_statistic">
      <el-table-column property="case_path" label="接口地址" width="500px" />
      <el-table-column property="request_count" label="请求次数" />
      <el-table-column property="avg_response_time" label="平均响应时间" />
      <el-table-column property="min_response_time" label="最小响应时间" />
      <el-table-column property="max_response_time" label="最大响应时间" />
      <el-table-column property="median" label="中位数" />
      <el-table-column property="p90_response_time" label="90响应时间" />
      <el-table-column property="p95_response_time" label="95响应时间" />
      <el-table-column property="p99_response_time" label="99响应时间" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { Search, Refresh, Download, RefreshRight } from '@element-plus/icons-vue'
import { api_reports } from '@/hooks/ifaceauto/apireports.ts'
import { useRouter } from 'vue-router'

const frequency:number = 15000

let timer: any = null

const position = ref('right')
const windowHeight = window.innerHeight || document.body.clientHeight
const h = windowHeight - 64 - 44 - 80

const dialogTableVisible = ref(false)

const tableheader = () => {
  return 'table-header'
}

const { fetchSuites, fetchPlans, fetchCases_statistic } = api_reports()
const router = useRouter()
const search = ref('')

const defaultCounts = ref([30, 50, 100])
const defaultCount = ref(30)
const currentPage = ref(1)
const totalCount = ref(0)
const autoUpdate = ref(true)


interface SuiteItem {
  suite_key: string;
  suite_name: string;
  status: string;
  created_at: string | Date;
  progress: string | "0";
}

interface PlanItem {
  id: number;
  suite_key: string;
  plan_key: string;
  plan_name: string;
  plan_task_sum: number;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
}

interface Plans {
  total_count: number;
  plans: PlanItem[];
}

interface CasesItem {
  case_path: number;
  request_count: string;
  avg_response_time: string;
  min_response_time: string;
  max_response_time: string;
  median: string;
  p90_response_time: string;
  p95_response_time: string;
  p99_response_time: string;
}

interface CasesStatistics {
  total_cases?: string;
  success_cases?: string;
  fail_cases?: string;
  pass_rate_percent?: string;
  case_statistic?: CasesItem[];
}

const suite_key = ref("")

const grouped = ref<Record<string, SuiteItem[]>>({})

const planDatas = ref<PlanItem[]>([])

const casesStatistics = ref<CasesStatistics>({})

interface User {
  date: string
  name: string
  address: string
}

const filterTableData = computed(() =>
  planDatas.value.filter(
    (data) =>
      !search.value ||
      data.plan_name.toLowerCase().includes(search.value.toLowerCase())
      || data.status.toLowerCase().includes(search.value.toLowerCase())
  )
)

onMounted(
  async () => {
    try {
      grouped.value = await fetchSuites()
      let firstKey = Object.keys(grouped.value)[0] as string | undefined
      let key = grouped.value[firstKey ?? "1"]?.[0]?.suite_key as string
      suite_key.value = key
      await fecthData(suite_key.value, 1, defaultCount.value)
      if (autoUpdate.value) {
        startAutoUpdate()
      }
    } catch (error) {
      console.error('请求失败:', error)
    }
  }
)

onBeforeUnmount(() => {
  stopAutoUpdate()
})

const handleSuiteClick = async (k: string) => {
  suite_key.value = k
  currentPage.value = 1
  await fecthData(suite_key.value, currentPage.value, defaultCount.value)
}

const handleSizeChange = async (val: number) => {
  await fecthData(suite_key.value, 1, defaultCount.value)
}

const handleCurrentChange = async (val: number) => {
  await fecthData(suite_key.value, currentPage.value, defaultCount.value)
}

const fecthData = async (s_keys: string, page: number, size: number) => {
  let result: Plans = await fetchPlans({
    "suite_key": s_keys,
    "current_page": page,
    "current_count": size
  })
  totalCount.value = result.total_count
  planDatas.value = result.plans
}

const detailClick = (suite_key: string, plan_key: string) => {
  router.push({ name: "apireportdetail", params: { suite_key: suite_key, plan_key: plan_key } })
}

const reportClick = async (suite_key: string, plan_key: string) => {
  dialogTableVisible.value = true
  let cases: CasesStatistics = await fetchCases_statistic({
    "suite_key": suite_key,
    "plan_key": plan_key
  })
  Object.assign(casesStatistics.value, {
    total_cases: cases.total_cases,
    success_cases: cases.success_cases,
    fail_cases: cases.fail_cases,
    pass_rate_percent: cases.pass_rate_percent,
    case_statistic: cases.case_statistic
  })
}

const getProgressClass = (val: string) => {
  if (val === "0") return 'progress-zero';
  if (val === "100") return 'progress-complete';
  return 'progress-loading';
};

watch(autoUpdate, (newVal) => {
  if (newVal) {
    startAutoUpdate()
  } else {
    stopAutoUpdate()
  }
})

const startAutoUpdate = async () => {
  stopAutoUpdate()

  timer = setInterval(async () => {
    grouped.value = await fetchSuites()
    await fecthData(suite_key.value, currentPage.value, defaultCount.value)
  }, frequency)
}

const stopAutoUpdate = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const getPassRate = (row:any) => {
  const { plan_task_sum, failed_case_num } = row;
  if (plan_task_sum === 0) {
    return '暂无数据';
  }
  const passNum = Math.max(0, plan_task_sum - failed_case_num);
  const rate = (passNum / plan_task_sum) * 100;
  return `${rate.toFixed(2)}%`;
};

const getTagType = (row:any) => {
  const { plan_task_sum, failed_case_num } = row;
  if (plan_task_sum === 0) {
    return 'info'; // 暂无数据用蓝色
  }
  const passNum = Math.max(0, plan_task_sum - failed_case_num);
  const rate = (passNum / plan_task_sum) * 100;
  // 自定义阈值：≥90%为绿色，否则为红色（可根据需求调整）
  return rate === 100 ? 'success' : 'danger';
};

</script>

<style scoped>
.image-header {
  border-bottom: 1px solid #eeeeee;
  @apply flex items-center;
}

.image-aside {
  border-right: 1px solid #eeeeee;
  position: relative;
}

.image-main {
  position: relative;
}

.image-aside .top {
  position: absolute;
  top: 50px;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}

.image-main .top {
  position: absolute;
  top: 100px;
  right: 0;
  left: 0;
  bottom: 50px;
  overflow-y: auto;
}

.image-aside .bottom, .image-main .bottom {
  position: absolute;
  bottom: 0;
  height: 50px;
  left: 0;
  right: 0;
  @apply flex items-center justify-center;
}

.suite-panel {
  margin-bottom: 6px;
  cursor: default;
}

/* 核心修复：进度容器 - 圆角与边框完全对齐 */
.progress-container {
  position: relative;
  padding: 5px;
  border-radius: 6px; /* 容器圆角 */
  background: #fafafa;
  overflow: hidden;
}

/* 修复：环形进度条 - 圆角衔接关键样式 */
.circular-progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 6px; /* 与容器圆角一致 */
  pointer-events: none;
}

.circular-progress::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: conic-gradient(
    from -90deg,
    var(--progress-color) var(--progress),
    transparent var(--progress)
  );
  border-radius: 6px;
  padding: 1px;
  box-sizing: border-box;
  -webkit-background-clip: content-box, border-box;
  background-clip: content-box, border-box;
  background-origin: content-box, border-box;
  background-image:
    linear-gradient(#fafafa, #fafafa), /* 中间透明部分（与容器背景一致） */
    conic-gradient(from -90deg, var(--progress-color) var(--progress), transparent var(--progress));
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 进度 0%：灰色边框 */
.progress-zero .progress-container {
  background: #fafafa;
}
.progress-zero .circular-progress::before {
  --progress-color: #ebeef5;
  /* 0% 时显示完整灰色边框 */
  background-image:
    linear-gradient(#fafafa, #fafafa),
    linear-gradient(#ebeef5, #ebeef5);
}

/* 进度 100%：绿色边框 + 成功背景 */
.progress-complete .progress-container {
  background: #f0f9ff;
}
.progress-complete .circular-progress::before {
  --progress-color: #409EFF;
  /* 100% 时显示完整绿色边框 */
  background-image:
    linear-gradient(#f0f7ff, #f0f7ff),
    linear-gradient(#409EFF, #409EFF);
}

/* 进度中：蓝色边框 + 呼吸动画 */
.progress-loading .progress-container {
  background: #f0f7ff;
}
.progress-loading .circular-progress::before {
  --progress-color: #409EFF;
  animation: pulse 2s infinite;
}

/* 呼吸动画优化：不影响圆角 */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 内部内容布局 */
.suite-content {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.suite-name {
  color: #409eff;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.suite-name:hover {
  text-decoration: underline;
  color: #409EFF;
}

.suite-status {
  display: flex;
  border-radius: 12px;
  align-items: center;
  font-size: 12px;
  color: #909399;
  padding: 2px 8px;
  white-space: nowrap;
}

.progress-complete .suite-status {
  background: #f0f9f0;
  color: #67C23A;
}

.progress-zero .suite-status {
  background: #f5f5f5;
  color: #909399;
}

.progress-loading .suite-status {
  background: #e8f4f8;
  color: #409EFF;
}

:deep(.el-collapse-item__content) {
  padding: 0 !important;
}

.text-color {
  color: #409eff;
}

:deep(.table-header) {
  @apply bg-gray-200 text-dark-200
}

.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
