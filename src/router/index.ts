import { createRouter, createWebHistory } from 'vue-router'

// 页面组件懒加载 - 按路由分割代码，提升首屏加载速度
const HomePage = () => import('@/pages/HomePage.vue')
const Rank = () => import('@/pages/rank/Rank.vue')

// 用户相关页面
const UserLoginPage = () => import('@/pages/user/UserLoginPage.vue')
const UserRegisterPage = () => import('@/pages/user/UserRegisterPage.vue')
const UpdateUserPage = () => import('@/pages/user/UpdateUserPage.vue')

// 空间相关页面
const MySpacePage = () => import('@/pages/space/MySpace.vue')
const AddSpacePage = () => import('@/pages/space/AddSpacePage.vue')
const SpaceDetailPage = () => import('@/pages/space/SpaceDetailPage.vue')
const SpaceAnalyzePage = () => import('@/pages/space/SpaceAnalyzePage.vue')

// 图片相关页面
const AddPicturePage = () => import('@/pages/picture/AddPicturePage.vue')
const PictureDetailPage = () => import('@/pages/picture/PictureDetailPage.vue')

// 投票相关页面
const AddVoteActivityPage = () => import('@/pages/vote/AddVoteActivityPage.vue')
const VotePage = () => import('@/pages/vote/VotePage.vue')
const VoteDetailPage = () => import('@/pages/vote/VoteDetailPage.vue')

// 管理员相关页面
const UserManagePage = () => import('@/pages/admin/UserManagePage.vue')
const PictureManagePage = () => import('@/pages/admin/PictureManagePage.vue')
const SpaceManagePage = () => import('@/pages/admin/SpaceManagePage.vue')
const SpaceUserManagePage = () => import('@/pages/admin/SpaceUserManagePage.vue')
const VoteManagePage = () => import('@/pages/admin/VoteManagePage.vue')

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
      path: '/vote',
      name: '投票',
      component: VotePage,
    },
    {
      path: '/vote/detail/:id',
      name: '投票详情',
      component: VoteDetailPage,
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
      component: SpaceUserManagePage,
      props: true,
    },
  ],
})

export default router
