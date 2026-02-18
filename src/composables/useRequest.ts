import { ref, type Ref } from 'vue'

export interface UseRequestOptions<T> {
  /** 是否立即执行，默认 false */
  immediate?: boolean
  /** 初始数据 */
  initialData?: T
  /** 请求失败时是否抛出错误，默认 false */
  throwOnError?: boolean
  /** 成功回调 */
  onSuccess?: (data: T) => void
  /** 失败回调 */
  onError?: (error: Error) => void
  /** 完成回调（无论成功失败） */
  onFinally?: () => void
}

export interface UseRequestReturn<T, P extends any[]> {
  /** 响应数据 */
  data: Ref<T | undefined>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 执行请求 */
  execute: (...args: P) => Promise<T | undefined>
  /** 刷新数据（使用上次的参数） */
  refresh: () => Promise<T | undefined>
  /** 重置状态 */
  reset: () => void
}

/**
 * 通用请求 Composable
 * 封装 API 调用的���载状态、错误处理和缓存
 *
 * @param fetcher 请求函数
 * @param options 配置选项
 */
export function useRequest<T, P extends any[] = []>(
  fetcher: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {},
): UseRequestReturn<T, P> {
  const {
    immediate = false,
    initialData,
    throwOnError = false,
    onSuccess,
    onError,
    onFinally,
  } = options

  const data = ref<T | undefined>(initialData) as Ref<T | undefined>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  let lastArgs: P | null = null

  const execute = async (...args: P): Promise<T | undefined> => {
    loading.value = true
    error.value = null
    lastArgs = args

    try {
      const result = await fetcher(...args)
      data.value = result
      onSuccess?.(result)
      return result
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err
      onError?.(err)
      if (throwOnError) {
        throw err
      }
      return undefined
    } finally {
      loading.value = false
      onFinally?.()
    }
  }

  const refresh = (): Promise<T | undefined> => {
    if (lastArgs) {
      return execute(...lastArgs)
    }
    return Promise.resolve(undefined)
  }

  const reset = () => {
    data.value = initialData
    loading.value = false
    error.value = null
    lastArgs = null
  }

  // 立即执行
  if (immediate) {
    execute(...([] as unknown as P))
  }

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    reset,
  }
}

/**
 * 带缓存的请求 Composable
 *
 * @param fetcher 请求函数
 * @param keyGenerator 缓存键生成函数
 * @param options 配置选项
 */
export function useRequestWithCache<T, P extends any[]>(
  fetcher: (...args: P) => Promise<T>,
  keyGenerator: (...args: P) => string,
  options: UseRequestOptions<T> & { cacheTime?: number } = {},
): UseRequestReturn<T, P> {
  const { cacheTime = 5 * 60 * 1000, ...restOptions } = options

  const cache = new Map<string, { data: T; timestamp: number }>()

  const cachedFetcher = async (...args: P): Promise<T> => {
    const key = keyGenerator(...args)
    const cached = cache.get(key)

    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data
    }

    const result = await fetcher(...args)
    cache.set(key, { data: result, timestamp: Date.now() })
    return result
  }

  return useRequest(cachedFetcher, restOptions)
}
