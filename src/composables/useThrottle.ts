import { ref, type Ref } from 'vue'

export interface UseThrottleOptions {
  /** Interval in milliseconds, default 200 */
  interval?: number
  /** Execute on leading edge, default true */
  leading?: boolean
  /** Execute on trailing edge, default true */
  trailing?: boolean
}

export interface UseThrottleReturn<T extends (...args: any[]) => any> {
  /** Throttled function */
  throttledFn: T
  /** Whether a call is pending */
  isPending: Ref<boolean>
  /** Cancel pending execution */
  cancel: () => void
  /** Flush pending execution immediately */
  flush: () => void
}

/**
 * Throttle composable for limiting function execution rate
 * @param fn Function to throttle
 * @param options Throttle options
 */
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

    // Leading edge call
    if (leading && timeSinceLastCall >= interval) {
      lastCallTime = now
      fn(...args)
      return
    }

    // Schedule trailing call
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
 * Throttle a ref value
 * @param value Ref to throttle
 * @param interval Interval in milliseconds
 */
export function useThrottledRef<T>(value: Ref<T>, interval = 200) {
  const throttledValue = ref(value.value) as Ref<T>
  const { throttledFn } = useThrottle(
    (v: T) => {
      throttledValue.value = v
    },
    { interval },
  )

  return throttledValue
}
