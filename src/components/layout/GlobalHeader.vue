<template>
  <!-- 全局头部组件 -->
  <div id="globalHeader">
    <!-- 使用 Ant Design 的栅格系统布局 -->
    <a-row :wrap="false" class="header-container">
      <!-- 左侧固定宽度的列，包含网站 logo 和标题 -->
      <a-col flex="200px">
        <RouterLink to="/">
          <div class="title-bar hover-scale">
            <!-- logo 图片 -->
            <img
              class="logo pulse"
              src="https://cdn.domye.top/uploads/07/1752738903.ico"
              alt="logo"
            />
            <!-- 网站标题 -->
            <div class="title">栖影</div>
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
          class="nav-menu"
        />
      </a-col>
      <!-- 右侧固定宽度的列，包含用户登录状态 -->
      <a-col flex="120px">
        <div class="user-login-status">
          <!-- 如果用户已登录，显示用户名；否则显示登录按钮 -->
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <ASpace class="user-info hover-scale">
                <img :src="loginUserStore.loginUser.userAvatar" alt="avatar" class="user-avatar" />
                <span class="username">{{ loginUserStore.loginUser.userName ?? '无名' }}</span>
                <!-- 显示用户名或'无名' -->
              </ASpace>
              <template #overlay>
                <a-menu class="dropdown-menu">
                  <a-menu-item class="dropdown-item">
                    <router-link to="/my_space">
                      <UserOutlined />
                      <!-- 用户图标 -->
                      我的空间
                    </router-link>
                  </a-menu-item>
                  <a-menu-item @click="doLogout" class="dropdown-item">
                    <!-- 退出登录菜单项 -->
                    <LogoutOutlined />
                    <!-- 退出图标 -->
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login" class="login-btn btn-click">登录</a-button>
            <!-- 登录按钮 -->
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
// 导入必要的模块和组件
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons-vue'
import { message, type MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'

// 初始化用户登录状态 store
const loginUserStore = useLoginUserStore()

// 初始化路由
const router = useRouter()

// 当前选中菜单项的 key
const current = ref<string[]>([])

// 菜单项点击事件处理函数
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 退出登录事件处理函数
const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}

// 监听路由变化，更新当前选中菜单项
router.afterEach((to) => {
  current.value = [to.path]
})

// 定义菜单项
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined), // 主页图标
    label: '主页',
    title: '主页',
  },
  {
    key: '/rank',
    label: '排行榜',
    title: '排行榜',
  },
  {
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/voteManage',
    label: '投票管理',
    title: '投票管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
]

// 过滤菜单项，仅管理员可访问管理页面
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    if (menu.key.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

// 展示在菜单的路由数组
const items = computed<MenuProps['items']>(() => filterMenus(originItems))
</script>

<style scoped>
/* 标题栏的样式 */
.title-bar {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

/* 网站标题的样式 */
.title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  margin-left: 8px;
  background: linear-gradient(135deg, #748cbc 0%, #3a5f8d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  z-index: 101;
  position: relative;
}

/* logo 图片的样式 */
.logo {
  height: 36px;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 101;
  position: relative;
}

/* 用户信息样式 */
.user-info {
  cursor: pointer;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #748cbc;
  transition: all 0.3s ease;
  z-index: 101;
  position: relative;
}

.user-avatar:hover {
  border-color: #3a5f8d;
  transform: rotate(10deg);
}

.username {
  margin-left: 8px;
  font-weight: 500;
  color: #2c3e50;
  z-index: 101;
  position: relative;
}

/* 登录按钮样式 */
.login-btn {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(116, 140, 188, 0.3);
  transition: all 0.3s ease;
  z-index: 101;
  position: relative;
}

.login-btn:hover {
  box-shadow: 0 4px 12px rgba(116, 140, 188, 0.5);
  transform: translateY(-2px);
}

/* 下拉菜单样式 */
.dropdown-menu {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f0f5ff;
}

/* 导航菜单样式 */
.nav-menu {
  border: none !important;
  background: transparent !important;
  z-index: 101;
  position: relative;
}

/* 头部容器 */
.header-container {
  align-items: center;
  height: 100%;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .title {
    font-size: 16px;
  }

  .logo {
    height: 30px;
  }

  .username {
    display: none;
  }
}
</style>
