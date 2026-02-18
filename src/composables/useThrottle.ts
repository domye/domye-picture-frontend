import { ref, type Ref } from 'vue'

export interface UseThrottleOptions {
  /** 间隔时间（毫秒），默认 200 */
  interval?: number
  /** 是否在开始边缘执行，默认 true */
  leading?: boolean
  /** 是否在结束边缘执行，默认 true */
  trailing?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseThrottleReturn<T extends (...args: any[]) => any> {
  /** 节流后的函数 */
  throttledFn: T
  /** 是否有待执行的调用 */
  isPending: Ref<boolean>
  /** 取消待执行 */
  cancel: () => void
  /** 立即执行待执行的调用 */
  flush: () => void
}

/**
 * 节流 Composable，用于限制函数执行频率
 * @param fn 需要节流的函数
 * @param options 节流选项
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  options: UseThrottleOptions = {},
): UseThrottleReturn<T> {
  const { interval = 200, leading = true, trailing = true } = options
  const isPending = ref(false)

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastCallTime = 0

  const throttledFn = ((...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCallTime
    lastArgs = args

    // 开始边缘调用
    if (leading && timeSinceLastCall >= interval) {
      lastCallTime = now
      fn(...args)
      return
    }

    // 安排结束边缘调用
    isPending.value = true

    if (!timeoutId) {
      const delay = interval - timeSinceLastCall
      timeoutId = setTimeout(() => {
        if (trailing && lastArgs) {
          lastCallTime = Date.now()
          fn(...lastArgs)
        }
        isPending.value = false
        timeoutId = null
      }, delay)
    }
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
    throttledFn,
    isPending,
    cancel,
    flush,
  }
}

/**
 * 节流 Ref 值
 * @param value 需要节流的 Ref
 * @param interval 间隔时间（毫秒）
 */
export function useThrottledRef<T>(value: Ref<T>, interval = 200) {
  const throttledValue = ref(value.value) as Ref<T>

  useThrottle(
    (v: T) => {
      throttledValue.value = v
    },
    { interval },
  )

  return throttledValue
}
