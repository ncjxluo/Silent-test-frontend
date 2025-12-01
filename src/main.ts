import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { router } from './router/index'
import 'virtual:windi.css'
import { createPinia } from 'pinia'
import 'nprogress/nprogress.css'
// import * as ElementPlusIconsVue from '@element-plus/icons-vue'


const app =  createApp(App)
const pinia = createPinia()

app.use(ElementPlus)
// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
//   app.component(key, component)
// }
app.use(router)
app.use(pinia)
app.mount('#app')
