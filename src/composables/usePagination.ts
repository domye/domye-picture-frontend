import { ref, computed, type Ref } from 'vue'

/**
 * 分页状态接口
 */
export interface PaginationState<T> {
  dataList: Ref<T[]>
  loading: Ref<boolean>
  loadingMore: Ref<boolean>
  current: Ref<number>
  pageSize: Ref<number>
  total: Ref<number>
  hasMore: Ref<boolean>
}

/**
 * 分页请求函数类型
 */
export type PaginationFetchFn<T> = (page: number, pageSize: number) => Promise<{
  records: T[]
  total: number
  current?: number
}>

/**
 * 分页 Composable 选项
 */
export interface UsePaginationOptions<T> {
  /** 每页条数，默认 10 */
  defaultPageSize?: number
  /** 数据获取函数 */
  fetchFn: PaginationFetchFn<T>
  /** 是否立即执行，默认 false */
  immediate?: boolean
}

/**
 * 通用分页 Composable
 * 提供统一的分页逻辑，包括加载、加载更多、重置等功能
 */
export function usePagination<T>(options: UsePaginationOptions<T>) {
  const { defaultPageSize = 10, fetchFn, immediate = false } = options

  // 响应式状态
  const dataList = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const loadingMore = ref(false)
  const current = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)
  const hasMore = computed(() => dataList.value.length < total.value)

  /**
   * 获取数据
   * @param page 页码
   * @param append 是否追加到现有数据
   */
  const fetchData = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        loading.value = true
      } else {
        loadingMore.value = true
      }

      const result = await fetchFn(page, pageSize.value)

      const newRecords = Array.isArray(result.records) ? result.records : []

      if (append) {
        dataList.value = [...dataList.value, ...newRecords]
      } else {
        dataList.value = newRecords
      }

      total.value = Number(result.total)
      current.value = Number(result.current || page)
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  /**
   * 加载更多数据
   */
  const loadMore = () => {
    if (hasMore.value && !loadingMore.value) {
      fetchData(current.value + 1, true)
    }
  }

  /**
   * 刷新数据（回到第一页）
   */
  const refresh = () => {
    return fetchData(1, false)
  }

  /**
   * 重置分页状态
   */
  const reset = () => {
    dataList.value = []
    current.value = 1
    total.value = 0
  }

  // 立即执行
  if (immediate) {
    fetchData()
  }

  return {
    dataList,
    loading,
    loadingMore,
    current,
    pageSize,
    total,
    hasMore,
    fetchData,
    loadMore,
    refresh,
    reset,
  }
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  current?: number
  pageSize?: number
}

/**
 * 分页响应接口
 */
export interface PaginationResponse<T> {
  records: T[]
  total: number
  current?: number
}
