import { ref, watch, type Ref } from 'vue'

export interface UseDebounceOptions {
  /** Delay in milliseconds, default 300 */
  delay?: number
  /** Execute on leading edge, default false */
  leading?: boolean
  /** Execute on trailing edge, default true */
  trailing?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UseDebounceReturn<T extends (...args: any[]) => any> {
  /** Debounced function */
  debouncedFn: T
  /** Whether a call is pending */
  isPending: Ref<boolean>
  /** Cancel pending execution */
  cancel: () => void
  /** Flush pending execution immediately */
  flush: () => void
}

/**
 * Debounce composable for delaying function execution
 * @param fn Function to debounce
 * @param options Debounce options
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
 * Debounce a ref value
 * @param value Ref to debounce
 * @param delay Delay in milliseconds
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
