<template>
  <div class="f-tag-list" :style="{ left: left_m }">
    <el-tabs
      v-model="activeTab"
      type="card"
      @tab-remove="removeTab"
      @tab-change="changeTab"
      style="min-width:100px; height: 100%;">
      <el-tab-pane
        v-for="item in tabList"
        :closable="item.path != '/home'"
        :key="item.realPath"
        :label=getTabLabel(item)
        :name="item.path">
      </el-tab-pane>
    </el-tabs>
        <span class="tag-btn">
          <el-dropdown @command="handleClose">
            <span class="el-dropdown-link">
              <el-icon>
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="clearLeft">关闭左侧窗口</el-dropdown-item>
                <el-dropdown-item command="clearRight">关闭右侧窗口</el-dropdown-item>
                <el-dropdown-item command="clearOther">关闭其他窗口</el-dropdown-item>
                <el-dropdown-item command="clearAll">全部关闭窗口</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </span>
  </div>
<!--  <div style="height:44px;"></div>-->
</template>

<script setup lang="ts">
import { computed, defineProps, ref, watch, toRaw } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRoute,onBeforeRouteUpdate } from 'vue-router';
import { router } from '@/router'

const route = useRoute()

const props = defineProps({
  isCollapse: Boolean,
})

const left_m = computed(() => (props.isCollapse ? '64px' : '250px'))


const activeTab = ref(route.path)

const tabList = ref([
  {
    title: '工作台',
    path:"/home",
    realPath: "/home", // 新增：实际访问路径
    params: {} // 新增：专属路由参数
  }
])

function addTab(tab: { title: string; path: string }, realPath?: string, params?: any) {
  const targetKey = realPath || tab.path;
  let noTab = tabList.value.findIndex(t => (t.realPath || t.path) == targetKey) == -1
  if(noTab){
    tabList.value.push(
      {
        ...tab,
        realPath: realPath || tab.path, // 存储实际访问路径
        params: params || {} // 存储专属参数
      }
    )
  }
  storage_tabs(tabList.value)
}

function initTabList(){
  let tbs_json = localStorage.getItem("tabList")
  let tbs = JSON.parse(tbs_json as string)

  if(tbs){
    tabList.value = tbs.map((item: any) => ({
      realPath: item.realPath || item.path,
      params: item.params || {},
      ...item
    }))
  }
}

initTabList()

onBeforeRouteUpdate((to,from)=>{
  activeTab.value = to.path
  addTab(
    { title: to.meta.title as string, path: to.path },
    to.fullPath, // 实际访问路径（带参数值，唯一）
    { ...to.params } // 深拷贝当前路由参数，避免联动
  )
})

const changeTab =(t:string) => {
  activeTab.value = t
  router.push(t)
}

const removeTab = (c_tab:string) => {
  let tabs = tabList.value
  let a_tab = activeTab.value
  if(a_tab == c_tab){
    tabs.forEach((tab,index)=>{
      if(tab.path == c_tab){
        const nextTab = tabs[index+1] || tabs[index-1]
        if(nextTab){
          a_tab = nextTab.path
        }
      }
    })
  }
  activeTab.value = a_tab
  tabList.value = tabList.value.filter(tab=>tab.path != c_tab)

  storage_tabs(tabList.value)
}
//
const handleClose = (c:any) => {
  if (c == "clearAll") {
    // 切换回首页
    activeTab.value = "/home"
    // 过滤只剩下首页
    tabList.value = [{
      title: '工作台',
      path: "/home",
      realPath: "/home",
      params: {}
    }]

  } else if (c == "clearOther") {
    // 过滤只剩下首页和当前激活
    tabList.value = tabList.value.filter(tab => tab.path == "/home" || tab.path == activeTab.value)
  }
  else if (c == "clearLeft") {
    let currentIndex = tabList.value.findIndex(tab=> tab.path == activeTab.value)
    if (currentIndex >= 0) {
      tabList.value = tabList.value.filter((tab,index)=> tab.path== "/home" || index >= currentIndex)
    }
  }
  else if (c == "clearRight") {
    // 过滤只剩下首页和当前激活
    let currentIndex = tabList.value.findIndex(tab=> tab.path == activeTab.value)
    if (currentIndex < tabList.value.length - 1) {
      tabList.value = tabList.value.filter((tab, index)=> index <= currentIndex)
    }
  }
  storage_tabs(tabList.value)
}

const storage_tabs = (obj:any) => {
  let table_list_storage = toRaw(obj)
  localStorage.setItem('tabList',JSON.stringify(table_list_storage))
}

watch(activeTab, (newVal) => {
  // router.push(newVal)
  if (router.currentRoute.value.path !== newVal) {
    router.push(newVal)
  }
})

const getTabLabel = (tabItem: any) => {
  // 仅对接口报表详情标签做参数拼接
  if (tabItem.path.includes('/ifaceauto/apireportdetail')) {
    const { suite_key, plan_key, plan_name } = tabItem.params;
    // 拼接标题，处理可选参数
    // let label = `${tabItem.title}（套件：${suite_key}，计划：${plan_key}）`;
    let label = tabItem.title
    if (plan_name) {
      label += `：${plan_name}`;
    }
    return label;
  }
  if (tabItem.path.includes('/hostmanagement/shell')) {
    const { v_key, v_ip } = tabItem.params;
    console.log('f' + v_ip);
    // 拼接标题，处理可选参数
    // let label = `${tabItem.title}（套件：${suite_key}，计划：${plan_key}）`;
    let label = tabItem.title
    if (v_ip) {
      label += `：${v_ip}`;
    }
    return label;
  }
  // 非目标标签返回原标题
  return tabItem.title;
}

</script>

<style scoped>
.f-tag-list {
  @apply fixed bg-gray-100 flex items-center px-2;

  right: 0;
  height: 44px;
  z-index: 100;
  /* 增加宽度，避免选项卡被截断 */
  width: calc(100% - var(--left-m, 250px));
}
.tag-btn {
  @apply bg-white rounded ml-auto flex items-center justify-center px-2;
  height: 32px;
}
:deep(.el-tabs__header){
  border: 0!important;
  @apply mb-0;
}
:deep(.el-tabs__nav){
  border: 0!important;
}
:deep(.el-tabs__item){
  border: 0!important;
  height: 32px;
  line-height: 32px;
  @apply bg-white mx-1 rounded;
}
:deep(.el-tabs__nav-next),:deep(.el-tabs__nav-prev){
  line-height: 32px;
  height: 32px;
}
:deep(.is-disabled){
  cursor: not-allowed;
  @apply text-gray-300;
}
</style>
