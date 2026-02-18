import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'theme'
const SIDEBAR_KEY = 'sidebarCollapsed'

export const useUIStore = defineStore('ui', () => {
  // 主题状态
  const theme = ref<ThemeMode>((localStorage.getItem(THEME_KEY) as ThemeMode) || 'light')

  // 侧边栏状态
  const sidebarCollapsed = ref<boolean>(localStorage.getItem(SIDEBAR_KEY) === 'true')

  // 移动端菜单状态
  const mobileMenuVisible = ref(false)

  // 监听变化并持久化
  watch(
    theme,
    (newTheme) => {
      localStorage.setItem(THEME_KEY, newTheme)
      // 应用主题到文档
      document.documentElement.setAttribute('data-theme', newTheme)
    },
    { immediate: true },
  )

  watch(sidebarCollapsed, (collapsed) => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  })

  // 主题操作
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  const setTheme = (newTheme: ThemeMode) => {
    theme.value = newTheme
  }

  // 侧边栏操作
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed
  }

  // 移动端菜单操作
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
