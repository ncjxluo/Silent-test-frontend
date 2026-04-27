<template>
  <el-card shadow="never">
    <div class="table-wrapper">
      <el-table
        ref="tableRef"
        :data="props.filterTableData"
        v-loading="loading"
        element-loading-text="正在加载中..."
      >
        <el-table-column type="expand">
          <template #default="props">
            <el-table
              :data="props.row.child_item"
              border
              tooltip-effect="light"
            >
              <el-table-column label="子序号" type="index" width="100" align="center" />
              <el-table-column
                v-for="s_column in s_filteredColumnData"
                :key="s_column.label"
                :prop="s_column.prop"
                :label="s_column.label"
                align="center"
              >
                <template #default="scope">
                  <template v-if="s_column.customRender">
                    <component :is="s_column.customRender(scope.row)" />
                  </template>
                  <template v-else>
                    {{ scope.row[s_column.prop] }}
                  </template>
                </template>
              </el-table-column>
              <el-table-column v-if="s_operation_is_enable" fixed="right" label="操作" min-width="80" align="center">
                <template #default="scope">
                  <slot name="s_operation" :row="scope.row"></slot>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column v-if="is_enable_selected" type="selection" width="55" />
        <el-table-column label="序号" type="index" width="60"></el-table-column>
        <el-table-column
          v-for="p_column in p_filteredColumnData"
          :key="p_column.label"
          :prop="p_column.prop"
          :label="p_column.label"
          align="center"
        >
          <template #default="scope">
            <template v-if="p_column.customRender">
              <component :is="p_column.customRender(scope.row)" />
            </template>
            <template v-else>
              {{ scope.row[p_column.prop] }}
            </template>
          </template>
        </el-table-column>
        <el-table-column v-if="p_operation_is_enable" fixed="right" label="操作" min-width="80" align="center">
          <template #default="scope">
            <slot name="p_operation" :row="scope.row"></slot>
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
import { type TableInstance  } from 'element-plus'

interface Column {
  label: string
  prop: string
  isenable?: boolean
  customRender?: (row: any) => any
  customSearch?: (row: any, searchText: string) => boolean
}

interface Props {
  filterTableData: any[]
  p_columnData: Column[]
  s_columnData: Column[]
  defaultCounts: number[]
  currentPage: number
  defaultCount: number
  totalCount: number
  s_operation_is_enable: boolean
  p_operation_is_enable: boolean
  is_enable_selected: boolean
  is_enable_header?: string
}

const tableRef: Ref<TableInstance | null> = ref(null)

const loading = ref(false)

const showLoading = () => (loading.value = true)
const hideLoading = () => (loading.value = false)

const props = defineProps<Props>()

const emits = defineEmits(['update:currentPage', 'update:defaultCount'])

const currentPageLocal = ref(props.currentPage)
const defaultCountLocal = ref(props.defaultCount)

const p_filteredColumnData = computed(() => {
  return props.p_columnData.filter(column => {
    return column.isenable !== false;
  });
})

const s_filteredColumnData = computed(() => {
  return props.s_columnData.filter(column => {
    return column.isenable !== false;
  });
})

function handleSizeChange(size: number) {
  emits('update:defaultCount', size)
}

function handleCurrentChange(page: number) {
  emits('update:currentPage', page)
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
