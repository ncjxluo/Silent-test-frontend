<template>
  <div class="bg-gray-100 p-4" style="height: 100%">
    <!-- 顶部搜索区 -->
    <div class="bg-white p-4 rounded mb-4 flex items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="text-gray-700 w-30">策略名称：</span>
        <el-input
          v-model="searchForm.strategy_name"
          placeholder="请输入"
          class="w-64"
          @change="searchEvent"
        />
      </div>
    </div>
    <!-- 应用列表区 -->
    <div class="bg-white rounded p-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">策略列表</h3>
        <div class="flex gap-2">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建
          </el-button>
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
          <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </general-table>
    </div>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="dialog_title"
    width="1000px"
    :close-on-click-modal="false"
    draggable
    overflow
    style="max-height: 800px"
  >
    <el-steps style="max-width: 1000px" :active="currentStep" finish-status="success" align-center>
      <el-step
        v-for="(step, index) in steps"
        :key="index"
        :title="step"
        sp
      />
    </el-steps>
    <div class="step-content">
      <div v-if="currentStep === 1" class="mt-4">
        <el-form :model="basicInfoForm" :rules="basicrules" label-width="120px" ref="basicInfoFormRef">
          <el-form-item label="策略名称" prop="strategy_name">
            <el-input
              v-model="basicInfoForm.strategy_name"
              placeholder="请输入策略名称"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item prop="process_mode">
            <template #label>
              <span style="display: flex; align-items: center; gap: 4px">
                部署模式
                <el-tooltip placement="top" effect="dark">
                  <template #content>
                    串行部署：按顺序逐个启动 <br />
                    并行部署：将会开启多个连接加速部署(但未经极端测试，可能有bug)
                  </template>
                  <el-icon size="16" color="#909399" style="cursor: help">
                    <QuestionFilled />
                  </el-icon>
                </el-tooltip>
              </span>
            </template>
            <el-button-group>
              <el-button
                :type="basicInfoForm.process_mode === '串行' ? 'primary' : 'default'"
                @click="basicInfoForm.process_mode = '串行'"
              >
                串行
              </el-button>
              <el-button
                :type="basicInfoForm.process_mode === '并行' ? 'primary' : 'default'"
                @click="basicInfoForm.process_mode = '并行'"
              >
                并行
              </el-button>
            </el-button-group>
          </el-form-item>
          <el-form-item label="请选择产品线" prop="product_line">
            <!--            <el-input v-model="basicInfoForm.pr" placeholder="请选择产品线" style="width: 300px" />-->
            <el-select
              v-model="basicInfoForm.product_line"
              filterable
              clearable
              placeholder="请选择产品线"
              style="width: 240px"
            >
              <el-option
                v-for="item in line_options"
                :key="item.id"
                :label="item.app_product_line"
                :value="item.app_product_line"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="目标机器" prop="target_vm">
            <el-select
              v-model="basicInfoForm.target_vm"
              filterable
              clearable
              placeholder="请选择目标虚机"
              style="width: 240px"
            >
              <el-option
                v-for="item in vm_options"
                :key="item.virtual_key"
                :label="item.virtual_name"
                :value="item.virtual_key"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div v-if="currentStep === 2" class="mt-4">
        <el-form :model="deploymentInfoForm" :rules="deploymentrules" label-width="120px" size="default" ref="deploymentInfoFormRef">
          <el-form-item label="部署工具路径" prop="deployment_path">
            <el-input
              v-model="deploymentInfoForm.deployment_path"
              placeholder="请输入部署工具路径"
              style="width: 400px"
            />
          </el-form-item>
          <el-form-item label="配置文件内容" prop="deployment_config_content">
            <el-alert
              title="必须按照部署工具的规则，设置参数"
              size="small"
              type="info"
              show-icon
              :closable="false"
            >
            </el-alert>
          </el-form-item>
        </el-form>
        <general-code
          v-model="deploymentInfoForm.deployment_config_content"
          language="typescript"
          theme="vs"
          style="width: 550px; height: 480px"
          :options="{ fontSize: 14, minimap: { enabled: false } }"
        />
      </div>
      <div v-if="currentStep === 3">
        <div style="text-align: center; padding: 20px 0; width: 950px">
          <el-alert type="warning" :closable="false">
            <p>
              注：点击表格可以编辑"绑定组件名"、“绑定组件值”、“执行命令”单元格，应确保其没有"--",否则无法执行部署操作
            </p>
          </el-alert>
          <el-table :data="tableData" border max-height="400px" @cell-click="handleCellClick">
            <!-- 应用名列 -->
            <el-table-column prop="app_nickname" label="应用名">
              <template #default="scope">
                {{ scope.row.app_nickname }}
              </template>
            </el-table-column>

            <!-- 绑定的组件名列 -->
            <el-table-column prop="field_name" label="绑定组件名">
              <template #default="scope">
                <div class="edit-cell" @click.stop="startEdit(scope.row, 'field_name')">
                  <el-input
                    v-if="editingCell === `${scope.row.id}-field_name`"
                    v-model="scope.row.field_name"
                    size="small"
                    @blur="finishEdit"
                    @keyup.enter="finishEdit"
                    ref="inputRefs"
                  />
                  <span v-else class="cell-text">{{ scope.row.field_name || '--' }}</span>
                </div>
              </template>
            </el-table-column>
            <!-- 绑定的组件值列 -->
            <el-table-column prop="field_order" label="组件排序" width="100">
              <template #default="scope">
                <div class="edit-cell" @click.stop="startEdit(scope.row, 'field_order')">
                  <el-input
                    v-if="editingCell === `${scope.row.id}-field_order`"
                    v-model="scope.row.field_order"
                    size="small"
                    @blur="finishEdit"
                    @keyup.enter="finishEdit"
                    ref="inputRefs"
                  />
                  <span v-else class="cell-text">{{ scope.row.field_order || '--' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="app_deploy_name" label="部署组件名" width="100">
              <template #default="scope">
                <div class="edit-cell" @click.stop="startEdit(scope.row, 'app_deploy_name')">
                  <el-input
                    v-if="editingCell === `${scope.row.id}-app_deploy_name`"
                    v-model="scope.row.app_deploy_name"
                    size="small"
                    @blur="finishEdit"
                    @keyup.enter="finishEdit"
                    ref="inputRefs"
                  />
                  <span v-else class="cell-text">{{ scope.row.app_deploy_name || '--' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="exec_cmd" label="部署执行的命令">
              <template #default="scope">
                <div class="edit-cell" @click.stop="startEdit(scope.row, 'exec_cmd')">
                  <el-input
                    v-if="editingCell === `${scope.row.id}-exec_cmd`"
                    v-model="scope.row.exec_cmd"
                    size="small"
                    @blur="finishEdit"
                    @keyup.enter="finishEdit"
                    ref="inputRefs"
                    :rows="2"
                    type="textarea"
                  />
                  <span v-else class="cell-text">{{ scope.row.exec_cmd || '--' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="verify_cmd" label="验证部署的命令">
              <template #default="scope">
                <div class="edit-cell" @click.stop="startEdit(scope.row, 'verify_cmd')">
                  <el-input
                    v-if="editingCell === `${scope.row.id}-verify_cmd`"
                    v-model="scope.row.verify_cmd"
                    size="small"
                    @blur="finishEdit"
                    @keyup.enter="finishEdit"
                    ref="inputRefs"
                    :rows="2"
                    type="textarea"
                  />
                  <span v-else class="cell-text">{{ scope.row.verify_cmd || '--' }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>


      <div
        v-if="currentStep === 4"
        class="mt-4"
        style="
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:20px;
    width:100%;
  "
      >
        <!-- 提示 -->
        <div style="width:100%;max-width:600px;">
          <el-alert type="warning" :closable="false">
            <p style="margin:0 0 8px;">
              注：发送的内容支持参数化，参数需与配置应用信息保持一致
            </p>
            <p style="margin:0;">
              可用的参数: {{ warm_reminder }}
            </p>
          </el-alert>
        </div>

        <!-- 表单 -->
        <el-form
          :model="messageInfoForm"
          :rules="messageinforules"
          label-position="top"
          ref="messageInfoFormRef"
          style="width:100%;max-width:600px;"
        >

          <el-form-item label="发送时机" prop="timing_sending">
            <el-button-group>
              <el-button
                :type="messageInfoForm.timing_sending === '部署前' ? 'primary' : 'default'"
                @click="messageInfoForm.timing_sending = '部署前'"
              >
                仅部署前
              </el-button>
              <el-button
                :type="messageInfoForm.timing_sending === '部署后' ? 'primary' : 'default'"
                @click="messageInfoForm.timing_sending = '部署后'"
              >
                仅部署后
              </el-button>
              <el-button
                :type="messageInfoForm.timing_sending === '部署前后' ? 'primary' : 'default'"
                @click="messageInfoForm.timing_sending = '部署前后'"
              >
                部署前后
              </el-button>
            </el-button-group>
          </el-form-item>

          <el-form-item label="配置消息通道" prop="message_key">
            <el-select
              v-model="messageInfoForm.message_key"
              clearable
              placeholder="请选择消息通道"
              style="width:100%"
              @change="mesChange"
            >
              <el-option
                v-for="item in message_options"
                :key="item.mes_key"
                :label="item.mes_name"
                :value="item.mes_key"
              />
            </el-select>
          </el-form-item>

          <el-form-item
            label="部署前发送内容"
            prop="before_content"
            :required="messageInfoForm.timing_sending === '部署前' || messageInfoForm.timing_sending === '部署前后'"
          >
            <el-input
              v-model="messageInfoForm.before_content"
              type="textarea"
              :rows="2"
              placeholder="请输入要发送的内容"
            />
          </el-form-item>

          <el-form-item
            label="部署后发送内容"
            prop="end_content"
            :required="messageInfoForm.timing_sending === '部署后' || messageInfoForm.timing_sending === '部署前后'"
          >
            <el-input
              v-model="messageInfoForm.end_content"
              type="textarea"
              :rows="2"
              placeholder="请输入要发送的内容"
            />
          </el-form-item>

        </el-form>
      </div>

    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="currentStep > 1 ? handleUp() : (dialogVisible = false)">
        {{ currentStep > 1 ? '上一步' : '取消' }}
      </el-button>
      <el-button type="primary" @click="currentStep < totalSteps ? handleDown() : handleFinish()">
        {{ currentStep < totalSteps ? '下一步' : '确定' }}
      </el-button>
    </template>
  </el-dialog>

  <general-drawer
    ref="GeneralDrawerRef"
    :title="'策略:' + drawerShowData?.strategy_name || '策略详情'"
    size="35%"
    closeOnClickModal
    destroyOnClose
    :showButton="false"
  >
    <el-descriptions title="基础信息" :column="1" border size="default">
      <el-descriptions-item label="策略名" label-width="120px">
        <span class="cell-text">{{ drawerShowData?.strategy_name || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="部署模式" label-width="120px">
        <span class="cell-text">{{ drawerShowData?.process_mode || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="产品线" label-width="120px">
        <span class="cell-text">{{ drawerShowData?.app_product_line || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="目标虚机" label-width="120px">
        <span class="cell-text">{{ drawerShowData?.virtual_name || '' }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions
      title="部署工具配置"
      border
      size="default"
      :column="1"
      style="margin-top: 20px"
      label-width="120px"
    >
    <el-descriptions-item label="部署工具路径">
      <span class="cell-text">{{ drawerShowData?.deployment_path || '-' }}</span>
    </el-descriptions-item>
    </el-descriptions>

    <!-- 竖向排列：部署工具内容（direction="vertical"） -->
    <el-descriptions
      border
      size="default"
      :column="1"
      label-width="120px"
    direction="vertical"
    >
    <el-descriptions-item label="部署工具内容" :rowspan="2">
      <span class="cell-text">{{ drawerShowData?.deployment_config_content || '-' }}</span>
    </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="消息通道" :column="1" border size="default" style="margin-top: 20px">
      <el-descriptions-item label="发送时机" label-width="120px">
        <!--        <span class="cell-text">{{ drawerShowData?.app_download_uname || '-' }}</span>-->
        <span class="cell-text">{{ getvalue(drawerShowData?.message_config,'timing_sending') || '--' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="消息通道" label-width="120px">
        <span class="cell-text">{{ getvalue(drawerShowData?.message_config,'message_key') || '--' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="部署前发送内容" label-width="120px">
        <span class="cell-text">{{ getvalue(drawerShowData?.message_config,'before_content') || '--' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="部署后发送内容" label-width="120px">
        <span class="cell-text">{{ getvalue(drawerShowData?.message_config,'end_content') || '--' }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions title="应用配置" :column="1" border size="default" direction="vertical" style="margin-top: 20px">
      <el-descriptions-item label="应用配置">
        {{ drawerShowData?.app_config || '-' }}
      </el-descriptions-item>
    </el-descriptions>
  </general-drawer>

  <general-dialog
    ref="DelDialogRef"
    title="删除策略"
    :width="500"
    confirmText="确定"
    btype="danger"
    @confirm="delConfirm"
  >
    <div>确定删除吗？</div>
  </general-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElForm, type ElInput, ElMessage } from 'element-plus'
import { Plus, QuestionFilled } from '@element-plus/icons-vue'
import { serversetting } from '@/hooks/hostmanagement/serversetting.ts'
import GeneralTable from '@/components/GeneralTable.vue'
import GeneralDialog from '@/components/GeneralDialog.vue'
import GeneralDrawer from '@/components/GeneralDrawer.vue'
import { app_config } from '@/hooks/deployment/appconfig.ts'
import { message_channel } from '@/hooks/messagecenter/messagechannel.ts'
import GeneralCode from '@/components/GeneralCode.vue'
import { deploy_strategy } from '@/hooks/deployment/deploystrategy.ts'

const { fetchAppConfigSelected, fetchAppLine } = app_config()
const { getVirtualMachineStatus } = serversetting()
const { get_messages_status } = message_channel()
const { addDeployStrategy, fetchDeployStrategy, editDeployStrategy, delDeployStrategy } = deploy_strategy()



// const code = ref('{}')

// const handleCodeChange = (value) => {
//   console.log('代码变化:', deploymentInfoForm.value.deployment_config_content)
//   deploymentInfoForm.value.deployment_config_content = value
// }

// 弹窗进度选项卡相关设置

const steps = ref(['基本参数', '配置部署工具', '配置应用信息', '配置消息通道'])

const currentStep = ref(1)
const totalSteps = ref(4)
const dialogVisible = ref(false)

const dialog_title = ref('')
const dialog_action = ref('')

// 基础参数
interface BasicInfo {
  strategy_name: string
  process_mode: string
  product_line: string
  target_vm: string
}

const basicInfoForm = ref<BasicInfo>({
  strategy_name: '',
  process_mode: '串行',
  product_line: '',
  target_vm: '',
})

const basicrules = {
  strategy_name: [{ required: true, message: '请输入策略名称', trigger: 'submit' }],
  process_mode: [{ required: true, message: '请选择部署模式', trigger: 'submit' }],
  product_line: [{ required: true, message: '请选择产品线', trigger: 'submit' }],
  target_vm: [{ required: true, message: '请选择目标环境', trigger: 'submit' }],
  message_channel: [{ required: true, message: '请选择消息通道', trigger: 'submit' }],
}

// 部署工具参数
interface DeploymentInfo{
  deployment_path: string,
  deployment_config_content: string,
}

const deploymentInfoForm = ref<DeploymentInfo>({
  deployment_path: '',
  deployment_config_content: '{}',
})

const deploymentrules = {
  deployment_path: [{ required: true, message: '请输入部署工具所在的路径', trigger: 'submit' }],
  deployment_config_content: [{ required: true, message: '请输入部署工具配置文件的相关参数', trigger: 'submit' }]
}

// 消息通道的参数
interface MessageInfo{
  timing_sending: string,
  message_key: string,
  before_content: string,
  end_content: string,
}

const messageInfoForm = ref<MessageInfo>({
  timing_sending: '部署后',
  message_key: '',
  before_content: '',
  end_content: '',
})

const messageinforules = {
  timing_sending: [{ required: true, message: '请输入选择发送时机', trigger: 'change' }],
  message_key: [{ required: true, message: '请输入选择消息通道', trigger: 'change' }],
  before_content: [{ required: messageInfoForm.value.timing_sending ==='部署前' || messageInfoForm.value.timing_sending ==='部署前后'
    , message: '请输入要发送的内容', trigger: 'blur' }],
  end_content: [{ required: messageInfoForm.value.timing_sending ==='部署后' || messageInfoForm.value.timing_sending ==='部署前后'
    , message: '请输入要发送的内容', trigger: 'blur' }],
}

interface VmItem {
  virtual_key: string
  virtual_name: string
}

interface MessageItem {
  mes_key: string
  mes_name: string
  mes_info: string
}

interface lineItem {
  id: string
  app_product_line: string
}

interface AppConfigSelectdItem {
  id: number
  app_nickname: string
  field_name: string
  field_order: string
  app_deploy_name: string
  exec_cmd: string
  verify_cmd: string
}

const vm_options = ref<VmItem[]>([])
const message_options = ref<MessageItem[]>([])
const line_options = ref<lineItem[]>([])

const basicInfoFormRef = ref<InstanceType<typeof ElForm>>();
const deploymentInfoFormRef = ref<InstanceType<typeof ElForm>>();
const messageInfoFormRef = ref<InstanceType<typeof ElForm>>();

const tableData = ref<AppConfigSelectdItem[]>([])

const editingCell = ref('')
const inputRefs = ref<InstanceType<typeof ElInput>[]>([])

const fetchLine = async () => {
  const res: lineItem[] = await fetchAppLine({})
  line_options.value = res
}

const fetchAppSelected = async () => {
  const res: AppConfigSelectdItem[] = await fetchAppConfigSelected({
    // app_product_line: basicInfoForm.value.product_line
    app_product_line: basicInfoForm.value.product_line,
  })
  tableData.value = res
}

const startEdit = (row: AppConfigSelectdItem, field: string) => {
  // 设置当前编辑的单元格
  editingCell.value = `${row.id}-${field}`

  // 等待DOM更新后聚焦输入框
  nextTick(() => {
    // 获取最后一个输入框引用（因为新创建的输入框会被添加到数组末尾）
    const input = inputRefs.value[inputRefs.value.length - 1]
    if (input) {
      input.focus()
    }
  })
}

// 处理单元格点击
const handleCellClick = (row: AppConfigSelectdItem, column: any) => {
  // 只处理允许编辑的列
  const validCols = ['app_nickname', 'field_name', 'field_order', 'exec_cmd']
  if (!validCols.includes(column.prop)) return

  // 如果点击的不是当前正在编辑的单元格，则开始编辑
  if (editingCell.value !== `${row.id}-${column.prop}`) {
    startEdit(row, column.prop)
  }
}

// 完成编辑
const finishEdit = () => {
  // 清空编辑状态
  editingCell.value = ''
}

// 消息通道变更时
const mesChange = (key: string) => {
  const selectedItem = message_options.value.find(item => item.mes_key === key);
  messageInfoForm.value.end_content = selectedItem?.mes_info || ''
  // messageInfoForm.value.end_content = value
}

const handleUp = async () => {
  currentStep.value--
}

const handleDown = async () => {
  let isValid:boolean = false
  switch (currentStep.value) {
    case 1:
      isValid = await basicInfoFormRef.value?.validate().then(() => true).catch(() => false) ?? false;
      break;
    case 2:
      isValid = await deploymentInfoFormRef.value?.validate().then(() => true).catch(() => false) ?? false;
      break;
    case 3:
      if (tableData.value.length === 0)
      {
        ElMessage.error('没有找到任何应用！')
      }
      else if (checkTableDataHasInvalidItem()){
        ElMessage.error('存在未填写的值')
      }else {
        isValid = true
      }
      break;
  }
  if (isValid) {
    currentStep.value ++
    if (currentStep.value === 3 && dialog_action.value === '新增') {
      await fetchAppSelected()
    }else if(currentStep.value === 4){
      get_warm_reminder()
    }
  }
}

const warm_reminder = ref('')

const get_warm_reminder = () => {
  let res = '产品线:${app_product_line} | 部署机器:${virtual_name}'

  for (const item of tableData.value) {
    // res = res + ' | ' + item.app_nickname + '版本号:' + '$' + `{${item.field_name}}`
    res = res + ' | ' + item.field_name + '$' + `{${item.app_nickname.replace(/-/g, '_')}}`
  }
  warm_reminder.value = res
}

const checkTableDataHasInvalidItem = (): boolean => {
  // 遍历数组中的每个对象
  return tableData.value.some(item => {
    const values = [item.field_name, item.field_order];
    return values.some(val => {
      return val === '' || val.includes('--') || val === null || val === undefined;
    });
  });
};

const handleFinish = async () => {
  let isValid:boolean = false
  if (currentStep.value === 4) {
    isValid = await messageInfoFormRef.value?.validate().then(() => true).catch(() => false) ?? false;
  }
  if (isValid) {
    if (dialog_action.value === '新增'){
      const res = await addDeployStrategy({
        strategy_name: basicInfoForm.value.strategy_name,
        process_mode: basicInfoForm.value.process_mode,
        app_product_line: basicInfoForm.value.product_line,
        virtual_key: basicInfoForm.value.target_vm,
        app_config: JSON.stringify(tableData.value),
        deployment_path: deploymentInfoForm.value.deployment_path,
        deployment_config_content: deploymentInfoForm.value.deployment_config_content,
        message_config: JSON.stringify({
          timing_sending: messageInfoForm.value.timing_sending,
          message_key: messageInfoForm.value.message_key,
          before_content: messageInfoForm.value.before_content,
          end_content: messageInfoForm.value.end_content
        })
      })
      if (res.msg == '新增成功') {
        ElMessage.success(res.msg)
        await fetchDeployStrategys(searchForm.value.strategy_name, currentPage.value, defaultCount.value)
        dialogVisible.value = false
      }else{
        ElMessage.error(res.msg)
        dialogVisible.value = false
      }
    }else {
      const res = await editDeployStrategy({
        strategy_key: strategy_key.value,
        strategy_name: basicInfoForm.value.strategy_name,
        process_mode: basicInfoForm.value.process_mode,
        app_product_line: basicInfoForm.value.product_line,
        virtual_key: basicInfoForm.value.target_vm,
        app_config: JSON.stringify(tableData.value),
        deployment_path: deploymentInfoForm.value.deployment_path,
        deployment_config_content: deploymentInfoForm.value.deployment_config_content,
        message_config: JSON.stringify({
          timing_sending: messageInfoForm.value.timing_sending,
          message_key: messageInfoForm.value.message_key,
          before_content: messageInfoForm.value.before_content,
          end_content: messageInfoForm.value.end_content
        })
      })
      if (res.msg == '编辑成功') {
        ElMessage.success(res.msg)
        await fetchDeployStrategys(searchForm.value.strategy_name, currentPage.value, defaultCount.value)
        strategy_key.value = ''
        dialogVisible.value = false
      }else{
        ElMessage.error(res.msg)
        strategy_key.value = ''
        dialogVisible.value = false
      }
    }

  }
}

const handleReset = () => {
  Object.assign(basicInfoForm.value, {
    strategy_name: '',
    process_mode: '串行',
    product_line: '',
    target_vm: '',
  })
  Object.assign(deploymentInfoForm.value, {
    deployment_path: '',
    deployment_config_content: '{}',
  })
  Object.assign(messageInfoForm.value, {
    timing_sending: '部署后',
    message_key: '',
    before_content: '',
    end_content: '',
  })
  // 可选：手动清除校验提示
  basicInfoFormRef.value?.clearValidate()
  deploymentInfoFormRef.value?.clearValidate()
  messageInfoFormRef.value?.clearValidate()
}

const handleAdd = async () => {
  handleReset()
  dialog_title.value = '新增部署策略'
  dialog_action.value = '新增'
  currentStep.value = 1
  dialogVisible.value = true
}

// 表格展示及搜索区域
// 搜索区域
interface SearchForm {
  strategy_name: string
}

const searchForm = ref<SearchForm>({
  strategy_name: ''
})

const searchEvent = async () => {
  await fetchDeployStrategys(searchForm.value.strategy_name, currentPage.value, defaultCount.value)
}
//表格定义
interface DeployStrategyItem {
  strategy_key: number
  strategy_name: string
  process_mode: string
  app_product_line: string
  virtual_key: string
  virtual_name: string
  app_config: string
  deployment_path: string
  deployment_config_content: string
  message_config: string
  created_at: string | Date
  updated_at: string | Date
}

interface DeployStrategys {
  total_count: number
  deploy_strategys: DeployStrategyItem[]
}

const tableDatas = ref<DeployStrategyItem[]>([])
const columnDatas = ref([
  {
    label: '策略名',
    prop: 'strategy_name',
  },
  {
    label: '部署模式',
    prop: 'process_mode',
  },
  {
    label: '产品线',
    prop: 'app_product_line',
  },
  {
    label: '目标机器',
    prop: 'virtual_name',
  }
])

const is_enable = ref(true)
const defaultCounts = ref([30, 50, 100])
const currentPage = ref(1)
const defaultCount = ref(30)
const totalCount = ref(0)
const searchKeys = ref(['agent_name', 'agent_status'])

const fetchDeployStrategys = async (ds_name: string, page: number, size: number) => {
  const res: DeployStrategys = await fetchDeployStrategy({
    strategy_name: ds_name,
    current_page: page,
    current_count: size,
  })
  totalCount.value = res.total_count
  tableDatas.value = res.deploy_strategys
}

// 详情
const drawerShowData = ref<DeployStrategyItem>()
const GeneralDrawerRef = ref<InstanceType<typeof GeneralDrawer>>()

const handleFind = (data: any) => {
  GeneralDrawerRef.value?.open(data)
  drawerShowData.value = data
}

const getvalue = (data:any, key:any, sign:number=0) => {
  const obj = JSON.parse(data)
  if (key.includes('message_key') && sign === 0)
  {
    return message_options.value.find(item => item.mes_key === obj[key])?.mes_name
  }else {
    return obj[key]
  }
}

const changePage = async () => {
  await fetchDeployStrategys(searchForm.value.strategy_name, currentPage.value, defaultCount.value)
}

const changeCount = async () => {
  await fetchDeployStrategys(searchForm.value.strategy_name, currentPage.value, defaultCount.value)
}

const exportAllData = async () => {}

const refreshDatas = async () => {
  await fetchDeployStrategys(searchForm.value.strategy_name, currentPage.value, defaultCount.value)
}
// 编辑
const strategy_key = ref('')

const handleEditor = (row: any) => {
  handleReset()
  strategy_key.value = row.strategy_key
  dialog_title.value = '编辑部署策略'
  dialog_action.value = '编辑'
  currentStep.value = 1
  Object.assign(basicInfoForm.value, {
    strategy_name: row.strategy_name,
    process_mode: row.process_mode,
    product_line: row.app_product_line,
    target_vm: row.virtual_key,
  })
  Object.assign(deploymentInfoForm.value, {
    deployment_path: row.deployment_path,
    deployment_config_content: row.deployment_config_content,
  })
  Object.assign(messageInfoForm.value, {
    timing_sending: getvalue(row.message_config,'timing_sending'),
    message_key: getvalue(row.message_config,'message_key',1),
    before_content: getvalue(row.message_config,'before_content'),
    end_content: getvalue(row.message_config,'end_content'),
  })
  tableData.value = JSON.parse(row.app_config)
  dialogVisible.value = true
}


// 删除
const DelDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const handleDelete = (row: any) => {
  // console.log(row)
  DelDialogRef.value?.open(row)
}

const delConfirm = async (row: any) => {

  const res = await delDeployStrategy({
    strategy_key: row.strategy_key,
  })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fetchDeployStrategys(searchForm.value.strategy_name, currentPage.value, defaultCount.value)
  } else {
    ElMessage.error(res.msg)
    DelDialogRef.value?.close()
  }
}

// 进入页面时加载

onMounted(async () => {
  await fetchDeployStrategys(searchForm.value.strategy_name, currentPage.value, defaultCount.value)
  const vm_select: VmItem[] = await getVirtualMachineStatus({
    status: '可连接',
  })
  const message: MessageItem[] = await get_messages_status({
    status: 1,
  })
  vm_options.value = vm_select
  message_options.value = message
  await fetchLine()

})

</script>

<style scoped>

.step-content {
  padding: 10px 0;
  display: flex;
  justify-content: center;
}
.el-alert {
  margin: 5px 0 0;
}
.el-alert:first-child {
  margin: 0;
}
/* 优化单元格样式，让点击更灵敏 */
.edit-cell {
  width: 100%;
  height: 100%;
  padding: 4px 0;
}

.cell-text {
  cursor: pointer; /* 提示可点击 */
  padding: 4px;
  display: inline-block;
  width: 100%;
}

.cell-text:hover {
  background-color: #f5f7fa; /*  hover效果，提升体验 */
}

/* 让输入框适配单元格 */
:deep(.el-input) {
  width: 100%;
}

:deep(.el-input__inner) {
  padding: 2px 5px;
  height: 30px;
  line-height: 30px;
}
</style>
