import { createApp } from 'vue'
import { createPinia } from 'pinia'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import router from './router'
import '@/access'
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Antd)
// 全局配置主题色
app.config.globalProperties.$antd = {
  configProvider: {
    theme: {
      primaryColor: '#17ac50ff', // 主色调
      infoColor: '#07b424ff',
      successColor: '#52c41a',
      warningColor: '#faad14',
      errorColor: '#f5222d',
    },
  },
}
app.mount('#app')
