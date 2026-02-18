import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'currentSpaceId'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const useSpaceStore = defineStore('space', () => {
  // Space list cache
  const spaceList = ref<API.SpaceVO[]>([])
  const spaceCacheTime = ref<number>(0)

  // Current space
  const currentSpaceId = ref<string | number | null>(localStorage.getItem(STORAGE_KEY))

  const currentSpace = computed(() =>
    spaceList.value.find((s) => String(s.id) === String(currentSpaceId.value)),
  )

  // Cache operations
  const setSpaceList = (list: API.SpaceVO[]) => {
    spaceList.value = list
    spaceCacheTime.value = Date.now()
  }

  const isCacheValid = () => {
    return Date.now() - spaceCacheTime.value < CACHE_TTL
  }

  const setCurrentSpace = (id: string | number | null) => {
    currentSpaceId.value = id
    if (id) {
      localStorage.setItem(STORAGE_KEY, String(id))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // Find space by ID
  const getSpaceById = (id: string | number) =>
    spaceList.value.find((s) => String(s.id) === String(id))

  // Clear cache
  const clearCache = () => {
    spaceList.value = []
    spaceCacheTime.value = 0
  }

  return {
    spaceList,
    spaceCacheTime,
    currentSpaceId,
    currentSpace,
    setSpaceList,
    isCacheValid,
    setCurrentSpace,
    getSpaceById,
    clearCache,
  }
})
