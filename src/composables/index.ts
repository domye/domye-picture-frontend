/**
 * Composables 统一导出
 * 遵循接口隔离原则 - 提供清晰的组合式函数接口
 */
export { usePagination } from './usePagination'
export type {
  PaginationState,
  PaginationFetchFn,
  UsePaginationOptions,
  PaginationParams,
  PaginationResponse,
} from './usePagination'

export { useImageLazyLoad, useImageLazyLoadBatch } from './useImageLazyLoad'
export type { UseImageLazyLoadOptions, UseImageLazyLoadReturn } from './useImageLazyLoad'

export { useDebounce, useDebouncedRef } from './useDebounce'
export type { UseDebounceOptions, UseDebounceReturn } from './useDebounce'

export { useThrottle, useThrottledRef } from './useThrottle'
export type { UseThrottleOptions, UseThrottleReturn } from './useThrottle'

export { useRequest, useRequestWithCache } from './useRequest'
export type { UseRequestOptions, UseRequestReturn } from './useRequest'

export { useTagCategories, clearTagCategoriesCache } from './useTagCategories'
export type { UseTagCategoriesReturn } from './useTagCategories'
