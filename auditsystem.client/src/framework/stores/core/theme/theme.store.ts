/**
 * Core store: Управление темой приложения
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { APP_CONFIG } from '@/core/config/app.config';
import { logger } from '@/core/services/logger/logger.service';
import type { Theme } from '@/core/types/common.types';

export const useThemeStore = defineStore('theme', () => {
  // State
  const currentTheme = ref<Theme>('auto');
  const userPreference = ref<Theme>('auto');
  const systemTheme = ref<'light' | 'dark'>('light');

  // Инициализация из localStorage
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
    currentTheme.value = savedTheme;
    userPreference.value = savedTheme;
  }

  // Getters
  const resolvedTheme = computed(() => {
    if (currentTheme.value === 'auto') {
      return systemTheme.value;
    }
    return currentTheme.value;
  });

  const isDark = computed(() => resolvedTheme.value === 'dark');
  const isLight = computed(() => resolvedTheme.value === 'light');
  const isAuto = computed(() => currentTheme.value === 'auto');

  // Actions
  const initialize = () => {
    // Определяем системную тему
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemTheme.value = mediaQuery.matches ? 'dark' : 'light';

    // Слушатель изменения системной темы
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Применяем тему
    applyTheme(resolvedTheme.value);

    logger.info('Theme store initialized', {
      current: currentTheme.value,
      resolved: resolvedTheme.value,
      system: systemTheme.value
    });
  };

  const setTheme = (theme: Theme) => {
    const previous = currentTheme.value;

    currentTheme.value = theme;
    userPreference.value = theme;
    localStorage.setItem('theme', theme);

    applyTheme(resolvedTheme.value);

    logger.info('Theme changed', {
      previous,
      current: theme,
      resolved: resolvedTheme.value
    });
  };

  const toggleTheme = () => {
    const newTheme: Theme = resolvedTheme.value === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
  };

  const reset = () => {
    currentTheme.value = 'auto';
    userPreference.value = 'auto';
    localStorage.removeItem('theme');
    applyTheme(resolvedTheme.value);

    logger.info('Theme reset to auto');
  };

  // Helper methods
  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;

    // Удаляем старые классы
    root.classList.remove('theme-light', 'theme-dark');

    // Добавляем новый класс
    root.classList.add(`theme-${theme}`);

    // Устанавливаем data атрибут для CSS
    root.setAttribute('data-theme', theme);

    // Добавляем класс для плавных переходов
    root.classList.add('theme-transition');
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  };

  const handleSystemThemeChange = (event: MediaQueryListEvent) => {
    systemTheme.value = event.matches ? 'dark' : 'light';

    // Автоматически обновляем тему если выбран auto режим
    if (currentTheme.value === 'auto') {
      applyTheme(resolvedTheme.value);
    }

    logger.debug('System theme changed', {
      system: systemTheme.value,
      current: currentTheme.value,
      resolved: resolvedTheme.value
    });
  };

  // Watch для автоматического применения изменений
  watch(resolvedTheme, (newTheme) => {
    applyTheme(newTheme);
  }, { immediate: true });

  return {
    // State
    current: currentTheme,
    preference: userPreference,
    system: systemTheme,

    // Getters
    resolved: resolvedTheme,
    isDark,
    isLight,
    isAuto,

    // Actions
    initialize,
    setTheme,
    toggleTheme,
    reset
  };
});
