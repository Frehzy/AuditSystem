/**
 * Core store: Управление состоянием приложения
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { APP_CONFIG } from '@/core/config/app.config';
import { logger } from '@/core/services/logger/logger.service';
import { AppSettings } from "./app.types";

export const useAppStore = defineStore('app', () => {
  // State
  const name = ref<string>(APP_CONFIG.APP.NAME);
  const version = ref<string>(APP_CONFIG.APP.VERSION);
  const isLoading = ref<boolean>(false);
  const isInitialized = ref<boolean>(false);
  const startupTime = ref<number>(Date.now());
  const settings = ref<AppSettings>({
    language: navigator.language.startsWith('ru') ? 'ru' : 'en',
    theme: 'auto',
    notifications: true,
    autoSave: true,
    debugMode: import.meta.env.DEV
  });

  // Getters
  const uptime = computed(() => Date.now() - startupTime.value);

  const appInfo = computed(() => ({
    name: name.value,
    version: version.value,
    environment: APP_CONFIG.APP.ENV,
    startupTime: new Date(startupTime.value),
    uptime: uptime.value
  }));

  // Actions
  const initialize = async (): Promise<void> => {
    if (isInitialized.value) return;

    try {
      isLoading.value = true;
      logger.info('Initializing application...');

      // Загружаем настройки из localStorage
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          settings.value = { ...settings.value, ...parsed };
        } catch (err) {
          logger.warn('Failed to parse saved settings', { error: err });
        }
      }

      // Инициализируем другие модули при необходимости
      await new Promise(resolve => setTimeout(resolve, 500)); // Симуляция загрузки

      isInitialized.value = true;
      logger.info('Application initialized successfully', {
        name: name.value,
        version: version.value,
        environment: APP_CONFIG.APP.ENV
      });
    } catch (error) {
      logger.error('Failed to initialize application', { error });
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>): void => {
    const oldSettings = { ...settings.value };
    settings.value = { ...settings.value, ...newSettings };

    // Сохраняем в localStorage
    localStorage.setItem('app_settings', JSON.stringify(settings.value));

    logger.info('Settings updated', {
      old: oldSettings,
      new: settings.value
    });
  };

  const resetSettings = (): void => {
    const oldSettings = { ...settings.value };
    settings.value = {
      language: navigator.language.startsWith('ru') ? 'ru' : 'en',
      theme: 'auto',
      notifications: true,
      autoSave: true,
      debugMode: import.meta.env.DEV
    };

    localStorage.removeItem('app_settings');

    logger.info('Settings reset', {
      old: oldSettings,
      new: settings.value
    });
  };

  const setLoading = (loading: boolean): void => {
    isLoading.value = loading;
    logger.debug('Loading state changed', { loading });
  };

  const reset = (): void => {
    isLoading.value = false;
    isInitialized.value = false;
    startupTime.value = Date.now();
    logger.info('App store reset');
  };

  return {
    // State
    name: computed(() => name.value),
    version: computed(() => version.value),
    isLoading: computed(() => isLoading.value),
    isInitialized: computed(() => isInitialized.value),
    startupTime: computed(() => startupTime.value),
    settings: computed(() => settings.value),

    // Getters
    uptime,
    appInfo,

    // Actions
    initialize,
    updateSettings,
    resetSettings,
    setLoading,
    reset
  };
});
