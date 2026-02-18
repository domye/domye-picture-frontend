import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePictureStore = defineStore('picture', () => {
  // Picture cache by ID
  const pictureCache = ref<Map<string | number, API.PictureVO>>(new Map())

  // Preload queue for detail view
  const preloadQueue = ref<Set<string | number>>(new Set())

  // Loading states
  const loadingIds = ref<Set<string | number>>(new Set())

  // Cache operations
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

  // Preload operations
  const addToPreloadQueue = (id: string | number) => preloadQueue.value.add(id)
  const removeFromPreloadQueue = (id: string | number) => preloadQueue.value.delete(id)

  // Cache invalidation
  const invalidateCache = () => pictureCache.value.clear()
  const invalidatePicture = (id: string | number) => pictureCache.value.delete(id)

  // Loading state tracking
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
