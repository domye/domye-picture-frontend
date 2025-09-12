<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!-- 分类和标签筛选 -->
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片瀑布流 -->
    <div class="waterfall-container" :style="{ columnCount: dynamicColumnCount }">
      <div
        v-for="picture in dataList"
        :key="picture.id"
        class="waterfall-item"
        @click="doClickPicture(picture)"
      >
        <div class="image-container">
          <img
            :alt="picture.name"
            :src="picture.url"
            class="waterfall-image"
            @load="onImageLoad($event, picture)"
          />
        </div>
        <div class="image-info">
          <h3>{{ picture.name }}</h3>
          <div class="tags">
            <a-tag color="green">
              {{ picture.category ?? '默认' }}
            </a-tag>
            <a-tag v-for="tag in picture.tags" :key="tag">
              {{ tag }}
            </a-tag>
          </div>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="pagination-container">
      <a-pagination
        v-model:current="searchParams.current"
        v-model:pageSize="searchParams.pageSize"
        :total="total"
        @change="onPageChange"
        @showSizeChange="onShowSizeChange"
      />
    </div>
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'

// 定义数据
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 20,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数
  const params = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  // [true, false, false] => ['java']
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
})

// 搜索
const doSearch = () => {
  // 重置搜索条件
  searchParams.current = 1
  fetchData()
}

// 标签和分类列表
const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])

/**
 * 获取标签和分类选项
 * @param values
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList ?? []
    categoryList.value = res.data.data.categoryList ?? []
  } else {
    message.error('获取标签分类列表失败，' + res.data.message)
  }
}

const router = useRouter()
// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 存储图片尺寸信息
const imageSizes = ref<Map<string, { width: number; height: number; aspectRatio: number }>>(
  new Map(),
)

// 图片加载完成后的处理
const onImageLoad = (event: Event, picture: API.PictureVO) => {
  const img = event.target as HTMLImageElement
  const originalWidth = img.naturalWidth
  const originalHeight = img.naturalHeight

  // 存储图片尺寸信息
  imageSizes.value.set(picture.id, {
    width: originalWidth,
    height: originalHeight,
    aspectRatio: newAspectRatio,
  })

  // 设置图片的宽高比
  img.style.width = '100%'
  img.style.height = `calc(100% / ${newAspectRatio})`
}

// 计算动态列数
const dynamicColumnCount = computed(() => {
  if (imageSizes.value.size === 0) return 5 // 默认5列

  // 获取所有图片的宽高比
  const aspectRatios = Array.from(imageSizes.value.values()).map((img) => img.aspectRatio)

  // 计算平均宽高比
  const avgAspectRatio = aspectRatios.reduce((sum, ratio) => sum + ratio, 0) / aspectRatios.length

  let columnCount = Math.round(7 / avgAspectRatio)

  // 限制最大和最小列数
  const maxColumns = 10
  const minColumns = 5
  columnCount = Math.max(minColumns, Math.min(maxColumns, columnCount))

  return columnCount
})

// 分页变化处理
const onPageChange = (page: number) => {
  searchParams.current = page
  fetchData()
}

// 每页条数变化处理
const onShowSizeChange = (current: number, size: number) => {
  searchParams.current = current
  searchParams.pageSize = size
  fetchData()
}

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
}

#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

#homePage .tag-bar {
  margin-bottom: 16px;
}

/* 瀑布流容器 */
.waterfall-container {
  column-gap: 16px;
  margin-bottom: 24px;
  transition: column-count 0.3s ease;
}

/* 瀑布流项目 */
.waterfall-item {
  break-inside: avoid;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.waterfall-item:hover {
  transform: translateY(-5px);
}

/* 图片容器 */
.image-container {
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 瀑布流图片 */
.waterfall-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* 图片信息 */
.image-info {
  padding: 12px;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 响应式布局 - 在小屏幕上进一步限制列数 */
@media (max-width: 1200px) {
  .waterfall-container {
    column-count: 4 !important;
  }
}

@media (max-width: 992px) {
  .waterfall-container {
    column-count: 3 !important;
  }
}

@media (max-width: 768px) {
  .waterfall-container {
    column-count: 2 !important;
  }
}

@media (max-width: 576px) {
  .waterfall-container {
    column-count: 1 !important;
  }
}
</style>
