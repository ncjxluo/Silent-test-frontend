
import nProgress from 'nprogress'
import { user_heartbeat } from '@/api/manager.ts'

export function showFullLoading(){
  nProgress.start()
}

export function hideFullLoading(){
  nProgress.done()
}

let heartbeatTimer: number | null = null;

export function startHeartbeat() {
  // 先停掉旧的，防止重复
  stopHeartbeat()

  const username = localStorage.getItem('username')
  if (!username) return
  // 每30秒一次
  heartbeatTimer = setInterval(async () => {
    try {
      await user_heartbeat()
    }catch(error){
      console.log('心跳请求失败', error)
    }
  }, 30000)
}

// 停止心跳
export function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

export function mapKeyToLabel(
  key: string | undefined,
  mapSource: Record<string, string> | any[],
  keyField = 'key',
  labelField = 'label',
  defaultValue = '-'
) {
  // 处理空值

  if (!key) return defaultValue;

  // 情况1：数据源是对象（原有逻辑，兼容旧用法）
  if (Object.prototype.toString.call(mapSource) === '[object Object]') {
    return (mapSource as Record<string, string>)[key] || defaultValue;
  }

  // 情况2：数据源是数组（新增逻辑，适配你的用户列表）
  if (Array.isArray(mapSource)) {
    // 从数组中找到匹配的项
    const matchItem = mapSource.find(item => item[keyField] === key);
    // 返回对应的label字段，无匹配则返回默认值
    return matchItem ? matchItem[labelField] : defaultValue;
  }

  // 非法数据源类型
  return defaultValue;
}

// export function jsonToTree(json_data: any, nodeFactory: any) {
//   const node = nodeFactory();
// }

function getJsonType(value: any): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return typeof value
}


function createBaseNode(key: string, value: any, columns: any[]) {

  const node: any = {
    id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    children: []
  }

  columns.forEach((column:any) => {
    switch (column.prop){
      case 'name':
      case 'key':
        node[column.prop] = key
        break
      case 'type':
        node[column.prop] = getJsonType(value)
        break
      case 'example':
      case 'value':
        node[column.prop] = typeof value === 'object' && value !== null
          ? ''
          : String(value ?? '')
        break
      default:
        node[column.prop] = ''
    }
  })
  return node
}

function buildTreeNode(key: string, value: any, columns:any[]){
  const node = createBaseNode(key, value, columns)
  if (value !== null && typeof value === 'object') {
    if (Array.isArray(value)) {
      // 处理数组
      node.children = value.map((item, index) =>
        buildTreeNode(`[${index}]`, item, columns)
      )
    } else {
      // 处理普通对象
      node.children = Object.entries(value).map(([k, v]) =>
        buildTreeNode(k, v, columns)
      )
    }
  }
  return node
}

export function jsonToTreeData(jsonData: any, columns: any[]) {

  if (typeof jsonData === 'object' && jsonData !== null) {
    if (Array.isArray(jsonData)) {
      return jsonData.map((item, index) =>
        buildTreeNode(`[${index}]`, item, columns)
      )
    } else {
      return Object.entries(jsonData).map(([key, value]) =>
        buildTreeNode(key, value, columns)
      )
    }
  }

  return [createBaseNode('root', jsonData, columns)]

}


export function gformatTime(timestamp:string | number) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  // console.log(date)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}
