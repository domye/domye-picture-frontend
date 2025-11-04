<template>
  <div class="vote-activity-list">
    <!-- 搜索表单 -->
    <a-card class="search-card">
      <a-form layout="inline" :model="searchParams" @finish="onSearch">
        <a-form-item label="活动标题">
          <a-input v-model:value="searchParams.title" placeholder="请输入活动标题" allow-clear />
        </a-form-item>
        <a-form-item label="活动状态">
          <a-select
            v-model:value="searchParams.status"
            placeholder="请选择活动状态"
            allow-clear
            style="width: 120px"
          >
            <a-select-option :value="1">进行中</a-select-option>
            <a-select-option :value="2">已结束</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">搜索</a-button>
            <a-button @click="resetSearch">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 活动列表 -->
    <a-card class="list-card">
      <template #title>
        <span>投票活动列表</span>
        <a-button type="primary" style="float: right" @click="handleCreate"> 创建活动 </a-button>
      </template>

      <a-list
        :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5 }"
        :data-source="dataList"
        :loading="loading"
      >
        <template #renderItem="{ item: activity }">
          <a-list-item>
            <a-card hoverable>
              <template #cover>
                <div class="activity-cover">
                  <a-tag :color="getStatusColor(activity.status)" class="status-tag">
                    {{ getStatusText(activity.status) }}
                  </a-tag>
                </div>
              </template>
              <a-card-meta :title="activity.title" :description="activity.description" />
              <template #actions>
                <edit-outlined key="edit" @click="handleEdit(activity)" />
                <eye-outlined key="view" @click="handleView(activity)" />
                <delete-outlined key="delete" @click="handleDelete(activity)" />
              </template>
              <div class="activity-info">
                <p>
                  <calendar-outlined />
                  开始：{{ dayjs(activity.startTime).format('YYYY-MM-DD HH:mm') }}
                </p>
                <p>
                  <calendar-outlined />
                  结束：{{ dayjs(activity.endTime).format('YYYY-MM-DD HH:mm') }}
                </p>
              </div>
            </a-card>
          </a-list-item>
        </template>
      </a-list>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <a-pagination
          v-model:current="searchParams.current"
          v-model:pageSize="searchParams.pageSize"
          :total="total"
          :show-total="() => `共 ${total} 条记录`"
          show-size-changer
          show-quick-jumper
          @change="onPageChange"
        />
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { EditOutlined, EyeOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons-vue'
import { listVoteActivitiesVoByPageUsingPost } from '@/api/voteController'

const router = useRouter()

// 数据
const dataList = ref([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = ref<API.VoteActivityQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取状态颜色
const getStatusColor = (status: number) => {
  const colors = {
    1: 'processing', // 进行中
    2: 'default', // 已结束
  }
  return colors[status] || 'default'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const texts = {
    1: '进行中',
    2: '已结束',
  }
  return texts[status] || '未知'
}

// 分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

// 搜索
const onSearch = (values: any) => {
  searchParams.value = {
    ...searchParams.value,
    ...values,
    current: 1,
  }
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchParams.value = {
    current: 1,
    pageSize: 12,
    sortField: 'createTime',
    sortOrder: 'descend',
  }
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await listVoteActivitiesVoByPageUsingPost(searchParams.value)
    if (res.data.data) {
      dataList.value = res.data.data.records ?? []
      total.value = res.data.data.total ?? 0
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 创建活动
const handleCreate = () => {
  router.push('/admin/vote-manage/create')
}

// 编辑活动
const handleEdit = (record: any) => {
  router.push(`/admin/vote-manage/edit?id=${record.id}`)
}

// 查看活动
const handleView = (record: any) => {
  router.push(`/vote/detail/${record.id}`)
}

// 删除活动
const handleDelete = async (record: any) => {
  try {
    const res = await deleteVoteActivityUsingPost({ id: record.id })
    if (res.data.code === 0) {
      message.success('删除成功')
      fetchData()
    } else {
      message.error(res.data.message || '删除失败')
    }
  } catch (error) {
    message.error('删除失败')
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.vote-activity-list {
  padding: 24px;
}

.search-card {
  margin-bottom: 24px;
}

.list-card {
  min-height: 400px;
}

.status-tag {
  position: absolute;
  top: 16px;
  right: 16px;
}

.activity-info {
  margin-top: 16px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.activity-info p {
  margin-bottom: 8px;
}

.activity-info .anticon {
  margin-right: 4px;
}

.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}

:deep(.ant-list-item) {
  padding: 0 !important;
}

:deep(.ant-card-meta-description) {
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
