import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { logger } from '@/core/utils/logger/logger';
import { stateManager } from '@/core/services/state/state-manager.service';

interface AppState {
  isOnline: boolean;
  isLoading: boolean;
  serverHealth: boolean;
  lastServerCheck: Date | null;
  errors: string[];
}

export const useAppStore = defineStore('app', () => {
  const state = ref<AppState>({
    isOnline: navigator.onLine,
    isLoading: false,
    serverHealth: false,
    lastServerCheck: null,
    errors: [],
  });

  // Computed
  const isOnline = computed(() => state.value.isOnline);
  const isLoading = computed(() => state.value.isLoading);
  const serverHealth = computed(() => state.value.serverHealth);
  const lastServerCheck = computed(() => state.value.lastServerCheck);
  const errors = computed(() => state.value.errors);
  const hasErrors = computed(() => state.value.errors.length > 0);

  // Actions
  const setOnlineStatus = (status: boolean) => {
    state.value.isOnline = status;
    stateManager.set('app.networkStatus', status);
    logger.info(`Network status changed: ${status ? 'online' : 'offline'}`);
  };

  const setLoading = (loading: boolean) => {
    state.value.isLoading = loading;
    stateManager.set('app.loading', loading);

    if (loading) {
      logger.debug('Global loading started');
    } else {
      logger.debug('Global loading finished');
    }
  };

  const setServerHealth = (health: boolean) => {
    state.value.serverHealth = health;
    state.value.lastServerCheck = new Date();

    stateManager.set('app.serverHealth', {
      health,
      lastCheck: state.value.lastServerCheck
    });

    logger.info(`Server health status: ${health ? 'healthy' : 'unhealthy'}`);
  };

  const addError = (error: string) => {
    state.value.errors.push(error);
    stateManager.set('app.errors', state.value.errors);
    logger.error('App error added:', error);
  };

  const clearErrors = () => {
    state.value.errors = [];
    stateManager.set('app.errors', []);
    logger.debug('App errors cleared');
  };

  const removeError = (index: number) => {
    if (index >= 0 && index < state.value.errors.length) {
      state.value.errors.splice(index, 1);
      stateManager.set('app.errors', state.value.errors);
      logger.debug(`Error at index ${index} removed`);
    }
  };

  // Watchers
  watch(
    () => state.value.isOnline,
    (newStatus) => {
      if (newStatus) {
        logger.info('App came online');
      } else {
        logger.warn('App went offline');
      }
    }
  );

  watch(
    () => state.value.serverHealth,
    (newHealth) => {
      if (!newHealth) {
        logger.warn('Server health degraded');
      }
    }
  );

  // Event listeners for network status
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOnlineStatus(true));
    window.addEventListener('offline', () => setOnlineStatus(false));
  }

  return {
    // State
    state,

    // Computed
    isOnline,
    isLoading,
    serverHealth,
    lastServerCheck,
    errors,
    hasErrors,

    // Actions
    setOnlineStatus,
    setLoading,
    setServerHealth,
    addError,
    clearErrors,
    removeError,
  };
});

export type AppStore = ReturnType<typeof useAppStore>;
