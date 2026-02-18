<template>
  <div id="UserManagePage">
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <!-- 用户头像展示 -->
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="50" />
        </template>

        <!-- 用户身份展示 -->
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>

        <!-- 黑白名单状态 -->
        <!-- <template v-else-if="column.dataIndex === 'filterStatus'">
          <a-tag v-if="record.inBlacklist" color="red">黑名单</a-tag>
          <a-tag v-else-if="record.inWhitelist" color="green">白名单</a-tag>
          <a-tag v-else color="default">无限制</a-tag>
        </template> -->

        <!-- 创建时间展示 -->
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <!-- 操作按钮 -->
        <template v-else-if="column.key === 'action'">
          <a-space direction="vertical">
            <!-- 黑白名单操作按钮 -->
            <a-dropdown v-if="record.userRole !== 'admin'">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="!record.inBlacklist" @click="handleAddToBlacklist(record.id)">
                    加入黑名单
                  </a-menu-item>
                  <a-menu-item
                    v-if="record.inBlacklist"
                    @click="handleRemoveFromBlacklist(record.id)"
                  >
                    移出黑名单
                  </a-menu-item>
                  <a-menu-item v-if="!record.inWhitelist" @click="handleAddToWhitelist(record.id)">
                    加入白名单
                  </a-menu-item>
                  <a-menu-item
                    v-if="record.inWhitelist"
                    @click="handleRemoveFromWhitelist(record.id)"
                  >
                    移出白名单
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button> 管理 <DownOutlined /> </a-button>
            </a-dropdown>
            <a-button danger @click="doDelete(record.id)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { deleteUserUsingPost, listUserVoByPageUsingPost } from '@/api/userController'
import {
  addFilterListUsingPost,
  removeFilterListUsingPost,
  getFilterListUsingGet,
} from '@/api/filterListController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'

// 数据
const dataList = ref<API.UserVO[]>([])
const total = ref(0)

// 表格列
const columns = [
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  // {
  //   title: '状态',
  //   dataIndex: 'filterStatus',
  // },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
  },
]
// 获取用户黑白名单状态
// const getUserFilterStatus = async () => {
//   const res = await getFilterListUsingGet({ mode: 0, type: 0 })
//   if (res.data.code === 0 && res.data.data) {
//     const filterList = res.data.data
//     dataList.value = dataList.value.map((user) => {
//       const userId = String(user.id)
//       const filterItem = filterList.find((item) => String(item.userId) === userId)
//       return {
//         ...user,
//         filtermode: filterItem ? filterItem.mode : null,
//         filtertype: filterItem ? filterItem.type : null,
//         inBlacklist: filterItem?.mode === 0,
//         inWhitelist: filterItem?.mode === 1,
//       }
//     })
//   }
// }

// 添加到黑名单
const handleAddToBlacklist = async (userId: number) => {
  const res = await addFilterListUsingPost({
    userId,
    type: 0,
    mode: 0,
  })
  if (res.data.code === 0) {
    message.success('已加入黑名单')
    await getUserFilterStatus()
  } else {
    message.error('操作失败，' + res.data.message)
  }
}

// 从黑名单移除
const handleRemoveFromBlacklist = async (userId: number) => {
  const res = await removeFilterListUsingPost({
    userId,
    mode: 0,
    type: 0,
  })
  if (res.data.code === 0) {
    message.success('已移出黑名单')
    await getUserFilterStatus()
  } else {
    message.error('操作失败，' + res.data.message)
  }
}

// 添加到白名单
const handleAddToWhitelist = async (userId: number) => {
  const res = await addFilterListUsingPost({
    userId,
    type: 0,
    mode: 1,
  })
  if (res.data.code === 0) {
    message.success('已加入白名单')
    await getUserFilterStatus()
  } else {
    message.error('操作失败，' + res.data.message)
  }
}

// 从白名单移除
const handleRemoveFromWhitelist = async (userId: number) => {
  const res = await removeFilterListUsingPost({
    userId,
    type: 0,
    mode: 1,
  })
  if (res.data.code === 0) {
    message.success('已移出白名单')
    await getUserFilterStatus()
  } else {
    message.error('操作失败，' + res.data.message)
  }
}

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
})

const doDelete = async (id: number) => {
  if (!id) {
    return
  }
  const res = await deleteUserUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

// 获取数据
const fetchData = async () => {
  const res = await listUserVoByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    // 确保total是数字类型
    total.value = Number(res.data.data.total) ?? 0
    await getUserFilterStatus()
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#UserManagePage {
  width: 100%;
  overflow-x: auto;
}

#UserManagePage a-table {
  min-width: 600px;
}
</style>
