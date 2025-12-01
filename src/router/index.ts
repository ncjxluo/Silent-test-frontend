import { createRouter, createWebHistory,type RouteRecordRaw, type RouteMeta, type Router } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import NotFound from '@/pages/NotFound.vue'
import LoginPage from '@/pages/login/LoginPage.vue'
import AdminPage from '@/layouts/AdminPage.vue'
import { useAuthStore } from '@/stores/auth'
import { showFullLoading,hideFullLoading } from '@/utils/util.ts'
import type { AsyncRoute } from '@/types/async_routes.ts'
import type { MenuItem } from '@/types/menu_type.ts'
import { useMenu } from '@/hooks/useMenu.ts'
import { h } from 'vue'


const routers:RouteRecordRaw[] = [
  {
    path: "/" ,
    name: "admin",
    component: AdminPage,
    children: [
      {
        path: "/home",
        name: "/home",
        component: HomePage,
      }
    ]
  },
  {
    path: "/login" ,
    name: "login",
    component: LoginPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  },
]
const { buildTree, fetchMenu } = useMenu()

const modules = import.meta.glob('@/pages/**/*.vue')

export const router:Router= createRouter(
  {
    history:createWebHistory(),
    routes:routers
  }
)

// 动态添加路由的方法
function generateRoutesFromMenus(menuTree:MenuItem[]):RouteRecordRaw[]{
  const asyncRoutes: RouteRecordRaw[] = []
  menuTree.forEach(menu => {
    const routeConfig: RouteRecordRaw = {
      path: menu.menu_path || menu.menu_key,
      name: menu.menu_router_name || menu.menu_key,
      meta: {
        title: menu.menu_name || undefined
      } as RouteMeta
    } as RouteRecordRaw;

    if (menu.menu_component)
    {
      const componentPath = `/src/pages/${menu.menu_component}.vue`
      const component = modules[componentPath]
      if (component) {
        routeConfig.component = component
      } else {
        console.warn(`❌ 组件未找到: ${componentPath}`)
        routeConfig.component = () => import('@/components/Placeholder.vue')
      }

    } else if (menu.children && menu.children.length > 0) {
    // 页面上的一级菜单
    routeConfig.component = () => import('@/layouts/DefaultLayout.vue')
    routeConfig.children = generateRoutesFromMenus(menu.children)
  } else {
      // 页面上二级菜单，但是组件为空时
    routeConfig.component = () => import('@/components/Placeholder.vue')
  }
    asyncRoutes.push(routeConfig)
})
  return asyncRoutes
}

export function addDynamicRoutes(menus: any[]) {
  let hasNewRoutes = false
  const asyncRoutes = generateRoutesFromMenus(menus)
  asyncRoutes.forEach(async_route => {
    if (!router.hasRoute(async_route.path)){
      router.addRoute('admin', async_route)
      hasNewRoutes = true
    }
  })
  return hasNewRoutes
}

router.beforeEach(async (to, from, next) => {
  showFullLoading()
  const auth = useAuthStore();
  const publicPages = ['/login', '/register', '/forgot-password']
  if (auth.token.accessToken || publicPages.includes(to.path)) {
    return next()
  }

  let hasNewRoutes = false
  if (!hasNewRoutes) {
    const menus = await fetchMenu()
    const menuTree = buildTree(menus)
    hasNewRoutes = addDynamicRoutes(menuTree)
  }

  // hasNewRoutes ? next(to.fullPath) : next()
  void (hasNewRoutes ? next(to.fullPath) : next());

})

router.afterEach(async (to, from, next) => {
  hideFullLoading()
})

// export default router
