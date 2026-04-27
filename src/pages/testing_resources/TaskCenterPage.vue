<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Tabs -->
    <div class="bg-white border-b flex justify-center">
      <el-tabs v-model="activeMainTab" class="main-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="任务列表" name="list" />
        <el-tab-pane label="项目看板" name="kanban" />
        <el-tab-pane label="看板设置" name="kanban_set" />
      </el-tabs>
    </div>
    <div class="p-6">
      <!-- ================= 列表 ================= -->
      <div v-if="activeMainTab === 'list'" class="bg-white p-4 rounded shadow-sm">
        <!-- 筛选条 -->
        <div class="flex items-center mb-4">
          <!-- Segmented -->
          <div class="segmented">
            <button
              v-for="item in filters"
              :key="item.value"
              @click="updateClick(item.value)"
              :class="['seg-btn', activeFilter === item.value && 'active']"
            >
              {{ item.label }}
            </button>
          </div>

          <el-input v-model="searchText" placeholder="搜索" clearable class="w-64 ml-auto" />
          <el-button type="primary" class="ml-4" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            创建项目
          </el-button>
        </div>
        <general-nest-table
          :filter-table-data="task_tableDatas"
          :p_columnData="task_Datas"
          :s_columnData="task_details_columnDatas"
          :default-counts="task_defaultCounts"
          v-model:current-page="task_currentPage"
          v-model:default-count="task_defaultCount"
          :total-count="task_totalCount"
          :is_enable_selected="false"
          :s_operation_is_enable="task_is_enable"
          :p_operation_is_enable="task_is_enable"
          @update:currentPage="task_changePage"
          @update:defaultCount="task_changeCount"
          @refresh="task_refreshDatas"
          @exportAllPage="task_exportAllData"
          ref="TaskGeneralTableRef"
        >
          <template #p_operation="scope">
            <el-button type="primary" text bg size="small" @click="p_task_handleEditor(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" text bg size="small" @click="p_task_handleDelete(scope.row)">
              删除
            </el-button>
          </template>
          <template #s_operation="scope">
            <el-button type="danger" text bg size="small" @click="s_task_handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </general-nest-table>
      </div>

      <!-- ================= 看板 ================= -->
      <div v-if="activeMainTab === 'kanban'" class="kanban-board">
        <div class="flex items-center mb-4">
          <!-- Segmented -->
          <div class="segmented">
            <el-text class="mr-2">版本:</el-text>
            <el-select
              v-model="kanban_selected_key"
              @change="handleTaskSelect"
              placeholder="Select"
              style="width: 240px"
            >
              <el-option
                v-for="item in task_tableDatas"
                :key="item.task_key"
                :label="item.task_name"
                :value="item.task_key"
              />
            </el-select>
            <el-switch
              v-model="kanban_switch"
              inline-prompt
              active-text="展示自己任务"
              inactive-text="展示全部任务"
              class="ml-2"
              @change="handleSwitchChange"
            />
          </div>
          <el-input v-model="kanban_task_searchText" placeholder="搜索" clearable class="w-64 ml-auto" @change="handleSearchChange" />
        </div>
        <draggable
          v-model="columns"
          item-key="id"
          animation="200"
          class="kanban-columns flex flex-wrap gap-4 w-full"
          :disabled="true"
        >
          <template #item="{ element: column }">
            <div
              class="kanban-column bg-gray-100 rounded-md p-2 min-w-[240px] max-w-[320px] flex-1"
            >
              <div class="column-header flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="column-handle cursor-grab font-semibold text-gray-700">☰</span>
                  <span>{{ column.column_name }}</span>
                  <span class="text-sm text-gray-500">({{ getValidTaskCount(column.tasks) }})</span>
                </div>
              </div>

              <!-- 卡片拖动 -->
              <draggable
                v-model="column.tasks"
                :group="{ name: 'tasks', pull: true, put: true }"
                item-key="id"
                animation="150"
                ghost-class="ghost"
                chosen-class="chosen"
                drag-class="drag"
                handle=".task-card"
                class="space-y-2 min-h-[100px]"
                @change="(evt:any) => onTaskDrag(evt, column)"
              >
                <template #item="{ element: task }">
                  <div
                    v-if="task.task_details_title !== null"
                    class="task-card bg-white rounded-md p-3 shadow flex flex-col cursor-grab w-full box-border"
                  >
                    <!-- 卡片头部 -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 flex-1">
                        <span class="task-handle cursor-grab text-gray-400">☰</span>
                        <span class="task-handle cursor-grab text-gray-400">{{
                          task.correlation_num
                        }}</span>
                        <span class="truncate max-w-[160px]">{{ task.task_details_title }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <el-tag v-if="task.priority === '高'" type="danger" size="mini">高</el-tag>
                        <el-tag v-if="task.priority === '中'" type="warning" size="mini">中</el-tag>
                        <el-tag v-if="task.priority === '低'" type="success" size="mini">低</el-tag>
                      </div>
                    </div>
                    <!-- 卡片详情 -->
                    <div class="task-detail mt-2 text-sm text-gray-500">
                      <div class="space-y-1">
                        <div>
                          负责人:
                          {{ mapKeyToLabel(task.assignee_key, tableDatas, 'user_key', 'nickname') }}
                        </div>
                        <div v-if="task.description?.trim()" class="truncate">
                          描述: {{ task.description }}
                        </div>
                        <div v-else>描述: 无</div>
                        <div>预计时间: {{ task.expect_day || '未知' }} 天</div>
                      </div>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </template>
        </draggable>
      </div>

      <div v-if="activeMainTab === 'kanban_set'" class="bg-white p-4 rounded shadow-sm">
        <!-- 筛选条 -->
        <div class="flex items-center justify-between mb-4">
          <!-- Segmented -->
          <div class="segmented">
            <el-input v-model="search_kanban" placeholder="搜索" clearable class="w-64" />
          </div>
          <el-button type="primary" class="ml-4" @click="kanban_handleAdd">
            <el-icon><Plus /></el-icon>
            创建模板
          </el-button>
        </div>
        <!-- 表格 -->
        <general-nest-table
          :filter-table-data="kanban_tableDatas"
          :p_columnData="kanban_Datas"
          :s_columnData="kanban_columnDatas"
          :default-counts="kanban_defaultCounts"
          v-model:current-page="kanban_currentPage"
          v-model:default-count="kanban_defaultCount"
          :total-count="kanban_totalCount"
          :is_enable_selected="false"
          :s_operation_is_enable="kanban_is_enable"
          :p_operation_is_enable="kanban_is_enable"
          @update:currentPage="kanban_changePage"
          @update:defaultCount="kanban_changeCount"
          @refresh="kanban_refreshDatas"
          @exportAllPage="kanban_exportAllData"
          ref="GeneralTableRef"
        >
          <template #p_operation="scope">
            <el-button
              type="primary"
              text
              bg
              size="small"
              @click="p_kanban_handleEditor(scope.row)"
            >
              编辑
            </el-button>
            <el-button type="danger" text bg size="small" @click="p_kanban_handleDelete(scope.row)">
              删除
            </el-button>
          </template>
          <template #s_operation="scope">
            <el-button type="danger" text bg size="small" @click="s_kanban_handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </general-nest-table>
      </div>
    </div>
  </div>

  <general-dialog
    ref="KanbanGeneralDialogRef"
    :title="kanban_dialog_title"
    :width="600"
    :confirmText="kanban_dialog_button_text"
    btype="primary"
    @confirm="kanban_handleNew"
  >
    <div class="header-divider" />
    <el-form
      :model="kanbanform"
      ref="formRef"
      :validate-on-rule-change="false"
      label-width="auto"
      style="max-width: 600px"
    >
      <el-form-item label="看板名称">
        <el-input v-model="kanbanform.board_name" placeholder="请输入看板名称" class="w-full" />
      </el-form-item>
      <el-form-item
        v-for="(item, index) in kanbanform.kanban_columns"
        :key="index"
        :label="`第${index + 1}列`"
        class="kanban-column-item"
      >
        <!-- 1. 看板名称行：统一宽度+垂直居中 -->
        <div class="form-row">
          <el-text class="form-label" type="info">看板列名称：</el-text>
          <el-input
            v-model="item.column_name"
            placeholder="请输入看板列名称"
            class="form-input"
            clearable
          />
        </div>

        <!-- 2. 排序序号行：增加数字校验 -->
        <div class="form-row">
          <el-text class="form-label" type="info">排序序号：</el-text>
          <el-input
            v-model="item.sort_order"
            placeholder="请输入数字（如1、2、3）"
            class="form-input"
            clearable
            type="number"
            min="1"
          />
        </div>

        <div class="form-row">
          <el-text class="form-label" type="info">列代表的状态：</el-text>
          <el-select v-model="item.column_status" placeholder="Select" style="width: 200px">
            <el-option
              v-for="item in column_status_options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <!-- 3. 删除按钮：样式优化+确认提示 -->
        <div class="form-actions">
          <el-button type="danger" icon="el-icon-delete" size="small" @click="removeDomain(item)" :disabled="edit_kanban_status">
            删除
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="看板描述">
        <el-input
          v-model="kanbanform.board_description"
          type="textarea"
          placeholder="请输入看板描述"
          class="w-full"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="addDomain">新增看板列</el-button>
      </el-form-item>
    </el-form>
  </general-dialog>

  <general-dialog
    ref="KanbanDelGeneralDialogRef"
    :title="kanban_del_title"
    :width="500"
    confirmText="确定"
    btype="danger"
    @confirm="kanbanDelConfirm"
  >
    <div>确定删除吗？</div>
  </general-dialog>

  <general-dialog
    ref="TaskGeneralDialogRef"
    :title="task_dialog_title"
    :width="900"
    :confirmText="task_dialog_button_text"
    btype="primary"
    @confirm="task_confirm"
  >
    <div class="task-dialog">
      <el-form label-width="90px" class="version-form" :inline="true" :model="Taskform">
        <div class="task-form-row">
          <el-form-item label="版本名称">
            <el-input
              placeholder="请输入版本名称"
              class="form-input"
              v-model="Taskform.task_name"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="版本号">
            <el-input
              placeholder="请输入版本号"
              class="form-input"
              v-model="Taskform.version_num"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="发版时间">
            <el-date-picker
              v-model="Taskform.release_time"
              type="date"
              placeholder="请输入发版时间"
              size="default"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="看板模板">
            <el-select
              v-model="Taskform.board_key"
              placeholder="请选择看板模板"
              style="width: 240px"
              :disabled="edit_task_status"
            >
              <el-option
                v-for="item in kanban_tableDatas"
                :key="item.board_key"
                :label="item.board_name"
                :value="item.board_key"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="发送消息">
            <el-select
              v-model="message_form.message_key"
              clearable
              placeholder="请选择消息通道"
              style="width: 240px"
            >
              <el-option
                v-for="item in message_options"
                :key="item.mes_key"
                :label="item.mes_name"
                :value="item.mes_key"
              />
            </el-select>
            <el-input
              v-model="message_form.message_content"
              style="width: 370px; margin-left: 10px"
              :rows="1"
              type="textarea"
              placeholder="发送内容"
            />
          </el-form-item>
        </div>
      </el-form>
      <div class="header-divider" />
      <div class="task-table-header">
        <span class="title">具体任务安排</span>
        <el-button size="small" type="primary" plain @click="addTaskDetails"> 新增任务 </el-button>
      </div>
      <div class="table-wrapper">
        <el-table :data="Taskform.task_details" border max-height="320" class="task-table">
          <el-table-column label="任务名称" width="240">
            <template #default="scope">
              <div class="edit-cell" @click.stop="startEdit(scope.row, 'task_details_title')">
                <el-input
                  v-if="editingCell === `${scope.row.task_details_key}-task_details_title`"
                  v-model="scope.row.task_details_title"
                  size="small"
                  @blur="finishEdit"
                  @keyup.enter="finishEdit"
                />
                <span v-else class="cell-text">
                  {{ scope.row.task_details_title || '--' }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="关联需求号" width="110">
            <template #default="scope">
              <div class="edit-cell" @click.stop="startEdit(scope.row, 'correlation_num')">
                <el-input
                  v-if="editingCell === `${scope.row.task_details_key}-correlation_num`"
                  v-model="scope.row.correlation_num"
                  size="small"
                  @blur="finishEdit"
                  @keyup.enter="finishEdit"
                />
                <span v-else class="cell-text">
                  {{ scope.row.correlation_num || '--' }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="任务描述" min-width="180">
            <template #default="scope">
              <div class="edit-cell" @click.stop="startEdit(scope.row, 'description')">
                <el-input
                  v-if="editingCell === `${scope.row.task_details_key}-description`"
                  v-model="scope.row.description"
                  size="small"
                  type="textarea"
                  :rows="2"
                  @blur="finishEdit"
                />
                <span v-else class="cell-text">
                  {{ scope.row.description || '--' }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="120">
            <template #default="scope">
              <div class="edit-cell" @click.stop="startEdit(scope.row, 'priority')">
                <el-select
                  v-if="editingCell === `${scope.row.task_details_key}-priority`"
                  v-model="scope.row.priority"
                  size="small"
                  style="width: 100%"
                  @change="finishEdit"
                >
                  <el-option
                    v-for="item in priority_options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
                <span v-else class="cell-text">
                  {{ scope.row.priority || '--' }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="负责人" width="140">
            <template #default="scope">
              <div class="edit-cell" @click.stop="startEdit(scope.row, 'assignee_key')">
                <el-select
                  v-if="editingCell === `${scope.row.task_details_key}-assignee_key`"
                  v-model="scope.row.assignee_key"
                  size="small"
                  style="width: 100%"
                  @change="finishEdit"
                >
                  <el-option
                    v-for="item in tableDatas"
                    :key="item.user_key"
                    :label="item.nickname"
                    :value="item.user_key"
                  />
                </el-select>
                <span v-else class="cell-text">
                  {{ getNicknameByKey(scope.row.assignee_key) || '--' }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="预估天数" width="110">
            <template #default="scope">
              <div class="edit-cell" @click.stop="startEdit(scope.row, 'expect_day')">
                <el-input
                  v-if="editingCell === `${scope.row.task_details_key}-expect_day`"
                  v-model="scope.row.expect_day"
                  size="small"
                  @blur="finishEdit"
                />
                <span v-else class="cell-text">
                  {{ scope.row.expect_day || '--' }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right">
            <template #default="scope">
              <el-button type="danger" size="small" @click="removeTaskDetails(scope.row)" :disabled="edit_task_status">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </general-dialog>

  <general-dialog
    ref="TaskDelGeneralDialogRef"
    :title="task_del_title"
    :width="500"
    confirmText="确定"
    btype="danger"
    @confirm="taskDelConfirm"
  >
    <div>确定删除吗？</div>
  </general-dialog>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, h } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import GeneralNestTable from '@/components/GeneralNestTable.vue'
import GeneralDrawer from '@/components/GeneralDrawer.vue'
import { ElForm, type ElInput, ElMessage } from 'element-plus'
import GeneralDialog from '@/components/GeneralDialog.vue'
import { task_center } from '@/hooks/test_resoure/task_center.ts'
import { system_users } from '@/hooks/systems/users.ts'
import { mapKeyToLabel } from '@/utils/util.ts'
import { message_channel } from '@/hooks/messagecenter/messagechannel.ts'

const { fetchUsers } = system_users()
const {
  addKanban,
  fetchKanbans,
  editKanban,
  delKanban,
  delKanbanColumn,
  addTask,
  fetchTasks,
  editTask,
  delTask,
  delTaskDetails,
  fetchKanbanColumnTasks,
  editKanbanTasks
} = task_center()

const getSelectedTask = () => {
  return task_tableDatas.value.find(t => t.task_key === kanban_selected_key.value) || null
}

const handleTabChange = async () => {
  if (activeMainTab.value === 'list') {
    await fecthTasks(
      activeFilter.value,
      searchText.value,
      task_currentPage.value,
      task_defaultCount.value,
    )
  }
  if (activeMainTab.value === 'kanban') {
    // console.log(task_tableDatas.value[0])
    // kanban_selected.value = task_tableDatas.value[0] || null
    kanban_selected_key.value = task_tableDatas.value[0]?.task_key || ''
    await fetch_kanban_task(
      kanban_switch.value,
      getSelectedTask()?.task_key || '',
      getSelectedTask()?.board_key || '',
      kanban_task_searchText.value
    )
  }
  if (activeMainTab.value === 'kanban_set') {
    await fetchKanbanDatas(search_kanban.value, kanban_currentPage.value, kanban_defaultCount.value)
  }
}

const getValidTaskCount = (tasks: any) => {
  if (!tasks || tasks.length === 0) return 0
  // 过滤规则：保留 task_details_title 不为 null/空 的任务（可根据你的实际字段调整）
  return tasks.filter((task:any) => {
    // 核心判断：任务的核心字段（比如task_details_title）不为null/空，才视为有效任务
    return task?.task_details_title !== null && task?.task_details_title !== ''
  }).length
}

/* tabs */
const activeMainTab = ref('list')
const column_status_options = ref(
  [
    {
      label: '未开始',
      value: '未开始',
    },{
    label: '进行中',
    value: '进行中',
  },{
    label: '已完成',
    value: '已完成',
  }
  ]
)

// 用户
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

const totalCount = ref(0)

const tableDatas = ref<UserItem[]>([])

const fecthUserData = async (page: number, size: number) => {
  const result: Users = await fetchUsers({
    i_type: 1,
    current_page: page,
    current_count: size,
  })
  totalCount.value = result.total_count
  tableDatas.value = result.users
}

// 测试任务
const priority_options = [
  {
    value: '高',
    label: '高',
  },
  {
    value: '中',
    label: '中',
  },
  {
    value: '低',
    label: '低',
  },
]

const activeFilter = ref('全部')
const searchText = ref('')

const filters = [
  { label: '全部', value: '全部' },
  { label: '未开始', value: '未开始' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
]

const task_dialog_title = ref('')
const task_dialog_button_text = ref('')
const task_dialog_action = ref('')

// 查
interface TaskDetailsColumnsItem {
  task_details_key: string
  task_key: string
  task_details_title: string
  correlation_num: string
  description: string
  priority: string
  assignee_key: string
  expect_day: string
  created_at: string | Date
  updated_at: string | Date
}

interface TaskItem {
  task_key: string
  task_name: string
  task_num: string
  version_num: string
  release_time: string
  board_key: string
  child_item: TaskDetailsColumnsItem[]
  created_at: string | Date
  updated_at: string | Date
}

interface Tasks {
  total_count: number
  tasks: TaskItem[]
}

const task_tableDatas = ref<TaskItem[]>([])

const fecthTasks = async (
  task_label_name: string,
  task_condition: string,
  page: number,
  size: number,
) => {
  const result: Tasks = await fetchTasks({
    task_label_name: task_label_name,
    task_condition: task_condition,
    current_page: page,
    current_count: size,
  })
  task_totalCount.value = result.total_count
  task_tableDatas.value = result.tasks
}

const task_Datas = ref([
  {
    label: '版本名称',
    prop: 'task_name',
  },
  {
    label: '版本号',
    prop: 'version_num',
  },
  {
    label: '发版时间',
    prop: 'release_time',
  },
  {
    label: '任务数量',
    prop: 'task_num',
  },
  {
    label: '任务状态',
    prop: 'is_complete',
  },
  {
    label: '看板模板',
    prop: 'board_key',
    customRender: (row:any) => {
      const label = mapKeyToLabel(row.board_key, kanban_tableDatas.value, 'board_key', 'board_name')
      return h('span', label)
    },
  },
])

const task_details_columnDatas = ref([
  {
    label: '任务的名字',
    prop: 'task_details_title',
  },
  {
    label: '关联的需求号',
    prop: 'correlation_num',
  },
  {
    label: '任务描述',
    prop: 'description',
  },
  {
    label: '优先级',
    prop: 'priority',
  },
  {
    label: '负责人',
    prop: 'assignee_key',
    customRender: (row:any) => {
      const label = mapKeyToLabel(row.assignee_key, tableDatas.value, 'user_key', 'nickname')
      return h('span', label)
    },
  },
  {
    label: '预估的时间',
    prop: 'expect_day',
  },
])

const getNicknameByKey = (userKey: string) => {
  if (!userKey) return ''
  const matchItem = tableDatas.value.find((item) => item.user_key === userKey)
  return matchItem ? matchItem.nickname : ''
}

const task_is_enable = ref(true)
const task_defaultCounts = ref([30, 50, 100])
const task_currentPage = ref(1)
const task_defaultCount = ref(30)
const task_totalCount = ref(0)

const updateClick = async (item: any) => {
  activeFilter.value = item
  await fecthTasks(
    activeFilter.value,
    searchText.value,
    task_currentPage.value,
    task_defaultCount.value,
  )
}

const task_changePage = async () => {}

const task_changeCount = async () => {}

const task_exportAllData = async () => {}

const task_refreshDatas = async () => {}




// 其他
interface TaskDetailsItem {
  task_details_title: string
  correlation_num: string
  description: string
  assignee_key: string
  priority: string
  expect_day: string
  task_details_key: string
}

const Taskform = ref<{
  task_details: TaskDetailsItem[]
  task_name: string
  task_num: string
  version_num: string
  release_time: string
  board_key: string
  is_complete: string
}>({
  task_details: [
    {
      task_details_title: '',
      correlation_num: '',
      description: '',
      priority: '高',
      assignee_key: '',
      expect_day: '',
      task_details_key: '0',
    },
  ],
  task_name: '',
  task_num: '',
  version_num: '',
  release_time: '',
  board_key: '',
  is_complete: '',
})

// 新增

const editingCell = ref('')
const inputRefs = ref<InstanceType<typeof ElInput>[]>([])

const TaskGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const startEdit = (row: TaskDetailsItem, field: string) => {
  // 设置当前编辑的单元格
  editingCell.value = `${row.task_details_key}-${field}`
  // 等待DOM更新后聚焦输入框
  nextTick(() => {
    // 获取最后一个输入框引用（因为新创建的输入框会被添加到数组末尾）
    const input = inputRefs.value[inputRefs.value.length - 1]
    if (input) {
      input.focus()
    }
  })
}

const edit_task_status = ref(false)

// 完成编辑
const finishEdit = () => {
  // 清空编辑状态
  editingCell.value = ''
}

const addTaskDetails = () => {
  const maxId = Taskform.value.task_details.length
  console.log(maxId)
  Taskform.value.task_details.push({
    task_details_title: '',
    correlation_num: '',
    description: '',
    priority: '高',
    assignee_key: '',
    expect_day: '',
    task_details_key: maxId + '新增',
  })
}

const removeTaskDetails = (item: any) => {
  const index = Taskform.value.task_details.indexOf(item)
  if (index !== -1) {
    Taskform.value.task_details.splice(index, 1)
  }
}

const task_handleReset = () => {
  Object.assign(Taskform.value, {
    task_details: [
      {
        task_details_title: '',
        correlation_num: '',
        description: '',
        priority: '高',
        assignee_key: '',
        expect_day: '',
        task_details_key: '0',
      },
    ],
    task_name: '',
    task_num: '',
    version_num: '',
    board_key: '',
    release_time: '',
  })
  // 可选：手动清除校验提示
  // formRef.value?.clearValidate()
}

const handleAdd = () => {
  task_handleReset()
  task_dialog_title.value = '新增任务'
  task_dialog_button_text.value = '新增'
  task_dialog_action.value = '新增'
  TaskGeneralDialogRef.value?.open()
}

const task_confirm = async (row: any) => {
  if (task_dialog_action.value === '新增') {
    const res = await addTask({
      task_name: Taskform.value.task_name,
      version_num: Taskform.value.version_num,
      release_time: Taskform.value.release_time,
      board_key: Taskform.value.board_key,
      task_num: Taskform.value.task_details.length,
      task_details: Taskform.value.task_details,
      message_info: message_form.value
    })

    if (res.msg == '新增成功') {
      ElMessage.success(res.msg)
      TaskGeneralDialogRef.value?.close()
      await fecthTasks(
        activeFilter.value,
        searchText.value,
        task_currentPage.value,
        task_defaultCount.value,
      )
    } else {
      ElMessage.error(res.msg)
      TaskGeneralDialogRef.value?.close()
    }
  } else {
    const res = await editTask({
      task_key: row.task_key,
      task_name: Taskform.value.task_name,
      version_num: Taskform.value.version_num,
      release_time: Taskform.value.release_time,
      board_key: Taskform.value.board_key,
      task_num: Taskform.value.task_details.length,
      task_details: Taskform.value.task_details,
    })
    if (res.msg == '编辑成功') {
      ElMessage.success(res.msg)
      TaskGeneralDialogRef.value?.close()
      await fecthTasks(
        activeFilter.value,
        searchText.value,
        task_currentPage.value,
        task_defaultCount.value,
      )
    } else {
      ElMessage.error(res.msg)
      TaskGeneralDialogRef.value?.close()
    }
  }
}
// 编辑

const p_task_handleEditor = (row: any) => {
  task_handleReset()
  task_dialog_title.value = '编辑任务'
  task_dialog_button_text.value = '编辑'
  task_dialog_action.value = '编辑'
  edit_task_status.value = true
  Object.assign(Taskform.value, {
    task_details: row.child_item,
    task_name: row.task_name,
    task_num: row.task_num,
    version_num: row.version_num,
    board_key: row.board_key,
    release_time: row.release_time,
  })
  TaskGeneralDialogRef.value?.open(row)
}
// 删除
const TaskDelGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const task_del_type = ref('')
const task_del_title = ref('')


const p_task_handleDelete = (row: any) => {
  task_del_title.value = '删除任务'
  task_del_type.value = '1'
  TaskDelGeneralDialogRef.value?.open(row)
}

const s_task_handleDelete = (row: any) => {
  task_del_title.value = '删除子任务'
  task_del_type.value = '2'
  TaskDelGeneralDialogRef.value?.open(row)
}

const taskDelConfirm = async (row: any) => {
  let res = { msg: '' }
  if (task_del_type.value === '1') {
    res = await delTask({
      task_key: row.task_key
    })
  } else {
    res = await delTaskDetails({
      task_details_key: row.task_details_key
    })
  }
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    TaskDelGeneralDialogRef.value?.close()
    await fecthTasks(
      activeFilter.value,
      searchText.value,
      task_currentPage.value,
      task_defaultCount.value,
    )
  } else {
    ElMessage.error(res.msg)
    TaskDelGeneralDialogRef.value?.close()
  }
}



// ------------------------------------------------------------------------------------------------------------------------

// 设置看板模板
const search_kanban = ref('')

const kanban_dialog_title = ref('')
const kanban_dialog_button_text = ref('')
const kanban_dialog_action = ref('')

// 查
interface KanBanColumnsItem {
  board_key: string
  column_key: string
  column_name: string
  sort_order: string
  column_status: string
  created_at: string | Date
  updated_at: string | Date
}

interface KanBanItem {
  board_key: string
  board_name: string
  board_description: string
  kanban_columns: string
  child_item: KanBanColumnsItem[]
  created_at: string | Date
  updated_at: string | Date
}

interface KanBanBoards {
  total_count: number
  kanbans: KanBanItem[]
}

const kanban_tableDatas = ref<KanBanItem[]>([])

const kanban_Datas = ref([
  {
    label: '看板模板名称',
    prop: 'board_name',
  },
  {
    label: '看板描述',
    prop: 'board_description',
  },
  {
    label: '看板列数',
    prop: 'kanban_columns',
  },
])

const kanban_columnDatas = ref([
  {
    label: '看板列名称',
    prop: 'column_name',
  },
  {
    label: '看板列排序',
    prop: 'sort_order',
  },
  {
    label: '列代表状态',
    prop: 'column_status',
  },
])

const kanban_is_enable = ref(true)
const kanban_defaultCounts = ref([30, 50, 100])
const kanban_currentPage = ref(1)
const kanban_defaultCount = ref(30)
const kanban_totalCount = ref(0)

const fetchKanbanDatas = async (k_name: string, page: number, size: number) => {
  const res: KanBanBoards = await fetchKanbans({
    k_name: k_name,
    current_page: page,
    current_count: size,
  })
  kanban_totalCount.value = res.total_count
  kanban_tableDatas.value = res.kanbans
}

const kanban_changePage = async () => {}

const kanban_changeCount = async () => {}

const kanban_exportAllData = async () => {}

const kanban_refreshDatas = async () => {}

const kanban_searchEvent = async () => {}

const kanban_handleFind = (data: any) => {}

// 其他
interface KanbanColumnItem {
  column_name: string
  sort_order: string
  column_status: string
}

const kanbanform = ref<{
  kanban_columns: KanbanColumnItem[]
  board_name: string
  board_description: string
}>({
  kanban_columns: [
    {
      column_name: '',
      sort_order: '',
      column_status: ''
    },
  ],
  board_name: '',
  board_description: '',
})

// 增
const KanbanGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const handleReset = () => {
  Object.assign(kanbanform.value, {
    kanban_columns: [
      {
        column_name: '',
        sort_order: '',
        column_status: ''
      },
    ],
    board_name: '',
    board_description: '',
  })
  // 可选：手动清除校验提示
  // kanbanform.value?.clearValidate()
}

const removeDomain = (item: any) => {
  const index = kanbanform.value.kanban_columns.indexOf(item)
  if (index !== -1) {
    kanbanform.value.kanban_columns.splice(index, 1)
  }
}

const addDomain = () => {
  kanbanform.value.kanban_columns.push({
    column_name: '',
    sort_order: '',
    column_status: ''
  })
}

const kanban_handleAdd = () => {
  handleReset()
  kanban_dialog_title.value = '新增看板模板'
  kanban_dialog_button_text.value = '新增'
  kanban_dialog_action.value = '新增'
  KanbanGeneralDialogRef.value?.open()
}

// 改

const p_kanban_handleEditor = (row: any) => {
  Object.assign(kanbanform.value, {
    kanban_columns: row.child_item,
    board_name: row.board_name,
    board_description: row.board_description,
  })
  kanban_dialog_title.value = '编辑看板模板'
  kanban_dialog_button_text.value = '编辑'
  kanban_dialog_action.value = '编辑'
  edit_kanban_status.value = true
  KanbanGeneralDialogRef.value?.open(row)
}

const kanban_handleNew = async (row: any) => {
  if (kanban_dialog_action.value === '新增') {
    const res = await addKanban({
      board_name: kanbanform.value.board_name,
      kanban_columns: kanbanform.value.kanban_columns,
      board_description: kanbanform.value.board_description,
    })

    if (res.msg == '新增成功') {
      ElMessage.success(res.msg)
      KanbanGeneralDialogRef.value?.close()
      await fetchKanbanDatas(
        search_kanban.value,
        kanban_currentPage.value,
        kanban_defaultCount.value,
      )
    } else {
      ElMessage.error(res.msg)
      KanbanGeneralDialogRef.value?.close()
    }
  } else {
    console.log(kanbanform.value)
    const res = await editKanban({
      board_key: row.board_key,
      board_name: kanbanform.value.board_name,
      kanban_columns: kanbanform.value.kanban_columns,
      board_description: kanbanform.value.board_description,
    })

    if (res.msg == '编辑成功') {
      ElMessage.success(res.msg)
      KanbanGeneralDialogRef.value?.close()
      await fetchKanbanDatas(
        search_kanban.value,
        kanban_currentPage.value,
        kanban_defaultCount.value,
      )
    } else {
      ElMessage.error(res.msg)
      KanbanGeneralDialogRef.value?.close()
    }
    edit_kanban_status.value = false
  }
}

// 删除看板相关
const KanbanDelGeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const edit_kanban_status = ref(false)

const kanban_del_title = ref('')
const kanban_del_type = ref('')

const p_kanban_handleDelete = (row: any) => {
  kanban_del_title.value = '删除看板模板'
  kanban_del_type.value = '1'
  KanbanDelGeneralDialogRef.value?.open(row)
}

const s_kanban_handleDelete = (row: any) => {
  kanban_del_title.value = '删除看板模板列'
  kanban_del_type.value = '2'
  KanbanDelGeneralDialogRef.value?.open(row)
}

const kanbanDelConfirm = async (row: any) => {
  let res = { msg: '' }
  console.log(row)
  if (kanban_del_type.value === '1') {
    res = await delKanban({
      board_key: row.board_key,
    })
  } else {
    res = await delKanbanColumn({
      column_key: row.column_key,
    })
  }
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    KanbanDelGeneralDialogRef.value?.close()
    await fetchKanbanDatas(search_kanban.value, kanban_currentPage.value, kanban_defaultCount.value)
  } else {
    ElMessage.error(res.msg)
    KanbanDelGeneralDialogRef.value?.close()
  }
}

//  ------------------------------------------------------------

// const kanban_selected = ref<null | TaskItem>(null)

const kanban_selected_key = ref<string>('')
//task_tableDatas.value[0]?.task_key ||

const columns = ref([])

const kanban_task_searchText = ref('')

const kanban_switch = ref(true)

const fetch_kanban_task = async (k_switch: boolean, task_key: string, board_key: string, condition:string) => {
  const res = await fetchKanbanColumnTasks({
    k_switch: k_switch,
    task_key: task_key,
    board_key: board_key,
    condition: condition
  })
  columns.value = res.tasks
}

const handleSwitchChange = async () => {
  await fetch_kanban_task(
    kanban_switch.value,
    getSelectedTask()?.task_key || '',
    getSelectedTask()?.board_key || '',
    kanban_task_searchText.value
  )
}

const handleSearchChange = async () => {
  await fetch_kanban_task(
    kanban_switch.value,
    getSelectedTask()?.task_key || '',
    getSelectedTask()?.board_key || '',
    kanban_task_searchText.value
  )
}

const handleTaskSelect = async (row: any) => {
  await fetch_kanban_task(
    kanban_switch.value,
    getSelectedTask()?.task_key || '',
    getSelectedTask()?.board_key || '',
    kanban_task_searchText.value
  )
}

//  ------------------------------------------------------------
const { get_messages_status } = message_channel()

const message_form = ref({
  message_key: '',
  message_content: ''
})

interface MessageItem {
  mes_key: string
  mes_name: string
  mes_info: string
}

const message_options = ref<MessageItem[]>([])


//  ------------------------------------------------------------

onMounted(async () => {
  await fecthUserData(1, 50000)
  await fetchKanbanDatas(search_kanban.value, kanban_currentPage.value, kanban_defaultCount.value)
  await fecthTasks(
    activeFilter.value,
    searchText.value,
    task_currentPage.value,
    task_defaultCount.value,
  )
  const message: MessageItem[] = await get_messages_status({
    status: 1,
  })
  message_options.value = message
})

// 拖动事件
const onTaskDrag = async (evt: any, targetColumn: any) => {
  if (!!evt.added && !evt.removed && !evt.moved)
  {
    const draggedTask = evt.added?.element || evt.moved?.element;
    if (draggedTask) {
      const res = await editKanbanTasks({
        assignee_key: draggedTask.assignee_key,
        task_key: draggedTask.task_key,
        task_details_key: draggedTask.task_details_key,
        column_key: targetColumn.column_key,
        column_status: targetColumn.column_status,
      })
      if (res.msg !== '编辑成功'){
        ElMessage.error(res.msg)
        await fetch_kanban_task(
          kanban_switch.value,
          getSelectedTask()?.task_key || '',
          getSelectedTask()?.board_key || '',
          kanban_task_searchText.value
        )
      }
      // console.log('draggedTask', draggedTask.assignee_key)
    }
  }else{
    return
  }
}
</script>

<style scoped>
/* Tabs */
.main-tabs :deep(.el-tabs__header) {
  margin: 0;
  display: flex;
  justify-content: center;
}

/* ================= segmented ================= */

.segmented {
  display: flex;
  overflow: hidden;
}

.seg-btn {
  padding: 6px 16px;
  background: #fff;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.seg-btn + .seg-btn {
  border-left: 1px solid #dcdfe6;
}

.seg-btn.active {
  background: #1677ff;
  color: white;
}

/* 统一表单项样式，避免间距混乱 */
.kanban-column-item {
  margin-bottom: 6px; /* 列之间的间距 */
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0; /* 分隔线，视觉更清晰 */
}

/* 表单行布局：垂直居中+统一间距 */
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px; /* 行之间的间距 */
  gap: 8px;
}

/* 表单标签：固定宽度+对齐，避免文字长短导致布局偏移 */
.form-label {
  flex: 0 0 100px; /* 固定宽度，不拉伸不收缩 */
  text-align: right; /* 右对齐，更美观 */
  color: #606266; /* 调整文字颜色，和表单标签统一 */
}

/* 输入框：占满剩余宽度，统一样式 */
.form-input {
  flex: 1; /* 自适应剩余宽度 */
  min-width: 200px; /* 最小宽度，避免太窄 */
}

/* 操作按钮区域：对齐+间距 */
.form-actions {
  margin-left: 108px; /* 和标签宽度+gap对齐，视觉统一 */
}

.header-divider {
  border-bottom: 1px solid #f0f0f0;
  @apply mb-4;
}

.task-dialog {
  padding-top: 10px;
}

/* 表单 */

/* 表格头 */
.task-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.task-table-header .title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 表格容器 */
.table-wrapper {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  @apply mb-8;
}

/* 可编辑单元格 */
.edit-cell {
  min-height: 28px;
  display: flex;
  align-items: center;
  padding: 2px 4px;
  cursor: pointer;
}

.cell-text {
  width: 100%;
  color: #333;
  word-break: break-all;
}

.task-form-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
/* 看板 */

/* 看板容器 */
.kanban-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  padding-bottom: 16px;
  scrollbar-width: thin;
}

.kanban-columns::-webkit-scrollbar {
  height: 6px;
}
.kanban-columns::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

/* 列容器 */
.kanban-column {
  background: #f5f6f7;
  padding: 2px;
  border-radius: 6px;
  min-height: 300px;
  flex: 1;
  min-width: 240px;
  max-width: 320px;
}

/* 任务卡片 */
.task-card {
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.task-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-detail {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
}

.task-card:hover .task-detail {
  max-height: 128px !important;
  opacity: 1 !important;
}
.task-card:hover .text-xs {
  display: none;
}

/* 空列样式 */
.empty-column {
  padding: 32px 16px;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  margin-top: 8px;
  text-align: center;
  color: #9ca3af;
}
</style>
