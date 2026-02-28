<template>
  <div class="mb-4">
    <el-button type="primary" bg size="small" @click="handleAddition"> 自定义角色 </el-button>
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
      <el-button type="primary" text bg size="small" @click="showDrawer(scope.row, 'find')">
        查看
      </el-button>
      <el-button type="primary" text bg size="small" @click="showDrawer(scope.row, 'edit')"> 编辑 </el-button>
      <el-button type="danger" text bg size="small" @click="handleDelRole(scope.row)"> 删除 </el-button>
    </template>
  </general-table>

  <general-drawer
    ref="AdditionGeneralDrawerRef"
    title="新增角色"
    size="40%"
    closeOnClickModal
    destroyOnClose
    @submit="addittion_role"
    :showButton="true"
  >
    <el-descriptions title="角色信息" :column="1">
      <el-descriptions-item label="角色名称">
        <el-input v-model="addrolename" style="width: 240px" placeholder="Please input" />
      </el-descriptions-item>
      <el-descriptions-item label="角色说明">
        <el-input v-model="addroledesc" style="width: 240px" placeholder="Please input" />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="权限菜单" :column="1">
      <el-descriptions-item label="权限信息">
        <el-tree
          :data="updateTreeData"
          ref="addPermissionTree"
          node-key="menu_key"
          :props="updateTreeProps"
          show-checkbox
          default-expand-all
        >
        </el-tree>
      </el-descriptions-item>
    </el-descriptions>
  </general-drawer>

  <general-drawer
    ref="GeneralDrawerRef"
    title="查看角色"
    size="40%"
    closeOnClickModal
    destroyOnClose
    :showButton="false"
  >
    <el-descriptions title="角色信息" :column="1">
      <el-descriptions-item label="角色名称">{{ rolename }}</el-descriptions-item>
      <el-descriptions-item label="角色说明">{{ roledesc }}</el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="权限菜单" :column="1">
      <el-descriptions-item label="权限信息">
        <el-tree
          :data="treeData"
          ref="permissionTree"
          node-key="menu_key"
          :props="treeProps"
          show-checkbox
          default-expand-all
          :default-checked-keys="pendingPermissionKeys"
        >
        </el-tree>
      </el-descriptions-item>
    </el-descriptions>
  </general-drawer>

  <general-dialog ref="DelDialogRef"
                  title='删除角色'
                  :width=500
                  confirmText="确定"
                  btype="danger"
                  @confirm="delConfirm">
    <div>确定删除吗？</div>
  </general-dialog>

  <general-drawer
    ref="EditGeneralDrawerRef"
    title="编辑角色"
    size="40%"
    closeOnClickModal
    destroyOnClose
    :showButton="true"
    @submit="edit_role"
  >
    <el-descriptions title="角色信息" :column="1">
<!--      <el-descriptions-item label="角色名称">{{ rolename }}</el-descriptions-item>-->
<!--      <el-descriptions-item label="角色说明">{{ roledesc }}</el-descriptions-item>-->
      <el-descriptions-item label="角色名称">
        <el-input v-model="editrolename" style="width: 240px" placeholder="Please input" />
      </el-descriptions-item>
      <el-descriptions-item label="角色说明">
        <el-input v-model="editroledesc" style="width: 240px" placeholder="Please input" />
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="权限菜单" :column="1">
      <el-descriptions-item label="权限信息">
        <el-tree
          :data="treeData"
          ref="permissionTree"
          node-key="menu_key"
          :props="treeProps"
          show-checkbox
          default-expand-all
          :default-checked-keys="pendingPermissionKeys"
        >
        </el-tree>
      </el-descriptions-item>
    </el-descriptions>
  </general-drawer>

</template>

<script setup lang="ts">
import GeneralTable from '@/components/GeneralTable.vue'
import GeneralDrawer from '@/components/GeneralDrawer.vue'
import { system_role } from '@/hooks/systems/roles.ts'
import { system_menu } from '@/hooks/systems/menus.ts'
import { useMenu } from '@/hooks/useMenu.ts'
import type { MenuItem } from '@/types/menu_type.ts'
import { onMounted, ref } from 'vue'

import { ElMessage, type TreeInstance } from 'element-plus'
import { ElTree } from 'element-plus'
import GeneralDialog from '@/components/GeneralDialog.vue'

const is_enable = ref(true)
const defaultCounts = ref([30, 50, 100])
const currentPage = ref(1)
const defaultCount = ref(30)
const totalCount = ref(0)
const searchKeys = ref(['agent_name', 'agent_status'])

const permissionTree = ref<TreeInstance | null>(null)

const addPermissionTree = ref<TreeInstance | null>(null)

const GeneralTableRef = ref<InstanceType<typeof GeneralTable>>()

const AdditionGeneralDrawerRef = ref<InstanceType<typeof GeneralDrawer>>()
const GeneralDrawerRef = ref<InstanceType<typeof GeneralDrawer>>()
const EditGeneralDrawerRef = ref<InstanceType<typeof GeneralDrawer>>()

const isViewMode = ref(true)

const DelDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const tableDatas = ref<RoleItem[]>([])

const columnDatas = ref([
  {
    label: '角色名称',
    prop: 'role_name',
  },
  {
    label: '描述',
    prop: 'description',
  },
])

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

const treeProps = {
  label: 'menu_name',
  children: 'children',
  disabled: () => isViewMode.value,
}

const updateTreeProps = {
  label: 'menu_name',
  children: 'children',
}

const { fetchRole, fetchActiveRole, additionRole, delRole, editRole } = system_role()
const { fetchMenu } = system_menu()
const { buildTree, filterTree } = useMenu()

const t_data = ref()

onMounted(async () => {
  try {
    await fecthRoleData(currentPage.value, defaultCount.value)
    const menus: MenuItem[] = await fetchMenu()
    const menus_tree = buildTree(menus)
    t_data.value = filterTree(menus_tree, -1)
    treeData.value = t_data.value
    updateTreeData.value = t_data.value
  } catch (error) {
    console.error('请求失败:', error)
  }
})

const collectParentKeys = (menuTree:any) => {
  const parentKeys = new Set()
  console.log(t_data.value)
  menuTree.forEach((item:any) => {
    if (item.children && item.children.length > 0) {
      parentKeys.add(item.menu_key)
      const childParentKeys = collectParentKeys(item.children)
      childParentKeys.forEach(childKey => {
        parentKeys.add(childKey)
      })
    }
  })
  return parentKeys;
}

const fecthRoleData = async (page: number, size: number) => {
  const result: Roles = await fetchRole({
    current_page: page,
    current_count: size,
  })
  totalCount.value = result.total_count
  tableDatas.value = result.roles
}

const changePage = async () => {}

const changeCount = async () => {}

const exportAllData = async () => {}

const refreshDatas = async () => {}

const treeData = ref([])
const updateTreeData = ref([])

const addrolename = ref('')
const addroledesc = ref('')

const editrolename = ref('')
const editroledesc = ref('')

const rolename = ref('')
const roledesc = ref('')

const pendingPermissionKeys = ref<string[]>([])

const init_menus = ref('')

const showDrawer = async (row: any, btype: string) => {
  rolename.value = row.role_name
  roledesc.value = row.description
  const parentMenuKeys = collectParentKeys(t_data.value)
  const keyList = await fetchActiveRole({ "role_key": row.role_key })
  init_menus.value = keyList
  pendingPermissionKeys.value = keyList.filter((key:any) => !parentMenuKeys.has(key))

  if (btype === 'find') {
    isViewMode.value = true
    GeneralDrawerRef.value?.open(row)
  }else {
    isViewMode.value = false
    editrolename.value = row.role_name
    editroledesc.value = row.description
    EditGeneralDrawerRef.value?.open(row)
  }

}

const handleAddition = async () => {
  AdditionGeneralDrawerRef.value?.open()
}

const addittion_role = async () => {
  console.log(addrolename.value)
  console.log(addroledesc.value)
  const checkObj = addPermissionTree.value?.getCheckedNodes(false, true)
  console.log(checkObj)
  const res = await additionRole({
    "role_name": addrolename.value,
    "role_description": addroledesc.value,
    "checkObj": checkObj,
  })
  AdditionGeneralDrawerRef.value?.close()
  if (res.msg == '新增成功') {
    ElMessage.success(res.msg)
    await fecthRoleData(currentPage.value, defaultCount.value)
    // await fecthDeptData(currentPage.value, defaultCount.value)
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelRole = async (row: any) => {
  DelDialogRef.value?.open(row)
}

const delConfirm = async (row: any) => {
  console.log(row)

  const res = await delRole({ "role_key": row.role_key })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fecthRoleData(currentPage.value, defaultCount.value)
  }
  else{
    ElMessage.error(res.msg)
  }
}

const edit_role = async (row: any) => {
  console.log(row)
  const res = await editRole({
    "role_key": row.role_key,
    "role_name": editrolename.value,
    "role_description": editroledesc.value,
    "initialCheckObj": init_menus.value,
    "checkObj": permissionTree.value?.getCheckedNodes(false, true)
  })
  if (res.msg == '更新成功') {
    ElMessage.success(res.msg)
    EditGeneralDrawerRef.value?.close()
    await fecthRoleData(currentPage.value, defaultCount.value)
  }
  else{
    ElMessage.error(res.msg)
  }
}


//--测试
</script>

<style scoped></style>
