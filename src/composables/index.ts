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
