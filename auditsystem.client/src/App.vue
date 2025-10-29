<!-- src/App.vue -->
<template>
  <div id="app" :class="themeClass">
    <RouterView />
    <BaseToast />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, computed } from 'vue';
  import { RouterView, useRouter } from 'vue-router';
  import BaseToast from '@/framework/ui/components/feedback/BaseToast.vue';
  import { useAppStore } from '@/framework/stores/app.store';
  import { provideToast, createToastApi } from '@/framework/ui/composables/useToast';
  import { logger } from '@/core/utils/logger';
  import './assets/styles/theme.css'

  // Предоставление toast API всему приложению
  provideToast(createToastApi());

  const appStore = useAppStore();
  const loggerContext = logger.create('App');

  /**
   * Текущий класс темы
   */
  const themeClass = computed(() => `theme-${appStore.currentTheme}`);

  /**
   * Обработчик онлайн/офлайн статуса
   */
  const handleOnline = () => {
    appStore.setOnlineStatus(true);
    loggerContext.info('Application came online');
  };

  const handleOffline = () => {
    appStore.setOnlineStatus(false);
    loggerContext.warn('Application went offline');
  };

  /**
   * Обработчик видимости страницы
   */
  const handleVisibilityChange = () => {
    if (document.hidden) {
      loggerContext.debug('App became hidden');
    } else {
      loggerContext.debug('App became visible');
    }
  };

  onMounted(() => {
    // Инициализация темы
    appStore.initializeTheme();

    // Сохранение router в глобальной области для navigation.service
    if (import.meta.env.DEV) {
      (window as any).__VUE_ROUTER__ = useRouter();
    }

    // Добавляем слушатель системных предпочтений темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      loggerContext.debug('System theme preference changed:', systemTheme);
      // Можно добавить логику для автоматического следования системной теме
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Инициализация слушателей событий
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    loggerContext.info('Application mounted', {
      online: navigator.onLine,
      userAgent: navigator.userAgent,
      theme: appStore.currentTheme
    });

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  });

  onUnmounted(() => {
    loggerContext.info('Application unmounted');
  });
</script>

<style>
  /* Global reset and base styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--color-background);
    color: var(--color-text-primary);
    line-height: 1.6;
    overflow-x: hidden;
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }

  #app {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-background);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
  }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted);
    }

  /* Selection styles */
  ::selection {
    background-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    color: var(--color-text-primary);
  }

  ::-moz-selection {
    background-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    color: var(--color-text-primary);
  }

  /* Focus styles for accessibility */
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity var(--transition-normal);
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: transform var(--transition-normal), opacity var(--transition-normal);
  }

  .slide-left-enter-from {
    transform: translateX(100%);
    opacity: 0;
  }

  .slide-left-leave-to {
    transform: translateX(-100%);
    opacity: 0;
  }

  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: transform var(--transition-normal), opacity var(--transition-normal);
  }

  .slide-right-enter-from {
    transform: translateX(-100%);
    opacity: 0;
  }

  .slide-right-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }

  /* Print styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    .no-print {
      display: none !important;
    }
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    :root {
      --border-width: 2px;
    }
  }

  /* Mobile first responsive design */
  .container {
    width: 100%;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (min-width: 640px) {
    .container {
      max-width: 640px;
      padding: 0 1.5rem;
    }
  }

  @media (min-width: 768px) {
    .container {
      max-width: 768px;
      padding: 0 2rem;
    }
  }

  @media (min-width: 1024px) {
    .container {
      max-width: 1024px;
      padding: 0 2.5rem;
    }
  }

  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
      padding: 0 3rem;
    }
  }
</style>
