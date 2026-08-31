import { ref } from 'vue'

const KEY = 'portal-theme'

/** 供组件订阅，切换主题后界面会立即更新 */
export const themeRef = ref('dark')

export function getTheme() {
  return themeRef.value
}

export function setTheme(theme) {
  themeRef.value = theme === 'light' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', themeRef.value)
  localStorage.setItem(KEY, themeRef.value)
}

export function initTheme() {
  const stored = localStorage.getItem(KEY)
  setTheme(stored === 'light' ? 'light' : 'dark')
}
