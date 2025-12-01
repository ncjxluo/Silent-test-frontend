import { fileURLToPath, URL } from 'node:url'
import WindiCSS from 'vite-plugin-windicss'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          prefix: 'icon', // 你在模板中会写 <icon-xxx />
        }),
      ],
    }),
    Icons({
      autoInstall: true, // 自动安装缺失图标
    }),
    vueDevTools(),
    WindiCSS(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
