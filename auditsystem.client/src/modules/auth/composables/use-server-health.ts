/**
 * Композабл для проверки здоровья сервера
 */

import { ref, computed, onUnmounted } from 'vue';
import { healthService, type ServerStatus, type HealthCheckConfig } from '../services/health.service';

export function useServerHealth(config?: Partial<HealthCheckConfig>) {
  const status = ref<ServerStatus>(healthService.getStatus());
  const lastCheck = ref<Date | null>(healthService.getLastCheck());
  const lastResponseTime = ref<number | null>(healthService.getLastResponseTime());
  const isChecking = ref(false);

  // Обновляем конфигурацию если передана
  if (config) {
    healthService.updateConfig(config);
  }

  const check = async (): Promise<void> => {
    isChecking.value = true;
    try {
      await healthService.check();
      updateState();
    } finally {
      isChecking.value = false;
    }
  };

  const manualCheck = async (): Promise<void> => {
    isChecking.value = true;
    try {
      await healthService.manualCheck();
      updateState();
    } finally {
      isChecking.value = false;
    }
  };

  const startPeriodicChecks = (interval?: number): void => {
    healthService.startPeriodicChecks(interval);
  };

  const stopPeriodicChecks = (): void => {
    healthService.stopPeriodicChecks();
  };

  const updateState = (): void => {
    status.value = healthService.getStatus();
    lastCheck.value = healthService.getLastCheck();

    const responseTime = healthService.getLastResponseTime();
    // Убеждаемся что это число, не строка
    lastResponseTime.value = typeof responseTime === 'number' ? responseTime : null;
  };

  // Добавлено правильное вычисление isOnline
  const isOnline = computed(() => {
    return status.value === 'online';
  });

  // Подписываемся на обновления статуса
  const statusSubscription = healthService.onStatusChange((newStatus: ServerStatus) => {
    status.value = newStatus;
  });

  onUnmounted(() => {
    stopPeriodicChecks();
    statusSubscription.unsubscribe();
  });

  return {
    status: computed(() => status.value),
    lastCheck: computed(() => lastCheck.value),
    lastResponseTime: computed(() => lastResponseTime.value),
    isOnline: isOnline,
    isChecking: computed(() => isChecking.value),
    check,
    manualCheck,
    startPeriodicChecks,
    stopPeriodicChecks,
    updateState
  };
}
