<template>
  <div class="mb-4">
    <el-button type="primary" bg size="small" @click="dialogVisible = true"> 新增用户 </el-button>
  </div>
  <general-table
    :filter-table-data="tableDatas"
    :column-data="columnDatas"
    :default-counts="defaultCounts"
    v-model:current-page="currentPage"
    v-model:default-count="defaultCount"
    :total-count="totalCount"
    :search-keys="searchKeys"
    :is_enable="is_enable"
    @update:currentPage="changePage"
    @update:defaultCount="changeCount"
    @refresh="refreshDatas"
    @exportAllPage="exportAllData"
    ref="GeneralTableRef"
  >
    <template #default="scope">
      <el-button type="primary" text bg size="small"> 查看权限 </el-button>
      <el-button type="primary" text bg size="small" @click="handleEditor(scope.row)"> 编辑 </el-button>
      <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)"> 删除 </el-button>
    </template>
  </general-table>

  <el-dialog
    v-model="dialogVisible"
    title="新增用户"
    width="500"
    draggable
    overflow
  >
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="用户名">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="真实姓名">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="部门">
<!--        <el-select v-model="dept_select" clearable placeholder="请选择部门" style="width: 240px">-->
<!--          <el-option v-for="item in path_options" :key="item.path" :value="item.path" />-->
<!--        </el-select>-->
      </el-form-item>
      <el-form-item label="角色">

      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import GeneralTable from '@/components/GeneralTable.vue'
import { system_users } from '@/hooks/systems/users.ts'
import { h, onMounted, ref, reactive } from 'vue'
import { ElTag } from 'element-plus'

const dialogVisible = ref(false)

const form = reactive({
  name: '',
  region: ''
})

const dept_select = ref('')

const path_options = ref([])

const is_enable = ref(true)
const defaultCounts = ref([3, 30, 50, 100])
const currentPage = ref(1)
const defaultCount = ref(3)
const totalCount = ref(0)
const searchKeys = ref(['agent_name', 'agent_status'])

const GeneralTableRef = ref<InstanceType<typeof GeneralTable>>()
const tableDatas = ref<UserItem[]>([])
const columnDatas = ref([
  {
    label: '用户名',
    prop: 'username',
  },
  {
    label: '真实姓名',
    prop: 'nickname',
  },
  {
    label: '邮箱',
    prop: 'email',
  },
  {
    label: '手机号',
    prop: 'phone',
  },
  {
    label: '状态',
    prop: 'status',
    customRender: (row: any) => h(
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
  {
    label: '部门',
    prop: 'dept',
  },
  {
    label: '创建时间',
    prop: 'created_at',
  }
])

interface UserItem {
  user_key: string
  nickname: string
  username: string
  email: string
  phone: string
  status: string
  dept: string
  created_at: string | Date
}

interface Users {
  total_count: number
  users: UserItem[]
}

const { fetchUsers } = system_users()

onMounted(async () => {
  try {
    await fecthUserData(currentPage.value, defaultCount.value)
  } catch (error) {
    console.error('请求失败:', error)
  }
})

const fecthUserData = async (page: number, size: number) => {
  const result: Users = await fetchUsers({
    current_page: page,
    current_count: size,
  })
  totalCount.value = result.total_count
  tableDatas.value = result.users
}

const changePage = async () => {}

const changeCount = async () => {}

const exportAllData = async () => {}

const refreshDatas = async () => {}

const handleEditor = async (row: any) => {
  console.log(row)
}

const handleDelete = async (row: any) => {
  console.log(row)
}



// const handleNew = async () => {
//   console.log("点击")
// }
</script>

<style scoped></style>
