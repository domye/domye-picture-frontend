import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import VueCropper from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import Vue3ColorPicker from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

import App from './App.vue'
import router from './router'
import '@/access'

const app = createApp(App)

app.use(createPinia()).use(router).use(Antd).use(VueCropper).use(Vue3ColorPicker)

app.mount('#app')
