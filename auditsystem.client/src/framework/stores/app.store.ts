import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logger } from '@/core/utils/logger';

interface AppError {
  id: string;
  message: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
}

export const useAppStore = defineStore('app', () => {
  // State
  const isOnline = ref(navigator.onLine);
  const isLoading = ref(false);
  const serverHealth = ref(false);
  const lastServerCheck = ref<Date | null>(null);
  const errors = ref<AppError[]>([]);

  // Computed
  const hasErrors = computed(() => errors.value.length > 0);
  const latestError = computed(() => errors.value[errors.value.length - 1]);
  const criticalErrors = computed(() =>
    errors.value.filter(error => error.type === 'error')
  );

  // Actions
  const setOnlineStatus = (status: boolean) => {
    isOnline.value = status;
    logger.info(`Network status: ${status ? 'online' : 'offline'}`);
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
    logger.debug(`Global loading: ${loading}`);
  };

  const setServerHealth = (health: boolean) => {
    serverHealth.value = health;
    lastServerCheck.value = new Date();
    logger.info(`Server health: ${health ? 'healthy' : 'unhealthy'}`);
  };

  const addError = (message: string, type: AppError['type'] = 'error') => {
    const error: AppError = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type
    };

    errors.value.push(error);

    // Автоматически очищаем старые ошибки (максимум 50)
    if (errors.value.length > 50) {
      errors.value = errors.value.slice(-50);
    }

    logger[type === 'error' ? 'error' : 'warn']('App error:', message);
  };

  const removeError = (id: string) => {
    const index = errors.value.findIndex(error => error.id === id);
    if (index > -1) {
      errors.value.splice(index, 1);
    }
  };

  const clearErrors = () => {
    errors.value = [];
    logger.debug('All errors cleared');
  };

  // Event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOnlineStatus(true));
    window.addEventListener('offline', () => setOnlineStatus(false));
  }

  return {
    // State
    isOnline: computed(() => isOnline.value),
    isLoading: computed(() => isLoading.value),
    serverHealth: computed(() => serverHealth.value),
    lastServerCheck: computed(() => lastServerCheck.value),
    errors: computed(() => errors.value),

    // Computed
    hasErrors,
    latestError,
    criticalErrors,

    // Actions
    setOnlineStatus,
    setLoading,
    setServerHealth,
    addError,
    removeError,
    clearErrors,
  };
});
