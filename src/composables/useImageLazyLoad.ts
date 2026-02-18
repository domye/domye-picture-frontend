import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export interface UseImageLazyLoadOptions {
  /** Root element for intersection, default viewport */
  root?: Element | null
  /** Margin around root, default '0px' */
  rootMargin?: string
  /** Visibility threshold, default 0.1 (10%) */
  threshold?: number
  /** Placeholder image while loading */
  placeholder?: string
  /** Error image on load failure */
  errorImage?: string
  /** Load immediately without intersection */
  immediate?: boolean
}

export interface UseImageLazyLoadReturn {
  /** Current image source (placeholder, actual, or error) */
  imageSrc: Ref<string>
  /** Whether image is loaded */
  isLoaded: Ref<boolean>
  /** Whether image failed to load */
  isError: Ref<boolean>
  /** Whether image is currently loading */
  isLoading: Ref<boolean>
  /** Element ref to observe */
  elementRef: Ref<HTMLImageElement | null>
  /** Manually trigger load */
  load: () => void
  /** Reset state */
  reset: () => void
}

/**
 * Image lazy loading composable using IntersectionObserver
 * @param src Actual image source
 * @param options Lazy load options
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
 * Batch image lazy loading for lists
 * @param count Number of images to track
 * @param options Lazy load options
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
