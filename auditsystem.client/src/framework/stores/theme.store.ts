// src/framework/stores/theme.store.ts
import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { themeService } from '@/core/services/core/ui/theme.service';
import { logger } from '@/core/utils/logger';
import type { Theme } from '@/core/types';

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>(themeService.getCurrentTheme());

  // Computed
  const isDark = computed(() => currentTheme.value === 'dark');
  const isLight = computed(() => currentTheme.value === 'light');
  const theme = computed(() => currentTheme.value);

  // Actions
  const initialize = (): void => {
    themeService.initialize();
    logger.info('Theme store initialized');
  };

  const initializeTheme = (): void => {
    initialize();
  };

  const toggle = (): void => {
    const newTheme = themeService.toggleTheme();
    currentTheme.value = newTheme;
    logger.info('Theme toggled to:', newTheme);
  };

  const set = (theme: Theme): void => {
    themeService.setTheme(theme);
    currentTheme.value = theme;
    logger.info('Theme set to:', theme);
  };

  const setupSystemPreferenceListener = (): (() => void) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      logger.debug('System theme preference changed:', systemTheme);
      if (currentTheme.value === 'auto') {
        set('auto');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  };

  const unsubscribe = themeService.subscribe((newTheme: Theme) => {
    currentTheme.value = newTheme;
    logger.debug('Theme updated:', newTheme);
  });

  onUnmounted(() => {
    unsubscribe();
    logger.debug('Theme store unmounted');
  });

  return {
    theme,
    isDark,
    isLight,
    initialize,
    initializeTheme,
    toggle,
    set,
    setupSystemPreferenceListener,
  };
});
