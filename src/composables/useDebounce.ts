import { ref, watch, type Ref } from 'vue'

export interface UseDebounceOptions {
  /** 延迟时间（毫秒），默认 300 */
  delay?: number
  /** 是否在开始边缘执行，默认 false */
  leading?: boolean
  /** 是否在结束边缘执行，默认 true */
  trailing?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseDebounceReturn<T extends (...args: any[]) => any> {
  /** 防抖后的函数 */
  debouncedFn: T
  /** 是否有待执行的调用 */
  isPending: Ref<boolean>
  /** 取消待执行 */
  cancel: () => void
  /** 立即执行待执行的调用 */
  flush: () => void
}

/**
 * 防抖 Composable，用于延迟函数执行
 * @param fn 需要防抖的函数
 * @param options 防抖选项
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  options: UseDebounceOptions = {},
): UseDebounceReturn<T> {
  const { delay = 300, leading = false, trailing = true } = options
  const isPending = ref(false)

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null

  const debouncedFn = ((...args: Parameters<T>) => {
    lastArgs = args
    isPending.value = true

    if (leading && !timeoutId) {
      fn(...args)
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      if (trailing && lastArgs) {
        fn(...lastArgs)
      }
      isPending.value = false
      timeoutId = null
    }, delay)
  }) as T

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
      isPending.value = false
    }
  }

  const flush = () => {
    if (timeoutId && lastArgs) {
      fn(...lastArgs)
      cancel()
    }
  }

  return {
    debouncedFn,
    isPending,
    cancel,
    flush,
  }
}

/**
 * 防抖 Ref 值
 * @param value 需要防抖的 Ref
 * @param delay 延迟时间（毫秒）
 */
export function useDebouncedRef<T>(value: Ref<T>, delay = 300) {
  const debouncedValue = ref(value.value) as Ref<T>

  const { debouncedFn } = useDebounce(
    (v: T) => {
      debouncedValue.value = v
    },
    { delay },
  )

  watch(value, debouncedFn)

  return debouncedValue
}
