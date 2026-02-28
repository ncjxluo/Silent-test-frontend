<template>
 <general-table :filter-table-data="tableDatas"
                :column-data="columnDatas"
                :default-counts="defaultCounts"
                v-model:current-page="currntPage"
                v-model:default-count="defaultCount"
                :total-count="totalCount"
                :search-keys="searchKeys"
                :is_enable_selected="false"
                :is_enable="is_enable"
                @update:currentPage="test1"
                @update:defaultCount="test2"
                @refresh="refreshDatas"
                @exportAllPage="exportAllData"
                ref="GeneralTableRef">


 </general-table>
</template>

<script setup lang="ts">
import GeneralTable  from '@/components/GeneralTable.vue'
import { onMounted, ref, h } from 'vue'
import { ElTag, ElMessage } from 'element-plus'
import { agent_reports } from '@/hooks/agent/agent.ts'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const { fetchApiAgents } = agent_reports()

const tableDatas = ref<AgentItem[]>([])
const columnDatas = ref([
  {
    "label": "agent名",
    "prop": "agent_name"
  },
  {
    "label": "agent状态",
    "prop": "agent_status",
    customRender: (row:any) => h(ElTag, {
      type: row.agent_status === 0 ? 'danger' : 'success'
    }, () => row.agent_status === 0 ? '失联' : '存活'),
    customSearch: (row:any, searchText:string) => {
      const statusText = row.agent_status === 0 ? '失联' : '存活'
      return statusText.toLowerCase().includes(searchText)
    }
  },
  {
    "label": "运行的任务",
    "prop": "agent_running_tasks"
  },
  {
    "label": "最大任务数",
    "prop": "agent_max_tasks"
  },
  {
    "label": "cpu负载",
    "prop": "agent_cpu"
  },
  {
    "label": "内存使用比",
    "prop": "agent_memory"
  },
  {
    "label": "io使用比",
    "prop": "agent_io"
  }
])

const GeneralTableRef = ref<InstanceType<typeof GeneralTable>>()

const defaultCounts = ref([3, 30,50,100])
const currntPage = ref(1)
const defaultCount = ref(3)
const totalCount = ref(0)

const is_enable = ref(false)

const searchKeys = ref(["agent_name","agent_status"])

interface AgentItem {
  agent_key: string;
  agent_name: string;
  agent_status: number;
  agent_running_tasks: string;
  agent_max_tasks: string;
  agent_cpu: string;
  agent_memory: string;
  agent_io: string;
  created_at: string | Date;
  updated_at: string | Date;
}

interface Agents {
  total_count: number;
  agents: AgentItem[];
}

onMounted(
  async () => {
    try {
      await fecthAgentData(1, defaultCount.value)
    } catch (error) {
      console.error('请求失败:', error)
    }
  }
)

const fecthAgentData = async (page: number, size: number) => {
  GeneralTableRef.value?.showLoading()
  const result:Agents = await fetchApiAgents({"current_page": page,"current_count": size})
  totalCount.value = result.total_count
  tableDatas.value = result.agents
  GeneralTableRef.value?.hideLoading()
}

const exportAgentData = async (page: number, size: number) => {
  const result:Agents = await fetchApiAgents({"current_page": page,"current_count": size})
  return result.agents
}

const test1 = async () => {
  await fecthAgentData(currntPage.value, defaultCount.value)
}

const test2 = async () => {
  await fecthAgentData(currntPage.value, defaultCount.value)
}

const refreshDatas = async () => {
  console.log("refreshDatas")
  await fecthAgentData(currntPage.value, defaultCount.value)
}

const exportAllData = async () => {
  try {
    const table = await exportAgentData(currntPage.value, totalCount.value)
    const exportData = table.map(agent => ({
        'agent名称': agent.agent_name,
        'agent状态': agent.agent_status === 0 ? '失联' : '存活',
        '运行任务': agent.agent_running_tasks,
        '最大任务数': agent.agent_max_tasks,
        'CPU使用率': agent.agent_cpu,
        '内存': agent.agent_memory,
        'IO': agent.agent_io,
        '创建时间': new Date(agent.created_at).toLocaleString('zh-CN'),
        '更新时间': new Date(agent.updated_at).toLocaleString('zh-CN')
      })
    )
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet1')
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const date = new Date()
    saveAs(blob, `${date.toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`)
    ElMessage.success("导出成功")
  }
  catch (error) {
    console.error('生成Excel失败:', error)
    ElMessage.error('导出失败')

  }

}

</script>


<style scoped></style>
