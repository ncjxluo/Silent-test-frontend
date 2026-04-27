<!-- TreeTable.vue -->
<template>
  <div class="tree-table">
    <!-- 表头 -->
    <div class="header flex items-center gap-2 pb-3 border-b text-sm text-gray-600 font-medium">
      <div
        v-for="col in columns"
        :key="col.prop"
        :style="{ width: col.width || 'auto' }"
        class="flex-1 min-w-0"
      >
        {{ col.label }}
      </div>
      <div class="w-24 text-center">操作</div>
    </div>

    <!-- 树节点递归渲染 -->
    <TreeNode
      v-for="node in treeData"
      :key="node.id"
      :node="node"
      :columns="columns"
      :level="0"
      @update-node="updateNode"
      @add-child="addChild"
      @delete-node="deleteNode"
    />

    <!-- 添加根节点按钮 -->
    <el-button type="primary" size="small" class="mt-4" @click="addRoot">
      + 添加根节点
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineComponent, h } from 'vue'
import { ElInput, ElSelect, ElOption, ElButton, ElRadioGroup, ElRadio, ElSwitch, ElInputNumber } from 'element-plus'

// ──────────────────────────────────────────────
// 类型定义（解决 TS 飘红）
interface ColumnConfig {
  prop: string
  label: string
  type?: 'input' | 'select' | 'radio'
  dataType?: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'
  width?: string
  options?: Array<{ label: string; value: any }>
}

const props = defineProps<{
  modelValue: any[]
  columns: ColumnConfig[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any[]): void
}>()

const treeData = ref<any[]>([])

const normalizeExample = (type: string, val: any) => {
  if (val == null) return val

  switch (type) {
    case 'number':
    case 'integer':
    case 'long':
      return Number(val) || 0

    case 'boolean':
      return val === true || val === 'true'

    case 'object':
    case 'array':
      return typeof val === 'string' ? val : JSON.stringify(val)

    default:
      return String(val)
  }
}

const normalizeTree = (nodes: any[]) => {
  return (nodes || []).map((node:any) => {
    const newNode:any = {
      ...node,
      example: node.type
        ? normalizeExample(node.type, node.example)
        : node.example,
      children: node.children?.length
        ? normalizeTree(node.children)
        : []
    }

    return newNode
  })
}
// ──────────────────────────────────────────────
// 数据同步（避免无限循环）
watch(
  () => props.modelValue,
  (newVal) => {
    // 防止相同数据重复赋值导致循环
    if (JSON.stringify(newVal) !== JSON.stringify(treeData.value)) {
      const cloned = JSON.parse(JSON.stringify(newVal || []))

      treeData.value = normalizeTree(cloned)
      // treeData.value = JSON.parse(JSON.stringify(newVal || []))
    }
  },
  { immediate: true }
)

watch(
  treeData,
  () => {
    emit('update:modelValue', JSON.parse(JSON.stringify(treeData.value)))
  },
  { deep: true, flush: 'post' }
)

// ──────────────────────────────────────────────
// 工具函数
const createEmptyNode = () => {
  const node: Record<string, any> = {
    id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    children: []
  }
  props.columns.forEach((col) => {
    // node[col.prop] = ''
    if (col.prop === 'example') {
      node[col.prop] = null
    } else {
      node[col.prop] = ''
    }
  })
  return node
}

const addRoot = () => {
  treeData.value.push(createEmptyNode())
}

// const updateNode = (id: string, key: string, value: any) => {
//   const findAndUpdate = (nodes: any[]): boolean => {
//     for (const node of nodes) {
//       if (node.id === id) {
//         node[key] = value
//         return true
//       }
//       if (node.children?.length && findAndUpdate(node.children)) {
//         return true
//       }
//     }
//     return false
//   }
//   findAndUpdate(treeData.value)
// }

const addChild = (parentId: string) => {
  const findAndAdd = (nodes: any[]): boolean => {
    for (const node of nodes) {
      if (node.id === parentId) {
        node.children.push(createEmptyNode())
        return true
      }
      if (node.children?.length && findAndAdd(node.children)) {
        return true
      }
    }
    return false
  }
  findAndAdd(treeData.value)
}

const deleteNode = (id: string) => {
  const findAndDelete = (nodes: any[]): boolean => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        nodes.splice(i, 1)
        return true
      }
      if (nodes[i].children?.length && findAndDelete(nodes[i].children)) {
        return true
      }
    }
    return false
  }
  findAndDelete(treeData.value)
}

// ──────────────────────────────────────────────
// 递归子组件 TreeNode
const TreeNode = defineComponent({
  props: {
    node: { type: Object, required: true },
    columns: { type: Array as () => ColumnConfig[], required: true },
    level: { type: Number, default: 0 }
  },
  emits: ['updateNode', 'addChild', 'deleteNode'],

  setup(props, { emit }) {
    return () =>
      h('div', null, [
        // 当前行
        h(
          'div',
          {
            class: 'flex items-center gap-2 py-2 hover:bg-gray-50 rounded transition-colors',
            style: { paddingLeft: `${props.level * 28}px` }
          },
          [
            // 动态列
            ...props.columns.map((col) =>
              h(
                'div',
                {
                  class: 'flex-1 min-w-0',
                  style: { width: col.width || 'auto' }
                },
                [
                  col.type === 'select'
                    ? h(ElSelect, {
                        modelValue: props.node[col.prop],
                        'onUpdate:modelValue': (v: any) =>
                          emit('updateNode', props.node.id, col.prop, v),
                        size: 'small',
                        class: 'w-full'
                      }, () =>
                        col.options?.map((opt) =>
                          h(ElOption, { label: opt.label, value: opt.value })
                        )
                    )
                    : col.type === 'radio'
                    ? h(ElRadioGroup,{
                        modelValue: props.node[col.prop],
                        'onUpdate:modelValue': (v: any) => emit('updateNode', props.node.id, col.prop, v),
                        size: 'small',
                        class: 'flex gap-4 items-center'
                        },()=>
                        col.options?.map((opt) =>
                          h(ElRadio, { label: opt.value }, () => opt.label)
                      )
                    )
                    : col.prop === 'example'
                      ? renderExampleInput(props, col, emit)
                      : h(ElInput, {
                      modelValue: props.node[col.prop],
                      'onUpdate:modelValue': (v: any) =>
                        emit('updateNode', props.node.id, col.prop, v),
                      size: 'small',
                      placeholder: '请输入'
                    })
                ]
              )
            ),
            // 操作按钮
            h(
              'div',
              { class: 'w-24 flex gap-2 justify-center shrink-0' },
              [
                h(ElButton, {
                  type: 'primary',
                  size: 'small',
                  circle: true,
                  onClick: () => emit('addChild', props.node.id)
                }, () => '+'),
                h(ElButton, {
                  type: 'danger',
                  size: 'small',
                  circle: true,
                  onClick: () => emit('deleteNode', props.node.id)
                }, () => '×')
              ]
            )
          ]
        ),

        // 子节点递归
        props.node.children?.length
          ? props.node.children.map((child: any) =>
            h(TreeNode, {
              node: child,
              columns: props.columns,
              level: props.level + 1,
              onUpdateNode: (id: string, key: string, val: any) =>
                emit('updateNode', id, key, val),
              onAddChild: (pid: string) => emit('addChild', pid),
              onDeleteNode: (did: string) => emit('deleteNode', did)
            })
          )
          : null
      ])
  }
})

const toBoolean = (val: any) => {
  if (val === true) return true
  if (val === false) return false
  if (typeof val === 'string') {
    if (val.toLowerCase() === 'true') return true
    if (val.toLowerCase() === 'false') return false
  }
  return false
}

const renderExampleInput = (props: any, col: any, emit: any) => {
  const type = props.node.type // 👈 动态取当前行的 type

  const common = {
    size: 'small',
    class: 'w-full'
  }

  // 变量占位符直接走 input
  const val = props.node[col.prop]
  if (typeof val === 'string' && val.includes('${')) {
    return h(ElInput, {
      ...common,
      modelValue: val,
      'onUpdate:modelValue': (v: any) =>
        emit('updateNode', props.node.id, col.prop, v)
    } as any)
  }

  switch (type) {
    case 'number':
    case 'integer':
      return h(ElInputNumber, {
        ...common,
        modelValue: props.node[col.prop],
        'onUpdate:modelValue': (v: any) =>
          emit('updateNode', props.node.id, col.prop, v)
      } as any)

    case 'boolean':
      return h(ElSwitch, {
        modelValue: toBoolean(props.node[col.prop]),
        'onUpdate:modelValue': (v: any) =>
          emit('updateNode', props.node.id, col.prop, v)
      })

    case 'object':
    case 'array':
      return h(ElInput, {
        ...common,
        type: 'textarea',
        modelValue:
          typeof val === 'string' ? val : JSON.stringify(val, null, 2),
        'onUpdate:modelValue': (v: any) =>
          emit('updateNode', props.node.id, col.prop, v),
        placeholder: '请输入 JSON'
      } as any)

    default:
      return h(ElInput, {
        ...common,
        modelValue: props.node[col.prop],
        'onUpdate:modelValue': (v: any) =>
          emit('updateNode', props.node.id, col.prop, v)
      } as any)
  }
}

const updateNode = (id: string, key: string, value: any) => {
  const findAndUpdate = (nodes: any[]): boolean => {
    for (const node of nodes) {
      if (node.id === id) {
        node[key] = value

        if (key === 'example') {
          node.example = normalizeExample(node.type, value)
        }

        // 👇 如果改的是 type，自动修正 example
        if (key === 'type') {
          node.example = normalizeExample(value, node.example)
        }

        return true
      }
      if (node.children?.length && findAndUpdate(node.children)) {
        return true
      }
    }
    return false
  }
  findAndUpdate(treeData.value)
}





</script>

<style scoped>
.tree-table {
  font-size: 14px;
  line-height: 1.5;
}
</style>
