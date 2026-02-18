import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 构建优化
  build: {
    // 代码分割策略
    rollupOptions: {
      output: {
        // 分包策略 - 将第三方库分离
        manualChunks: {
          // Vue 核心库
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // UI 组件库
          'antd-vendor': ['ant-design-vue', '@ant-design-vue/use'],
          // 图表库
          'echarts-vendor': ['echarts', 'vue-echarts', 'echarts-wordcloud'],
          // 工具库
          'utils-vendor': ['axios', 'dayjs'],
        },
        // 静态资源命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash].[ext]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash].[ext]'
          }
          if (/\.css$/i.test(assetInfo.name || '')) {
            return 'assets/css/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },
    // 压缩配置
    minify: 'esbuild',
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用源码映射（生产环境可关闭以减小体积）
    sourcemap: false,
    // 清空输出目录
    emptyOutDir: true,
    // 块大小警告阈值
    chunkSizeWarningLimit: 1000,
  },
  // 依赖预构建优化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'ant-design-vue',
      'axios',
      'dayjs',
      'echarts',
      'vue-echarts',
    ],
  },
  // 开发服务器优化
  server: {
    // 热更新
    hmr: true,
  },
})
