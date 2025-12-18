<template>
  <div class="app-container" :style="{ height: h + 'px' }">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true">
        <el-form-item prop="status" label="执行接口">
          <el-select v-model="path_select" clearable placeholder="请选择接口" style="width: 240px">
            <el-option v-for="item in path_options" :key="item.path" :value="item.path" />
          </el-select>
        </el-form-item>
        <el-form-item prop="status" label="执行状态">
          <el-select v-model="status_value" clearable placeholder="请选择状态" style="width: 240px">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="phone" label="耗时">
          <el-input v-model="time_fromValue" placeholder="开始值" style="width: 120px" />
          <span class="separator"> to </span>
          <el-input v-model="time_toValue" placeholder="结束值" style="width: 120px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="searchClick"> 查询 </el-button>
          <el-button :icon="Refresh" @click="resetClick"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-input v-model="search" size="small" placeholder="Type to search" />
        </div>
        <div class="operation-wrapper">
          <el-tooltip content="下载">
            <el-tooltip content="下载" placement="top-start">
              <el-dropdown  @command="handleCommand">
                <el-button type="primary" :icon="Download" circle />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="currentPage">导出当前页</el-dropdown-item>
                    <el-dropdown-item command="allPage">导出全部页</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-tooltip>
          </el-tooltip>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table
          :data="tableData"
          border
          preserve-expanded-content
          style="width: 100%"
          max-height="500px"
          v-loading="loading"
          element-loading-text="正在加载中..."
        >
          <el-table-column type="expand">
            <template #default="props">
              <div m="4">
                <el-table
                  :data="props.row.child_item"
                  border
                  :tooltip-formatter="tableRowFormatter"
                  :row-class-name="rowcss_setting"
                  :cell-class-name="restime_setting"
                  tooltip-effect="light"
                >
                  <el-table-column label="步骤序号" prop="step_id" />
                  <el-table-column
                    label="步骤名字"
                    prop="step_name"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
                  <el-table-column
                    label="用户变量"
                    prop="user_variables"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
                  <el-table-column
                    label="请求接口"
                    prop="request_url"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
                  <el-table-column
                    label="请求参数"
                    prop="request_param"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
                  <el-table-column
                    label="返回响应"
                    prop="real_response"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
                  <el-table-column label="响应时间" prop="response_time" width="240" />
                  <el-table-column
                    label="整体断言标记"
                    prop="assert_res_sign"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
                  <el-table-column
                    label="断言详情"
                    prop="assert_res_details"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
                  <el-table-column
                    label="结构断言详情"
                    prop="assert_ver_sign"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
                  <el-table-column
                    label="结构断言详情"
                    prop="assert_time_sign"
                    width="240"
                    show-overflow-tooltip
                    :tooltip-formatter="fromatter_data"
                  />
<!--                  <el-table-column label="备注" prop="remarks" />-->
                  <el-table-column fixed="right" label="操作" width="150" align="center">
                    <template #default="scope">
                      <el-button
                        type="primary"
                        text
                        bg
                        size="small"
                        @click="viewDetails(scope.row)"
                      >
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="执行状态" prop="case_status">
            <template #default="scope">
              <el-tag
                v-if="scope.row.case_status === 'fail'"
                type="danger"
                effect="dark"
                disable-transitions
              >
                {{ scope.row.case_status }}
              </el-tag>
              <el-tag v-else type="success" effect="dark" disable-transitions>
                {{ scope.row.case_status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="执行case" prop="case_key" />
          <el-table-column label="sql语句" width="600" v-if="showColumn" prop="sql" />
          <el-table-column label="备注"  width="130" >
            <template #default="scope">
              <el-select
                v-model="scope.row.remarks"
                placeholder=""
                size="small"
                style="width: 100px;"
              ><el-option label="无异常" value="无异常" />
              <el-option label="存在误报" value="存在误报" />
              <el-option label="确有异常" value="确认异常" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small"
                         @click="editCase(scope.row)"
              >
                编辑case
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
  </div>
  <el-drawer v-model="drawer" direction="rtl" resizable :title="drawer_title">
    <el-text class="mx-1">请求接口</el-text>
    <div>{{ urlText }}</div>
    <el-text class="mx-1">用户变量</el-text>
    <vue-json-pretty
      :data="userVariablesJson"
      :deep="3"
      :show-length="true"
      :show-line-number="true"
      :highlight-key="['status', 'message']"
    />
    <el-text class="mx-1">请求参数</el-text>
    <vue-json-pretty
      :data="requestParam"
      :deep="3"
      :show-length="true"
      :show-line-number="true"
      :highlight-key="['status', 'message']"
    />
    <el-text class="mx-1">返回响应</el-text>
    <vue-json-pretty
      :data="realResponse"
      :deep="3"
      :show-length="true"
      :show-line-number="true"
      :highlight-key="['status', 'message']"
    />
    <el-text class="mx-1">断言结果</el-text>
    <div>{{ assertText }}</div>
    <el-text class="mx-1">断言详情</el-text>
    <vue-json-pretty
      :data="assertDetails"
      :deep="3"
      :show-length="true"
      :show-line-number="true"
      :highlight-key="['status', 'message']"
    />
  </el-drawer>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { Search, Refresh, Download, RefreshRight } from '@element-plus/icons-vue'
import { api_reports } from '@/hooks/ifaceauto/apireports.ts'
import { ElMessage, type TableTooltipData } from 'element-plus'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { edit_api_cases } from '@/api/ifaceauto.ts'

const route = useRoute()

const drawer = ref(false)
const drawer_title = ref('')
const urlText = ref('')
const assertText = ref('')

const userVariablesJson = ref({})
const requestParam = ref({})
const realResponse = ref({})
const assertDetails = ref({})

const { fetchCases, fetchPathSelect, editorCase } = api_reports()

const suite_key = route.params.suite_key as string
const plan_key = route.params.plan_key as string

const windowHeight = window.innerHeight || document.body.clientHeight

const h = windowHeight - 64 - 44 - 80

const showColumn = ref(false)

const search = ref('')

const path_select = ref('')

const status_value = ref('')
const time_fromValue = ref('')
const time_toValue = ref('')

const options = [
  {
    value: '0',
    label: '成功',
  },
  {
    value: '1',
    label: '失败',
  },
]

const defaultCounts = ref([30, 50, 100])
const defaultCount = ref(30)
const currentPage = ref(1)
const totalCount = ref(0)

const loading = ref(false)

interface CasesItem {
  step_id?: string
  step_name?: string
  user_variables?: string
  request_url?: string
  request_param?: string
  real_response?: string
  response_time?: string
  assert_res_sign?: string
  assert_res_details?: string
  assert_ver_sign?: string
  assert_time_sign?: string
}

interface CaseDatas {
  case_key?: string
  case_status?: string
  sql?: string
  remarks?: string
  child_item?: CasesItem[]
}

interface PathSelect {
  path?: string
}

const tableData = ref<CaseDatas[]>([])

const path_options = ref<PathSelect[]>([])

onMounted(async () => {
  try {
    path_options.value = await fetchPathSelect({ suite_key: suite_key, plan_key: plan_key })
    await fecthCasesData(suite_key, plan_key, currentPage.value, defaultCount.value)
  } catch (error) {
    console.error('请求失败:', error)
  }
})

const tableRowFormatter = (data: TableTooltipData<CaseDatas>) => {
  return `${data.cellValue}: table formatter`
}

const fecthCasesData = async (
  s_key: string,
  p_key: string,
  page: number,
  size: number,
  path: any = null,
  status_value: any = null,
  time_fromValue: any = null,
  time_toValue: any = null,
) => {
  loading.value = true
  let result = await fetchCases({
    suite_key: s_key,
    plan_key: p_key,
    current_page: page,
    current_count: size,
    path: path,
    status: status_value,
    s_time: time_fromValue,
    e_time: time_toValue,
  })
  const allEmpty = result.cases.every((item: { sql: string }) => !item.sql)
  if (!allEmpty) {
    showColumn.value = true
  }

  tableData.value = result.cases
  totalCount.value = result.total_count
  loading.value = false
}

const fromatter_data = (row: any) => {
  try {
    return JSON.stringify(JSON.parse(row.cellValue), null, 2) // 格式化成多行缩进
  } catch (e) {
    return row.cellValue
  }
}

const handleSizeChange = async (val: number) => {
  // await fecthCasesData(suite_key, plan_key, 1, defaultCount.value)
  await fecthCasesData(
    suite_key,
    plan_key,
    currentPage.value,
    defaultCount.value,
    path_select.value,
    status_value.value,
    time_fromValue.value,
    time_toValue.value,
  )
}

const handleCurrentChange = async (val: number) => {
  // await fecthCasesData(suite_key, plan_key, currentPage.value, defaultCount.value)
  await fecthCasesData(
    suite_key,
    plan_key,
    currentPage.value,
    defaultCount.value,
    path_select.value,
    status_value.value,
    time_fromValue.value,
    time_toValue.value,
  )
}

const restime_setting = ({ row, column }: any) => {
  if (column.property === 'response_time') {
    if (parseFloat(row.response_time) > 0 && parseFloat(row.response_time) <= 100) {
      return 'time-perfect' // 完美的
    } else if (parseFloat(row.response_time) > 100 && parseFloat(row.response_time) <= 500) {
      return 'time-excellent' // 可使用的
    } else if (parseFloat(row.response_time) > 500 && parseFloat(row.response_time) <= 1000) {
      return 'time-tolerable' // 可容忍的
    } else {
      return 'time-intolerable' // 不可忍受的
    }
  }
}

const rowcss_setting = ({ row }: any) => {
  if (row.assert_res_sign.includes('失败')) {
    return 'status-row'
  }
}

const resetClick = () => {
  path_select.value = ''
  status_value.value = ''
  time_fromValue.value = ''
  time_toValue.value = ''
}

const searchClick = async () => {
  await fecthCasesData(
    suite_key,
    plan_key,
    currentPage.value,
    defaultCount.value,
    path_select.value,
    status_value.value,
    time_fromValue.value,
    time_toValue.value,
  )
}

const viewDetails = (obj: any) => {
  drawer.value = true
  drawer_title.value = obj.step_name
  urlText.value = obj.request_url
  userVariablesJson.value = JSON.parse(obj.user_variables)
  requestParam.value = JSON.parse(obj.request_param)
  realResponse.value = JSON.parse(obj.real_response)
  assertText.value = obj.assert_res_sign
  assertDetails.value = JSON.parse(obj.assert_res_details.replace('详情:', ''))
}

const handleCommand = (c:any) => {
  switch (c) {
    case 'allPage':
      currentAllDatas()
      break
    case 'currentPage':
      currentPageDatas()
      break
  }
}

const exportCasesData = async (
  s_key: string,
  p_key: string,
  page: number,
  size: number,
  path: any = null,
  status_value: any = null,
  time_fromValue: any = null,
  time_toValue: any = null,
) => {
  let result = await fetchCases({
    suite_key: s_key,
    plan_key: p_key,
    current_page: page,
    current_count: totalCount.value,
    path: path,
    status: status_value,
    s_time: time_fromValue,
    e_time: time_toValue,
  })
  return result.cases
}

const currentAllDatas = async () => {
  try {
    const resultData = await exportCasesData(
      suite_key,
      plan_key,
      currentPage.value,
      defaultCount.value,
      path_select.value,
      status_value.value,
      time_fromValue.value,
      time_toValue.value,
    )

    const exportData: any[] = []

    resultData.forEach((caseData: CaseDatas, index: number) => {
      exportData.push({
        '类型': '用例概览',
        '用例': caseData.case_key,
        '用例状态': caseData.case_status,
        'SQL': caseData.sql
      })

      if (caseData.child_item && caseData.child_item.length > 0) {
        caseData.child_item.forEach(child => {
          exportData.push({
            '类型': '步骤',
            '步骤ID': child.step_id,
            '步骤名称': child.step_name,
            '用户变量':  truncateText(child.user_variables,5000),
            '请求URL': child.request_url,
            '请求参数': truncateText(child.request_param,5000),
            '实际响应': truncateText(child.real_response,10000),
            '响应时间': child.response_time,
            '断言结果标记': truncateText(child.assert_res_sign,1000),
            '断言详情': truncateText(child.assert_res_details,1000),
            '断言验证标记': child.assert_ver_sign,
            '断言时间标记': child.assert_time_sign
          })
        })
      }
      if (index < resultData.length - 1) {
        exportData.push({}) // 空行
      }

    })

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet1')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const date = new Date()
    saveAs(blob, `${date.toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`)
    ElMessage.success("导出成功")
  } catch (e) {
    console.log(e)
    ElMessage.error('导出失败')
  }
}

const currentPageDatas = () => {
  try {
    const table = document.querySelector('.el-table')
    if (!table) {
      console.error('未找到 .el-table 元素');
      return;
    }
    const clonedTable = table.cloneNode(true) as Element
    const allCells = clonedTable.querySelectorAll('td, th')
    allCells.forEach(cell => {
      if (cell.textContent.length > 30000) {
        cell.textContent = cell.textContent.substring(0, 30000) + '...（内容过长已截断）'
      }
    });
    const worksheet = XLSX.utils.table_to_sheet(clonedTable)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet1')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const date = new Date()
    saveAs(blob, `${date.toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`)
    ElMessage.success('导出成功')
  } catch (e) {
    console.log(e)
    ElMessage.error('导出失败')
  }
}

const truncateText = (text: string | undefined, maxLength: number = 1000): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...（已截断）'
}

const editCase = async (row:any) => {
  console.log(suite_key)
  console.log(plan_key)
  console.log(row.remarks)
  console.log(row)
  const res = await editorCase({
    "suite_key": suite_key,
    "plan_key": plan_key,
    "case_key": row.case_key,
    "remarks": row.remarks
  })
  if (res.msg == '更新成功') {
    await fecthCasesData(
      suite_key,
      plan_key,
      currentPage.value,
      defaultCount.value,
      path_select.value,
      status_value.value,
      time_fromValue.value,
      time_toValue.value,
    )
    ElMessage.success(res.msg)
  }else {
    ElMessage.error(res.msg)
  }


}

</script>

<style lang="scss" scoped>
.el-alert {
  margin-bottom: 20px;
}

.operation-wrapper {
  display: flex;
  gap: 10px;
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

.separator {
  color: #666;
  font-size: 14px;
  margin: 0px 8px;
}

.el-tooltip__popper {
  max-width: 60% !important;
  /* toptip提示语的宽度可根据自己需要进行设置 */
}

:deep(.el-popper) {
  min-width: 20px;
  max-width: 600px;
  --el-popover-bg-color: #67c23a;
  --el-popover-font-size: 14px;
  --el-popover-border-color: #67c23a;
  --el-popover-padding: 12px;
  --el-popover-border-radius: 8px;
}

:deep(.time-perfect) {
  background-color: #f0f9eb !important;
}

:deep(.time-excellent) {
  background-color: #ecf5ff !important;
}

:deep(.time-tolerable) {
  background-color: #fdf6ec !important;
}

:deep(.time-intolerable) {
  background-color: #fef0f0 !important;
}

:deep(.status-row) {
  background-color: #fef0f0 !important;
}
</style>
