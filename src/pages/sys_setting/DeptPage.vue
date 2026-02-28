<template>
  <div class="mb-4">
    <el-button type="primary" bg size="small" @click="handleDialog"> 新增组织 </el-button>
  </div>
  <general-table
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
    ref="GeneralTableRef"
  >
    <template #default="scope">
      <el-button type="primary" text bg size="small" @click="handleEditor(scope.row)">
        编辑
      </el-button>
      <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
        删除
      </el-button>
    </template>
  </general-table>

  <general-dialog ref="GeneralDialogRef"
                  title='新增组织'
                  :width=500
                  confirmText="新增"
                  btype="primary"
                  @confirm="handleNew">
        <el-form :model="form" label-width="auto" style="max-width: 600px">
          <el-form-item label="组织名">
            <el-input v-model="form.dept_name" />
          </el-form-item>
          <el-form-item label="是否启用">
            <el-radio-group v-model="form.status">
              <el-radio value="1" size="large">启用</el-radio>
              <el-radio value="0" size="large">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
  </general-dialog>

  <general-dialog ref="EditDialogRef"
                  title='编辑组织'
                  :width=500
                  confirmText="更新"
                  btype="primary"
                  @confirm="Editor">
    <el-form :model="editform" label-width="auto" style="max-width: 600px">
      <el-form-item label="组织名">
        <el-input v-model="editform.dept_name" />
      </el-form-item>
      <el-form-item label="是否启用">
        <el-radio-group v-model="editform.status">
          <el-radio value="1" size="large">启用</el-radio>
          <el-radio value="0" size="large">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </general-dialog>

  <general-dialog ref="DelDialogRef"
                  title='删除组织'
                  :width=500
                  confirmText="确定"
                  btype="danger"
                  @confirm="delConfirm">
    <div>确定删除吗？</div>
  </general-dialog>
</template>

<script setup lang="ts">
import GeneralTable from '@/components/GeneralTable.vue'
import GeneralDialog from '@/components/GeneralDialog.vue'
import { system_dept } from '@/hooks/systems/depts.ts'
import { h, onMounted, ref, reactive } from 'vue'
import { ElMessage, ElTag } from 'element-plus'

// const dialogVisible = ref(false)

const form = reactive({
  dept_name: '',
  status: '1',
})


const editform = reactive({
  dept_key: '',
  dept_name: '',
  status: '',
})

const is_enable = ref(true)
const defaultCounts = ref([30, 50, 100])
const currentPage = ref(1)
const defaultCount = ref(30)
const totalCount = ref(0)
const searchKeys = ref(['agent_name', 'agent_status'])

const GeneralTableRef = ref<InstanceType<typeof GeneralTable>>()

const GeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const EditDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const DelDialogRef = ref<InstanceType<typeof GeneralDialog>>()


const tableDatas = ref<DeptItem[]>([])
const columnDatas = ref([
  {
    label: '部门名',
    prop: 'dept_name',
  },
  {
    label: '状态',
    prop: 'status',
    customRender: (row: any) =>
      h(
        ElTag,
        {
          type: row.status === 0 ? 'danger' : 'success',
        },
        () => (row.status === 0 ? '禁用' : '启用'),
      ),
    customSearch: (row: any, searchText: string) => {
      const statusText = row.status === 0 ? '禁用' : '启用'
      return statusText.toLowerCase().includes(searchText)
    },
  },
])

interface DeptItem {
  dept_key: string
  dept_name: string
  status: string
  created_at: string | Date
}

interface Depts {
  total_count: number
  depts: DeptItem[]
}

const { fetchDept, additionDept, delDept, changeDept } = system_dept()

onMounted(async () => {
  try {
    await fecthDeptData(currentPage.value, defaultCount.value)
  } catch (error) {
    console.error('请求失败:', error)
  }
})

const fecthDeptData = async (page: number, size: number) => {
  const result: Depts = await fetchDept({
    current_page: page,
    current_count: size,
  })
  totalCount.value = result.total_count
  tableDatas.value = result.depts
}

const changePage = async () => {}

const changeCount = async () => {}

const exportAllData = async () => {}

const refreshDatas = async () => {}

const handleEditor = async (row: any) => {
  console.log(row)
  EditDialogRef.value?.open()
  editform.dept_key = row.dept_key
  editform.dept_name = row.dept_name
  editform.status = row.status.toString()
  // const res = await changeDept(editform)
}

const handleDelete = async (row: any) => {
  DelDialogRef.value?.open(row)
}

const handleNew = async () => {
  const res = await additionDept(form)
  if (res.msg == '新增成功') {
    ElMessage.success(res.msg)
    GeneralDialogRef.value?.close()
    await fecthDeptData(currentPage.value, defaultCount.value)
  }
  else{
    ElMessage.error(res.msg)
  }
}

const handleDialog = () => {
  GeneralDialogRef.value?.open()
}

const Editor = async () => {
  const res = await changeDept(editform)
  if (res.msg == '更新成功') {
    EditDialogRef.value?.close()
    await fecthDeptData(currentPage.value, defaultCount.value)
    ElMessage.success(res.msg)
  }else {
    ElMessage.error(res.msg)
  }

}

const delConfirm = async (row: any) => {
  // console.log(row)
  const res = await delDept({ dept_key: row.dept_key })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fecthDeptData(currentPage.value, defaultCount.value)
  }
  else{
    ElMessage.error(res.msg)
  }
}

</script>

<style scoped></style>
