// framework/stores/theme.store.ts
import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { logger } from '@/core/utils/logger';
import { themeService } from '@/core/services/ui/theme.service';
import type { Theme } from '@/core/types';

/**
 * Стор для управления темой приложения
 */
export const useThemeStore = defineStore('theme', () => {
  // ==================== СОСТОЯНИЕ ====================
  const current = ref<Theme>(themeService.getCurrentTheme());
  const preference = ref<Theme>(themeService.getCurrentTheme());
  const systemPreference = ref<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
  const isDark = computed(() => current.value === 'dark');
  const isLight = computed(() => current.value === 'light');
  const isAuto = computed(() => current.value === 'auto');

  /** Финальная тема с учетом автоматического режима */
  const resolved = computed(() => {
    if (current.value === 'auto') {
      return systemPreference.value;
    }
    return current.value;
  });

  // ==================== ДЕЙСТВИЯ ====================
  /**
   * Инициализация системы тем
   */
  const initialize = () => {
    try {
      logger.info('Инициализируем систему тем');

      themeService.initialize();
      current.value = themeService.getCurrentTheme();
      preference.value = themeService.getCurrentTheme();

      // Получаем системные предпочтения
      updateSystemPreference();

      logger.info('Система тем инициализирована', {
        theme: current.value,
        systemPreference: systemPreference.value
      });
    } catch (error) {
      logger.error('Ошибка при инициализации системы тем', { error });
      throw error;
    }
  };

  /**
   * Обновление системных предпочтений
   */
  const updateSystemPreference = () => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    systemPreference.value = isDarkMode ? 'dark' : 'light';
    logger.debug('Системные предпочтения обновлены', {
      systemPreference: systemPreference.value
    });
  };

  /**
   * Установка темы
   * @param theme - Новая тема
   */
  const setTheme = (theme: Theme) => {
    try {
      const previousTheme = current.value;

      logger.info('Изменяем тему', {
        previous: previousTheme,
        new: theme
      });

      themeService.setTheme(theme);
      current.value = theme;
      preference.value = theme;

      logger.info('Тема успешно изменена', {
        previous: previousTheme,
        new: theme,
        resolved: resolved.value
      });
    } catch (error) {
      logger.error('Ошибка при изменении темы', { error });
      throw error;
    }
  };

  /**
   * Переключение темы
   * @returns Новая тема
   */
  const toggleTheme = () => {
    try {
      logger.info('Переключаем тему');

      const newTheme = themeService.toggleTheme();
      current.value = newTheme;
      preference.value = newTheme;

      logger.info('Тема успешно переключена', {
        newTheme,
        resolved: resolved.value
      });

      return newTheme;
    } catch (error) {
      logger.error('Ошибка при переключении темы', { error });
      throw error;
    }
  };

  // Подписка на изменения темы из сервиса
  const unsubscribeTheme = themeService.subscribe((newTheme: Theme) => {
    logger.debug('Получено обновление темы из сервиса', { newTheme });
    current.value = newTheme;
    preference.value = newTheme;
  });

  // Слушатель изменений системной темы
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    systemPreference.value = e.matches ? 'dark' : 'light';
    logger.debug('Системная тема изменена', {
      systemPreference: systemPreference.value
    });

    if (current.value === 'auto') {
      logger.info('Автоматически обновляем тему по системным настройкам', {
        newTheme: resolved.value
      });
    }
  };

  mediaQuery.addEventListener('change', handleSystemThemeChange);

  /**
   * Очистка ресурсов
   */
  const cleanup = () => {
    try {
      logger.info('Очищаем ресурсы темы');

      unsubscribeTheme();
      mediaQuery.removeEventListener('change', handleSystemThemeChange);

      logger.info('Ресурсы темы очищены');
    } catch (error) {
      logger.error('Ошибка при очистке ресурсов темы', { error });
    }
  };

  // Автоматическая инициализация
  initialize();

  // Очистка при размонтировании
  onUnmounted(() => {
    cleanup();
  });

  return {
    // ==================== СОСТОЯНИЕ ====================
    current: computed(() => current.value),
    preference: computed(() => preference.value),
    systemPreference: computed(() => systemPreference.value),

    // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
    resolved,
    isDark,
    isLight,
    isAuto,

    // ==================== ДЕЙСТВИЯ ====================
    initialize,
    setTheme,
    toggleTheme,
    updateSystemPreference,
    cleanup
  };
});
