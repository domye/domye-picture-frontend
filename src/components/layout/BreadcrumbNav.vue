<template>
  <div class="breadcrumb-nav" v-if="breadcrumbs.length > 1">
    <a-breadcrumb>
      <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path || index">
        <router-link v-if="item.path && index < breadcrumbs.length - 1" :to="item.path">
          {{ item.title }}
        </router-link>
        <span v-else>{{ item.title }}</span>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  title: string
  path?: string
}

const route = useRoute()

// 路由名称映射
const routeNameMap: Record<string, string> = {
  home: '首页',
  rank: '排行榜',
  用户登录: '登录',
  用户注册: '注册',
  我的空间: '我的空间',
  创建空间: '创建空间',
  空间详情: '空间详情',
  空间分析: '空间分析',
  创建图片: '创建图片',
  图片详情: '图片详情',
  创建投票: '创建投票',
  投票: '投票',
  投票详情: '投票详情',
  用户管理: '用户管理',
  图片管理: '图片管理',
  空间管理: '空间管理',
  投票管理: '投票管理',
  空间成员管理: '空间成员管理',
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const matched = route.matched.filter((item) => item.meta?.title || item.name)
  const crumbs: BreadcrumbItem[] = []

  // 添加首页
  crumbs.push({
    title: '首页',
    path: '/',
  })

  // 添加匹配的路由
  matched.forEach((item, index) => {
    const title =
      (item.meta?.title as string) ||
      (item.name ? routeNameMap[item.name as string] || String(item.name) : '')

    if (title && title !== '首页') {
      crumbs.push({
        title,
        path: index === matched.length - 1 ? undefined : item.path,
      })
    }
  })

  return crumbs
})
</script>

<style scoped>
.breadcrumb-nav {
  padding: 12px 0;
  margin-bottom: 16px;
  background: transparent;
}

.breadcrumb-nav :deep(.ant-breadcrumb) {
  font-size: 14px;
}

.breadcrumb-nav :deep(.ant-breadcrumb a) {
  color: #666;
  transition: color 0.2s;
}

.breadcrumb-nav :deep(.ant-breadcrumb a:hover) {
  color: #748cbc;
}

.breadcrumb-nav :deep(.ant-breadcrumb > span:last-child) {
  color: #333;
  font-weight: 500;
}
</style>
