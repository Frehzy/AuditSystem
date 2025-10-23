import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { themeService } from '@/core/services/theme/theme.service';
import { logger } from '@/core/utils/logger/logger';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(themeService.getCurrentTheme());
  const loggerContext = logger.create('ThemeStore');

  /**
   * Инициализация темы
   */
  const initializeTheme = (): void => {
    themeService.initialize();
    loggerContext.info('Theme store initialized');
  };

  /**
   * Настройка слушателя системных предпочтений
   */
  const setupSystemPreferenceListener = (): (() => void) => {
    return themeService.setupSystemPreferenceListener();
  };

  /**
   * Переключение темы
   */
  const toggleTheme = (): void => {
    themeService.toggleTheme();
    loggerContext.info('Theme toggled');
  };

  /**
   * Установка конкретной темы
   */
  const setTheme = (newTheme: string): void => {
    if (newTheme === 'light' || newTheme === 'dark') {
      themeService.setTheme(newTheme);
      loggerContext.info('Theme set', { theme: newTheme });
    } else {
      loggerContext.warn('Invalid theme attempted to set', { theme: newTheme });
    }
  };

  // Подписка на изменения темы
  const unsubscribe = themeService.subscribe((newTheme) => {
    theme.value = newTheme;
    loggerContext.debug('Theme updated in store', { theme: newTheme });
  });

  // Очистка при размонтировании
  onUnmounted(() => {
    unsubscribe();
    loggerContext.debug('Theme store unmounted');
  });

  return {
    theme: computed(() => theme.value),
    isDark: computed(() => themeService.isDark()),
    isLight: computed(() => themeService.isLight()),
    toggleTheme,
    setTheme,
    initializeTheme,
    setupSystemPreferenceListener,
  };
});
