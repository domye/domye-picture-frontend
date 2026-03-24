<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar fade-in">
      <a-input-search
        v-model:value="searchText"
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
      >
        <div
          v-for="picture in column"
          :key="picture.id"
          class="waterfall-item card-hover"
          @click="doClickPicture(picture)"
        >
          <div class="image-container" :style="getImageContainerStyle(picture)">
            <img
              v-if="picture.thumbnailUrl || picture.url"
              :alt="picture.name"
              :src="picture.thumbnailUrl || picture.url"
              class="waterfall-image"
              loading="lazy"
              @error="onImageError($event, picture)"
            />
            <div v-else class="image-placeholder">
              <PictureOutlined />
            </div>
          </div>
          <div class="image-info">
            <h3 :title="picture.name">{{ picture.name }}</h3>
            <p v-if="picture.introduction" class="introduction" :title="picture.introduction">
              {{ picture.introduction }}
            </p>
            <div class="tags" v-if="picture.category || picture.tags?.length">
              <a-tag v-if="picture.category" color="green" class="tag category-tag">
                {{ picture.category }}
              </a-tag>
              <a-tag v-for="tag in picture.tags" :key="tag" class="tag">
                {{ tag }}
              </a-tag>
            </div>
            <div class="meta-info" v-if="picture.createTime || picture.user?.userName">
              <span v-if="picture.user?.userName" class="author">
                <UserOutlined style="margin-right: 4px" />
                {{ picture.user.userName }}
              </span>
              <span v-if="picture.createTime" class="time">
                <ClockCircleOutlined style="margin-right: 4px" />
                {{ formatTime(picture.createTime) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 加载更多 sentinel -->
    <div ref="sentinel" class="load-more-sentinel">
      <a-spin v-if="loadingMore" size="large" />
      <span v-else-if="!hasMore && dataList.length > 0" class="no-more-text">
        已经到底啦 ~
      </span>
    </div>
    <!-- 首次加载状态 -->
    <div v-if="loading && dataList.length === 0" class="loading-container">
      <a-spin size="large" tip="加载中..." />
    </div>
    <!-- 空状态 -->
    <a-empty v-if="!loading && dataList.length === 0" description="暂无图片" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { listPictureVoByPage } from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'
import { useTagCategories, useInfiniteScroll } from '@/composables'
import { useElementSize } from '@vueuse/core'
import { PictureOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 使用标签分类 composable
const { tagList, categoryList } = useTagCategories()

// 搜索条件
const searchText = ref('')
const selectedCategory = ref<string>('all')
const selectedTagList = ref<boolean[]>([])

// 监听 tagList 变化，初始化 selectedTagList
watch(
  tagList,
  (newList) => {
    selectedTagList.value = newList.map(() => false)
  },
  { immediate: true },
)

// 构建搜索参数
const buildSearchParams = (): API.PictureQueryRequest => {
  const params: API.PictureQueryRequest = {
    sortField: 'createTime',
    sortOrder: 'descend',
    tags: [],
  }
  // 搜索文本
  if (searchText.value) {
    params.searchText = searchText.value
  }
  // 分类
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  // 标签
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
    defaultPageSize: 20,
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

// 搜索（重置到第一页）
const doSearch = async () => {
  imageHeights.value.clear()
  await refresh()
}

const router = useRouter()
// 跳转至图片详情页
const doClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

// ========== 瀑布流布局 ==========
const waterfallContainer = ref<HTMLElement | null>(null)
const { width: containerWidth } = useElementSize(waterfallContainer)

// 瀑布流配置
const GAP = 16
const MIN_COLUMN_WIDTH = 200
const MAX_COLUMNS = 7
const MIN_COLUMNS = 1

// 计算列数
const columnCount = computed(() => {
  const width = containerWidth.value
  if (width <= 0) return MIN_COLUMNS

  let count = Math.floor((width + GAP) / (MIN_COLUMN_WIDTH + GAP))
  count = Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, count))
  return count
})

// 图片高度缓存（基于原始尺寸）
const imageHeights = ref<Map<number, number>>(new Map())

// 预计算图片高度（使用 API 返回的尺寸，基于基准列宽 200px）
const BASE_COLUMN_WIDTH = 200 // 基准列宽，用于计算固定高度比例

const calculateImageHeight = (picture: API.PictureVO): number => {
  if (picture.id && imageHeights.value.has(picture.id)) {
    return imageHeights.value.get(picture.id)!
  }

  // 默认高度为基准列宽（正方形）
  let height = BASE_COLUMN_WIDTH

  if (picture.picWidth && picture.picHeight && picture.picWidth > 0) {
    // 使用 API 返回的尺寸计算高度比例
    height = (picture.picHeight / picture.picWidth) * BASE_COLUMN_WIDTH
  } else if (picture.picScale && picture.picScale > 0) {
    // 使用宽高比
    height = BASE_COLUMN_WIDTH / picture.picScale
  }

  // 限制最大最小高度，避免极端比例
  height = Math.max(100, Math.min(height, BASE_COLUMN_WIDTH * 2.5))

  if (picture.id) {
    imageHeights.value.set(picture.id, height)
  }

  return height
}

// 瀑布流列数据
const columns = ref<API.PictureVO[][]>([])

// 分配图片到各列
const distributePictures = () => {
  const count = columnCount.value
  if (count <= 0) return

  const newColumns: API.PictureVO[][] = Array.from({ length: count }, () => [])
  const columnHeights: number[] = Array(count).fill(0)

  // 按高度最小的列分配
  dataList.value.forEach((picture) => {
    const minHeight = Math.min(...columnHeights)
    const minIndex = columnHeights.indexOf(minHeight)

    newColumns[minIndex].push(picture)
    columnHeights[minIndex] += calculateImageHeight(picture) + GAP
  })

  columns.value = newColumns
}

// 图片容器样式
const getImageContainerStyle = (picture: API.PictureVO) => {
  const height = calculateImageHeight(picture)
  // 使用 aspect-ratio 或固定高度
  return {
    height: `${height}px`,
  }
}

// 图片加载错误处理
const onImageError = (event: Event, picture: API.PictureVO) => {
  const img = event.target as HTMLImageElement
  if (img && picture.url && img.src !== picture.url) {
    // 尝试加载原图
    img.src = picture.url
  }
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

// 监听数据变化，重新分配
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
  min-height: 200px;
}

/* 瀑布流列 - 添加过渡动画 */
.waterfall-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
}

/* 瀑布流项目 - 添加过渡动画 */
.waterfall-item {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  break-inside: avoid;
}

.waterfall-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

/* 图片容器 */
.image-container {
  width: 100%;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 瀑布流图片 */
.waterfall-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.waterfall-item:hover .waterfall-image {
  transform: scale(1.05);
}

/* 图片占位符 */
.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ccc;
  font-size: 48px;
}

/* 图片信息 */
.image-info {
  padding: 12px;
  background-color: #fff;
}

.image-info h3 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

/* 图片简介 */
.introduction {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 标签区域 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-bottom: 8px;
}

/* 分类标签（绿色） */
.category-tag {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #52c41a;
}

/* 标签 */
.tag {
  border-radius: 12px;
  font-size: 12px;
  padding: 2px 8px;
  margin: 0;
  background: #f5f5f5;
  border: none;
  color: #666;
  transition: all 0.2s ease;
}

.tag:hover {
  background: #e8e8e8;
}

/* 元信息 */
.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.meta-info .author,
.meta-info .time {
  display: flex;
  align-items: center;
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
  min-height: 300px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .waterfall-container {
    gap: 12px;
  }

  .waterfall-column {
    gap: 12px;
  }

  .waterfall-item {
    border-radius: 8px;
  }

  .image-info {
    padding: 10px;
  }
}

@media (max-width: 576px) {
  .search-input {
    border-radius: 20px;
  }

  #homePage .tag-bar {
    padding: 12px;
  }

  .tags {
    gap: 4px;
  }

  .tag {
    font-size: 11px;
    padding: 1px 6px;
  }
}
</style>
