<template>
  <div class="mb-4">
    <el-button type="primary" bg size="small" @click="addition_user"> 新增用户 </el-button>
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

  <el-dialog v-model="dialogVisible" title="新增用户" width="500" draggable overflow>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="真实姓名">
        <el-input v-model="form.nickname" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio value="1" size="large">启用</el-radio>
          <el-radio value="0" size="large">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="部门">
        <el-select v-model="form.dept_key" clearable placeholder="请选择部门" style="width: 240px">
          <el-option
            v-for="item in dept_options"
            :key="item.dept_key"
            :label="item.dept_name"
            :value="item.dept_key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="form.role_key" clearable placeholder="请选择角色" style="width: 240px">
          <el-option
            v-for="item in role_options"
            :key="item.role_key"
            :label="item.role_name"
            :value="item.role_key"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancel_save">取消</el-button>
        <el-button type="primary" @click="save_user"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>

  <general-dialog
    ref="DelDialogRef"
    title="删除用户"
    :width="500"
    confirmText="确定"
    btype="danger"
    @confirm="delConfirm"
  >
    <div>确定删除吗？</div>
  </general-dialog>
</template>

<script setup lang="ts">
import GeneralTable from '@/components/GeneralTable.vue'
import { system_users } from '@/hooks/systems/users.ts'
import { system_dept } from '@/hooks/systems/depts.ts'
import { h, onMounted, ref, reactive } from 'vue'
import { ElMessage, ElTag } from 'element-plus'
import { system_role } from '@/hooks/systems/roles.ts'
import GeneralDialog from '@/components/GeneralDialog.vue'

const dialogVisible = ref(false)

const DelDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: '',
  dept_key: '',
  role_key: '',
})

const { fetchDept } = system_dept()
const { fetchUsers, additionUser, delUser, changeUser } = system_users()
const { fetchRole } = system_role()

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

interface RoleItem {
  role_key: string
  role_name: string
  description: string
  created_at: string | Date
}

interface Roles {
  total_count: number
  roles: RoleItem[]
}

const dept_options = ref<DeptItem[]>([])

const role_options = ref<RoleItem[]>([])

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
  {
    label: '部门',
    prop: 'dept',
  },
  {
    label: '角色',
    prop: 'role',
  },
  {
    label: '创建时间',
    prop: 'created_at',
  },
])

interface UserItem {
  user_key: string
  nickname: string
  username: string
  email: string
  phone: string
  status: string
  dept_key: string
  dept: string
  role_key: string
  role: string
  created_at: string | Date
}

interface Users {
  total_count: number
  users: UserItem[]
}

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
  DelDialogRef.value?.open(row)
}

const addition_user = async () => {
  dialogVisible.value = true
  await fecthDeptData()
  await fecthRoleData()
}

const fecthDeptData = async () => {
  const result: Depts = await fetchDept({
    current_page: 1,
    current_count: 1000000,
  })
  dept_options.value = result.depts
}

const fecthRoleData = async () => {
  const result: Roles = await fetchRole({
    current_page: 1,
    current_count: 1000000,
  })
  role_options.value = result.roles
}

const save_user = async () => {
  console.log(form)
  const res =  await additionUser(form)
  if (res.msg == '新增成功') {
    ElMessage.success(res.msg)
    dialogVisible.value = false
    await fecthUserData(currentPage.value, defaultCount.value)
  }
  else{
    ElMessage.error(res.msg)
  }
}

const cancel_save = async () => {
  dialogVisible.value = false
  Object.assign(form, {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    status: '',
    dept_key: '',
    role_key: '',
  })
}

const delConfirm = async (row: any) => {
  const res = await delUser({ user_key: row.user_key })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fecthUserData(currentPage.value, defaultCount.value)
  }
  else{
    ElMessage.error(res.msg)
  }
}

// const handleNew = async () => {
//   console.log("点击")
// }
</script>

<style scoped></style>
