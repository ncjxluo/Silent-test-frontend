<template>
  <div class="page">
    <el-splitter class="page-splitter">
      <!-- 左侧分组 -->
      <el-splitter-panel size="260" min="200">
        <el-card shadow="never" class="group-panel">
          <div class="group-header">
            <span>分组列表</span>
            <el-switch
              size="default"
              width="60px"
              v-model="group_switc"
              active-text="编辑"
              inactive-text="浏览"
              inline-prompt
            />
          </div>

          <div class="header-divider" />

          <el-tree
            :data="treeData"
            node-key="group_key"
            class="group-tree"
            @node-click="handleNodeClick"
            @node-contextmenu="handleContextMenu"
            :highlight-current="true"
            ref="groupTree"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <el-icon class="tree-node-icon">
                  <Monitor v-if="data.group_type === 'server'" />
                  <Folder v-else />
                </el-icon>

                <el-input
                  v-if="data.editing"
                  v-model="data.group_name"
                  size="small"
                  class="tree-node-input"
                  autofocus
                  @blur="finishEdit(data)"
                  @keydown.enter.stop.prevent="finishEdit(data)"
                  @keydown.esc.stop.prevent="cancelEdit(data)"
                />

                <span v-else class="tree-node-label">
                  {{ data.group_name }}
                </span>
                <span v-if="data.count !== undefined" class="tree-node-count">
                  {{ data.count }}
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-splitter-panel>

      <el-splitter-panel>
        <el-card shadow="never" class="content-panel">
          <!-- 工具栏 -->
          <div class="toolbar">
            <el-input
              v-model="fuzzy_search"
              placeholder="输入名称/IP搜索"
              style="width: 220px"
              @change="searchEvent"
              clearable
            />

            <div class="actions">
              <el-button type="primary" @click="handleAdd()">+ 新建</el-button>
              <el-button @click="handleVerifySelected()">验证</el-button>
              <el-button type="primary" :icon="Search" @click="handleAllSearch">全局搜索</el-button>
            </div>
          </div>

          <general-table
            :filter-table-data="tableDatas"
            :column-data="columnDatas"
            :default-counts="defaultCounts"
            v-model:current-page="currentPage"
            v-model:default-count="defaultCount"
            :total-count="totalCount"
            :search-keys="searchKeys"
            :is_enable_selected="true"
            :is_enable="is_enable"
            @update:currentPage="changePage"
            @update:defaultCount="changeCount"
            @refresh="refreshDatas"
            @exportAllPage="exportAllData"
            ref="GeneralTableRef"
          >
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleFind(scope.row)">
                详情
              </el-button>
              <el-button type="primary" text bg size="small" @click="handleEditor(scope.row)">
                编辑
              </el-button>
              <el-button type="primary" text bg size="small" @click="handleConntion(scope.row)">
                连接
              </el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </general-table>
        </el-card>
      </el-splitter-panel>
    </el-splitter>
  </div>
  <TreeContextMenu
    :visible="menuVisible"
    :x="menuX"
    :y="menuY"
    :actions="menuActions"
    @select="handleMenuSelect"
    @close="menuVisible = false"
  />

  <general-dialog
    ref="GeneralDialogRef"
    :title="dialog_title"
    :width="600"
    :confirmText="dialog_button_text"
    btype="primary"
    @confirm="handleNew"
  >
    <div class="header-divider" />
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      :validate-on-rule-change="false"
      label-width="auto"
      style="max-width: 600px"
    >
      <el-form-item label="虚拟机分组" v-if="dialog_action === '编辑'">
<!--        <el-select placeholder="请选择虚机分组" class="w-full" clearable>-->
<!--          <el-option label="研发" value="研发" />-->
<!--          <el-option label="测试" value="测试" />-->
<!--          <el-option label="产品" value="产品" />-->
<!--        </el-select>-->
        <el-tree-select
          v-model="selected_group"
          :data="treeData"
          node-key="group_key"
          :props="treeProps"
          filterable
          style="width: 240px"
          placeholder="请选择分组"
        />
      </el-form-item>
      <!-- 主机名称 -->
      <el-form-item label="主机名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入主机名称" class="w-full" />
      </el-form-item>

      <el-form-item label="环境标签" prop="envTag">
        <el-select v-model="form.envTag" placeholder="请选择环境标签" class="w-full" clearable>
          <el-option label="研发" value="研发" />
          <el-option label="测试" value="测试" />
          <el-option label="产品" value="产品" />
        </el-select>
      </el-form-item>

      <el-form-item label="连接地址">
        <div class="flex items-center bg-gray-50 rounded-md border border-gray-200 p-1" >

          <el-tag type="info" size="small" class="mr-2 bg-blue-50 text-blue-700 border-blue-200"
            >ssh</el-tag
          >
          <el-form-item prop="username" >
          <el-input
            v-model="form.username"
            placeholder="用户名"
            class="w-28 mr-2 flex-initial"
            size="small"
          />
          </el-form-item>
          <span class="text-gray-500 mr-2">@</span>
          <el-form-item prop="host">
            <el-input v-model="form.host" placeholder="主机名/IP" class="flex-1 mr-2" size="small" />
          </el-form-item>
          <span class="text-gray-500 mr-1">-P</span>
          <el-form-item prop="port">
            <el-input v-model="form.port" placeholder="端口" class="w-20 flex-initial" size="small" />
          </el-form-item>
        </div>
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入登录密码"
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="备注信息">
        <el-input
          v-model="form.remark"
          placeholder="请输入主机备注信息"
          type="textarea"
          :rows="3"
          class="w-full"
        />
      </el-form-item>
    </el-form>
  </general-dialog>

  <general-dialog
    ref="GeneralDialogAllSearchRef"
    title="全局搜索"
    :width="1000"
    confirmText="0"
    btype="primary"
  >
    <el-card shadow="never" class="content-panel">
      <div class="toolbar">
        <el-input
          v-model="allsearchinput"
          placeholder="输入名称|IP|备注搜索"
          style="width: 320px"
          clearable
        />
        <div class="actions">
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </div>
      </div>

      <general-table
        :filter-table-data="allsearchtableDatas"
        :column-data="allcolumnDatas"
        :default-counts="alldefaultCounts"
        v-model:current-page="allcurrentPage"
        v-model:default-count="alldefaultCount"
        :total-count="alltotalCount"
        :search-keys="searchKeys"
        :is_enable_selected="false"
        :is_enable="is_enable"
        @update:currentPage="changePage"
        @update:defaultCount="changeCount"
        @refresh="refreshDatas"
        @exportAllPage="exportAllData"
        ref="AllGeneralTableRef"
      >
        <template #default="scope">
          <el-button type="primary" text bg size="small" @click="allSearchhandleEditor(scope.row)">
            跳转
          </el-button>
          <el-button type="primary" text bg size="small" @click="handleConntion(scope.row)">
            连接
          </el-button>
        </template>
      </general-table>
    </el-card>
  </general-dialog>

  <general-drawer
    ref="GeneralDrawerRef"
    :title="'虚机:' + drawerShowData?.virtual_name || '虚机详情'"
    size="30%"
    closeOnClickModal
    destroyOnClose
    :showButton="false"
  >
    <el-descriptions title="基础信息" :column="1" border class="info-descriptions" size="default">
      <el-descriptions-item label="所属分组">
        <span class="cell-text">{{ drawerShowData?.group_name || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="主机名称">
        <span class="cell-text">{{ drawerShowData?.virtual_name || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="连接地址">
        <span class="cell-text">{{ drawerShowData?.virtual_ip_address || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="连接端口">
        <span class="cell-text">{{ drawerShowData?.virtual_ip_port || '22' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="连接用户">
        <span class="cell-text">{{ drawerShowData?.virtual_username || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="描述信息">
        <span class="cell-text">{{ drawerShowData?.description || '-' }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      title="扩展属性"
      :column="1"
      border
      class="info-descriptions"
      size="default"
      style="margin-top: 20px"
    >
      <el-descriptions-item label="所属环境">
        <span class="cell-text">{{ drawerShowData?.virtual_env || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="系统发行版">
        <span class="cell-text">{{
          getValue(drawerShowData?.virtual_config_info, '系统发行版') || '-'
        }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="cpu核心数">
        <span class="cell-text">{{
          getValue(drawerShowData?.virtual_config_info, 'cpu(核心数)') + '核' || '-'
        }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="内存大小">
        <span class="cell-text">{{
          getValue(drawerShowData?.virtual_config_info, '内存') + 'G' || '-'
        }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="磁盘大小">
        <span class="cell-text">{{
          getValue(drawerShowData?.virtual_config_info, '磁盘') || '-'
        }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        <span class="cell-text">{{ drawerShowData?.created_at || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        <span class="cell-text">{{ drawerShowData?.updated_at || '-' }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </general-drawer>

  <general-dialog
    ref="DelDialogRef"
    title="删除虚拟机"
    :width="500"
    confirmText="确定"
    btype="danger"
    @confirm="delConfirm"
  >
    <div>确定删除吗？</div>
  </general-dialog>
</template>

<script setup lang="ts">
import { h, onMounted, ref, nextTick } from 'vue'
import { Folder, Monitor } from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'
import { ElForm, ElMessage, ElMessageBox, ElTag, ElText, type TreeInstance } from 'element-plus'
import TreeContextMenu, { type ContextMenuAction } from '@/components/GeneralTree.vue'
import { serversetting } from '@/hooks/hostmanagement/serversetting.ts'
import GeneralTable from '@/components/GeneralTable.vue'
import GeneralDialog from '@/components/GeneralDialog.vue'
import { router } from '@/router'
import GeneralDrawer from '@/components/GeneralDrawer.vue'

/* =========================
 * 基础状态
 * ========================= */

const GeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const GeneralTableRef = ref<InstanceType<typeof GeneralTable>>()
const AllGeneralTableRef = ref<InstanceType<typeof GeneralTable>>()

const GeneralDialogAllSearchRef = ref<InstanceType<typeof GeneralDialog>>()

const GeneralDrawerRef = ref<InstanceType<typeof GeneralDrawer>>()

// 全局搜索的组件定义
const allsearchinput = ref('')
const allsearchtableDatas = ref<VirtualMachineItem[]>([])
const alldefaultCounts = ref([10000])
const allcurrentPage = ref(1)
const alldefaultCount = ref(10000)
const alltotalCount = ref(0)
const groupTree = ref<TreeInstance | null>(null)

// 抽屉展示的信息
const drawerShowData = ref<VirtualMachineItem>()

// 删除虚机
const DelDialogRef = ref<InstanceType<typeof GeneralDialog>>()

// 新增和编辑虚机
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const dialog_title = ref('')
const dialog_button_text = ref('')
const dialog_action = ref('')
const treeProps = ref({
  label: 'group_name',
})
const selected_group = ref('')
const selected_key = ref('')


const group_switc = ref(false)

const fuzzy_search = ref('')

const group_selected = ref('8d5654a7-391f-48b9-9032-a8b4aae9b1b9')

const form = ref({
  envTag: '', // 环境标签值
  name: '', // 主机名称
  username: '', // SSH用户名
  host: '', // 主机IP/域名
  port: '22', // SSH端口，默认22
  password: '', // 登录密码
  remark: '', // 备注信息
})

const rules = {
  envTag: [{ required: true, message: '请选择环境标签', trigger: 'submit' }],
  name: [{ required: true, message: '请输入虚机名称', trigger: 'submit' }],
  username: [{ required: true, message: '请输入连接用户名', trigger: 'submit' }],
  host: [{ required: true, message: '请输入虚机ip地址', trigger: 'submit' }],
  port: [{ required: true, message: '请输入虚机端口号', trigger: 'submit' }],
  password: [{ required: true, message: '请输入虚机密码', trigger: 'submit' }],
}

const handleReset = () => {
  Object.assign(form.value, {
    envTag: '',
    name: '',
    username: '',
    host: '',
    port: '22',
    password: '',
    remark: '',
  })
  // 可选：手动清除校验提示
  formRef.value?.clearValidate()
}

const is_enable = ref(true)
const defaultCounts = ref([30, 50, 100])
const currentPage = ref(1)
const defaultCount = ref(30)
const totalCount = ref(0)
const searchKeys = ref(['agent_name', 'agent_status'])

const vm_statusTypeMap = {
  未连接: 'info',
  无法连接: 'danger',
  可连接: 'success',
}

interface TableRow {
  status: '未连接' | '无法连接' | '可连接'
  [key: string]: any
}

const vm_envTypeMap = {
  研发: '#1890ff',
  测试: '#c2bf1a',
  产品: '#52c41a',
}

interface envRow {
  virtual_env: '研发' | '测试' | '产品'
  [key: string]: any
}

const tableDatas = ref<VirtualMachineItem[]>([])

const allcolumnDatas = ref([
  {
    label: '分组名',
    prop: 'group_name',
  },
  {
    label: '主机名',
    prop: 'virtual_name',
  },
  {
    label: '所属环境',
    prop: 'virtual_env',
    customRender: (row: envRow) =>
      h(
        ElText,
        {
          style: {
            color: row.virtual_env ? vm_envTypeMap[row.virtual_env] : '#1890ff',
          },
        },
        () => row.virtual_env,
      ),
  },
  {
    label: 'IP地址',
    prop: 'virtual_ip_address',
  },
  {
    label: '备注',
    prop: 'description',
  },
  {
    label: '验证状态',
    prop: 'status',
    customRender: (row: TableRow) =>
      h(
        ElTag,
        {
          type: row.status
            ? (vm_statusTypeMap[row.status] as 'info' | 'danger' | 'success')
            : ('info' as 'info' | 'danger' | 'success'),
        },
        () => row.status,
      ),
    customSearch: (row: any, searchText: string) => {
      const statusText = row.status
      return statusText.toLowerCase().includes(searchText)
    },
  },
])

const columnDatas = ref([
  {
    label: '分组名',
    prop: 'group_name',
    isenable: false,
  },
  {
    label: '主机名',
    prop: 'virtual_name',
  },
  {
    label: '所属环境',
    prop: 'virtual_env',
    customRender: (row: envRow) =>
      h(
        ElText,
        {
          style: {
            color: row.virtual_env ? vm_envTypeMap[row.virtual_env] : '#1890ff',
          },
        },
        () => row.virtual_env,
      ),
  },
  {
    label: 'IP地址',
    prop: 'virtual_ip_address',
  },
  {
    label: '用户名',
    prop: 'virtual_username',
  },
  {
    label: '资源配置',
    prop: 'virtual_config_info',
    isenable: false,
  },
  {
    label: '备注',
    prop: 'description',
    isenable: false,
  },
  {
    label: '验证状态',
    prop: 'status',
    customRender: (row: TableRow) =>
      h(
        ElTag,
        {
          type: row.status
            ? (vm_statusTypeMap[row.status] as 'info' | 'danger' | 'success')
            : ('info' as 'info' | 'danger' | 'success'),
        },
        () => row.status,
      ),
    customSearch: (row: any, searchText: string) => {
      const statusText = row.status
      return statusText.toLowerCase().includes(searchText)
    },
  },
])

interface VirtualMachineItem {
  group_key: string
  group_name: string
  virtual_key: string
  virtual_name: string
  virtual_env: string
  virtual_ip_address: string
  virtual_ip_port: string
  virtual_username: string
  virtual_password: string
  status: string
  virtual_config_info: string | ''
  description: string | ''
  created_at: string | Date
  updated_at: string | Date
}

interface VirtualMachine {
  total_count: number
  virtual_machines: VirtualMachineItem[]
}

interface VerifyVirtualMachine {
  result: Record<string, string>[]
}

const changePage = async () => {}

const changeCount = async () => {}

const exportAllData = async () => {}

const refreshDatas = async () => {}

const handleAdd = async () => {
  handleReset()
  dialog_title.value = '新增虚拟机'
  dialog_button_text.value = '新增'
  dialog_action.value = '新增'
  GeneralDialogRef.value?.open()
}

const searchEvent = async () => {
  await fetchVirtualMachine(
    group_selected.value,
    fuzzy_search.value,
    currentPage.value,
    defaultCount.value,
  )
}

const handleNew = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (dialog_action.value === '新增') {
        const res = await addVirtualMachine({
          group_key: group_selected.value,
          virtual_name: form.value.name,
          virtual_env: form.value.envTag,
          virtual_ip_address: form.value.host,
          virtual_ip_port: form.value.port,
          virtual_username: form.value.username,
          virtual_password: form.value.password,
          description: form.value.remark,
        })
        if (res.msg == '新增成功') {
          ElMessage.success(res.msg)
          GeneralDialogRef.value?.close()
          await fetchVirtualMachine(
            group_selected.value,
            fuzzy_search.value,
            currentPage.value,
            defaultCount.value,
          )
        } else {
          ElMessage.error(res.msg)
        }
      }else{

        const res = await editVirtualMachine({
          group_key: selected_group.value,
          virtual_key: selected_key.value,
          virtual_name: form.value.name,
          virtual_env: form.value.envTag,
          virtual_ip_address: form.value.host,
          virtual_ip_port: form.value.port,
          virtual_username: form.value.username,
          virtual_password: form.value.password,
          description: form.value.remark,
        })
        if (res.msg == '编辑成功') {
          ElMessage.success(res.msg)
          GeneralDialogRef.value?.close()
          await fetchVirtualMachine(
            group_selected.value,
            fuzzy_search.value,
            currentPage.value,
            defaultCount.value,
          )
        } else {
          ElMessage.error(res.msg)
        }
      }


    }
  })

}

const handleVerifySelected = async () => {
  const selectedRows = GeneralTableRef.value?.getSelectionRows() ?? []
  const selectedKyes = selectedRows.map((row: any) => row.virtual_key)
  if (selectedRows.length > 0) {
    // console.log(selectedKyes)
    const res: VerifyVirtualMachine = await verifyVirtualMachine({
      virtual_keys: selectedKyes,
    })
    console.log(res)
    const hasFail: boolean = res.result.some((obj) => {
      const msg = Object.values(obj)[0]
      return typeof msg === 'string' && msg.startsWith('无法连接')
    })

    if (hasFail) {
      ElMessage.warning('部分主机连接失败')
    } else {
      ElMessage.success('验证连接成功')
    }
    await fetchVirtualMachine(
      group_selected.value,
      fuzzy_search.value,
      currentPage.value,
      defaultCount.value,
    )
  } else {
    ElMessage.info('没有选择要验证的机器')
  }
}

const handleEditor = async (row: any) => {
  handleReset()
  dialog_title.value = '编辑虚拟机'
  dialog_button_text.value = '编辑'
  dialog_action.value = '编辑'
  console.log(row)
  selected_group.value = row.group_key
  selected_key.value = row.virtual_key
  Object.assign(form.value, {
    envTag: row.virtual_env,
    name: row.virtual_name,
    username: row.virtual_username,
    host: row.virtual_ip_address,
    port: row.virtual_ip_port,
    password: row.virtual_password,
    remark: row.description,
  })
  GeneralDialogRef.value?.open()
}

const handleDelete = async (row: any) => {
  DelDialogRef.value?.open(row)
}

const {
  addServerGroup,
  getServerGroup,
  delServerGroup,
  addVirtualMachine,
  getVirtualMachine,
  verifyVirtualMachine,
  getVirtualMachineAllSearch,
  delVirtualMachine,
  editVirtualMachine,
} = serversetting()

interface TreeNode {
  group_key: string
  group_name: string
  group_type?: 'cloud' | 'server'
  parent_key?: string
  group_order?: number
  children?: TreeNode[]
  editing?: boolean
  _oldLabel?: string
}

const treeData = ref<TreeNode[]>([])

/* =========================
 * 右键菜单
 * ========================= */

const menuVisible = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const currentNode = ref<TreeNode | null>(null)

const menuActions: ContextMenuAction[] = [
  { key: 'add-root', label: '添加根节点' },
  { key: 'add-child', label: '添加子节点' },
  { key: 'rename', label: '重命名节点' },
  { key: 'delete', label: '删除节点', danger: true },
]

onMounted(async () => {
  await fetchGroup()
  await fetchVirtualMachine(
    group_selected.value,
    fuzzy_search.value,
    currentPage.value,
    defaultCount.value,
  )
})

const fetchVirtualMachine = async (
  group_key: string,
  fuzzy_search: string | null,
  page: number,
  size: number,
) => {
  const res: VirtualMachine = await getVirtualMachine({
    group_key: group_key,
    fuzzy_search: fuzzy_search,
    current_page: page,
    current_count: size,
  })
  totalCount.value = res.total_count
  tableDatas.value = res.virtual_machines
}

const fetchGroup = async () => {
  const res = await getServerGroup()
  treeData.value = res
}

const handleNodeClick = async (data: TreeNode) => {
  if (data.children?.length === 0) {
    group_selected.value = data.group_key
    await fetchVirtualMachine(
      group_selected.value,
      fuzzy_search.value,
      currentPage.value,
      defaultCount.value,
    )
  }
}

const handleContextMenu = (event: MouseEvent, data: TreeNode) => {
  if (!group_switc.value) return
  event.preventDefault()
  currentNode.value = data
  menuX.value = event.clientX
  menuY.value = event.clientY
  menuVisible.value = true
}

const handleMenuSelect = (key: string) => {
  switch (key) {
    case 'add-child':
      addChildNode()
      break
    case 'add-root':
      addRootNode()
      break
    case 'rename':
      renameNode()
      break
    case 'delete':
      deleteNode()
      break
  }
}

/* =========================
 * Tree CRUD（原地编辑）
 * ========================= */

/** 添加子节点（直接进入编辑态） */
const addChildNode = () => {
  if (!currentNode.value) return
  if (currentNode.value.group_type === 'server') {
    ElMessage.warning('禁止增加三级节点')
    return
  }
  const children = currentNode.value.children || []
  const lastObj = children[children.length - 1]
  const lastOrder = lastObj?.group_order ?? 0
  const child: TreeNode = {
    group_key: '-1',
    group_name: '',
    group_type: 'server',
    parent_key: currentNode.value.group_key,
    group_order: Number(lastOrder) + 1,
    editing: true,
  }
  currentNode.value.children ||= []
  currentNode.value.children.push(child)
}

/** 添加根节点 */
const addRootNode = () => {
  const lastobj = treeData.value[treeData.value.length - 1]
  const lastOrder = lastobj?.group_order ?? 0
  treeData.value.push({
    group_key: '0',
    group_name: '',
    group_type: 'cloud',
    parent_key: '0',
    group_order: Number(lastOrder) + 1,
    editing: true,
  })
}

/** 重命名 */
const renameNode = () => {
  if (!currentNode.value) return
  currentNode.value._oldLabel = currentNode.value.group_name
  currentNode.value.editing = true
}

/** 完成编辑 */
const finishEdit = async (node: TreeNode) => {
  if (!node.group_name?.trim()) {
    ElMessage.warning('名称不能为空')
    return
  }
  node.editing = false
  delete node._oldLabel
  const res = await addServerGroup({
    group_key: node.group_key,
    parent_key: node.parent_key,
    group_name: node.group_name,
    group_type: node.group_type,
    group_order: node.group_order,
  })
  if (res.msg == '新增成功' || res.msg == '编辑成功') {
    ElMessage.success(res.msg)
    await fetchGroup()
  } else {
    ElMessage.error(res.msg)
  }
}

/** 取消编辑 */
const cancelEdit = (node: TreeNode) => {
  // 新增节点取消 → 直接删除
  if (!node._oldLabel && !node.group_name) {
    removeNode(node.group_key)
    return
  }

  // 重命名取消 → 回滚
  if (node._oldLabel !== undefined) {
    node.group_name = node._oldLabel
    delete node._oldLabel
  }

  node.editing = false
}

/** 删除节点 */
const deleteNode = async () => {
  if (!currentNode.value) return
  if (currentNode.value.group_key === '8d5654a7-391f-48b9-9032-a8b4aae9b1b9') {
    ElMessage.warning('默认节点不可以删除')
    return
  }
  try {
    await ElMessageBox.confirm(`确认删除「${currentNode.value.group_name}」？`, '删除确认', {
      type: 'warning',
    })
    removeNode(currentNode.value.group_key)
  } catch {}
}

const removeNode = async (group_key: string) => {
  const res = await delServerGroup({
    group_key: group_key,
  })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    await fetchGroup()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleConntion = (row: any) => {
  console.log(row.virtual_ip_address)
  router.push({ name: 'shell', params: { v_key: row.virtual_key, v_ip: row.virtual_ip_address } })
}

const handleAllSearch = async () => {
  GeneralDialogAllSearchRef.value?.open()
}

const handleSearch = async () => {
  // const a = allsearchinput.value
  const res = await getVirtualMachineAllSearch({
    fuzzy_search: allsearchinput.value,
    current_page: allcurrentPage.value,
    current_count: alldefaultCount.value,
  })
  allsearchtableDatas.value = res.virtual_machines
}

const allSearchhandleEditor = async (data: any) => {
  const targetKey = data.group_key
  group_selected.value = targetKey
  GeneralDialogAllSearchRef.value?.close()
  await nextTick()

  setTimeout(() => {
    const targetNode = groupTree.value?.getNode(targetKey)
    if (targetNode) {
      groupTree.value?.$emit('node-click', targetNode.data, targetNode, null)
      groupTree.value?.setCurrentKey(targetKey)
    } else {
      ElMessage.warning(`未找到分组节点：${targetKey}`)
    }
  }, 150)
}

const handleFind = (data: any) => {
  GeneralDrawerRef.value?.open(data)
  drawerShowData.value = data
}

const getValue = (data: any, key: string) => {
  try {
    data = JSON.parse(data)
    return data[key]
  } catch (error) {
    return '-'
  }
}

const delConfirm = async (row: any) => {
  const res = await delVirtualMachine({ virtual_key: row.virtual_key })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fetchVirtualMachine(
      group_selected.value,
      fuzzy_search.value,
      currentPage.value,
      defaultCount.value,
    )
  } else {
    ElMessage.error(res.msg)
  }
}
</script>

<style scoped>
.page {
  height: calc(100vh - 64px); /* 根据你的 layout header 调整 */
  /* background: #f5f7fa; */
  box-sizing: border-box;
}

.page-splitter {
  height: 100%;
}

/* 卡片通用 */
.group-panel {
  height: 100%;
  border: none;
  margin-right: 10px;
}

.content-panel {
  height: 100%;
  border: none;
  margin-left: 5px;
}

/* 左侧头部 */
.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
}

/* 分隔线 */
.header-divider {
  height: 1px;
  background-color: var(--el-border-color-light);
  margin-bottom: 18px;
}

/* 树 */
.group-tree {
  height: calc(100% - 56px);
  overflow: auto;
}

/* tree 节点 */
.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.tree-node-icon {
  color: var(--el-color-primary);
}

.tree-node-label {
  flex: 1;
}

.tree-node-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 右侧工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

/* 统一表单元素样式 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-form-item__content) {
  margin-left: 0 !important;
}

/* 输入框圆角统一 */
:deep(.el-input__wrapper) {
  border-radius: 4px;
}

/* 连接地址输入框的边框统一 */
:deep(.el-input--small .el-input__wrapper) {
  border: none;
  box-shadow: none;
}
</style>
