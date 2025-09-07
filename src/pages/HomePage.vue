<template>
  <div class="image-search-container">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        placeholder="从图库中搜索"
        v-model:value="searchParams.searchText"
        enter-button="搜索"
        size="large"
        @search="handleSearch"
        allow-clear
      />
    </div>

    <!-- 分类 + 标签 -->
    <div class="filter-section">
      <a-tabs v-model:activeKey="selectedCategory" @change="handleCategoryChange">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>
      <div class="tag-bar">
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag
            v-for="(tag, index) in tagList"
            :key="tag"
            v-model:checked="selectedTagList[index]"
            @change="handleTagChange"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>

    <!-- 瀑布流图片列表 -->
    <div class="waterfall-container" ref="waterfallContainer">
      <div class="waterfall-column" v-for="(column, colIndex) in columns" :key="colIndex">
        <div
          class="waterfall-item"
          v-for="picture in column"
          :key="picture.id"
          @click="handlePictureClick(picture)"
        >
          <a-card hoverable :body-style="{ padding: '12px' }">
            <template #cover>
              <!-- 图片加载占位符 -->
              <div v-if="!imageLoaded[picture.id]" class="image-placeholder">
                <a-skeleton-image active />
              </div>
              <!-- 图片加载错误提示 -->
              <div v-else-if="imageError[picture.id]" class="image-error">
                <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="图片加载失败" />
              </div>
              <!-- 实际图片 -->
              <img
                v-show="imageLoaded[picture.id] && !imageError[picture.id]"
                :alt="picture.name"
                :src="getPictureUrl(picture)"
                @load="handleImageLoad(picture.id)"
                @error="handleImageError(picture.id)"
                class="fade-in"
                loading="lazy"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex gap="small" wrap="wrap">
                  <a-tag v-if="picture.category" color="green">
                    {{ picture.category }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
          </a-card>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div ref="loadMoreTrigger" class="load-more-trigger">
      <div v-if="loading" class="loading-state">
        <a-spin size="large" />
        <span>加载更多图片...</span>
      </div>
      <div v-if="noMore" class="no-more-data">没有更多图片了</div>
      <div v-if="error" class="error-state">
        <a-alert message="加载失败" :description="error" type="error" show-icon />
        <a-button type="primary" @click="retryLoading">重试</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message, Empty } from 'ant-design-vue'
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import type { API } from '@/api/typings'
import { debounce } from 'lodash'

// 类型定义
interface Picture extends API.PictureVO {
  id: string | number
}

interface ImageLoadState {
  [key: string | number]: boolean
}

interface CacheEntry {
  data: Picture[]
  total: number
  noMore: boolean
  timestamp: number
}

// 响应式数据
const dataList = ref<Picture[]>([])
const total = ref(0)
const loading = ref(false)
const noMore = ref(false)
const error = ref<string | null>(null)
const imageLoaded = ref<ImageLoadState>({})
const imageError = ref<ImageLoadState>({})
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])
const selectedCategory = ref<string>('all')
const columnCount = ref(3) // 默认3列
const waterfallContainer = ref<HTMLElement | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

// 搜索参数
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12, // 增加每页数量
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
})

// 优化的缓存对象
const cache = ref<{ [key: string]: CacheEntry }>({})
const CACHE_MAX_SIZE = 20
const CACHE_EXPIRE_TIME = 30 * 60 * 1000

// 计算属性 - 优化瀑布流布局
const columns = computed(() => {
  const cols: Picture[][] = Array.from({ length: columnCount.value }, () => [])

  // 使用更智能的分配算法，根据图片高度分配到不同列
  const columnHeights = new Array(columnCount.value).fill(0)

  dataList.value.forEach((item) => {
    // 找到当前最短的列
    const minHeight = Math.min(...columnHeights)
    const targetColumn = columnHeights.indexOf(minHeight)

    cols[targetColumn].push(item)
    // 假设图片高度为200px（可以根据实际情况调整）
    columnHeights[targetColumn] += 200
  })

  return cols
})

// 工具方法 - 优化图片URL获取
const getPictureUrl = (picture: Picture): string => {
  // 优先使用缩略图
  if (picture.thumbnailUrl) {
    return picture.thumbnailUrl
  }

  // 如果主URL存在，直接使用
  if (picture.url) {
    return picture.url
  }

  // 如果都没有，返回空字符串
  return ''
}

// 移除过于严格的URL验证，因为后端返回的URL可能是相对路径
const isValidImageUrl = (url: string): boolean => {
  return !!url && typeof url === 'string' && url.trim().length > 0
}

// 优化的图片状态管理
const initializeImageStates = (pictures: Picture[], resetAll = false) => {
  if (resetAll) {
    imageLoaded.value = {}
    imageError.value = {}
  }

  pictures.forEach((picture) => {
    if (imageLoaded.value[picture.id] === undefined) {
      imageLoaded.value[picture.id] = false
    }
    if (imageError.value[picture.id] === undefined) {
      imageError.value[picture.id] = false
    }
  })
}

// 缓存管理
const cleanExpiredCache = () => {
  const now = Date.now()
  Object.keys(cache.value).forEach((key) => {
    if (now - cache.value[key].timestamp > CACHE_EXPIRE_TIME) {
      delete cache.value[key]
    }
  })
}

const manageCacheSize = () => {
  const keys = Object.keys(cache.value)
  if (keys.length > CACHE_MAX_SIZE) {
    keys.sort((a, b) => cache.value[a].timestamp - cache.value[b].timestamp)
    const toDelete = keys.slice(0, keys.length - CACHE_MAX_SIZE)
    toDelete.forEach((key) => delete cache.value[key])
  }
}

const generateCacheKey = (page = 1): string => {
  const tags = selectedTagList.value
    .map((checked, index) => (checked ? tagList.value[index] : null))
    .filter(Boolean) as string[]
  return `${page}_category=${selectedCategory.value}&tags=${tags.join(',')}&searchText=${searchParams.searchText}`
}

// 优化的数据获取方法
const fetchData = async (useCache = true) => {
  if (loading.value || noMore.value) return

  const cacheKey = generateCacheKey(searchParams.current)

  // 清理过期缓存
  cleanExpiredCache()

  // 检查缓存
  if (useCache && cache.value[cacheKey]) {
    const cachedData = cache.value[cacheKey]
    if (searchParams.current === 1) {
      dataList.value = cachedData.data
      total.value = cachedData.total
      noMore.value = cachedData.noMore
      initializeImageStates(dataList.value, true)
    } else {
      dataList.value = [...dataList.value, ...cachedData.data]
      initializeImageStates(cachedData.data)
    }

    console.log('使用缓存数据，页码:', searchParams.current, '图片数量:', cachedData.data.length)
    return
  }

  loading.value = true
  error.value = null

  try {
    const params: API.PictureQueryRequest = {
      ...searchParams,
      tags: selectedTagList.value
        .map((checked, index) => (checked ? tagList.value[index] : null))
        .filter(Boolean) as string[],
    }

    if (selectedCategory.value !== 'all') {
      params.category = selectedCategory.value
    }

    console.log('正在获取数据，页码:', searchParams.current)
    const res = await listPictureVoByPageUsingPost(params)

    if (res.data.code === 0 && res.data.data) {
      const newRecords = res.data.data.records || []
      console.log('获取到新图片数量:', newRecords.length)

      if (searchParams.current === 1) {
        dataList.value = newRecords
        initializeImageStates(newRecords, true)
      } else {
        dataList.value = [...dataList.value, ...newRecords]
        initializeImageStates(newRecords)
      }

      total.value = res.data.data.total || 0
      noMore.value = dataList.value.length >= total.value

      // 缓存当前页数据
      cache.value[cacheKey] = {
        data: newRecords,
        total: total.value,
        noMore: noMore.value,
        timestamp: Date.now(),
      }

      manageCacheSize()

      console.log('当前总图片数量:', dataList.value.length, '是否还有更多:', !noMore.value)
    } else {
      throw new Error(res.data.message || '获取数据失败')
    }
  } catch (err: any) {
    error.value = err.message || '请求失败，请稍后重试'
    console.error('Fetch data error:', err)
    message.error('加载数据失败: ' + err.message)
  } finally {
    loading.value = false
  }
}

const fetchTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      categoryList.value = res.data.data.categoryList || []
      tagList.value = res.data.data.tagList || []
      selectedTagList.value = new Array(tagList.value.length).fill(false)
    } else {
      throw new Error(res.data.message || '加载分类标签失败')
    }
  } catch (err: any) {
    message.error('获取分类标签失败: ' + err.message)
  }
}

// 事件处理方法
const resetSearch = () => {
  console.log('重置搜索')
  searchParams.current = 1
  noMore.value = false
  dataList.value = []
  imageLoaded.value = {}
  imageError.value = {}
  fetchData()
}

const handleSearch = () => resetSearch()
const handleCategoryChange = () => resetSearch()

const handleTagChange = debounce(() => {
  resetSearch()
}, 500)

// 优化的响应式列数计算
const updateColumnCount = () => {
  if (!waterfallContainer.value) return

  const containerWidth = waterfallContainer.value.clientWidth
  const minWidth = 280 // 最小列宽
  const gap = 16 // 列间距

  // 计算最大可能的列数
  const maxColumns = Math.floor((containerWidth + gap) / (minWidth + gap))
  columnCount.value = Math.max(1, Math.min(maxColumns, 5)) // 最多5列

  console.log('容器宽度:', containerWidth, '更新列数:', columnCount.value)
}

// 图片加载处理
const handleImageLoad = (imageId: string | number) => {
  console.log('图片加载成功:', imageId)
  imageLoaded.value[imageId] = true
  imageError.value[imageId] = false
}

const handleImageError = (imageId: string | number) => {
  console.error('图片加载失败:', imageId)
  imageLoaded.value[imageId] = true
  imageError.value[imageId] = true
}

const retryLoading = () => {
  error.value = null
  fetchData()
}

// 路由
const router = useRouter()
const handlePictureClick = (picture: Picture) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 优化的无限滚动
let observer: IntersectionObserver | null = null

const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return

  // 清理之前的 observer
  if (observer) {
    observer.disconnect()
    observer = null
  }

  console.log('设置 IntersectionObserver')
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading.value && !noMore.value && !error.value) {
        console.log('触发无限滚动，当前页码:', searchParams.current)
        searchParams.current++
        fetchData()
      }
    },
    {
      rootMargin: '300px', // 增加预加载距离
      threshold: 0.1,
    },
  )

  observer.observe(loadMoreTrigger.value)
}

// 监听器
watch(
  [dataList, loading, noMore, error],
  () => {
    nextTick(() => {
      setupIntersectionObserver()
    })
  },
  { flush: 'post' },
)

// 监听窗口大小变化
watch(
  () => waterfallContainer.value?.clientWidth,
  () => {
    updateColumnCount()
  },
)

// 监听路由变化
watch(
  () => router.currentRoute.value,
  (newRoute, oldRoute) => {
    if (oldRoute?.path.includes('/picture/') && newRoute.path === '/') {
      console.log('从详情页返回，恢复状态')
      const cacheKey = generateCacheKey(1)
      if (cache.value[cacheKey]) {
        fetchData(true)
      }
    }
  },
)

// 生命周期
onMounted(() => {
  console.log('组件挂载')
  fetchTagCategoryOptions()
  fetchData()
  updateColumnCount()

  // 使用防抖的resize监听
  const debouncedResize = debounce(updateColumnCount, 200)
  window.addEventListener('resize', debouncedResize)

  nextTick(() => {
    setupIntersectionObserver()
  })
})

onUnmounted(() => {
  console.log('组件卸载')
  window.removeEventListener('resize', updateColumnCount)
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped lang="less">
.image-search-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 16px;
}

.search-bar {
  max-width: 600px;
  margin: 0 auto 24px;
}

.filter-section {
  margin-bottom: 24px;

  .tag-bar {
    margin-top: 12px;
  }
}

.waterfall-container {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  width: 100%;

  .waterfall-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0; // 防止flex子项溢出
  }

  .waterfall-item {
    break-inside: avoid;
    width: 100%;

    :deep(.ant-card) {
      transition:
        transform 0.3s,
        box-shadow 0.3s;
      width: 100%;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
      }
    }

    .image-placeholder {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .image-error {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      border-radius: 8px;
      border: 1px dashed #d9d9d9;
    }

    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      border-radius: 8px 8px 0 0;
    }
  }
}

.load-more-trigger {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 0;

  .loading-state,
  .no-more-data,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .no-more-data {
    color: rgba(0, 0, 0, 0.45);
  }

  .error-state {
    text-align: center;
    gap: 16px;
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 响应式设计 - 优化断点 */
@media (max-width: 1200px) {
  .waterfall-container {
    gap: 14px;

    .waterfall-column {
      gap: 14px;
    }
  }
}

@media (max-width: 992px) {
  .waterfall-container {
    gap: 12px;

    .waterfall-column {
      gap: 12px;
    }
  }
}

@media (max-width: 768px) {
  .image-search-container {
    padding: 0 12px;
  }

  .waterfall-container {
    gap: 10px;

    .waterfall-column {
      gap: 10px;
    }
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .filter-section {
    margin-bottom: 20px;
  }
}

@media (max-width: 576px) {
  .image-search-container {
    padding: 0 8px;
  }

  .waterfall-container {
    flex-direction: column;
    gap: 8px;

    .waterfall-column {
      gap: 8px;
      width: 100%;
    }
  }

  .search-bar {
    margin-bottom: 16px;
    max-width: 100%;
  }

  .filter-section {
    margin-bottom: 16px;
  }

  .waterfall-item {
    :deep(.ant-card) {
      .ant-card-body {
        padding: 8px;
      }
    }
  }
}

@media (max-width: 375px) {
  .image-search-container {
    padding: 0 4px;
  }

  .waterfall-container {
    gap: 6px;

    .waterfall-column {
      gap: 6px;
    }
  }
}
</style>
