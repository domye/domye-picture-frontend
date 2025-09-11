<template>
  <a-flex justify="space-between">
    <h2>空间管理</h2>
    <a-space>
      <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
    </a-space>
  </a-flex>
  <div class="picture-manage-container">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="空间名称" name="spaceName">
          <a-input
            v-model:value="searchParams.spaceName"
            placeholder="请输入空间名称"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="空间级别" name="spaceLevel">
          <a-select
            v-model:value="searchParams.spaceLevel"
            :options="SPACE_LEVEL_OPTIONS"
            placeholder="请输入空间级别"
            style="min-width: 180px"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="用户 id" name="userId">
          <a-input v-model:value="searchParams.userId" placeholder="请输入用户 id" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">搜索</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        @change="doTableChange"
        :scroll="{ x: 1500 }"
        row-key="id"
        bordered
      >
        <!-- 自定义数据展示方式 -->
        <template #bodyCell="{ column, record }">
          <!-- 图片展示 -->
          <template v-if="column.dataIndex === 'url'">
            <a-image
              :src="record.thumbnailUrl"
              :width="60"
              :preview="{
                src: record.url,
              }"
              class="thumbnail"
            />
          </template>

          <!-- 空间级别 -->
          <template v-if="column.dataIndex === 'spaceLevel'">
            <a-tag>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
          </template>
          <!-- 使用情况 -->
          <template v-if="column.dataIndex === 'spaceUseInfo'">
            <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
            <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
          </template>
          <!-- 创建时间 -->
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}
          </template>

          <!-- 编辑时间 -->
          <template v-else-if="column.dataIndex === 'editTime'">
            {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm') }}
          </template>

          <!-- 操作按钮 -->
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button type="link" :href="`/add_space?id=${record.id}`" target="_blank">
                编辑
              </a-button>
              <a-button type="link" danger @click="doDelete(record.id)">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deleteSpaceUsingPost,
  listSpaceByPageUsingPost,
  listSpaceLevelUsingGet,
} from '@/api/spaceController'
import { SPACE_LEVEL_MAP } from '@/constants/space'
import { filesize } from 'filesize'
const formatSize = (bytes) => filesize(bytes, { base: 2, standard: 'jedec', unit: 'MB' })
// 数据
const dataList = ref([])
const total = ref(0)
const SPACE_LEVEL_OPTIONS = ref<string[]>([])

// 表格列
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '空间名称',
    dataIndex: 'spaceName',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    fixed: 'right',
  },
]

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showTotal: (total) => `共 ${total} 条`,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }
})

const doTableChange = (page: any, filters: any, sorter: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  if (sorter.field) {
    searchParams.sortField = sorter.field
    searchParams.sortOrder = sorter.order
  }
  fetchData()
}

// 搜索条件
const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const doDelete = async (id: number) => {
  if (!id) {
    return
  }
  const res = await deleteSpaceUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

// 获取数据
const fetchData = async () => {
  const res = await listSpaceByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 执行搜索
const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 获取标签分类
const getSpaceLevelOptions = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    SPACE_LEVEL_OPTIONS.value = res.data.data.map((data) => {
      return {
        value: data.value,
        label: String(data.text), // 将 label 转换为字符串
      }
    })
  } else {
    message.error('获取标签分类失败，' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  getSpaceLevelOptions()
  fetchData()
})
</script>

<style scoped lang="less">
.page-header {
  margin-bottom: 10px;

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
  }

  .create-btn {
    margin-left: auto;
  }
}

.picture-manage-container {
  // background-color: #f0f2f5;
  //  padding: 16px;
  border-radius: 4px;
}

.search-card {
  margin-bottom: 16px;

  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .search-item {
      margin-bottom: 0;
    }
  }
}

.table-card {
  :deep(.ant-table) {
    background-color: #fff;
  }

  :deep(.ant-table-thead > tr > th) {
    background-color: #fafafa;
    font-weight: 500;
  }
}

.thumbnail {
  border: 1px solid #f0f0f0;
  border-radius: 2px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.pic-info {
  font-size: 12px;
  line-height: 1.5;

  .info-label {
    color: rgba(0, 0, 0, 0.45);
    display: inline-block;
    width: 50px;
  }
}

.review-message {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn {
  padding: 0 4px;
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
    align-items: flex-start;

    .search-item {
      width: 100%;

      :deep(.ant-select) {
        width: 100% !important;
      }
    }
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .create-btn {
      margin-left: 0;
      width: 100%;
    }
  }
}
</style>
