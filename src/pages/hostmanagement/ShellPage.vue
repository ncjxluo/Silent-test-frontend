<template>
  <el-splitter>
    <el-splitter-panel size="20%" :collapsible="true">
      <div class="file-toolbar">
        <!-- 搜索框 -->
        <el-input
          v-model="fileSearch"
          placeholder="搜索文件/文件夹"
          size="small"
          clearable
          class="search-input"
        />
        <!-- 刷新按钮 -->
        <el-icon><Refresh /></el-icon>
        <!-- 上传下载下拉组件 -->
        <el-dropdown size="small">
          <el-button>
            操作
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <!--              <el-dropdown-item @click="handleUploadFile">-->
              <!--                <el-icon><upload /></el-icon>-->
              <!--                上传文件-->
              <!--              </el-dropdown-item>-->
              <!--              <el-dropdown-item @click="handleDownloadFile">-->
              <!--                <el-icon><download /></el-icon>-->
              <!--                下载文件-->
              <!--              </el-dropdown-item>-->
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <!-- 文件树 -->
      <div class="file-tree-wrapper">
        <!--        <el-tree-->
        <!--          ref="fileTreeRef"-->
        <!--          :data="fileTreeData"-->
        <!--          :props="treeProps"-->
        <!--          :filter-node-method="filterFileNode"-->
        <!--          @node-click="handleFileNodeClick"-->
        <!--          highlight-current-->
        <!--          default-expand-all-->
        <!--          class="file-tree"-->
        <!--        >-->
        <!--          &lt;!&ndash; 自定义文件树节点图标 &ndash;&gt;-->
        <!--          <template #default="{ node, data }">-->
        <!--            <span class="tree-node">-->
        <!--              <el-icon v-if="data.type === 'dir'" class="dir-icon">-->
        <!--                <folder />-->
        <!--              </el-icon>-->
        <!--              <el-icon v-else class="file-icon">-->
        <!--                <document />-->
        <!--              </el-icon>-->
        <!--              <span>{{ node.label }}</span>-->
        <!--            </span>-->
        <!--          </template>-->
        <!--        </el-tree>-->
      </div>
    </el-splitter-panel>
    <el-splitter-panel>
      <div
        ref="terminal"
        v-loading="loading"
        class="terminal"
        element-loading-text="正在连接..."
      ></div>
    </el-splitter-panel>
  </el-splitter>
</template>

<!--<script setup lang="ts">-->
<!--import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue'-->
<!--import { config } from '@/utils/config.ts'-->
<!--import { ElMessage, ElMessageBox } from 'element-plus'-->
<!--// 仅需导入核心包，无任何插件依赖-->
<!--import { debounce } from 'lodash'-->
<!--import { Terminal } from '@xterm/xterm'-->
<!--import { FitAddon } from '@xterm/addon-fit'-->

<!--// 引入xterm样式-->
<!--import '@xterm/xterm/css/xterm.css'-->

<!--// 导入Element Plus图标-->
<!--import { ArrowDown, Upload, Download, Folder, Document, Refresh } from '@element-plus/icons-vue'-->
<!--import { useRoute } from 'vue-router'-->

<!--const route = useRoute()-->
<!--const baseUrl = ref('')-->
<!--const v_key = route.params.v_key as string-->

<!--// &#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45; 左侧文件树相关 &#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;&#45;-->
<!--// 文件树搜索关键词-->
<!--const fileSearch = ref('')-->
<!--// 文件树实例-->
<!--const fileTreeRef = ref()-->
<!--// 文件树数据（模拟Linux目录结构）-->
<!--const fileTreeData = ref([-->
<!--  {-->
<!--    id: '/root',-->
<!--    label: 'root',-->
<!--    type: 'dir',-->
<!--    children: [-->
<!--      {-->
<!--        id: '/root/scripts',-->
<!--        label: 'scripts',-->
<!--        type: 'dir',-->
<!--        children: [-->
<!--          { id: '/root/scripts/test.sh', label: 'test.sh', type: 'file' },-->
<!--          { id: '/root/scripts/oracle.xml', label: 'oracle.xml', type: 'file' },-->
<!--        ],-->
<!--      },-->
<!--      {-->
<!--        id: '/root/logs',-->
<!--        label: 'logs',-->
<!--        type: 'dir',-->
<!--        children: [-->
<!--          { id: '/root/logs/access.log', label: 'access.log', type: 'file' },-->
<!--          { id: '/root/logs/error.log', label: 'error.log', type: 'file' },-->
<!--        ],-->
<!--      },-->
<!--      { id: '/root/.bashrc', label: '.bashrc', type: 'file' },-->
<!--      { id: '/root/profile', label: 'profile', type: 'file' },-->
<!--    ],-->
<!--  },-->
<!--  {-->
<!--    id: '/etc',-->
<!--    label: 'etc',-->
<!--    type: 'dir',-->
<!--    children: [-->
<!--      { id: '/etc/nginx', label: 'nginx', type: 'dir' },-->
<!--      { id: '/etc/my.cnf', label: 'my.cnf', type: 'file' },-->
<!--    ],-->
<!--  },-->
<!--  {-->
<!--    id: '/var',-->
<!--    label: 'var',-->
<!--    type: 'dir',-->
<!--    children: [-->
<!--      { id: '/var/lib', label: 'lib', type: 'dir' },-->
<!--      { id: '/var/log', label: 'log', type: 'dir' },-->
<!--    ],-->
<!--  },-->
<!--])-->

<!--// 文件树配置-->
<!--const treeProps = reactive({-->
<!--  children: 'children',-->
<!--  label: 'label',-->
<!--})-->

<!--// 过滤文件树节点-->
<!--const filterFileNode = (value: string, data: any) => {-->
<!--  if (!value) return true-->
<!--  return data.label.toLowerCase().includes(value.toLowerCase())-->
<!--}-->

<!--// 监听搜索框变化，过滤文件树-->
<!--watch(fileSearch, (val) => {-->
<!--  fileTreeRef.value?.filter(val.toLowerCase())-->
<!--})-->
<!--//-->
<!--// // 刷新文件树-->
<!--// const refreshFileTree = () => {-->
<!--//   ElMessage.success('文件树已刷新')-->
<!--//   // 实际项目中调用接口重新获取服务器文件列表-->
<!--//   fileSearch.value = ''-->
<!--// }-->
<!--//-->
<!--// // 处理文件节点点击（自动发送命令到终端）-->
<!--// const handleFileNodeClick = (data: any) => {-->
<!--//   if (data.type === 'file') {-->
<!--//     ElMessage.info(`你选择了文件：${data.id}`)-->
<!--//   } else {-->
<!--//     ElMessage.info(`你选择了目录：${data.id}`)-->
<!--//   }-->
<!--// }-->
<!--//-->
<!--// // 处理文件上传-->
<!--// const handleUploadFile = () => {-->
<!--//   ElMessageBox.prompt('请输入要上传的文件路径（服务器端）', '文件上传', {-->
<!--//     confirmButtonText: '确认上传',-->
<!--//     cancelButtonText: '取消',-->
<!--//     inputValue: '/root/uploads/',-->
<!--//   })-->
<!--//     .then(({ value }) => {-->
<!--//       ElMessage.success(`即将上传文件到：${value}`)-->
<!--//       // 实际项目中对接文件上传接口-->
<!--//     })-->
<!--//     .catch(() => {-->
<!--//       ElMessage.info('取消文件上传')-->
<!--//     })-->
<!--// }-->
<!--//-->
<!--// // 处理文件下载-->
<!--// const handleDownloadFile = () => {-->
<!--//   const selectedNode = fileTreeRef.value?.getCurrentNode()-->
<!--//   if (!selectedNode) {-->
<!--//     ElMessage.warning('请先选择要下载的文件/目录')-->
<!--//     return-->
<!--//   }-->
<!--//   ElMessage.success(`即将下载：${selectedNode.data.id}`)-->
<!--//   // 实际项目中对接文件下载接口-->
<!--// }-->
<!--// //&#45;&#45;&#45;&#45;终端&#45;&#45;&#45;&#45;-->
<!--const loading = ref(true)-->
<!--const terminal = ref(null)-->
<!--const fitAddon = new FitAddon()-->
<!--const first = ref(true)-->
<!--const terminalSocket = ref<WebSocket | null>(null)-->
<!--// 终端-->
<!--const term = ref<Terminal | null>(null)-->
<!--//-->
<!--// // 初始化WS-->
<!--const initWS = () => {-->
<!--  if (!terminalSocket.value) {-->
<!--    createWS()-->
<!--  }-->
<!--  // if (terminalSocket.value && terminalSocket.value.readyState > 1) {-->
<!--  //   terminalSocket.value.close()-->
<!--  //   createWS()-->
<!--  // }-->
<!--}-->

<!--const safeTermWrite = (content: string) => {-->
<!--  if (term.value) {-->
<!--    try {-->
<!--      term.value.write(content)-->
<!--    } catch (e) {-->
<!--      console.error('终端写入失败:', e)-->
<!--    }-->
<!--  }-->
<!--}-->

<!--//-->
<!--// // 创建WS-->
<!--const createWS = () => {-->
<!--  // const url = `/access/Api/ws/ssh/b172df81-2485-453d-a6ff-120c03821536?userName=test&passwd=1`-->
<!--  console.log(baseUrl.value)-->
<!--  terminalSocket.value = new WebSocket(`ws://${baseUrl.value}api/v1/ws/ws_ssh?v_key=${v_key}`)-->
<!--  terminalSocket.value.onopen = runRealTerminal-->
<!--  terminalSocket.value.onmessage = onWSReceive //收到服务器消息-->
<!--  terminalSocket.value.onclose = closeRealTerminal //WebSocket 连接已关闭-->
<!--  terminalSocket.value.onerror = errorRealTerminal //WebSocket 连接出错-->
<!--}-->

<!--//WebSocket 连接已建立-->
<!--const runRealTerminal = () => {-->
<!--  loading.value = false-->
<!--  if (isWsOpen()) {-->
<!--    terminalSocket.value.send(-->
<!--      JSON.stringify({-->
<!--        type: 'init',-->
<!--        data: {-->
<!--          v_key: v_key,          // 传 vm 的 key-->
<!--          cols: term.value.cols,-->
<!--          rows: term.value.rows,-->
<!--        },-->
<!--      })-->
<!--    )-->
<!--  }-->
<!--}-->
<!--// //WebSocket收到服务器消息-->
<!--const onWSReceive = (message:any) => {-->
<!--  const msg = JSON.parse(message.data)-->

<!--  if (msg.type === 'terminal') {-->
<!--    // 后端发送的 base64 输出-->
<!--    const decoded = atob(msg.data)-->
<!--    term.value.write(decoded)-->
<!--  } else if (msg.type === 'resize') {-->
<!--    // 后端请求 resize-->
<!--    term.value.resize(msg.data.cols, msg.data.rows)-->
<!--  }-->
<!--  term.value.element && term.value.focus()-->

<!--  // 首次渲染时自适应-->
<!--  if (first.value === true) {-->
<!--    first.value = false-->
<!--    resizeRemoteTerminal()-->
<!--  }-->
<!--}-->

<!--// //WebSocket 连接出错-->
<!--const errorRealTerminal = (ex) => {-->
<!--  console.log(ex)-->
<!--}-->
<!--//   let message = ex.message-->
<!--//   if (!message) message = 'disconnected'-->
<!--//   term.value.write(`\x1b[31m${message}\x1b[m\r\n`)-->
<!--//   console.log('err')-->
<!--// }-->
<!--// //WebSocket 连接已关闭-->
<!--const closeRealTerminal = () => {-->
<!--  console.log('close')-->
<!--}-->
<!--//-->
<!--// // 初始化Terminal-->
<!--const initTerm = () => {-->
<!--  term.value = new Terminal({-->
<!--    fontSize: 14,-->
<!--    fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",-->
<!--    theme: {-->
<!--      background: '#181d28',-->
<!--    },-->
<!--    // 光标闪烁-->
<!--    cursorBlink: true,-->
<!--    cursorStyle: 'underline',-->
<!--    // scrollback: 100,-->
<!--    // tabStopWidth: 4,-->
<!--  })-->
<!--  term.value.open(terminal.value) //挂载dom窗口-->
<!--  term.value.loadAddon(fitAddon) //自适应尺寸-->

<!--  // 不能初始化的时候fit,需要等terminal准备就绪,可以设置延时操作-->
<!--  setTimeout(() => {-->
<!--    fitAddon.fit()-->
<!--  }, 100)-->
<!--  termData() //Terminal 事件挂载-->
<!--}-->
<!--//-->
<!--// // 终端输入触发事件-->
<!--const termData = () => {-->
<!--  // 输入与粘贴的情况,onData不能重复绑定,不然会发送多次-->
<!--  term.value.onData((data) => {-->
<!--    console.log(data, '传入服务器')-->
<!--    if (isWsOpen()) {-->
<!--      console.log('ok')-->
<!--      terminalSocket.value.send(-->
<!--        JSON.stringify({-->
<!--          type: 'terminal',-->
<!--          data: { base64: btoa(data) },-->
<!--        })-->
<!--      )-->
<!--    }-->
<!--  })-->
<!--  // 终端尺寸变化触发-->
<!--  term.value.onResize(() => {-->
<!--    resizeRemoteTerminal()-->
<!--  })-->
<!--}-->
<!--//-->
<!--// //尺寸同步 发送给后端,调整后端终端大小,和前端保持一致,不然前端只是范围变大了,命令还是会换行-->
<!--const resizeRemoteTerminal = () => {-->
<!--  const { cols, rows } = term.value-->
<!--  if (isWsOpen()) {-->
<!--    terminalSocket.value.send(-->
<!--      JSON.stringify({-->
<!--        type: 'resize',-->
<!--        data: {-->
<!--          rows: rows,-->
<!--          cols: cols,-->
<!--        },-->
<!--      }),-->
<!--    )-->
<!--  }-->
<!--}-->
<!--//-->
<!--// // 是否连接中0 1 2 3 状态-->
<!--const isWsOpen = () => {-->
<!--  const readyState = terminalSocket.value && terminalSocket.value.readyState-->
<!--  return readyState === 1-->
<!--}-->
<!--//-->
<!--// // 适应浏览器尺寸变化-->
<!--const fitTerm = () => {-->
<!--  fitAddon.fit()-->
<!--}-->
<!--const onResize = debounce(() => fitTerm(), 500)-->

<!--const onTerminalResize = () => {-->
<!--  window.addEventListener('resize', onResize)-->
<!--}-->
<!--const removeResizeListener = () => {-->
<!--  window.removeEventListener('resize', onResize)-->
<!--}-->

<!--onMounted( async () => {-->
<!--  const conf = await config.getConfig()-->
<!--  baseUrl.value = conf.baseUrl.replace('http://', '')-->
<!--  initWS()-->
<!--  initTerm()-->
<!--  onTerminalResize()-->
<!--})-->
<!--//-->
<!--onBeforeUnmount(() => {-->
<!--  removeResizeListener()-->
<!--  terminalSocket.value && terminalSocket.value.close()-->
<!--})-->
<!--</script>-->

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue'
import { config } from '@/utils/config.ts'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce } from 'lodash'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'
import { ArrowDown, Upload, Download, Folder, Document, Refresh } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const baseUrl = ref('')
const v_key = route.params.v_key as string

// ---------------------- 左侧文件树相关 ----------------------
const fileSearch = ref('')
const fileTreeRef = ref()
const fileTreeData = ref([
  {
    id: '/root',
    label: 'root',
    type: 'dir',
    children: [
      {
        id: '/root/scripts',
        label: 'scripts',
        type: 'dir',
        children: [
          { id: '/root/scripts/test.sh', label: 'test.sh', type: 'file' },
          { id: '/root/scripts/oracle.xml', label: 'oracle.xml', type: 'file' },
        ],
      },
      {
        id: '/root/logs',
        label: 'logs',
        type: 'dir',
        children: [
          { id: '/root/logs/access.log', label: 'access.log', type: 'file' },
          { id: '/root/logs/error.log', label: 'error.log', type: 'file' },
        ],
      },
      { id: '/root/.bashrc', label: '.bashrc', type: 'file' },
      { id: '/root/profile', label: 'profile', type: 'file' },
    ],
  },
  {
    id: '/etc',
    label: 'etc',
    type: 'dir',
    children: [
      { id: '/etc/nginx', label: 'nginx', type: 'dir' },
      { id: '/etc/my.cnf', label: 'my.cnf', type: 'file' },
    ],
  },
  {
    id: '/var',
    label: 'var',
    type: 'dir',
    children: [
      { id: '/var/lib', label: 'lib', type: 'dir' },
      { id: '/var/log', label: 'log', type: 'dir' },
    ],
  },
])

const treeProps = reactive({
  children: 'children',
  label: 'label',
})

const filterFileNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

watch(fileSearch, (val) => {
  fileTreeRef.value?.filter(val.toLowerCase())
})

// ---------------------- 终端核心逻辑（关键修复） ----------------------
const isComponentMounted = ref(true)

const loading = ref(true)
const terminal = ref<HTMLElement | null>(null)
const fitAddon = new FitAddon()
const first = ref(true)
const terminalSocket = ref<WebSocket | null>(null)
const term = ref<Terminal | null>(null)

const safeTermWrite = (content: string) => {
  if (term.value && isComponentMounted.value) {
    try {
      term.value.write(content)
    } catch (e) {
      console.error('终端写入失败:', e)
    }
  }
}

// 修复：统一编码解码函数
const safeBtoa = (str: string) => {
  try {
    return btoa(unescape(encodeURIComponent(str)))
  } catch (e) {
    console.error('编码失败:', e)
    return btoa(str) // 回退方案
  }
}

const safeAtob = (b64Str: string) => {
  try {
    return decodeURIComponent(escape(atob(b64Str)))
  } catch (e) {
    console.error('解码失败:', e)
    return b64Str
  }
}

// 是否连接中
const isWsOpen = () => {
  return terminalSocket.value?.readyState === WebSocket.OPEN
}

// 创建WS连接
const createWS = () => {
  console.log('连接WS:', `ws://${baseUrl.value}api/v1/ws/ws_ssh?v_key=${v_key}`)
  terminalSocket.value = new WebSocket(`ws://${baseUrl.value}api/v1/ws/ws_ssh?v_key=${v_key}`)
  terminalSocket.value.onopen = runRealTerminal
  terminalSocket.value.onmessage = onWSReceive
  terminalSocket.value.onclose = closeRealTerminal
  terminalSocket.value.onerror = errorRealTerminal
}

// WebSocket 连接已建立
const runRealTerminal = () => {
  console.log('WS连接成功')
  if (term.value && isWsOpen()) {
    // 发送初始化消息（修复：使用后端期望的格式）
    terminalSocket.value?.send(
      JSON.stringify({
        type: 'init',
        data: {
          v_key: v_key,
          cols: term.value.cols,
          rows: term.value.rows,
        },
      })
    )
  }
  loading.value = false
}

// WebSocket收到服务器消息
const onWSReceive = (message: MessageEvent) => {
  try {
    const msg = JSON.parse(message.data)
    console.log('收到消息:', msg.type)

    // 修复：根据后端返回的消息类型处理
    if (msg.type === 'terminal') {
      // 修复：后端可能直接返回base64字符串，也可能在data字段中
      const b64Data = typeof msg.data === 'string' ? msg.data :
        (msg.data?.base64 || '')
      if (b64Data) {
        const decoded = safeAtob(b64Data)
        term.value?.write(decoded)
      }
    }
    else if (msg.type === 'connection') {
      console.log('连接状态:', msg.status)
      if (msg.status === 'connected') {
        term.value?.write(`\r\n\x1b[32m${msg.message}\x1b[0m\r\n`)
      }
    }
    else if (msg.type === 'error') {
      term.value?.write(`\r\n\x1b[31m错误: ${msg.message}\x1b[0m\r\n`)
    }
    else if (msg.type === 'resize') {
      if (msg.data && term.value) {
        term.value.resize(msg.data.cols, msg.data.rows)
      }
    }

    // 首次连接成功后调整终端大小
    if (first.value) {
      first.value = false
      setTimeout(() => {
        fitAddon.fit()
        resizeRemoteTerminal()
      }, 100)
    }

    // 保持焦点
    term.value?.focus()

  } catch (e) {
    console.error('消息处理失败:', e)
  }
}

// WebSocket 连接出错
const errorRealTerminal = (ex: Event) => {
  console.error('WS错误:', ex)
  term.value?.write(`\r\n\x1b[31m连接出错\x1b[0m\r\n`)
}

// WebSocket 连接已关闭
const closeRealTerminal = () => {
  console.log('WS关闭')
  term.value?.write(`\r\n\x1b[33m连接已断开\x1b[0m\r\n`)
  loading.value = true
}

// 初始化Terminal
const initTerm = () => {
  if (!terminal.value) {
    console.error('终端容器未找到')
    return
  }

  // 创建终端实例
  term.value = new Terminal({
    fontSize: 14,
    fontFamily: "Monaco, Menlo, Consolas, 'Courier New', monospace",
    theme: {
      background: '#181d28',
      foreground: '#ffffff',
    },
    cursorBlink: true,
    cursorStyle: 'underline',
    convertEol: true,
    allowTransparency: false,
  })

  // 挂载终端
  term.value.open(terminal.value)
  term.value.loadAddon(fitAddon)

  // 绑定输入事件
  term.value.onData((data) => {
    console.log('用户输入:', data)

    // 先本地回显（重要：确保用户能看到自己的输入）
    // term.value!.write(data)

    // 发送到后端
    if (isWsOpen()) {
      terminalSocket.value?.send(
        JSON.stringify({
          type: 'terminal',
          data: { base64: safeBtoa(data) }
        })
      )
    }
  })

  // 处理终端大小变化
  term.value.onResize(() => {
    resizeRemoteTerminal()
  })

  // 初始调整大小
  setTimeout(() => {
    fitAddon.fit()
  }, 100)

  // 获取焦点
  term.value.focus()
}

// 尺寸同步
const resizeRemoteTerminal = () => {
  if (!term.value) return

  const { cols, rows } = term.value
  console.log('终端大小变化:', cols, rows)

  if (isWsOpen()) {
    terminalSocket.value?.send(
      JSON.stringify({
        type: 'resize',
        data: { rows, cols }
      })
    )
  }
}

// 适应浏览器尺寸变化
const fitTerm = () => {
  if (fitAddon && term.value) {
    fitAddon.fit()
    resizeRemoteTerminal()
  }
}

const onResize = debounce(() => fitTerm(), 500)

// 挂载生命周期
onMounted(async () => {
  try {
    // 获取配置
    const conf = await config.getConfig()
    baseUrl.value = conf.baseUrl.replace('http://', '').replace('https://', '')

    // 关键修改：先初始化终端，再连接WebSocket
    initTerm()

    // 延迟创建WS连接，确保终端已初始化
    setTimeout(() => {
      createWS()
    }, 300)

    // 监听窗口大小变化
    window.addEventListener('resize', onResize)

  } catch (e) {
    console.error('初始化失败:', e)
    ElMessage.error('初始化失败: ' + (e as Error).message)
  }
})

onBeforeUnmount(() => {
  // window.removeEventListener('resize', onResize)
  // terminalSocket.value?.close()
  // if (term.value) {
  //   term.value.dispose()
  // }
  cleanup()
})

const cleanup = () => {
  console.log('开始清理组件资源...')

  // 标记组件已卸载
  isComponentMounted.value = false

  // 清理窗口resize监听器
  window.removeEventListener('resize', onResize)

  // 关闭WebSocket连接
  if (terminalSocket.value) {
    try {
      // 先移除所有事件监听器
      terminalSocket.value.onopen = null
      terminalSocket.value.onmessage = null
      terminalSocket.value.onclose = null
      terminalSocket.value.onerror = null

      // 关闭连接
      if (terminalSocket.value.readyState === WebSocket.OPEN) {
        terminalSocket.value.close(1000, '组件卸载')
      }
    } catch (e) {
      console.error('关闭WebSocket失败:', e)
    } finally {
      terminalSocket.value = null
    }
  }

  // 清理终端实例
  if (term.value) {
    try {
      // 先清空终端内容
      term.value.clear()
      // 然后销毁实例
      term.value.dispose()
    } catch (e) {
      console.error('销毁终端失败:', e)
    } finally {
      term.value = null
    }
  }

  console.log('组件资源清理完成')
}
</script>

<style scoped>
/* 全局基础样式 */
:global(*) {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:global(html),
:global(body),
:global(#app) {
  height: 100%;
  overflow: hidden;
  background-color: #f6f8fa;
}

/* 容器样式 */
.linux-terminal-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
}

/* 顶部工具栏 */
.toolbar {
  height: 60px;
  border-bottom: 1px solid #e1e4e8;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.toolbar h3 {
  color: #24292e;
  font-weight: 600;
  font-size: 18px;
}

/* 主容器 */
.main-container {
  flex: 1;
  overflow: hidden;
}

/* 左侧文件区 */
.file-aside {
  border-right: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  padding: 15px;
  height: 100%;
  background-color: #fff;
}

/* 左侧操作栏 */
.file-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  align-items: center;
}

.search-input {
  flex: 1;
}

.operation-btn {
  background-color: #f6f8fa;
  border-color: #e1e4e8;
  color: #24292e;
  &:hover {
    background-color: #e6e9ec;
    border-color: #d1d5da;
  }
}

/* 文件树容器 */
.file-tree-wrapper {
  flex: 1;
  overflow-y: auto;
}

/* 文件树样式 */
.file-tree {
  font-size: 14px;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 2px 0;
  border-radius: 4px;
  &:hover {
    background-color: #f6f8fa;
  }
}

.dir-icon {
  margin-right: 5px;
  color: #409eff;
}

.file-icon {
  margin-right: 5px;
  color: #909399;
}

/* 右侧终端区 */
.terminal-main {
  margin-bottom: 20px; /* 增加底距，确保和翻页组件分离 */
  overflow: auto;
  max-height: calc(100vh - 150px);
  background-color: #161b22;
}

/* 终端状态条 */
.terminal-status-bar {
  height: 28px;
  line-height: 28px;
  padding: 0 16px;
  font-size: 13px;
  color: #fff;
  border-bottom: 1px solid #30363d;
  .status-text {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.terminal-status-bar.connected {
  background: #238636;
}

.terminal-status-bar.disconnected {
  background: #da3633;
}

.terminal {
  width: 100%;
  height: calc(100% - 62px);
}

/* 终端容器 */
.terminal-container {
  width: 100%;
  height: calc(100% - 28px);
  background: #161b22;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.4);
  padding: 8px;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
  &:hover {
    background: #484f58;
  }
}

::-webkit-scrollbar-track {
  background: #161b22;
}

/* 文件树滚动条单独样式 */
.file-tree-wrapper::-webkit-scrollbar-track {
  background: #f6f8fa;
}

.file-tree-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5da;
  &:hover {
    background: #9ea3a8;
  }
}
</style>
