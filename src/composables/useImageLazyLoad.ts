import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseImageLazyLoadOptions {
  /** 交叉观察的根元素，默认视口 */
  root?: Element | null
  /** 根元素边距，默认 '50px' */
  rootMargin?: string
  /** 可见阈值，默认 0.1 (10%) */
  threshold?: number
  /** 加载中的占位图 */
  placeholder?: string
  /** 加载失败时的图片 */
  errorImage?: string
  /** 立即加载，不等待交叉 */
  immediate?: boolean
}

export interface UseImageLazyLoadReturn {
  /** 当前图片地址（占位图、实际图片或错误图） */
  imageSrc: Ref<string>
  /** 图片是否已加载 */
  isLoaded: Ref<boolean>
  /** 图片是否加载失败 */
  isError: Ref<boolean>
  /** 图片是否正在加载 */
  isLoading: Ref<boolean>
  /** 需要观察的元素引用 */
  elementRef: Ref<HTMLImageElement | null>
  /** 手动触发加载 */
  load: () => void
  /** 重置状态 */
  reset: () => void
}

/**
 * 图片懒加载 Composable，使用 IntersectionObserver 实现
 * @param src 实际图片地址
 * @param options 懒加载选项
 */
export function useImageLazyLoad(
  src: string,
  options: UseImageLazyLoadOptions = {},
): UseImageLazyLoadReturn {
  const {
    root = null,
    rootMargin = '50px',
    threshold = 0.1,
    placeholder = '',
    errorImage = '',
    immediate = false,
  } = options

  const imageSrc = ref(placeholder)
  const isLoaded = ref(false)
  const isError = ref(false)
  const isLoading = ref(false)
  const elementRef = ref<HTMLImageElement | null>(null)

  let observer: IntersectionObserver | null = null

  const loadImage = () => {
    if (isLoaded.value || isLoading.value) return

    isLoading.value = true
    isError.value = false

    const img = new Image()
    img.src = src

    img.onload = () => {
      imageSrc.value = src
      isLoaded.value = true
      isLoading.value = false
    }

    img.onerror = () => {
      imageSrc.value = errorImage
      isError.value = true
      isLoading.value = false
    }
  }

  const reset = () => {
    imageSrc.value = placeholder
    isLoaded.value = false
    isError.value = false
    isLoading.value = false
  }

  const load = () => {
    loadImage()
  }

  const setupObserver = () => {
    if (immediate) {
      loadImage()
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage()
            if (elementRef.value && observer) {
              observer.unobserve(elementRef.value)
            }
          }
        })
      },
      {
        root,
        rootMargin,
        threshold,
      },
    )

    if (elementRef.value) {
      observer.observe(elementRef.value)
    }
  }

  onMounted(() => {
    setupObserver()
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    imageSrc,
    isLoaded,
    isError,
    isLoading,
    elementRef,
    load,
    reset,
  }
}

/**
 * 批量图片懒加载，用于列表场景
 * @param getImageSrc 根据索引获取图片地址的函数
 * @param count 图片数量
 * @param options 懒加载选项
 */
export function useImageLazyLoadBatch(
  getImageSrc: (index: number) => string,
  count: number,
  options: UseImageLazyLoadOptions = {},
) {
  const states = Array.from({ length: count }, () => ({
    isLoaded: ref(false),
    isError: ref(false),
    isLoading: ref(false),
  }))

  const containerRef = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  const setupObserver = () => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const index = Number(img.dataset.index)
            if (!isNaN(index)) {
              states[index].isLoading.value = true
              img.src = getImageSrc(index)
            }
            observer?.unobserve(img)
          }
        })
      },
      {
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '50px',
        threshold: options.threshold ?? 0.1,
      },
    )
  }

  const observe = (element: HTMLImageElement, index: number) => {
    if (!observer) setupObserver()
    element.dataset.index = String(index)
    observer?.observe(element)
  }

  onMounted(setupObserver)

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return {
    states,
    containerRef,
    observe,
  }
}
