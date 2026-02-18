import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePictureStore = defineStore('picture', () => {
  // 图片缓存（按 ID 索引）
  const pictureCache = ref<Map<string | number, API.PictureVO>>(new Map())

  // 预加载队列（用于详情页）
  const preloadQueue = ref<Set<string | number>>(new Set())

  // 加载状态
  const loadingIds = ref<Set<string | number>>(new Set())

  // 缓存操作
  const getCached = (id: string | number) => pictureCache.value.get(id)

  const cachePicture = (picture: API.PictureVO) => {
    if (picture.id) {
      pictureCache.value.set(picture.id, picture)
    }
  }

  const cachePictures = (pictures: API.PictureVO[]) => {
    pictures.forEach((p) => {
      if (p.id) pictureCache.value.set(p.id, p)
    })
  }

  // 预加载操作
  const addToPreloadQueue = (id: string | number) => preloadQueue.value.add(id)
  const removeFromPreloadQueue = (id: string | number) => preloadQueue.value.delete(id)

  // 缓存失效
  const invalidateCache = () => pictureCache.value.clear()
  const invalidatePicture = (id: string | number) => pictureCache.value.delete(id)

  // 加载状态追踪
  const setLoading = (id: string | number, loading: boolean) => {
    if (loading) {
      loadingIds.value.add(id)
    } else {
      loadingIds.value.delete(id)
    }
  }

  const isLoading = (id: string | number) => loadingIds.value.has(id)

  return {
    pictureCache,
    preloadQueue,
    loadingIds,
    getCached,
    cachePicture,
    cachePictures,
    addToPreloadQueue,
    removeFromPreloadQueue,
    invalidateCache,
    invalidatePicture,
    setLoading,
    isLoading,
  }
})
