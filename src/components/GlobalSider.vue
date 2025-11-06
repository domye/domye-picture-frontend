<template>
  <div id="globalSider">
    <a-layout-sider class="sider" width="200px">
      <a-menu
        mode="inline"
        v-model:selectedKeys="current"
        :items="menuItems"
        @click="doMenuClick"
        class="side-menu"
      />
    </a-layout-sider>
  </div>
</template>

<script lang="ts" setup>
// 导入必要的模块和组件
import { computed, h, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, PictureOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_TYPE_ENUM } from '@/constants/space'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
const loginUserStore = useLoginUserStore()
// 固定的菜单列表
const fixedMenuItems = [
  {
    key: '/vote',
    label: '比赛',
    icon: () => h(UserOutlined),
  },
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]

const teamSpaceList = ref<API.SpaceUserVO[]>([])
const menuItems = computed(() => {
  // 没有团队空间，只展示固定菜单
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  // 展示团队空间分组
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser, index) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
      class: `menu-item-${index}`
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

// 加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  // 登录才加载
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})

const router = useRouter()

// 当前选中菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, failure) => {
  current.value = [to.path]
})
// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
</script>

<style scoped>
.sider {
  background: #ffffff !important;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
  margin: 0;
  transition: all 0.3s ease;
  height: calc(100vh - 150px); /* 调整高度以适应新的顶栏 */
  overflow: hidden;
}

.sider:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.side-menu {
  border: none !important;
  background: transparent !important;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.side-menu :deep(.ant-menu-item) {
  margin: 2px 8px;
  border-radius: 6px !important;
  transition: all 0.2s ease;
}

.side-menu :deep(.ant-menu-item:hover) {
  background-color: #f0f5ff !important;
  transform: translateX(5px);
}

.side-menu :deep(.ant-menu-item-selected) {
  background-color: #e6f7ff !important;
  position: relative;
}

.side-menu :deep(.ant-menu-item-selected)::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 4px;
  background-color: #748cbc;
  border-radius: 0 4px 4px 0;
}

.side-menu :deep(.ant-menu-item-group-title) {
  font-weight: bold;
  color: #5a5a5a;
  padding-left: 24px !important;
  font-size: 14px;
}
</style>