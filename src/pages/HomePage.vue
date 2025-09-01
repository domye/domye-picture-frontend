<template>
  <!-- 搜索框 -->
  <div class="search-bar">
    <a-input-search
      placeholder="从海量图片中搜索"
      v-model:value="searchParams.searchText"
      enter-button="搜索"
      size="large"
      @search="doSearch"
    />
  </div>

  <!-- 分类 + 标签 -->
  <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
    <a-tab-pane key="all" tab="全部" />
    <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
  </a-tabs>
  <div class="tag-bar">
    <span style="margin-right: 8px"></span>
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

  <!-- 竖向瀑布流图片列表 -->
  <div class="waterfall-container" ref="waterfallContainer">
    <div class="waterfall-column" v-for="(column, index) in columns" :key="index">
      <div
        class="waterfall-item"
        v-for="picture in column"
        :key="picture.id"
        @click="doClickPicture(picture)"
      >
        <a-card hoverable>
          <template #cover>
            <!-- 骨架屏 -->
            <div v-if="!imageLoaded[picture.id]" class="skeleton">
              <a-skeleton active :paragraph="{ rows: 3 }" />
            </div>
            <!-- 图片 -->
            <img
              v-show="imageLoaded[picture.id]"
              :alt="picture.name"
              :src="picture.url"
              @load="handleImageLoad(picture.id)"
              class="fade-in"
            />
          </template>
          <a-card-meta :title="picture.name">
            <template #description>
              <a-flex>
                <a-tag color="green">
                  {{ picture.category ?? '默认' }}
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

  <!-- 加载中提示 -->
  <div ref="loadMoreTrigger" class="load-more-trigger">
    <div v-if="loading" class="loading-tip">
      <a-spin />
      <span>加载中...</span>
    </div>
    <div v-if="noMore" class="no-more-tip">没有更多数据了</div>
  </div>
</template>

<script setup lang="ts">
import {
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// 数据
const dataList = ref([])
const total = ref(0)
const loading = ref(false)
const noMore = ref(false)
const imageLoaded = ref({}) // 记录图片加载状态

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 4,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 获取数据
const fetchData = async () => {
  if (loading.value || noMore.value) return
  loading.value = true

  const params = {
    ...searchParams,
    tags: [],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })

  try {
    const res = await listPictureVoByPageUsingPost(params)
    if (res.data.data) {
      const newRecords = res.data.data.records ?? []
      if (searchParams.current === 1) {
        dataList.value = newRecords
        // 重置图片加载状态
        imageLoaded.value = {}
      } else {
        dataList.value = [...dataList.value, ...newRecords]
      }
      total.value = res.data.data.total ?? 0
      noMore.value = dataList.value.length >= total.value
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('请求失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const doSearch = () => {
  searchParams.current = 1
  noMore.value = false
  fetchData()
}

// 竖向瀑布流布局
const columnCount = ref(2) // 默认两列，手机端适配
const columns = ref([])

const distributeToColumns = () => {
  const newColumns = Array.from({ length: columnCount.value }, () => [])
  dataList.value.forEach((item, index) => {
    newColumns[index % columnCount.value].push(item)
  })
  columns.value = newColumns
}

// 监听 dataList 变化，重新分配到列
watch(dataList, distributeToColumns, { immediate: true })

// 响应式调整列数
const updateColumnCount = () => {
  const width = window.innerWidth
  if (width < 576) {
    columnCount.value = 1 // 手机端两列
  } else if (width < 768) {
    columnCount.value = 2 // 平板三列
  } else {
    columnCount.value = 4 // 桌面四列
  }
  distributeToColumns()
}

onMounted(() => {
  updateColumnCount()
  window.addEventListener('resize', updateColumnCount)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateColumnCount)
})

// 图片加载处理
const handleImageLoad = (imageId) => {
  imageLoaded.value[imageId] = true
}

// IntersectionObserver 实现无限滚动
const loadMoreTrigger = ref(null)
let observer = null

const setupIntersectionObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !loading.value && !noMore.value) {
          searchParams.current++
          fetchData()
        }
      })
    },
    {
      rootMargin: '100px', // 提前100px触发加载
    },
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
}

onMounted(() => {
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<string[]>([])

// 获取标签和分类选项
const getTagCategoryOptions = async () => {
  try {
    const res = await listPictureTagCategoryUsingGet()
    if (res.data.code === 0 && res.data.data) {
      categoryList.value = res.data.data.categoryList ?? []
      tagList.value = res.data.data.tagList ?? []
    } else {
      message.error('加载分类标签失败，' + res.data.message)
    }
  } catch (error) {
    message.error('获取分类标签失败')
  }
}

const router = useRouter()
const doClickPicture = (picture) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

onMounted(() => {
  getTagCategoryOptions()
  fetchData()
})
</script>

<style scoped>
.search-bar {
  max-width: 480px;
  margin: 0 auto 20px;
}

.tag-bar {
  margin-bottom: 20px;
}

/* 瀑布流容器 */
.waterfall-container {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  /* max-height: calc(100vh - 400px); 适配布局高度 */
  overflow-y: auto;
}

/* 瀑布流列 */
.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 瀑布流项 */
.waterfall-item {
  break-inside: avoid;
  margin-bottom: 16px;
}

.waterfall-item img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

/* 骨架屏样式 */
.skeleton {
  padding: 16px;
  background: #f5f5f5;
}

/* 图片淡入动画 */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 加载更多触发器 */
.load-more-trigger {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.loading-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.no-more-tip {
  color: #999;
}

/* 手机端适配 */
@media (max-width: 576px) {
  .waterfall-container {
    gap: 8px;
  }
  .waterfall-column {
    gap: 8px;
  }
  .waterfall-item {
    margin-bottom: 8px;
  }
} /* Chrome, Safari, Edge, Opera */
div::-webkit-scrollbar {
  display: none;
}

/* Firefox */
div {
  scrollbar-width: none; /* Firefox 64+ */
}
</style>
