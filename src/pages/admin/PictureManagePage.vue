<template>
  <div class="picture-manage-container">
    <!-- 搜索表单 -->
    <a-card class="search-card" :bordered="false">
      <a-form layout="inline" :model="searchParams" @finish="doSearch" class="search-form">
        <!-- 关键词搜索 -->
        <a-form-item label="关键词" name="searchText" class="search-item">
          <a-input
            v-model:value="searchParams.searchText"
            placeholder="从名称和简介搜索"
            allow-clear
          />
        </a-form-item>

        <!-- 分类搜索 -->
        <a-form-item label="类型" name="category" class="search-item">
          <a-select
            v-model:value="searchParams.category"
            placeholder="请选择类型"
            allow-clear
            :options="categoryOptions"
            style="width: 150px"
          />
        </a-form-item>

        <!-- 标签搜索 -->
        <a-form-item label="标签" name="tags" class="search-item">
          <a-select
            v-model:value="searchParams.tags"
            mode="tags"
            placeholder="请选择标签"
            style="width: 180px"
            allow-clear
            :options="tagOptions"
          />
        </a-form-item>

        <!-- 审核状态搜索 -->
        <a-form-item label="审核状态" name="reviewStatus" class="search-item">
          <a-select
            v-model:value="searchParams.reviewStatus"
            :options="PIC_REVIEW_STATUS_OPTIONS"
            placeholder="请选择审核状态"
            style="width: 150px"
            allow-clear
          />
        </a-form-item>

        <!-- 搜索按钮 -->
        <a-form-item class="search-item">
          <a-space>
            <a-button type="primary" html-type="submit">搜索</a-button>
            <a-button @click="resetSearch">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="false"
        @change="doTableChange"
        :scroll="{ x: 1500, y: 600 }"
        row-key="id"
        bordered
        virtual
        :virtual-item-size="54"
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

          <!-- 标签展示 -->
          <template v-if="column.dataIndex === 'tags'">
            <a-space wrap>
              <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag" color="blue">
                {{ tag }}
              </a-tag>
            </a-space>
          </template>

          <!-- 参数展示 -->
          <template v-if="column.dataIndex === 'picInfo'">
            <div class="pic-info">
              <div><span class="info-label">格式：</span>{{ record.picFormat }}</div>
              <div>
                <span class="info-label">尺寸：</span>{{ record.picWidth }}×{{ record.picHeight }}
              </div>
              <div><span class="info-label">宽高比：</span>{{ record.picScale }}</div>
              <div>
                <span class="info-label">大小：</span>{{ (record.picSize / 1024).toFixed(2) }}KB
              </div>
            </div>
          </template>

          <!-- 审核信息展示 -->
          <template v-if="column.dataIndex === 'reviewMessage'">
            <div>
              <span class="info-label">状态：</span>
              <a-tag :color="getReviewStatusColor(record.reviewStatus)">
                {{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}
              </a-tag>
            </div>
            <div v-if="record.reviewMessage" class="review-message">
              <span class="info-label">信息：</span>{{ record.reviewMessage }}
            </div>
            <div v-if="record.reviewerId">
              <span class="info-label">审核人：</span>{{ record.reviewerId }}
            </div>
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
              <!-- 通过审核 -->
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                type="link"
                size="small"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
                class="action-btn"
              >
                通过
              </a-button>

              <!-- 拒绝审核 -->
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                type="link"
                danger
                size="small"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
                class="action-btn"
              >
                拒绝
              </a-button>

              <!-- 编辑和删除 -->
              <a-button
                type="link"
                size="small"
                :href="`/add_picture?id=${record.id}`"
                target="_blank"
                class="action-btn"
              >
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除这张图片吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="doDelete(record.id)"
              >
                <a-button type="link" danger size="small" class="action-btn">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <a-pagination
          v-model:current="searchParams.current"
          v-model:page-size="searchParams.pageSize"
          :total="total"
          :show-total="(total) => `共 ${total} 条`"
          show-size-changer
          :page-size-options="['10', '20', '50', '100']"
          @change="handlePageChange"
          @show-size-change="handlePageSizeChange"
        />
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import {
  deletePicture,
  doPictureReview,
  listPictureByPage,
} from '@/api/pictureController'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/picture'
import { useTagCategories } from '@/composables'

// 使用标签分类 composable
const { tags: tagOptions, categories: categoryOptions } = useTagCategories()

// 数据
const dataList = ref([])
const total = ref(0)

// 表格列
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 100,
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    width: 200,
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 120,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 200,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 180,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    width: 200,
  },
  {
    title: '用户ID',
    dataIndex: 'userId',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 150,
    sorter: true,
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    width: 150,
    sorter: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    fixed: 'right',
  },
]

// 获取审核状态颜色
const getReviewStatusColor = (status: number) => {
  switch (status) {
    case PIC_REVIEW_STATUS_ENUM.PASS:
      return 'green'
    case PIC_REVIEW_STATUS_ENUM.REJECT:
      return 'red'
    default:
      return 'orange'
  }
}

// 审核图片
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReview({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }
}

// 分页变化
const handlePageChange = (page: number) => {
  searchParams.current = page
  fetchData()
}

// 每页数量变化
const handlePageSizeChange = (current: number, size: number) => {
  searchParams.pageSize = size
  searchParams.current = 1
  fetchData()
}

// 表格变化（排序）
const doTableChange = (_page: any, _filters: any, sorter: any) => {
  if (sorter.field) {
    searchParams.sortField = sorter.field
    searchParams.sortOrder = sorter.order
  } else {
    searchParams.sortField = undefined
    searchParams.sortOrder = undefined
  }
  fetchData()
}

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 重置搜索
const resetSearch = () => {
  searchParams.searchText = ''
  searchParams.category = undefined
  searchParams.tags = undefined
  searchParams.reviewStatus = undefined
  searchParams.current = 1
  fetchData()
}

// 删除图片
const doDelete = async (id: number) => {
  if (!id) {
    return
  }
  const res = await deletePicture({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error('删除失败，' + res.data.message)
  }
}

// 获取数据
const fetchData = async () => {
  const res = await listPictureByPage({
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

// 页面加载时请求一次
onMounted(() => {
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

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
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
