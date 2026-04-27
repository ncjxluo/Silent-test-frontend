<template>
  <div class="page-container" style="height: 100%">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="page-title">消息通道配置</div>
      <el-button type="primary" @click="handleDialog">
        <el-icon><Plus /></el-icon>
        新增通道
      </el-button>
    </div>

    <!-- 卡片列表容器：核心添加滚动规则 -->
    <div class="card-list-container">
      <el-space wrap size="large" style="width: 100%;">
        <el-card
          v-for="item in card_data"
          :key="item.mes_key"
          class="message-card"
          shadow="hover"
        >
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <span class="status-dot" :class="item.is_enable === 1 ? 'active' : 'inactive'"></span>
                {{ item.mes_name }}
              </div>
              <div class="card-actions">
                <el-switch
                  :model-value="item.is_enable === 1"
                  @change="(val: any) => handleSwitchChange(val, item)"
                  size="small"
                />
                <div class="action-divider"></div>
                <el-button
                  class="action-btn edit-btn"
                  text
                  size="small"
                  @click="handleEdit(item)"
                >
                  编辑
                </el-button>
                <el-button
                  class="action-btn delete-btn"
                  text
                  size="small"
                  @click="handleDelete(item)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>
          <div class="card-content">
            <div class="content-item">
              <span class="label">发送接口：</span>
              <span class="value single-line-scroll">{{ item.mes_url }}</span>
            </div>
            <div class="content-item">
              <span class="label">默认发送内容：</span>
              <span class="value">{{ item.mes_info || '无' }}</span>
            </div>
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
      <el-form :model="form" label-width="120px" style="max-width: 600px">
        <el-form-item label="消息通道名字">
          <el-input v-model="form.mes_name" placeholder="请输入通道名称" />
        </el-form-item>
        <el-form-item label="消息通道地址">
          <el-input v-model="form.mes_url" placeholder="请输入Webhook地址" />
        </el-form-item>
        <el-form-item label="消息发送的默认内容">
          <el-input
            v-model="form.mes_info"
            type="textarea"
            :rows="3"
            placeholder="请输入默认消息内容"
          />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-radio-group v-model="form.is_enable">
            <el-radio value="1" size="large">启用</el-radio>
            <el-radio value="0" size="large">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div class="dialog-footer-actions">
        <el-button type="primary" @click="handleSend">
          <el-icon><Promotion /></el-icon>
          发送测试
        </el-button>
      </div>
    </general-dialog>

    <general-dialog
      ref="DelDialogRef"
      title="删除消息通道"
      :width="400"
      confirmText="确定删除"
      btype="danger"
      @confirm="delConfirm"
    >
      <div class="delete-confirm">
        <el-icon size="48" color="#F56C6C"><Warning /></el-icon>
        <p>确定要删除该消息通道吗？</p>
        <p class="sub-text">此操作不可恢复</p>
      </div>
    </general-dialog>
  </div>
</template>

<script setup lang="ts">
import GeneralDialog from '@/components/GeneralDialog.vue'
import { message_channel } from '@/hooks/messagecenter/messagechannel.ts'
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Promotion, Warning } from '@element-plus/icons-vue'

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
  const messages: Messages = await get_messages()
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
  // 重置表单
  Object.assign(form, {
    mes_name: '',
    mes_url: '',
    mes_info: '',
    is_enable: '1',
  })
  GeneralDialogRef.value?.open()
}

const handleEdit = (item: MessageItem) => {
  // 填充表单
  Object.assign(form, {
    mes_name: item.mes_name,
    mes_url: item.mes_url,
    mes_info: item.mes_info,
    is_enable: item.is_enable.toString(),
  })
  GeneralDialogRef.value?.open()
}

const handleNew = async () => {
  const res = await save_message({
    "mes_name": form.mes_name,
    "mes_url": form.mes_url,
    "mes_info": form.mes_info,
    "is_enable": form.is_enable,
  })
  if (res.msg === '新增成功') {
    ElMessage.success(res.msg)
    GeneralDialogRef.value?.close()
    await fetch_messages()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleSend = async () => {
  const res = await test_send({
    mes_url: form.mes_url,
    mes_info: form.mes_info
  })
  if (res.msg === '发送成功') {
    ElMessage.success(res.msg)
  } else {
    ElMessage.error(res.msg)
  }
}

const handleSwitchChange = async (val: number, item: any) => {
  const res = await set_message_status({
    "mes_key": item.mes_key,
    "is_enable": val,
  })
  if (res.msg === '更新状态成功') {
    ElMessage.success(res.msg)
    await fetch_messages()
  } else {
    ElMessage.error(res.msg)
  }
}

const handleDelete = async (item: any) => {
  DelDialogRef.value?.open(item)
}

const delConfirm = async (item: any) => {
  const res = await del_message({ mes_key: item.mes_key })
  if (res.msg === '删除成功') {
    ElMessage.success(res.msg)
    DelDialogRef.value?.close()
    await fetch_messages()
  } else {
    ElMessage.error(res.msg)
  }
}
</script>

<style scoped>
/* 页面外层容器 */
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  padding: 24px;
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

/* 核心：卡片列表容器，添加滚动规则 */
.card-list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

:deep(.el-space) {
  width: 100%;
  justify-content: flex-start;
}

/* 卡片样式 */
.message-card {
  width: 380px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.message-card:hover {
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.2);
  transform: translateY(-2px);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-dot.active {
  background-color: #10b981;
}

.status-dot.inactive {
  background-color: #94a3b8;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-divider {
  width: 1px;
  height: 16px;
  background-color: #e2e8f0;
  margin: 0 4px;
}

.action-btn {
  padding: 2px 6px !important;
  font-size: 12px !important;
  min-width: unset !important;
  --el-button-text-hover-bg-color: transparent;
}

.edit-btn {
  color: #3b82f6 !important;
  --el-button-text-hover-text-color: #2563eb !important;
}

.delete-btn {
  color: #ef4444 !important;
  --el-button-text-hover-text-color: #dc2626 !important;
}

/* 卡片内容 */
.card-content {
  padding: 16px 0 0;
}

.content-item {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}

.content-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #64748b;
  min-width: 100px;
}

.value {
  color: #1e293b;
  flex: 1;
  word-break: break-all;
}

.single-line-scroll {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 对话框样式 */
.dialog-footer-actions {
  margin-top: 16px;
  text-align: right;
}

.delete-confirm {
  text-align: center;
  padding: 24px 0;
}

.delete-confirm p {
  margin: 16px 0 8px;
  font-size: 16px;
  color: #1e293b;
}

.delete-confirm .sub-text {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* 优化滚动条样式 */
.card-list-container::-webkit-scrollbar {
  width: 6px;
}
.card-list-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}
.card-list-container::-webkit-scrollbar-track {
  background-color: #f1f5f9;
}
</style>
