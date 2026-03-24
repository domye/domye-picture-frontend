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
      <div class="waterfall-columns" :style="columnsStyle">
        <div v-for="(column, colIndex) in columns" :key="colIndex" class="waterfall-column">
          <div
            v-for="picture in column"
            :key="picture.id"
            :ref="(el) => setItemRef(el, picture.id)"
            class="waterfall-item"
            @click="doClickPicture(picture)"
          >
            <div class="image-container">
              <img
                v-if="picture.url"
                :alt="picture.name"
                :src="picture.url"
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
    </div>
    <!-- 加载更多 sentinel -->
    <div ref="sentinel" class="load-more-sentinel">
      <a-spin v-if="loadingMore" size="large" />
      <span v-else-if="!hasMore && dataList.length > 0" class="no-more-text"> 已经到底啦 ~ </span>
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
import { computed, nextTick, ref, watch } from 'vue'
import { listPictureVoByPage } from '@/api/pictureController.ts'
import { useRouter } from 'vue-router'
import { useTagCategories, useInfiniteScroll } from '@/composables'
import { useWindowSize } from '@vueuse/core'
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
const { width: windowWidth } = useWindowSize()

// 瀑布流配置
const GAP = 16
const MAX_COLUMNS = 7

// 计算列数（基于窗口宽度的响应式断点）
const columnCount = computed(() => {
  const width = windowWidth.value

  // 响应式断点
  if (width < 768) return 1      // 移动端：单列
  if (width < 992) return 2      // 平板：2列
  if (width < 1200) return 3     // 小桌面：3列
  if (width < 1400) return 4     // 桌面：4列
  if (width < 1600) return 5     // 大桌面：5列
  if (width < 1800) return 6     // 超大桌面：6列
  return MAX_COLUMNS              // 超宽屏：7列
})

// 列样式
const columnsStyle = computed(() => ({
  gap: `${GAP}px`,
}))

// 图片宽高比缓存
const imageAspectRatios = ref<Map<number, number>>(new Map())

// 计算图片宽高比
const getImageAspectRatio = (picture: API.PictureVO): number => {
  if (picture.id && imageAspectRatios.value.has(picture.id)) {
    return imageAspectRatios.value.get(picture.id)!
  }

  let ratio = 1 // 默认正方形

  if (picture.picWidth && picture.picHeight && picture.picWidth > 0) {
    ratio = picture.picHeight / picture.picWidth
  } else if (picture.picScale && picture.picScale > 0) {
    ratio = 1 / picture.picScale
  }

  // 限制比例范围，避免极端情况
  ratio = Math.max(0.5, Math.min(ratio, 2.5))

  if (picture.id) {
    imageAspectRatios.value.set(picture.id, ratio)
  }

  return ratio
}

// 瀑布流列数据
const columns = ref<API.PictureVO[][]>([])

// ========== FLIP 动画 ==========
const itemRefs = new Map<number, HTMLElement>()

// 收集 DOM 引用
const setItemRef = (el: unknown, id: number) => {
  if (el instanceof HTMLElement) {
    itemRefs.set(id, el)
  }
}

// 记录元素当前位置
const recordPositions = (): Map<number, DOMRect> => {
  const positions = new Map<number, DOMRect>()
  itemRefs.forEach((el, id) => {
    positions.set(id, el.getBoundingClientRect())
  })
  return positions
}

// 应用 FLIP 动画
const applyFlipAnimation = (firstPositions: Map<number, DOMRect>) => {
  // 读取新位置并应用 FLIP
  itemRefs.forEach((el, id) => {
    const first = firstPositions.get(id)
    if (!first) return

    const last = el.getBoundingClientRect()

    // 计算位置差异
    const deltaX = first.left - last.left
    const deltaY = first.top - last.top

    // 只有位置变化时才应用动画
    if (deltaX !== 0 || deltaY !== 0) {
      // Invert: 将元素移动回原位置
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      el.style.transition = 'none'

      // Play: 下一帧开始动画
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        el.style.transform = ''
      })
    }
  })
}

// 分配图片到各列（最短列优先）
const distributePictures = async () => {
  const count = columnCount.value
  if (count <= 0) return

  // 记录当前位置（FLIP: First）
  const firstPositions = recordPositions()

  const newColumns: API.PictureVO[][] = Array.from({ length: count }, () => [])
  const columnHeights: number[] = Array(count).fill(0)

  // 按高度最小的列分配（从左到右阅读顺序）
  dataList.value.forEach((picture) => {
    const minHeight = Math.min(...columnHeights)
    const minIndex = columnHeights.indexOf(minHeight)

    newColumns[minIndex].push(picture)
    // 使用宽高比计算相对高度
    const ratio = getImageAspectRatio(picture)
    columnHeights[minIndex] += ratio
  })

  columns.value = newColumns

  // 等待 DOM 更新后应用 FLIP 动画
  await nextTick()
  applyFlipAnimation(firstPositions)
}

// 监听数据和列数变化，重新分配
watch(
  [dataList, columnCount],
  () => {
    distributePictures()
  },
  { immediate: true },
)

// 图片加载错误处理
const onImageError = (event: Event, picture: API.PictureVO) => {
  const img = event.target as HTMLImageElement
  if (img && picture.url && img.src !== picture.url) {
    img.src = picture.url
  }
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}
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
  min-height: 200px;
}

/* 列容器 - flex 布局 */
.waterfall-columns {
  display: flex;
  width: 100%;
  gap: 16px;
}

/* 单列 */
.waterfall-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 瀑布流项目 */
.waterfall-item {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  will-change: transform;
  transition: box-shadow 0.3s ease;
}

.waterfall-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

/* 图片容器 */
.image-container {
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 瀑布流图片 - 自适应高度 */
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
