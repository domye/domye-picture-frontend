import { ref, onMounted, type Ref } from 'vue'
import { listPictureTagCategoryUsingGet } from '@/api/pictureController'

export interface UseTagCategoriesReturn {
  /** 标签列表 */
  tags: Ref<{ value: string; label: string }[]>
  /** 分类列表 */
  categories: Ref<{ value: string; label: string }[]>
  /** 原始标签列表 */
  tagList: Ref<string[]>
  /** 原始分类列表 */
  categoryList: Ref<string[]>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 刷新数据 */
  refresh: () => Promise<void>
}

// 全局缓存
let cachedTagList: string[] | null = null
let cachedCategoryList: string[] | null = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * 标签分类 Composable
 * 统一管理图片标签和分类数据，避免重复请求
 */
export function useTagCategories(): UseTagCategoriesReturn {
  const tags = ref<{ value: string; label: string }[]>([])
  const categories = ref<{ value: string; label: string }[]>([])
  const tagList = ref<string[]>([])
  const categoryList = ref<string[]>([])
  const loading = ref(false)

  const fetchData = async () => {
    // 检查缓存是否有效
    if (cachedTagList && cachedCategoryList && Date.now() - cacheTime < CACHE_TTL) {
      tagList.value = cachedTagList
      categoryList.value = cachedCategoryList
      tags.value = cachedTagList.map((item) => ({ value: item, label: item }))
      categories.value = cachedCategoryList.map((item) => ({ value: item, label: item }))
      return
    }

    loading.value = true
    try {
      const res = await listPictureTagCategoryUsingGet()
      if (res.data.code === 0 && res.data.data) {
        const rawTagList = res.data.data.tagList ?? []
        const rawCategoryList = res.data.data.categoryList ?? []

        // 更新缓存
        cachedTagList = rawTagList
        cachedCategoryList = rawCategoryList
        cacheTime = Date.now()

        // 更新响应式数据
        tagList.value = rawTagList
        categoryList.value = rawCategoryList
        tags.value = rawTagList.map((item) => ({ value: item, label: item }))
        categories.value = rawCategoryList.map((item) => ({ value: item, label: item }))
      }
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => {
    // 清除缓存
    cachedTagList = null
    cachedCategoryList = null
    cacheTime = 0
    await fetchData()
  }

  onMounted(fetchData)

  return {
    tags,
    categories,
    tagList,
    categoryList,
    loading,
    refresh,
  }
}

/**
 * 清除标签分类缓存
 */
export function clearTagCategoriesCache() {
  cachedTagList = null
  cachedCategoryList = null
  cacheTime = 0
}
