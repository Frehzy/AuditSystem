// src/framework/ui/composables/useTheme.ts
import { ref, computed, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

/**
 * Композабл для управления темой приложения
 */
export function useTheme() {
  const storedTheme = localStorage.getItem('theme') as Theme | null
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const theme = ref<Theme>(storedTheme || 'auto')
  const isDark = computed(() => {
    if (theme.value === 'auto') {
      return systemPrefersDark
    }
    return theme.value === 'dark'
  })

  // Применение темы к документу
  const applyTheme = (): void => {
    const effectiveTheme = isDark.value ? 'dark' : 'light'
    document.documentElement.className = `theme-${effectiveTheme}`
    localStorage.setItem('theme', theme.value)
  }

  // Переключение темы
  const toggleTheme = (): Theme => {
    const themes: Theme[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    theme.value = themes[nextIndex]
    return theme.value
  }

  // Установка конкретной темы
  const setTheme = (newTheme: Theme): void => {
    theme.value = newTheme
  }

  // Следим за изменениями системных предпочтений
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = () => {
    if (theme.value === 'auto') {
      applyTheme()
    }
  }

  // Используем современный метод addEventListener
  mediaQuery.addEventListener('change', handleSystemThemeChange)

  // Автоматическое применение темы при изменениях
  watch(theme, applyTheme, { immediate: true })

  // Функция очистки
  const cleanup = () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }

  return {
    theme: computed(() => theme.value),
    isDark,
    toggleTheme,
    setTheme,
    cleanup
  }
}
