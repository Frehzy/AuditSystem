// framework/stores/app-state.store.ts
import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { logger } from '@/core/utils/logger';

/**
 * Стор для управления общим состоянием приложения
 */
export const useAppStateStore = defineStore('app-state', () => {
  // ==================== СОСТОЯНИЕ ====================
  const isOnline = ref(navigator.onLine);
  const isLoading = ref(false);
  const serverHealth = ref(false);
  const appVersion = ref(import.meta.env.VITE_APP_VERSION || '1.0.0');
  const startupTime = ref(Date.now());

  // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
  /** Время работы приложения в миллисекундах */
  const uptime = computed(() => Date.now() - startupTime.value);

  /** Форматированное время работы */
  const formattedUptime = computed(() => {
    const seconds = Math.floor(uptime.value / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  // ==================== ДЕЙСТВИЯ ====================
  /**
   * Установка сетевого статуса
   * @param status - Статус соединения
   */
  const setOnlineStatus = (status: boolean) => {
    const previousStatus = isOnline.value;
    isOnline.value = status;

    if (previousStatus !== status) {
      const event = status ? 'online' : 'offline';
      logger.info(`Сетевой статус изменен: ${event}`, {
        previous: previousStatus ? 'online' : 'offline',
        current: status ? 'online' : 'offline',
        uptime: formattedUptime.value
      });
    }
  };

  /**
   * Установка состояния загрузки
   * @param loading - Флаг загрузки
   */
  const setLoading = (loading: boolean) => {
    const previousLoading = isLoading.value;
    isLoading.value = loading;

    if (previousLoading !== loading) {
      logger.debug('Состояние загрузки изменено', {
        previous: previousLoading,
        current: loading,
        context: 'app-state'
      });
    }
  };

  /**
   * Установка здоровья сервера
   * @param health - Флаг здоровья сервера
   */
  const setServerHealth = (health: boolean) => {
    const previousHealth = serverHealth.value;
    serverHealth.value = health;

    if (previousHealth !== health) {
      const status = health ? 'healthy' : 'unhealthy';
      logger.info(`Здоровье сервера изменено: ${status}`, {
        previous: previousHealth ? 'healthy' : 'unhealthy',
        current: health ? 'healthy' : 'unhealthy',
        uptime: formattedUptime.value
      });
    }
  };

  /**
   * Получение информации о состоянии приложения
   */
  const getAppInfo = () => ({
    version: appVersion.value,
    startupTime: new Date(startupTime.value),
    uptime: formattedUptime.value,
    isOnline: isOnline.value,
    serverHealth: serverHealth.value,
    isLoading: isLoading.value
  });

  // Слушатели сетевого статуса
  const handleOnline = () => {
    logger.info('Восстановлено сетевое соединение');
    setOnlineStatus(true);
  };

  const handleOffline = () => {
    logger.warn('Потеряно сетевое соединение');
    setOnlineStatus(false);
    setServerHealth(false);
  };

  // Инициализация
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Очистка при размонтировании
  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    logger.debug('Ресурсы app-state store очищены');
  });

  return {
    // ==================== СОСТОЯНИЕ ====================
    isOnline: computed(() => isOnline.value),
    isLoading: computed(() => isLoading.value),
    serverHealth: computed(() => serverHealth.value),
    appVersion: computed(() => appVersion.value),
    startupTime: computed(() => startupTime.value),

    // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
    uptime,
    formattedUptime,

    // ==================== ДЕЙСТВИЯ ====================
    setOnlineStatus,
    setLoading,
    setServerHealth,
    getAppInfo
  };
});
