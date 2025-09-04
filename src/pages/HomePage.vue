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
                v-if="isValidImageUrl(picture.url)"
                :alt="picture.name"
                :src="picture.url"
                @load="handleImageLoad(picture.id)"
                @error="handleImageError(picture.id)"
                class="fade-in"
                loading="lazy"
              />
              <!-- 图片地址无效提示 -->
              <div v-else class="image-error">
                <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" description="图片地址无效" />
              </div>
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
const columnCount = ref(2)
const waterfallContainer = ref<HTMLElement | null>(null)
const loadMoreTrigger = ref<HTMLElement | null>(null)

// 搜索参数
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 5,
  sortField: 'createTime',
  sortOrder: 'descend',
  searchText: '',
})

// 缓存对象
const cache = ref<{ [key: string]: CacheEntry }>({})

// 计算属性
const columns = computed(() => {
  const cols: Picture[][] = Array.from({ length: columnCount.value }, () => [])
  dataList.value.forEach((item, index) => {
    cols[index % columnCount.value].push(item)
  })
  return cols
})

// 工具方法
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const initializeImageStates = (pictures: Picture[]) => {
  pictures.forEach((picture) => {
    // 使用 Vue.set 或直接赋值确保响应性
    if (!(picture.id in imageLoaded.value)) {
      imageLoaded.value[picture.id] = false
    }
    if (!(picture.id in imageError.value)) {
      imageError.value[picture.id] = false
    }
  })
}

// 生成缓存键
const generateCacheKey = (): string => {
  const tags = selectedTagList.value
    .map((checked, index) => (checked ? tagList.value[index] : null))
    .filter(Boolean) as string[]
  return `category=${selectedCategory.value}&tags=${tags.join(',')}&searchText=${searchParams.searchText}`
}

// 数据获取方法
const fetchData = async () => {
  if (loading.value || noMore.value) return

  const cacheKey = generateCacheKey()

  // 只有第一页使用缓存
  if (cache.value[cacheKey] && searchParams.current === 1) {
    const cachedData = cache.value[cacheKey]
    dataList.value = cachedData.data
    total.value = cachedData.total
    noMore.value = cachedData.noMore

    // 重新初始化所有图片状态
    imageLoaded.value = {}
    imageError.value = {}
    initializeImageStates(dataList.value)

    console.log('使用缓存数据，图片数量:', dataList.value.length)
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
        imageLoaded.value = {}
        imageError.value = {}
      } else {
        dataList.value = [...dataList.value, ...newRecords]
      }

      // 初始化新图片的加载状态
      initializeImageStates(newRecords)

      total.value = res.data.data.total || 0
      noMore.value = dataList.value.length >= total.value

      // 只缓存第一页数据
      if (searchParams.current === 1) {
        cache.value[cacheKey] = {
          data: dataList.value,
          total: total.value,
          noMore: noMore.value,
        }
      }

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

const updateColumnCount = () => {
  if (!waterfallContainer.value) return

  const containerWidth = waterfallContainer.value.clientWidth
  columnCount.value = Math.max(1, Math.floor(containerWidth / 300))
  console.log('更新列数:', columnCount.value)
}

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

// 无限滚动
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
      rootMargin: '200px',
      threshold: 0.1,
    },
  )

  observer.observe(loadMoreTrigger.value)
}

// 监听数据变化，重新设置 observer
watch([dataList, loading, noMore, error], () => {
  nextTick(() => {
    setupIntersectionObserver()
  })
})

// 生命周期
onMounted(() => {
  console.log('组件挂载')
  fetchTagCategoryOptions()
  fetchData()
  updateColumnCount()
  window.addEventListener('resize', updateColumnCount)

  // 延迟设置 observer，确保 DOM 已渲染
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

  .waterfall-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .waterfall-item {
    break-inside: avoid;

    :deep(.ant-card) {
      transition:
        transform 0.3s,
        box-shadow 0.3s;

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

/* 响应式设计 */
@media (max-width: 768px) {
  .waterfall-container {
    gap: 12px;

    .waterfall-column {
      gap: 12px;
    }
  }
}

@media (max-width: 576px) {
  .waterfall-container {
    flex-direction: column;
    gap: 12px;

    .waterfall-column {
      gap: 12px;
    }
  }

  .search-bar {
    margin-bottom: 16px;
  }

  .filter-section {
    margin-bottom: 16px;
  }
}
</style>
