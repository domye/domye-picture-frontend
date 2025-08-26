<template>
  <!-- 全局头部组件 -->
  <div id="globalHeader">
    <!-- 使用 Ant Design 的栅格系统布局 -->
    <a-row :wrap="false">
      <!-- 左侧固定宽度的列，包含网站 logo 和标题 -->
      <a-col flex="200px">
        <RouterLink to="/">
          <div class="title-bar">
            <!-- logo 图片 -->
            <img class="logo" src="https://q1.qlogo.cn/g?b=qq&nk=1523610551&s=640" alt="logo" />
            <!-- 网站标题 -->
            <div class="title">摄影云图库</div>
          </div>
        </RouterLink>
      </a-col>
      <!-- 右侧自动扩展宽度的列，包含菜单栏 -->
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <!-- 右侧固定宽度的列，包含用户登录状态 -->
      <a-col flex="120px">
        <div class="user-login-status">
          <!-- 如果用户已登录，显示用户名；否则显示登录按钮 -->
          <div v-if="loginUserStore.loginUser.id">
            {{ loginUserStore.loginUser.userName ?? '无名' }}
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
// 导入必要的模块和组件
import { h, ref } from 'vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import type { MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '../stores/useLoginUserStore'

// 初始化用户登录状态 store
const loginUserStore = useLoginUserStore()
// 获取当前登录用户信息
loginUserStore.fetchLoginUser()

// 初始化路由
const router = useRouter()

// 当前选中菜单项的 key
const current = ref<string[]>([])

// 菜单点击事件处理函数
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 监听路由变化，更新当前选中菜单项
router.afterEach((to) => {
  current.value = [to.path]
})

// 定义菜单项
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    label: '关于',
    title: '关于',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://www.codefather.cn', target: '_blank' }, '编程导航'),
    title: '编程导航',
  },
])
</script>

<style scoped>
/* 标题栏的样式 */
.title-bar {
  display: flex;
  align-items: center;
}

/* 网站标题的样式 */
.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

/* logo 图片的样式 */
.logo {
  height: 48px;
}
</style>
