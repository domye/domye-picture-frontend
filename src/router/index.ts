import { createRouter, createWebHistory } from 'vue-router'

// 页面组件导入
import HomePage from '@/pages/HomePage.vue'
import Rank from '@/pages/rank/Rank.vue'

// 用户相关页面
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'

// 空间相关页面
import MySpacePage from '@/pages/space/MySpace.vue'
import AddSpacePage from '@/pages/space/AddSpacePage.vue'
import SpaceDetailPage from '@/pages/space/SpaceDetailPage.vue'
import SpaceAnalyzePage from '@/pages/space/SpaceAnalyzePage.vue'

// 图片相关页面
import AddPicturePage from '@/pages/picture/AddPicturePage.vue'
import PictureDetailPage from '@/pages/picture/PictureDetailPage.vue'

// 管理员相关页面
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import PictureManagePage from '@/pages/admin/PictureManagePage.vue'
import SpaceManagePage from '@/pages/admin/spaceManage.vue'
import SpaceUserManage from '@/pages/admin/spaceUserManage.vue'
import VoteManagePage from '@/pages/admin/VoteManagePage.vue'
import AddVoteActivityPage from '@/pages/vote/AddVoteActivityPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 基础路由
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/rank',
      name: '排行榜',
      component: Rank,
    },

    // 用户相关路由
    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
    },

    // 空间相关路由
    {
      path: '/my_space',
      name: '我的空间',
      component: MySpacePage,
    },
    {
      path: '/add_space',
      name: '创建空间',
      component: AddSpacePage,
    },
    {
      path: '/space/:id',
      name: '空间详情',
      component: SpaceDetailPage,
      props: true,
    },
    {
      path: '/space_analyze',
      name: '空间分析',
      component: SpaceAnalyzePage,
    },

    // 图片相关路由
    {
      path: '/add_picture',
      name: '创建图片',
      component: AddPicturePage,
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailPage,
      props: true,
    },

    // 投票相关路由
    {
      path: '/add_vote',
      name: '创建投票',
      component: AddVoteActivityPage,
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailPage,
      props: true,
    },
    // 管理员相关路由
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManagePage,
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: PictureManagePage,
    },
    {
      path: '/admin/spaceManage',
      name: '空间管理',
      component: SpaceManagePage,
    },
    {
      path: '/admin/voteManage',
      name: '投票管理',
      component: VoteManagePage,
    },
    {
      path: '/spaceUserManage/:id',
      name: '空间成员管理',
      component: SpaceUserManage,
      props: true,
    },
  ],
})

export default router
