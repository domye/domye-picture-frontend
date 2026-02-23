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
        <template v-if="column.dataIndex === 'title'">
          {{ record.title }}
        </template>

        <!-- 活动状态展示 -->
        <template v-if="column.dataIndex === 'status'">
          <a-tag v-if="record.status === 1" color="green">进行中</a-tag>
          <a-tag v-else-if="record.status === 2" color="red">已结束</a-tag>
          <a-tag v-else color="default">未开始</a-tag>
        </template>
        <!-- 创建时间展示 -->
        <template v-if="column.dataIndex === 'startTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <!-- 结束时间展示 -->
        <template v-if="column.dataIndex === 'endTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <!-- 操作按钮 -->
        <template v-if="column.key === 'action'">
          <a-space direction="vertical">
            <!-- 黑白名单操作按钮 -->
            <a-dropdown v-if="record.userRole !== 'admin'">
              <template #overlay>
                <a-menu>
                  <a-menu-item v-if="!record.inBlacklist"> 加入黑名单 </a-menu-item>
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
import { deleteUser } from '@/api/userController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import { listVoteActivitiesVoByPage } from '@/api/voteController'

// 数据
const dataList = ref<API.VoteActivityVO[]>([])
const total = ref(0)

// 表格列
const columns = [
  {
    title: '标题',
    dataIndex: 'title',
  },
  {
    title: '描述',
    dataIndex: 'description',
  },

  {
    title: '状态',
    dataIndex: 'status',
  },
  {
    title: '总票数',
    dataIndex: 'totalVotes',
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
  },
]

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
const searchParams = reactive<API.VoteActivityQueryRequest>({
  current: 1,
  pageSize: 10,
})

const doDelete = async (id: number) => {
  if (!id) {
    return
  }
  const res = await deleteUser({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

// 获取数据
const fetchData = async () => {
  const res = await listVoteActivitiesVoByPage({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = Number(res.data.data.total) ?? 0
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
