// src/modules/auth/composables/use-server-health.ts
import { ref, computed, onUnmounted } from 'vue';
import { healthService } from '../services';
import { logger } from '@/core/utils/logger';
import type { HealthCheckConfig, ServerStatus } from '../types';

export const useServerHealth = (config?: Partial<HealthCheckConfig>) => {
  const loggerContext = logger.create('useServerHealth');

  // Используем сервис с возможностью кастомизации конфига
  const service = healthService;
  if (config) {
    service.updateConfig(config);
  }

  // Реактивное состояние
  const isChecking = ref(false);
  const lastResponseTime = ref<number | null>(null);

  // Проксируем методы сервиса с реактивными обертками
  const check = async () => {
    isChecking.value = true;
    const startTime = Date.now();

    try {
      const status = await service.check();
      lastResponseTime.value = Date.now() - startTime;
      return status;
    } finally {
      isChecking.value = false;
    }
  };

  const manualCheck = async () => {
    loggerContext.info('Manual check requested');
    return await check();
  };

  // Вычисляемые свойства
  const status = computed(() => service.getStatus());
  const isOnline = computed(() => service.isOnline());
  const isOffline = computed(() => status.value === 'offline');
  const lastCheck = computed(() => service.getLastCheck());
  const lastOnline = computed(() => service.getLastOnline());
  const retryCount = computed(() => service.getRetryCount());

  const formattedResponseTime = computed(() => {
    if (!lastResponseTime.value) return null;
    return `${lastResponseTime.value}ms`;
  });

  // Управление периодическими проверками
  const startPeriodicChecks = (interval?: number) => {
    service.startPeriodicChecks(interval);
  };

  const stopPeriodicChecks = () => {
    service.stopPeriodicChecks();
  };

  // Очистка
  onUnmounted(() => {
    stopPeriodicChecks();
    loggerContext.debug('Server health composable unmounted');
  });

  return {
    // Состояние
    status,
    isOnline,
    isOffline,
    isChecking: computed(() => isChecking.value),
    lastCheck,
    lastOnline,
    retryCount,
    lastResponseTime,
    formattedResponseTime,

    // Методы
    check,
    manualCheck,
    startPeriodicChecks,
    stopPeriodicChecks,

    // Конфигурация
    updateConfig: (newConfig: Partial<HealthCheckConfig>) => {
      service.updateConfig(newConfig);
    },

    // Статистика
    getStats: () => ({
      status: status.value,
      lastCheck: lastCheck.value,
      lastOnline: lastOnline.value,
      retryCount: retryCount.value,
      responseTime: formattedResponseTime.value,
    }),
  };
};

export type UseServerHealthReturn = ReturnType<typeof useServerHealth>;
