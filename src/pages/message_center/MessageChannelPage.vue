<template>
  <div class="page-container" style="height: 100%">
    <div class="add-btn-container" style="margin-bottom: 20px">
      <el-button type="primary" bg size="small" @click="handleDialog">新增</el-button>
    </div>

    <!-- 卡片列表容器：核心添加滚动规则 -->
    <div class="card-list-container">
      <el-space wrap size="small" style="width: 100%;">
        <el-card v-for="item in card_data" :key="item.mes_key" class="box-card" style="width: 350px">
          <template #header>
            <div
              class="card-header"
              style="display: flex; justify-content: space-between; align-items: center"
            >
              <span>{{ item.mes_name }}</span>
              <div class="card-header-actions">
                <el-switch :model-value="item.is_enable === 1"
                           @change="(val:any) => handleSwitchChange(val, item)"
                           size="small" />
                <div class="btn-group">
                  <el-button class="card-btn" text size="small">编辑</el-button>
                  <el-button class="card-btn" text size="small" @click="handleDelete(item)">删除</el-button>
                </div>
              </div>
            </div>
          </template>
          <div class="text item">
            <div class="text item single-line-scroll">
              发送接口：{{ item.mes_url }}
            </div>
            <div>默认发送内容：{{ item.mes_info }}</div>
          </div>
        </el-card>
      </el-space>
    </div>

    <general-dialog
      ref="GeneralDialogRef"
      title="新增消息通道"
      :width="500"
      confirmText="新增"
      btype="primary"
      @confirm="handleNew"
    >
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="消息通道名字">
          <el-input v-model="form.mes_name" />
        </el-form-item>
        <el-form-item label="消息通道地址">
          <el-input v-model="form.mes_url" />
        </el-form-item>
        <el-form-item label="消息发送的默认内容">
          <el-input v-model="form.mes_info" />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-radio-group v-model="form.is_enable">
            <el-radio value="1" size="large">启用</el-radio>
            <el-radio value="0" size="large">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-button type="primary" bg size="small" @click="handleSend">发送测试</el-button>
    </general-dialog>
    <general-dialog ref="DelDialogRef"
                    title='删除消息通道'
                    :width=500
                    confirmText="确定"
                    btype="danger"
                    @confirm="delConfirm">
      <div>确定删除吗？</div>
    </general-dialog>
  </div>
</template>

<script setup lang="ts">
import GeneralDialog from '@/components/GeneralDialog.vue'
import { message_channel } from '@/hooks/messagecenter/messagechannel.ts'
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const { test_send, save_message, get_messages, set_message_status, del_message } = message_channel()

const GeneralDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const EditDialogRef = ref<InstanceType<typeof GeneralDialog>>()
const DelDialogRef = ref<InstanceType<typeof GeneralDialog>>()

const form = reactive({
  mes_name: '',
  mes_url: '',
  mes_info: '',
  is_enable: '1',
})

interface MessageItem {
  mes_key: string
  mes_name: string
  mes_url: string
  mes_info: string | "没有默认消息"
  is_enable: number
}

interface Messages {
  messages: MessageItem[]
}

const card_data = ref<MessageItem[]>([])

const fetch_messages = async () => {
  const messages:Messages = await get_messages()
  console.log(messages.messages)
  card_data.value = messages.messages
}

onMounted(async () => {
  try {
    await fetch_messages()
  } catch (error) {
    console.error('请求失败:', error)
  }
})

const handleDialog = () => {
  GeneralDialogRef.value?.open()
}

const handleNew = async () => {
  console.log('点击了新增部门-确认')
  const res = await save_message({
    "mes_name": form.mes_name,
    "mes_url": form.mes_url,
    "mes_info": form.mes_info,
    "is_enable": form.is_enable,
  })
  if (res.msg == '新增成功') {
    ElMessage.success(res.msg)
    GeneralDialogRef.value?.close()
    await fetch_messages()
  }
  else{
    ElMessage.error(res.msg)
  }

}

const handleSend = async () => {
  console.log('发送成功')
  console.log(form)
  const res = await test_send(
    {
      mes_url: form.mes_url,
      mes_info: form.mes_info
    }
  )
  if (res.msg == '发送成功') {
    ElMessage.success(res.msg)
  }
  else{
    ElMessage.error(res.msg)
  }

}

const handleSwitchChange = async (val: number, item: any) => {
  console.log(item)
  console.log(val)
  const res = await set_message_status({
    "mes_key": item.mes_key,
    "is_enable": val,
  })
  if (res.msg == '更新状态成功') {
    ElMessage.success(res.msg)
    await fetch_messages()
  }
  else{
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (item: any) => {
  DelDialogRef.value?.open(item)
}

const delConfirm = async (item: any) => {
  // console.log(row)
  const res = await del_message({ mes_key: item.mes_key })
  if (res.msg == '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fetch_messages()
  }
  else{
    ElMessage.error(res.msg)
  }
}

</script>

<style scoped>
/* 页面外层容器：占满父容器高度（继承总布局的content-wrapper高度） */
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 核心：卡片列表容器，添加滚动规则 */
.card-list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* 强制隐藏水平滚动 */
  padding-right: 0 !important; /* 移除之前的右侧padding */
  width: 100%; /* 确保宽度和父容器一致 */
  box-sizing: border-box; /* 避免padding撑大宽度 */
}

:deep(.el-space) {
  width: 100%;
  justify-content: flex-start; /* 卡片从左侧开始排列，不居中 */
}

/* 优化滚动条样式（可选，适配Chrome/Firefox） */
.card-list-container::-webkit-scrollbar {
  width: 6px;
}
.card-list-container::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}
.card-list-container::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}

/* 原有按钮样式保留 */
.card-header-actions {
  display: flex;
  align-items: center;
  gap: 6px !important;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 0 !important;
}

.card-btn {
  padding: 2px 0 !important;
  padding-inline: 3px !important;
  font-size: 12px !important;
  min-width: unset !important;
  --el-button-text-hover-bg-color: transparent;
  color: #666 !important;
  --el-button-text-hover-text-color: #1989fa !important;
}

.card-btn:last-child {
  border-left: 1px solid #eee;
  margin-left: 4px !important;
  padding-left: 7px !important;
}

.single-line-scroll {
  white-space: nowrap; /* 强制不换行 */
  overflow: hidden;    /* 隐藏超出容器的内容 */
  text-overflow: ellipsis; /* 超出部分显示省略号 */
}
</style>
