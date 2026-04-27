<template>
  <div class="bg-gray-100 p-4">
    <!-- 顶部搜索区 -->
    <div class="bg-white p-4 rounded mb-4 flex items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="text-gray-700">应用名称：</span>
        <el-input v-model="searchForm.app_name" placeholder="请输入" class="w-64" @change="searchEvent"/>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-700">产品线名称：</span>
<!--        <el-input v-model="searchForm.product" placeholder="请输入" class="w-64" @change="searchEvent"/>-->
        <el-select v-model="searchForm.product" filterable clearable placeholder="请选择产品线" @change="searchEvent" style="width: 240px">
          <el-option
            v-for="item in line_options"
            :key="item.id"
            :label="item.app_product_line"
            :value="item.app_product_line"
          />
        </el-select>
      </div>
    </div>
    <!-- 应用列表区 -->
    <div class="bg-white rounded p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">应用列表</h3>
        <div class="flex gap-2">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建应用
          </el-button>
          <el-button type="primary" @click="handleLineAdd">
            <el-icon><Plus /></el-icon>
            新建产品线
          </el-button>
          <!--          <el-button @click="handleFullscreen">-->
          <!--            <el-icon><FullScreen /></el-icon>-->
          <!--          </el-button>-->
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
        :is_enable_selected="false"
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
          <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </general-table>
    </div>
  </div>
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
      <!-- 主机名称 -->
      <el-form-item label="应用名称" prop="app_nickname">
        <el-input v-model="form.app_nickname" placeholder="请输入应用名称" class="w-full" />
      </el-form-item>

      <el-form-item label="应用产品线" prop="app_product_line">
<!--        <el-input v-model="form.app_product_line" placeholder="请输入应用产品线" class="w-full" />-->
        <el-select v-model="form.app_product_line" filterable clearable placeholder="请选择产品线" @change="searchEvent" style="width: 240px">
          <el-option
            v-for="item in line_options"
            :key="item.id"
            :label="item.app_product_line"
            :value="item.app_product_line"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="应用前缀名(版本号前)" prop="app_before_name">
        <el-input v-model="form.app_before_name" placeholder="请输入应用前缀名" class="w-full" />
      </el-form-item>

      <el-form-item label="应用后缀名(版本号后)" prop="app_end_name">
        <el-input v-model="form.app_end_name" placeholder="请输入应用后缀名" class="w-full" />
      </el-form-item>

      <el-form-item label="应用下载方式" prop="app_download_type">
        <el-select v-model="form.app_download_type" placeholder="请选择应用下载方式" class="w-full" clearable>
          <el-option label="ftp" value="ftp" />
          <el-option label="http" value="http" />
        </el-select>
      </el-form-item>

      <el-form-item label="应用下载ip" prop="app_download_ip">
        <el-input v-model="form.app_download_ip" placeholder="请输入应用下载ip" class="w-full" />
      </el-form-item>

      <el-form-item label="应用下载端口" prop="app_download_port">
        <el-input v-model="form.app_download_port" placeholder="请输入应用下载端口" class="w-full" />
      </el-form-item>

      <el-form-item label="应用下载用户名">
        <el-input v-model="form.app_download_uname" placeholder="请输入应用下载用户名" class="w-full" />
      </el-form-item>

      <el-form-item label="应用下载用户的密码">
        <el-input
          v-model="form.app_download_passwd"
          type="password"
          placeholder="请输入登录密码"
          class="w-full"
        />
      </el-form-item>

      <el-form-item label="应用下载的路径" prop="app_download_path">
        <el-input
          v-model="form.app_download_path "
          placeholder="请输入应用下载的路径"
          type="textarea"
          :rows="2"
          class="w-full"
        />
      </el-form-item>
    </el-form>
  </general-dialog>

  <general-drawer
    ref="GeneralDrawerRef"
    :title="'应用:' + drawerShowData?.app_nickname || '应用详情'"
    size="35%"
    closeOnClickModal
    destroyOnClose
    :showButton="false"
  >
    <el-descriptions title="详细信息" :column="1" border class="info-descriptions" size="default">
      <el-descriptions-item label="应用名">
        <span class="cell-text">{{ drawerShowData?.app_nickname || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品线">
        <span class="cell-text">{{ drawerShowData?.app_product_line || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品前缀名">
        <span class="cell-text">{{ drawerShowData?.app_before_name || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品后缀名">
        <span class="cell-text">{{ drawerShowData?.app_end_name || '' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品下载方式">
        <span class="cell-text">{{ drawerShowData?.app_download_type || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品下载ip">
        <span class="cell-text">{{ drawerShowData?.app_download_ip || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品下载端口">
        <span class="cell-text">{{ drawerShowData?.app_download_port || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品下载用户名">
        <span class="cell-text">{{ drawerShowData?.app_download_uname || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品下载密码">
        <span class="cell-text">{{ drawerShowData?.app_download_passwd || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品下载路径">
        <span class="cell-text">{{ drawerShowData?.app_download_path || '-' }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </general-drawer>

  <general-dialog
    ref="DelDialogRef"
    title="删除应用配置"
    :width="500"
    confirmText="确定"
    btype="danger"
    @confirm="delConfirm"
  >
    <div>确定删除吗？</div>
  </general-dialog>

  <general-dialog
    ref="LineGeneralDialogRef"
    :title="line_dialog_title"
    :width="600"
    :confirmText="line_dialog_button_text"
    btype="primary"
    @confirm="line_handleNew"
  >
    <div class="header-divider" />
    <el-form
      :model="line_form"
      :rules="line_rules"
      ref="line_formRef"
      :validate-on-rule-change="false"
      label-width="auto"
      style="max-width: 600px"
    >
      <el-form-item label="应用产品线" prop="app_product_line">
        <el-input v-model="line_form.app_product_line" placeholder="请输入应用产品线" class="w-full" />
      </el-form-item>
    </el-form>
  </general-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import GeneralTable from '@/components/GeneralTable.vue'
import GeneralDialog from '@/components/GeneralDialog.vue'
import GeneralDrawer from '@/components/GeneralDrawer.vue'
import { app_config } from '@/hooks/deployment/appconfig.ts'

const { fetchAppConfig, addAppConfig, editAppConfig, delAppConfig, addAppLine, fetchAppLine } = app_config()

//搜索区
interface SearchForm {
  app_name: string
  product: string
}

const searchForm = ref<SearchForm>({
  app_name: '',
  product: '',
})

//表格定义
interface AppConfigItem {
  id: number
  app_nickname: string
  app_product_line: string
  app_before_name: string
  app_end_name: string
  app_download_type: string
  app_download_ip: string
  app_download_port: string
  app_download_uname: string
  app_download_passwd: string
  app_download_path: string
  created_at: string | Date
  updated_at: string | Date
}

interface AppConfigs {
  total_count: number
  app_configs: AppConfigItem[]
}

const tableDatas = ref<AppConfigItem[]>([])
const GeneralDrawerRef = ref<InstanceType<typeof GeneralDrawer>>()

const columnDatas = ref([
  {
    label: '应用名',
    prop: 'app_nickname',
  },
  {
    label: '产品线',
    prop: 'app_product_line',
  },
  {
    label: '下载类型',
    prop: 'app_download_type',
  },
])

const is_enable = ref(true)
const defaultCounts = ref([30, 50, 100])
const currentPage = ref(1)
const defaultCount = ref(30)
const totalCount = ref(0)
const searchKeys = ref(['agent_name', 'agent_status'])

const fetchAppConfigs = async (n_name:string, p_line:string, page: number, size: number) => {
  const res: AppConfigs = await fetchAppConfig(
    {
      app_nickname: n_name,
      app_product_line: p_line,
      current_page: page,
      current_count: size,
    }
  )
  totalCount.value = res.total_count
  tableDatas.value = res.app_configs
}

const drawerShowData = ref<AppConfigItem>()

const changePage = async () => {
  await fetchAppConfigs(
    searchForm.value.app_name,
    searchForm.value.product,
    currentPage.value,
    defaultCount.value,
  )
}

const changeCount = async () => {
  await fetchAppConfigs(
    searchForm.value.app_name,
    searchForm.value.product,
    currentPage.value,
    defaultCount.value,
  )
}

const exportAllData = async () => {}

const refreshDatas = async () => {
  await fetchAppConfigs(
    searchForm.value.app_name,
    searchForm.value.product,
    currentPage.value,
    defaultCount.value,
  )
}

const searchEvent = async () => {
  await fetchAppConfigs(
    searchForm.value.app_name,
    searchForm.value.product,
    currentPage.value,
    defaultCount.value,
  )
}

const handleFind = (data: any) => {
  GeneralDrawerRef.value?.open(data)
  drawerShowData.value = data
}

const handleEditor = (row: any) => {
  handleReset()
  dialog_title.value = '编辑应用'
  dialog_button_text.value = '编辑'
  dialog_action.value = '编辑'
  Object.assign(form.value, {
    app_nickname: row.app_nickname,
    app_product_line: row.app_product_line,
    app_before_name: row.app_before_name,
    app_end_name: row.app_end_name,
    app_download_type: row.app_download_type,
    app_download_ip: row.app_download_ip,
    app_download_port: row.app_download_port,
    app_download_uname: row.app_download_uname,
    app_download_passwd: row.app_download_passwd,
    app_download_path: row.app_download_path,
  })
  GeneralDialogRef.value?.open(row)
}

// 新增 和 编辑
const formRef = ref<InstanceType<typeof ElForm> | null>(null)
const GeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()


const dialog_title = ref('')
const dialog_button_text = ref('')
const dialog_action = ref('')


const form = ref({
  app_nickname: '',
  app_product_line: '',
  app_before_name: '',
  app_end_name: '',
  app_download_type: 'ftp',
  app_download_ip: '',
  app_download_port: '',
  app_download_uname: '',
  app_download_passwd: '',
  app_download_path: '',
})

const rules = {
  app_nickname: [{ required: true, message: '请输入应用名称', trigger: 'submit' }],
  app_product_line: [{ required: true, message: '请输入应用产品线', trigger: 'submit' }],
  app_before_name: [{ required: true, message: '请输入应用前缀名', trigger: 'submit' }],
  app_end_name: [{ required: true, message: '请输入应用后缀名', trigger: 'submit' }],
  app_download_type: [{ required: true, message: '请选择应用下载方式', trigger: 'submit' }],
  app_download_ip: [{ required: true, message: '请输入应用下载ip', trigger: 'submit' }],
  app_download_port: [{ required: true, message: '请输入应用下载端口', trigger: 'submit' }],
  app_download_path: [{ required: true, message: '请输入应用下载的路径', trigger: 'submit' }],
}

const handleReset = () => {
  Object.assign(form.value, {
    app_nickname: '',
    app_product_line: '',
    app_before_name: '',
    app_end_name: '',
    app_download_type: 'ftp',
    app_download_ip: '',
    app_download_port: '',
    app_download_uname: '',
    app_download_passwd: '',
    app_download_path: '',
  })
  // 可选：手动清除校验提示
  formRef.value?.clearValidate()
}

const handleAdd = async () => {
  handleReset()
  dialog_title.value = '新增应用'
  dialog_button_text.value = '新增'
  dialog_action.value = '新增'
  GeneralDialogRef.value?.open()
}

const handleNew = async (row: any) => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (dialog_action.value === '新增') {
        const res = await addAppConfig({
          app_nickname: form.value.app_nickname,
          app_product_line: form.value.app_product_line,
          app_before_name: form.value.app_before_name,
          app_end_name: form.value.app_end_name,
          app_download_type: form.value.app_download_type,
          app_download_ip: form.value.app_download_ip,
          app_download_port: form.value.app_download_port,
          app_download_uname: form.value.app_download_uname,
          app_download_passwd: form.value.app_download_passwd,
          app_download_path: form.value.app_download_path
        })
        if (res.msg == '新增成功') {
          ElMessage.success(res.msg)
          GeneralDialogRef.value?.close()
          await fetchAppConfigs(
            searchForm.value.app_name,
            searchForm.value.product,
            currentPage.value,
            defaultCount.value
          )
        }else{
          ElMessage.error(res.msg)
          GeneralDialogRef.value?.close()

        }
      }else {

        const res = await editAppConfig({
          id: row.id,
          app_nickname: form.value.app_nickname,
          app_product_line: form.value.app_product_line,
          app_before_name: form.value.app_before_name,
          app_end_name: form.value.app_end_name,
          app_download_type: form.value.app_download_type,
          app_download_ip: form.value.app_download_ip,
          app_download_port: form.value.app_download_port,
          app_download_uname: form.value.app_download_uname,
          app_download_passwd: form.value.app_download_passwd,
          app_download_path: form.value.app_download_path
        })

        if (res.msg == '编辑成功') {
          ElMessage.success(res.msg)
          GeneralDialogRef.value?.close()
          await fetchAppConfigs(
            searchForm.value.app_name,
            searchForm.value.product,
            currentPage.value,
            defaultCount.value
          )
        }else{
          ElMessage.error(res.msg)
          GeneralDialogRef.value?.close()
        }
      }
    }
  })
}

// 删除
const DelDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const handleDelete = (row: any) => {
  DelDialogRef.value?.open(row)
}

const delConfirm = async (row: any) => {
  const res = await delAppConfig({
    id: row.id
  })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fetchAppConfigs(
      searchForm.value.app_name,
      searchForm.value.product,
      currentPage.value,
      defaultCount.value
    )
  }else {
    ElMessage.error(res.msg)
    DelDialogRef.value?.close()
  }
}

// 产品线

const line_formRef = ref<InstanceType<typeof ElForm> | null>(null)
const LineGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const line_dialog_title = ref('')
const line_dialog_button_text = ref('')

const line_form = ref({
  app_product_line: '',
})

const line_rules = {
  app_product_line: [{ required: true, message: '请输入应用产品线', trigger: 'submit' }],
}

const lineHandleReset = () => {
  Object.assign(line_form.value, {
    app_product_line: '',
  })
  // 可选：手动清除校验提示
  line_formRef.value?.clearValidate()
}

const handleLineAdd = async () => {
  lineHandleReset()
  line_dialog_title.value = '新增产品线'
  line_dialog_button_text.value = '新增'
  LineGeneralDialogRef.value?.open()
}

const line_handleNew = async (row: any) => {
  line_formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
        const res = await addAppLine({
          app_product_line: line_form.value.app_product_line,
        })
        if (res.msg == '新增成功') {
          ElMessage.success(res.msg)
          LineGeneralDialogRef.value?.close()
          await fetchLine()
        }else{
          ElMessage.error(res.msg)
          LineGeneralDialogRef.value?.close()
      }
    }
  })
}

interface lineItem {
  id: string
  app_product_line: string
}

const line_options = ref<lineItem[]>([])

const fetchLine = async () => {
  const res: lineItem[] = await fetchAppLine(
    {}
  )
  line_options.value = res
}


onMounted(async () => {
  await fetchAppConfigs(
    searchForm.value.app_name,
    searchForm.value.product,
    currentPage.value,
    defaultCount.value
  )
  await fetchLine()
})
</script>

<style scoped></style>
