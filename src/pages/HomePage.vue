<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar fade-in">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
        class="search-input"
      />
    </div>
    <!-- 分类和标签筛选 -->
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch" class="fade-in-delay-1">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
    </a-tabs>
    <div class="tag-bar fade-in-delay-2">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
          class="tag-item"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!-- 图片瀑布流 -->
    <div class="waterfall-container" ref="waterfallContainer">
      <div
        v-for="(column, colIndex) in columns"
        :key="colIndex"
        class="waterfall-column"
        :style="{ width: columnWidth + 'px' }"
      >
        <div
          v-for="picture in column"
          :key="picture.id"
          class="waterfall-item card-hover"
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
              <a-tag color="green" class="tag">
                {{ picture.category ?? '默认' }}
              </a-tag>
              <a-tag v-for="tag in picture.tags" :key="tag" class="tag">
                {{ tag }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 加载更多 sentinel -->
    <div ref="sentinel" class="load-more-sentinel">
      <a-spin v-if="loadingMore" size="large" />
      <span v-else-if="!hasMore && dataList.length > 0" class="no-more-text"> 已经到底啦 ~ </span>
    </div>
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <a-spin size="large" class="rotate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { listPictureVoByPage } from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'
import { useTagCategories, useInfiniteScroll } from '@/composables'

// 使用标签分类 composable
const { tagList, categoryList } = useTagCategories()

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 标签选择状态
const selectedCategory = ref<string>('all')
const selectedTagList = ref<boolean[]>([])

// 构建搜索参数
const buildSearchParams = () => {
  const params: API.PictureQueryRequest = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags!.push(tagList.value[index])
    }
  })
  return params
}

// 使用无限滚动 composable
const { dataList, loading, loadingMore, hasMore, sentinel, refresh } =
  useInfiniteScroll<API.PictureVO>({
    defaultPageSize: 10,
    fetchFn: async (page, pageSize) => {
      const params = buildSearchParams()
      params.current = page
      params.pageSize = pageSize
      const res = await listPictureVoByPage(params)
      if (res.data.code === 0 && res.data.data) {
        return {
          records: res.data.data.records ?? [],
          total: res.data.data.total ?? 0,
          current: page,
        }
      }
      throw new Error(res.data.message || '获取数据失败')
    },
    immediate: true,
  })

// 监听 tagList 变化，初始化 selectedTagList
watch(
  tagList,
  (newList) => {
    selectedTagList.value = newList.map(() => false)
  },
  { immediate: true },
)

const screenWidth = ref(window.innerWidth)
const waterfallContainer = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

// 监听窗口大小变化
const handleResize = () => {
  screenWidth.value = window.innerWidth
}

// 页面加载时设置事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize)

  // 使用 ResizeObserver 监听容器实际宽度
  nextTick(() => {
    if (waterfallContainer.value) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          screenWidth.value = entry.contentRect.width
        }
      })
      resizeObserver.observe(waterfallContainer.value)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
})

// 搜索（重置到第一页）
const doSearch = async () => {
  await refresh()
}

const router = useRouter()
// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// 计算动态列数和列宽 - 基于屏幕宽度和间距
const gap = 16

const columnCount = computed(() => {
  const minColumnWidth = 200 // 每列最小宽度

  // 计算能放下的列数：screenWidth >= n * minColumnWidth + (n-1) * gap
  let count = Math.floor((screenWidth.value + gap) / (minColumnWidth + gap))

  // 限制最大和最小列数
  const maxColumns = 7
  const minColumns = 1
  count = Math.max(minColumns, Math.min(maxColumns, count))

  return count
})

// 计算每列的精确宽度，确保填满容器
const columnWidth = computed(() => {
  const count = columnCount.value
  // 列宽 = (容器宽度 - (列数-1) * 间距) / 列数
  return (screenWidth.value - (count - 1) * gap) / count
})

// 瀑布流列数据
const columns = ref<API.PictureVO[][]>([])
const imageHeights = ref<Map<number, number>>(new Map())

// 图片加载完成后记录高度
const onImageLoad = (event: Event, picture: API.PictureVO) => {
  const img = event.target as HTMLImageElement
  if (img) {
    // 计算在当前列宽下的实际显示高度
    const displayHeight = (img.naturalHeight / img.naturalWidth) * columnWidth.value
    imageHeights.value.set(picture.id!, displayHeight)
    distributePictures()
  }
}

// 分配图片到各列
const distributePictures = () => {
  const count = columnCount.value
  const newColumns: API.PictureVO[][] = Array.from({ length: count }, () => [])
  const newHeights: number[] = Array(count).fill(0)

  // 按顺序分配每张图片到当前高度最小的列
  dataList.value.forEach((picture) => {
    // 找到当前高度最小的列
    const minHeight = Math.min(...newHeights)
    const minIndex = newHeights.indexOf(minHeight)

    newColumns[minIndex].push(picture)
    // 使用图片高度（如果已加载）或默认高度估算
    newHeights[minIndex] += imageHeights.value.get(picture.id!) ?? columnWidth.value
  })

  columns.value = newColumns
}

// 监听数据和列数变化，重新分配
watch(
  [dataList, columnCount],
  () => {
    distributePictures()
  },
  { immediate: true },
)
</script>

<style scoped>
#homePage {
  margin-bottom: 16px;
  background: transparent;
}

#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

.search-input {
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-input:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

#homePage .tag-bar {
  margin-bottom: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.tag-item {
  transition: all 0.2s ease;
}

.tag-item:hover {
  transform: translateY(-2px);
}

/* 瀑布流容器 */
.waterfall-container {
  width: 100%;
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

/* 瀑布流列 */
.waterfall-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 瀑布流项目 */
.waterfall-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.waterfall-item:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* 图片容器 */
.image-container {
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

/* 瀑布流图片 */
.waterfall-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.waterfall-item:hover .waterfall-image {
  transform: scale(1.05);
}

/* 图片信息 */
.image-info {
  padding: 12px;
  background-color: #fff;
  border-radius: 0 0 8px 8px;
}

.image-info h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #2c3e50;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  border-radius: 12px;
  font-size: 12px;
  padding: 2px 8px;
  transition: all 0.2s ease;
}

.tag:hover {
  transform: scale(1.05);
}

/* 加载更多 sentinel */
.load-more-sentinel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
  margin: 24px 0;
  padding: 16px;
}

.no-more-text {
  color: #999;
  font-size: 14px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

/* 响应式布局 - 在小屏幕上进一步限制列数 */
@media (max-width: 576px) {
  .search-input {
    border-radius: 20px;
  }
}
</style>
