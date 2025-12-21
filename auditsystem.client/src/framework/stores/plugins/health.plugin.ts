/**
 * Плагин Pinia для мониторинга здоровья сторов
 */

import type { PiniaPluginContext } from 'pinia';
import { storeHealthMonitor } from '../utils/store.health';
import { logger } from '@/core/services/logger/logger.service';

export const healthPlugin = (context: PiniaPluginContext) => {
  const { store } = context;
  const loggerContext = logger.create(`HealthPlugin:${store.$id}`);

  // Регистрируем стор в мониторе
  storeHealthMonitor.registerStore(store);

  // Отслеживаем время выполнения действий
  store.$onAction(({ name, store, args, after, onError }) => {
    const startTime = Date.now();
    const storeId = store.$id;

    after((result) => {
      const duration = Date.now() - startTime;
      storeHealthMonitor.recordAction(storeId, duration);

      loggerContext.debug('Action completed with timing', {
        action: name,
        duration: `${duration}ms`
      });
    });

    onError((error: unknown) => {
      storeHealthMonitor.recordError(store.$id);

      loggerContext.error('Action failed', {
        action: name,
        error: error instanceof Error ? error.message : String(error)
      });
    });
  });

  // Добавляем метод для получения метрик здоровья
  return {
    $health: {
      getMetrics: () => storeHealthMonitor.getMetrics(store.$id),
      isHealthy: () => {
        const metrics = storeHealthMonitor.getMetrics(store.$id);
        return Array.isArray(metrics) ? true : metrics.isHealthy;
      },
      reset: () => storeHealthMonitor.resetStore(store.$id)
    }
  };
};
