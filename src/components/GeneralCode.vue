<template>
  <div ref="editorContainer" class="vscode-editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineProps, defineEmits, defineExpose } from 'vue'
import * as monaco from 'monaco-editor'


// 定义 props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'python'
  },
  theme: {
    type: String,
    default: 'vs'
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  fontSize: {
    type: Number,
    default: 14
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'mounted'])

// 编辑器容器引用
const editorContainer = ref(null)
let editor:any = null

// 初始化编辑器
onMounted(() => {
  if (!editorContainer.value) return

  const editorOptions = {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly,
    fontSize: props.fontSize,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: true
    },
    lineNumbers: 'on',
    lineNumbersMinChars: 3,
    roundedSelection: false,
    cursorStyle: 'line',
    cursorWidth: 2,
    renderWhitespace: 'none',
    tabSize: 2,
    wordWrap: 'on',
    ...props.options
  } as monaco.editor.IStandaloneEditorConstructionOptions;

  editor = monaco.editor.create(editorContainer.value, editorOptions)

  editor.onDidChangeModelContent(() => {
    const value = editor.getValue()
    emit('update:modelValue', value)
    emit('change', value)
  })

  editor.onDidFocusEditorText(() => {
    emit('focus')
  })

  editor.onDidBlurEditorText(() => {
    emit('blur')
  })

  emit('mounted', editor)

  setTimeout(() => {
    editor?.layout()
  }, 100)
})

// 监听 props 变化
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue)
  }
})

watch(() => props.language, (newLanguage) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage)
    }
  }
})

watch(() => props.theme, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme)
  }
})

watch(() => props.readOnly, (newValue) => {
  if (editor) {
    editor.updateOptions({ readOnly: newValue })
  }
})

watch(() => props.fontSize, (newValue) => {
  if (editor) {
    editor.updateOptions({ fontSize: newValue })
  }
})

// 窗口大小变化
const handleResize = () => {
  editor?.layout()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (editor) {
    editor.dispose()
  }
})

// 暴露方法给父组件
defineExpose({
  getValue: () => editor?.getValue() || '',
  setValue: (value: any) => editor?.setValue(value),
  getEditor: () => editor,
  layout: () => editor?.layout(),
  focus: () => editor?.focus(),
  formatCode: () => editor?.getAction('editor.action.formatDocument')?.run(),
  undo: () => editor?.trigger('', 'undo', ''),
  redo: () => editor?.trigger('', 'redo', '')
})
</script>

<style scoped>
.vscode-editor-container {
  width: 100%;
  height: 100%;
  min-width: 500px;
  max-height: 450px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}
</style>
