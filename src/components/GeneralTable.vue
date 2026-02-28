<template>
  <el-card shadow="never">
    <div class="toolbar-wrapper" v-if="is_enabled_header">
      <div>
        <el-input v-model="search" size="small" placeholder="Type to search" />
      </div>
      <div class="operation-wrapper">
        <el-tooltip content="下载" placement="top-start">
          <el-dropdown @command="handleCommand">
            <el-button type="primary" :icon="Download" circle />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="currentPage">导出当前页</el-dropdown-item>
                <el-dropdown-item command="allPage">导出全部页</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip content="刷新当前页" placement="top-start">
          <el-button type="primary" :icon="RefreshRight" circle @click="refresh" />
        </el-tooltip>
      </div>
    </div>
    <div class="table-wrapper">
      <el-table
        ref="tableRef"
        :data="filteredData"
        v-loading="loading"
        element-loading-text="正在加载中..."
      >
        <el-table-column v-if="is_enable_selected" type="selection" width="55" />
        <el-table-column label="序号" type="index" width="60"></el-table-column>
        <el-table-column
          v-for="column in filteredColumnData"
          :key="column.label"
          :prop="column.prop"
          :label="column.label"
          align="center"
        >
          <template #default="scope">
            <template v-if="column.customRender">
              <component :is="column.customRender(scope.row)" />
            </template>
            <template v-else>
              {{ scope.row[column.prop] }}
            </template>
          </template>
        </el-table-column>
        <el-table-column v-if="is_enable" fixed="right" label="操作" min-width="120" align="center">
          <template #default="scope">
            <slot :row="scope.row"></slot>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pager-wrapper">
      <el-pagination
        :page-sizes="defaultCounts"
        v-model:current-page="currentPageLocal"
        v-model:page-size="defaultCountLocal"
        size="small"
        :default-page-size="defaultCount"
        layout="prev, pager, next, total, sizes"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import { Download, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage,type TableInstance  } from 'element-plus'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface Column {
  label: string
  prop: string
  isenable?: boolean
  customRender?: (row: any) => any
  customSearch?: (row: any, searchText: string) => boolean
}

interface Props {
  filterTableData: any[]
  columnData: Column[]
  defaultCounts: number[]
  currentPage: number
  defaultCount: number
  totalCount: number
  searchKeys: string[]
  is_enable: boolean
  is_enable_selected: boolean
  is_enable_header?: string
}

const tableRef: Ref<TableInstance | null> = ref(null)

const loading = ref(false)
const showLoading = () => (loading.value = true)
const hideLoading = () => (loading.value = false)

const props = defineProps<Props>()


const emits = defineEmits(['update:currentPage', 'update:defaultCount', 'refresh', 'exportAllPage'])

const currentPageLocal = ref(props.currentPage)
const defaultCountLocal = ref(props.defaultCount)

const search = ref('')

const is_enabled_header = computed(() => {
  console.log('1'+props.is_enable_header)
  return props.is_enable_header === '0' ? false : true;
})

const filteredData = computed(() =>
  props.filterTableData.filter((row) =>
    props.searchKeys.some((key) => {
      const column = props.columnData.find((col) => col.prop === key)
      const searchText = search.value.toLowerCase()

      if (column?.customSearch) {
        return column.customSearch(row, searchText)
      }

      return String(row[key] ?? '')
        .toLowerCase()
        .includes(searchText)
    }),
  ),
)

const filteredColumnData = computed(() => {
  return props.columnData.filter(column => {
    // 逻辑：isenable 为 undefined（未配置）→ 显示；isenable 为 true → 显示；否则隐藏
    return column.isenable !== false;
  });
})

function handleSizeChange(size: number) {
  emits('update:defaultCount', size)
}

function handleCurrentChange(page: number) {
  emits('update:currentPage', page)
}

const refresh = () => emits('refresh')

const handleCommand = (c: any) => {
  switch (c) {
    case 'allPage':
      emits('exportAllPage')
      break
    case 'currentPage':
      exportData()
      break
  }
}

const exportData = () => {
  try {
    const table = document.querySelector('.el-table')
    const worksheet = XLSX.utils.table_to_sheet(table)
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

defineExpose({
  showLoading,
  hideLoading,
  getSelectionRows: () => tableRef.value?.getSelectionRows() || [],
  clearSelection: () => tableRef.value?.clearSelection()
})
</script>

<style scoped>
.text-color {
  color: #409eff;
}

:deep(.table-header) {
  @apply bg-gray-200 text-dark-200;
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.operation-wrapper {
  display: flex;
  gap: 10px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
