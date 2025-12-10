// framework/stores/index.ts

// Реэкспортируем все сторе
export * from './app.store';
export * from './auth.store';
export * from './theme.store';
export * from './error.store';
export * from './app-state.store';
export * from './activity.store';

// Реэкспортируем все типы
export * from './types';

// Хелпер для удобного использования нескольких сторов
import { useAppStore } from './app.store';
import { useAuthStore } from './auth.store';
import { useThemeStore } from './theme.store';
import { useErrorStore } from './error.store';
import { useAppStateStore } from './app-state.store';
import { useActivityStore } from './activity.store';

/**
 * Хелпер для получения всех сторов приложения
 * @returns Объект со всеми сторами
 */
export const useStores = () => ({
  app: useAppStore(),
  auth: useAuthStore(),
  theme: useThemeStore(),
  error: useErrorStore(),
  appState: useAppStateStore(),
  activity: useActivityStore()
});
