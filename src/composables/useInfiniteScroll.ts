import { ref, type Ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { usePagination, type PaginationFetchFn } from './usePagination'

/**
 * 无限滚动选项
 */
export interface UseInfiniteScrollOptions<T> {
  /** 每页条数，默认 20 */
  defaultPageSize?: number
  /** 数据获取函数 */
  fetchFn: PaginationFetchFn<T>
  /** 是否立即执行，默认 true */
  immediate?: boolean
  /** 触发加载的距离阈值（距离底部多少像素），默认 200 */
  distance?: number
}

/**
 * 无限滚动返回值
 */
export interface UseInfiniteScrollReturn<T> {
  /** 数据列表 */
  dataList: Ref<T[]>
  /** 首次加载状态 */
  loading: Ref<boolean>
  /** 加载更多状态 */
  loadingMore: Ref<boolean>
  /** 是否还有更多数据 */
  hasMore: Ref<boolean>
  /** sentinel 元素引用 */
  sentinel: Ref<HTMLElement | null>
  /** 刷新数据 */
  refresh: () => Promise<void>
  /** 重置状态 */
  reset: () => void
}

/**
 * 无限滚动 Composable
 * 基于 IntersectionObserver 实现滚动到底部自动加载更多
 */
export function useInfiniteScroll<T>(
  options: UseInfiniteScrollOptions<T>,
): UseInfiniteScrollReturn<T> {
  const {
    defaultPageSize = 20,
    fetchFn,
    immediate = true,
    distance = 200,
  } = options

  // 使用现有的 usePagination composable
  const pagination = usePagination<T>({
    defaultPageSize,
    fetchFn,
    immediate,
  })

  // sentinel 元素（用于检测是否滚动到底部）
  const sentinel = ref<HTMLElement | null>(null)

  // 是否暂停加载（用于控制加载时机）
  const isPaused = ref(false)

  // 使用 IntersectionObserver 监听 sentinel 元素
  const { stop } = useIntersectionObserver(
    sentinel,
    ([{ isIntersecting }]) => {
      // 当 sentinel 进入视口且满足加载条件时，加载更多
      if (isIntersecting && pagination.hasMore.value && !pagination.loadingMore.value && !isPaused.value) {
        pagination.loadMore()
      }
    },
    {
      // 根据距离阈值设置 rootMargin
      rootMargin: `0px 0px ${distance}px 0px`,
    },
  )

  return {
    dataList: pagination.dataList,
    loading: pagination.loading,
    loadingMore: pagination.loadingMore,
    hasMore: pagination.hasMore,
    sentinel,
    refresh: pagination.refresh,
    reset: () => {
      pagination.reset()
      stop()
    },
  }
}