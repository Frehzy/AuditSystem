// src/modules/auth/composables/useServerHealth.ts
import { ref, onUnmounted, computed, watch } from 'vue';
import { logger } from '@/core/utils/logger';
// Исправлено: правильный импорт
import { notificationService } from '@/core/services/ui/notification.service';

export type ServerStatus = 'checking' | 'online' | 'offline';

interface ServerHealthState {
  status: ServerStatus;
  isInitialized: boolean;
  lastCheck: Date | null;
  retryCount: number;
  lastError: string | null;
  responseTime: number | null;
  lastOnline: Date | null;
  totalChecks: number;
  successfulChecks: number;
}

interface HealthCheckConfig {
  checkInterval: number;
  retryInterval: number;
  maxRetries: number;
  timeout: number;
  notifyOnStatusChange: boolean;
}

export const useServerHealth = (config: Partial<HealthCheckConfig> = {}) => {
  const loggerContext = logger.create('useServerHealth');

  const defaultConfig: HealthCheckConfig = {
    checkInterval: 30000,
    retryInterval: 10000,
    maxRetries: 5,
    timeout: 8000,
    notifyOnStatusChange: true,
  };

  const currentConfig = { ...defaultConfig, ...config };

  const state = ref<ServerHealthState>({
    status: 'checking',
    isInitialized: false,
    lastCheck: null,
    retryCount: 0,
    lastError: null,
    responseTime: null,
    lastOnline: null,
    totalChecks: 0,
    successfulChecks: 0,
  });

  let checkInterval: number | null = null;
  let retryTimeout: number | null = null;
  let isChecking = false;
  let consecutiveFailures = 0;

  // Computed properties
  const status = computed(() => state.value.status);
  const isInitialized = computed(() => state.value.isInitialized);
  const lastCheck = computed(() => state.value.lastCheck);
  const retryCount = computed(() => state.value.retryCount);
  const lastError = computed(() => state.value.lastError);
  const responseTime = computed(() => state.value.responseTime);
  const isOnline = computed(() => state.value.status === 'online');
  const isOffline = computed(() => state.value.status === 'offline');
  const isCheckingStatus = computed(() => state.value.status === 'checking');
  const lastOnline = computed(() => state.value.lastOnline);
  const successRate = computed(() => {
    if (state.value.totalChecks === 0) return 100;
    return (state.value.successfulChecks / state.value.totalChecks) * 100;
  });
  const healthScore = computed(() => {
    const rate = successRate.value;
    if (rate >= 95) return 'excellent';
    if (rate >= 80) return 'good';
    if (rate >= 60) return 'fair';
    return 'poor';
  });

  /**
   * Проверка соединения с сервером
   */
  const checkServerConnection = async (isRetry: boolean = false): Promise<boolean> => {
    if (isChecking) {
      loggerContext.debug('Health check already in progress');
      return state.value.status === 'online';
    }

    isChecking = true;
    const previousStatus = state.value.status;
    state.value.status = 'checking';
    state.value.lastError = null;

    const startTime = performance.now();
    state.value.totalChecks++;

    try {
      // Простая проверка доступности сервера через HEAD запрос
      const response = await fetch('/api/health', {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: AbortSignal.timeout(currentConfig.timeout)
      });

      const isHealthy = response.ok;
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);

      const newStatus = isHealthy ? 'online' : 'offline';
      state.value.status = newStatus;
      state.value.lastCheck = new Date();
      state.value.responseTime = responseTimeMs;

      if (isHealthy) {
        state.value.successfulChecks++;
        consecutiveFailures = 0;
        state.value.lastOnline = new Date();
        state.value.retryCount = 0;

        if (previousStatus === 'offline' && currentConfig.notifyOnStatusChange) {
          notificationService.success('Соединение с сервером восстановлено');
        }

        loggerContext.info('Server health check passed', {
          responseTime: `${responseTimeMs}ms`,
          successRate: `${successRate.value.toFixed(1)}%`
        });
      } else {
        consecutiveFailures++;
        state.value.retryCount++;
        loggerContext.warn('Server health check failed - server responded but not healthy', {
          retryCount: state.value.retryCount,
          consecutiveFailures
        });
      }

      // Уведомление об изменении статуса
      if (previousStatus !== newStatus && currentConfig.notifyOnStatusChange) {
        handleStatusChange(previousStatus, newStatus);
      }

      // Перезапускаем проверки если сервер вернулся в онлайн
      if (newStatus === 'online' && !checkInterval && !isRetry) {
        startPeriodicChecks(currentConfig.checkInterval);
      }

      return isHealthy;
    } catch (error: unknown) {
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);

      consecutiveFailures++;
      state.value.lastError = error instanceof Error ? error.message : 'Unknown error';
      state.value.status = 'offline';
      state.value.lastCheck = new Date();
      state.value.responseTime = responseTimeMs;
      state.value.retryCount++;

      loggerContext.error('Health check failed', {
        error: state.value.lastError,
        retryCount: state.value.retryCount,
        consecutiveFailures,
        responseTime: `${responseTimeMs}ms`,
      });

      // Запускаем быстрые повторные проверки при ошибках
      if (consecutiveFailures <= currentConfig.maxRetries && !isRetry) {
        scheduleRetryCheck();
      }

      return false;
    } finally {
      isChecking = false;
      state.value.isInitialized = true;
    }
  };

  /**
   * Запуск периодических проверок
   */
  const startPeriodicChecks = (intervalMs: number = currentConfig.checkInterval): void => {
    stopPeriodicChecks();

    // Немедленная первая проверка
    checkServerConnection();

    checkInterval = window.setInterval(() => {
      if (state.value.retryCount >= currentConfig.maxRetries) {
        loggerContext.warn('Max retry attempts reached, pausing health checks');
        stopPeriodicChecks();
        return;
      }

      checkServerConnection();
    }, intervalMs);

    loggerContext.info('Periodic health checks started', {
      interval: `${intervalMs}ms`,
      maxRetries: currentConfig.maxRetries
    });
  };

  /**
   * Остановка периодических проверок
   */
  const stopPeriodicChecks = (): void => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
    loggerContext.info('Periodic health checks stopped');
  };

  /**
   * Планирование повторной проверки
   */
  const scheduleRetryCheck = (): void => {
    if (retryTimeout) {
      clearTimeout(retryTimeout);
    }

    retryTimeout = window.setTimeout(() => {
      checkServerConnection(true);
    }, currentConfig.retryInterval);

    loggerContext.debug('Retry check scheduled', {
      delay: `${currentConfig.retryInterval}ms`
    });
  };

  /**
   * Ручная проверка соединения
   */
  const manualCheck = async (): Promise<boolean> => {
    loggerContext.info('Manual health check requested');
    consecutiveFailures = 0;
    return await checkServerConnection();
  };

  /**
   * Сброс состояния проверки
   */
  const reset = (): void => {
    state.value.retryCount = 0;
    state.value.lastError = null;
    state.value.status = 'checking';
    state.value.responseTime = null;
    consecutiveFailures = 0;

    loggerContext.info('Health check state reset');
  };

  /**
   * Принудительный перезапуск проверок
   */
  const restartChecks = (intervalMs?: number): void => {
    reset();
    startPeriodicChecks(intervalMs);
  };

  /**
   * Получение статистики проверок
   */
  const getStats = () => ({
    totalChecks: state.value.totalChecks,
    successfulChecks: state.value.successfulChecks,
    successRate: successRate.value,
    healthScore: healthScore.value,
    averageResponseTime: state.value.responseTime,
    lastOnline: state.value.lastOnline,
    uptime: calculateUptime()
  });

  /**
   * Обработка изменения статуса
   */
  const handleStatusChange = (previousStatus: ServerStatus, newStatus: ServerStatus): void => {
    if (previousStatus === 'online' && newStatus === 'offline') {
      notificationService.error('Потеряно соединение с сервером');
    } else if (previousStatus === 'offline' && newStatus === 'online') {
      notificationService.success('Соединение с сервером восстановлено');
    }
  };

  /**
   * Расчет времени доступности
   */
  const calculateUptime = (): string => {
    if (state.value.totalChecks === 0) return '0%';
    return `${successRate.value.toFixed(1)}%`;
  };

  // Watchers
  watch(isOnline, (newVal) => {
    loggerContext.debug('Server status changed', {
      isOnline: newVal,
      successRate: successRate.value
    });
  });

  onUnmounted(() => {
    stopPeriodicChecks();
  });

  return {
    // State
    status,
    isInitialized,
    lastCheck,
    retryCount,
    lastError,
    responseTime,
    isOnline,
    isOffline,
    isChecking: isCheckingStatus,
    lastOnline,
    successRate,
    healthScore,

    // Stats
    getStats,

    // Actions
    checkServerConnection,
    startPeriodicChecks,
    stopPeriodicChecks,
    manualCheck,
    reset,
    restartChecks,

    // Configuration
    updateConfig: (newConfig: Partial<HealthCheckConfig>) => {
      Object.assign(currentConfig, newConfig);
    }
  };
};

export type UseServerHealthReturn = ReturnType<typeof useServerHealth>;
