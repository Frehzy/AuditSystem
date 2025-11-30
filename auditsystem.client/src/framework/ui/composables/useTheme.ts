// src/framework/ui/composables/useTheme.ts
import { ref, computed, watch, onUnmounted } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

/**
 * Композабл для управления темой приложения с улучшенной поддержкой CSS переменных
 */
export function useTheme() {
  const storedTheme = localStorage.getItem('theme') as Theme | null
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const theme = ref<Theme>(storedTheme || 'auto')

  // Вычисляемая тема с учетом автоматического режима
  const effectiveTheme = computed(() => {
    if (theme.value === 'auto') {
      return systemPrefersDark ? 'dark' : 'light'
    }
    return theme.value
  })

  const isDark = computed(() => effectiveTheme.value === 'dark')
  const isLight = computed(() => effectiveTheme.value === 'light')

  // Применение темы к документу с улучшенной логикой
  const applyTheme = (): void => {
    const themeClass = `theme-${effectiveTheme.value}`

    // Удаляем предыдущие классы темы
    document.documentElement.classList.remove('theme-light', 'theme-dark')

    // Добавляем новый класс темы
    document.documentElement.classList.add(themeClass)

    // Добавляем класс для плавных переходов
    document.documentElement.classList.add('theme-transition')

    // Сохраняем в localStorage
    localStorage.setItem('theme', theme.value)

    // Обновляем meta theme-color для мобильных браузеров
    updateThemeMeta()
  }

  // Обновление meta theme-color
  const updateThemeMeta = (): void => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta')
      metaThemeColor.setAttribute('name', 'theme-color')
      document.head.appendChild(metaThemeColor)
    }

    const themeColor = isDark.value ? '#0f172a' : '#f8fafc'
    metaThemeColor.setAttribute('content', themeColor)
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

  // Синхронизация с системными настройками
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    if (theme.value === 'auto') {
      applyTheme()
    }
  }

  // Инициализация темы
  const initialize = (): void => {
    applyTheme()

    // Убираем класс перехода после инициализации
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 300)
  }

  // Используем современный метод addEventListener
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  } else {
    // Fallback для старых браузеров
    mediaQuery.addListener(handleSystemThemeChange)
  }

  // Автоматическое применение темы при изменениях
  watch([theme, effectiveTheme], applyTheme, { immediate: true })

  // Функция очистки
  const cleanup = () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    } else {
      mediaQuery.removeListener(handleSystemThemeChange)
    }
  }

  // Автоматическая инициализация
  initialize()

  return {
    theme: computed(() => theme.value),
    effectiveTheme: computed(() => effectiveTheme.value),
    isDark,
    isLight,
    toggleTheme,
    setTheme,
    cleanup
  }
}
