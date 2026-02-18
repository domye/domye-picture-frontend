import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'theme'
const SIDEBAR_KEY = 'sidebarCollapsed'

export const useUIStore = defineStore('ui', () => {
  // Theme state
  const theme = ref<ThemeMode>((localStorage.getItem(THEME_KEY) as ThemeMode) || 'light')

  // Sidebar state
  const sidebarCollapsed = ref<boolean>(localStorage.getItem(SIDEBAR_KEY) === 'true')

  // Mobile menu state
  const mobileMenuVisible = ref(false)

  // Watch for changes and persist
  watch(
    theme,
    (newTheme) => {
      localStorage.setItem(THEME_KEY, newTheme)
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', newTheme)
    },
    { immediate: true },
  )

  watch(sidebarCollapsed, (collapsed) => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  })

  // Theme operations
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setTheme = (newTheme: ThemeMode) => {
    theme.value = newTheme
  }

  // Sidebar operations
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  // Mobile menu operations
  const toggleMobileMenu = () => {
    mobileMenuVisible.value = !mobileMenuVisible.value
  }

  const closeMobileMenu = () => {
    mobileMenuVisible.value = false
  }

  return {
    theme,
    sidebarCollapsed,
    mobileMenuVisible,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileMenu,
    closeMobileMenu,
  }
})
