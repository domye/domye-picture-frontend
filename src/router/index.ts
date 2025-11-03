import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 用户相关页面
const UserRegisterPage = () => import('@/pages/user/UserRegisterPage.vue')
const UserLoginPage = () => import('@/pages/user/UserLoginPage.vue')

// 空间相关页面
const SpaceManagePage = () => import('@/pages/admin/spaceManage.vue')
const AddSpacePage = () => import('@/pages/space/AddSpacePage.vue')
const MySpacePage = () => import('@/pages/space/MySpace.vue')
const SpaceDetailPage = () => import('@/pages/space/SpaceDetailPage.vue')
const SpaceAnalyzePage = () => import('@/pages/space/SpaceAnalyzePage.vue')
const SpaceUserManage = () => import('@/pages/admin/spaceUserManage.vue')

// 图片相关页面
const AddPicturePage = () => import('@/pages/picture/AddPicturePage.vue')
const PictureManagePage = () => import('@/pages/admin/PictureManagePage.vue')
const PictureDetailPage = () => import('@/pages/picture/PictureDetailPage.vue')

// 其他页面
const HomePage = () => import('@/pages/HomePage.vue')
const UserManagePage = () => import('@/pages/admin/UserManagePage.vue')
const Rank = () => import('@/pages/rank/Rank.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: { title: '首页' },
  },
  // 用户路由
  {
    path: '/user/login',
    name: 'user_login',
    component: UserLoginPage,
    meta: { title: '用户登录' },
  },
  {
    path: '/user/register',
    name: 'user_register',
    component: UserRegisterPage,
    meta: { title: '用户注册' },
  },
  // 空间路由
  {
    path: '/space/my',
    name: 'my_space',
    component: MySpacePage,
    meta: { title: '我的空间' },
  },
  {
    path: '/space/create',
    name: 'create_space',
    component: AddSpacePage,
    meta: { title: '创建空间' },
  },
  {
    path: '/space/:id',
    name: 'space_detail',
    component: SpaceDetailPage,
    props: true,
    meta: { title: '空间详情' },
  },
  {
    path: '/space/:id/users',
    name: 'space_user_manage',
    component: SpaceUserManage,
    props: true,
    meta: { title: '空间成员管理' },
  },
  {
    path: '/space/:id/analyze',
    name: 'space_analyze',
    component: SpaceAnalyzePage,
    props: true,
    meta: { title: '空间分析' },
  },
  // 图片路由
  {
    path: '/picture/create',
    name: 'create_picture',
    component: AddPicturePage,
    meta: { title: '创建图片' },
  },
  {
    path: '/picture/:id',
    name: 'picture_detail',
    component: PictureDetailPage,
    props: true,
    meta: { title: '图片详情' },
  },
  // 管理员路由
  {
    path: '/admin/users',
    name: 'admin_user_manage',
    component: UserManagePage,
    meta: { title: '用户管理' },
  },
  {
    path: '/admin/pictures',
    name: 'admin_picture_manage',
    component: PictureManagePage,
    meta: { title: '图片管理' },
  },
  {
    path: '/admin/spaces',
    name: 'admin_space_manage',
    component: SpaceManagePage,
    meta: { title: '空间管理' },
  },
  // 其他路由
  {
    path: '/rank',
    name: 'rank',
    component: Rank,
    meta: { title: '排行榜' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
