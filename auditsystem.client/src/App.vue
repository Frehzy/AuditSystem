<!-- src/App.vue -->
<template>
  <div id="app" :class="[themeClass, { 'theme-transition': enableTransitions }]">
    <RouterView v-slot="{ Component, route }">
      <transition :name="route.meta?.transition || 'fade'" mode="out-in">
        <div v-if="shouldUseLayout(route)" :class="getLayoutClass(route)">
          <component :is="Component" />
        </div>
        <component v-else :is="Component" />
      </transition>
    </RouterView>
    <BaseToast />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, computed, ref } from 'vue';
  import { RouterView, useRoute } from 'vue-router';
  import BaseToast from '@/framework/ui/components/feedback/BaseToast.vue';
  import { useThemeStore } from '@/framework/stores';
  import { logger } from '@/core/services/logger/logger.service';
  import './assets/styles/globals.css';

  const route = useRoute();
  const themeStore = useThemeStore();
  const loggerContext = logger.create('App');
  const enableTransitions = ref(true);

  /**
   * Текущий класс темы
   */
  const themeClass = computed(() => `theme-${themeStore.resolved}`);

  /**
   * Определяет, нужно ли использовать layout для текущего маршрута
   */
  const shouldUseLayout = (route: any): boolean => {
    // Для страницы авторизации не используем layout
    return route.meta?.layout !== false && route.name !== 'Login';
  };

  /**
   * Возвращает CSS класс для layout
   */
  const getLayoutClass = (route: any): string => {
    const layout = route.meta?.layout || 'default';

    switch (layout) {
      case 'auth':
        return 'auth-layout';
      case 'default':
      default:
        return 'main-layout';
    }
  };

  /**
   * Обработчик онлайн/офлайн статуса
   */
  const handleOnline = () => {
    loggerContext.info('Application came online');
  };

  const handleOffline = () => {
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

  /**
   * Обработчик изменения системной темы
   */
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const systemTheme = e.matches ? 'dark' : 'light';
    loggerContext.debug('System theme preference changed');

    // Автоматическое следование системной теме, если не выбрана пользовательская
    if (themeStore.preference === 'auto') {
      themeStore.setTheme(systemTheme);
    }
  };

  /**
   * Обработчик для reduced motion preference
   */
  const handleReducedMotionChange = (e: MediaQueryListEvent) => {
    enableTransitions.value = !e.matches;
    loggerContext.debug('Reduced motion preference changed');
  };

  onMounted(() => {
    // Инициализация темы
    themeStore.initialize();

    // Добавляем слушатель системных предпочтений темы
    const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    themeMediaQuery.addEventListener('change', handleSystemThemeChange);

    // Добавляем слушатель reduced motion preference
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', handleReducedMotionChange);
    enableTransitions.value = !motionMediaQuery.matches;

    // Инициализация слушателей событий
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    loggerContext.info('Application mounted', {
      online: navigator.onLine,
      theme: themeStore.resolved,
      themePreference: themeStore.preference,
      reducedMotion: !enableTransitions.value
    });

    // Cleanup function
    return () => {
      themeMediaQuery.removeEventListener('change', handleSystemThemeChange);
      motionMediaQuery.removeEventListener('change', handleReducedMotionChange);
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
    font-family: var(--font-family-sans, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
    background-color: var(--color-background);
    color: var(--color-text-primary);
    line-height: 1.6;
    overflow-x: hidden;
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }

  #app {
    min-height: 100vh;
    min-height: 100dvh;
  }

  /* Layout styles */
  .auth-layout {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-100) 100%);
    padding: var(--spacing-lg);
    position: relative;
    overflow: hidden;
  }

  .theme-dark .auth-layout {
    background: linear-gradient(135deg, var(--color-gray-900) 0%, var(--color-gray-800) 100%);
  }

  .main-layout {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  /* Scrollbar styles - используем переменные из theme.css */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-surface-hover);
    border-radius: var(--radius-sm);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: var(--radius-sm);
    transition: background-color var(--transition-fast);
  }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--color-text-muted);
    }

  /* Selection styles - используем переменные из theme.css */
  ::selection {
    background-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    color: var(--color-text-primary);
  }

  ::-moz-selection {
    background-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    color: var(--color-text-primary);
  }

  /* Focus styles for accessibility - используем focus-ring из theme.css */
  :focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--shadow-focus);
  }

  /* Utility classes - дополняем существующие */
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

  /* Animation classes - используем переменные переходов */
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

  /* Status indicators */
  .status-online {
    background: var(--status-online-bg);
    border: 1px solid var(--status-online-border);
    color: var(--status-online-text);
  }

  .status-offline {
    background: var(--status-offline-bg);
    border: 1px solid var(--status-offline-border);
    color: var(--status-offline-text);
  }

  .status-checking {
    background: var(--status-checking-bg);
    border: 1px solid var(--status-checking-border);
    color: var(--status-checking-text);
  }

  /* Button-like interactive elements */
  .interactive-element {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-primary);
    transition: all var(--transition-fast);
    cursor: pointer;
  }

    .interactive-element:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-primary);
    }

    .interactive-element:focus-visible {
      box-shadow: var(--shadow-focus);
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

    /* Используем print переменные из theme.css */
    body {
      background-color: var(--color-background, #ffffff) !important;
      color: var(--color-text-primary, #000000) !important;
    }
  }

  /* Reduced motion for accessibility - используем логику из theme.css */
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

  /* High contrast support - используем логику из theme.css */
  @media (prefers-contrast: high) {
    :root {
      --color-border: var(--color-text-primary);
      --shadow-md: 0 0 0 1px var(--color-text-primary);
    }

    .interactive-element {
      border: 2px solid;
    }
  }

  /* Container system с использованием CSS переменных для spacing */
  .container {
    width: 100%;
    margin: 0 auto;
    padding: 0 var(--spacing-md, 1rem);
  }

  @media (min-width: 640px) {
    .container {
      max-width: 640px;
      padding: 0 var(--spacing-lg, 1.5rem);
    }
  }

  @media (min-width: 768px) {
    .container {
      max-width: 768px;
      padding: 0 var(--spacing-xl, 2rem);
    }
  }

  @media (min-width: 1024px) {
    .container {
      max-width: 1024px;
      padding: 0 var(--spacing-xl, 2rem);
    }
  }

  @media (min-width: 1280px) {
    .container {
      max-width: 1280px;
      padding: 0 var(--spacing-2xl, 3rem);
    }
  }

  /* Grid system для консистентности */
  .grid {
    display: grid;
    gap: var(--spacing-md, 1rem);
  }

  .grid-cols-1 {
    grid-template-columns: 1fr;
  }

  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-cols-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 768px) {
    .grid-cols-2,
    .grid-cols-3,
    .grid-cols-4 {
      grid-template-columns: 1fr;
    }
  }

  /* Flex utilities */
  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .gap-sm {
    gap: var(--spacing-sm, 0.5rem);
  }

  .gap-md {
    gap: var(--spacing-md, 1rem);
  }

  .gap-lg {
    gap: var(--spacing-lg, 1.5rem);
  }

  /* Text utilities с использованием CSS переменных */
  .text-primary {
    color: var(--color-text-primary);
  }

  .text-secondary {
    color: var(--color-text-secondary);
  }

  .text-muted {
    color: var(--color-text-muted);
  }

  .text-success {
    color: var(--color-success);
  }

  .text-error {
    color: var(--color-error);
  }

  .text-warning {
    color: var(--color-warning);
  }

  .text-info {
    color: var(--color-info);
  }

  .text-sm {
    font-size: 0.875rem;
  }

  .text-base {
    font-size: 1rem;
  }

  .text-lg {
    font-size: 1.125rem;
  }

  .text-xl {
    font-size: 1.25rem;
  }

  .font-medium {
    font-weight: 500;
  }

  .font-semibold {
    font-weight: 600;
  }

  .font-bold {
    font-weight: 700;
  }
</style>
