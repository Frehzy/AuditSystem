// framework/stores/store.middleware.ts
import { PiniaPluginContext } from 'pinia';
import { logger } from '@/core/utils/logger';
import type {
  StoreActionLog,
  PerformanceMetrics,
  MiddlewareConfig,
  StoreSpecificConfig
} from './types/middleware.types';

/**
 * Конфигурация middleware по умолчанию
 */
const defaultConfig: MiddlewareConfig = {
  maxLogs: 1000,
  logErrors: true,
  logSuccess: true,
  performanceTracking: true,
  storeSpecific: {}
};

/**
 * Создание логгера для сторов
 */
export function createStoreLogger(config: Partial<MiddlewareConfig> = {}) {
  const mergedConfig: MiddlewareConfig = { ...defaultConfig, ...config };
  const actionLogs: StoreActionLog[] = [];

  // Периодическая очистка старых логов (каждый час)
  const cleanupInterval = setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const oldLogs = actionLogs.filter(log => log.timestamp < oneHourAgo);

    if (oldLogs.length > 0) {
      const removedCount = oldLogs.length;
      const remainingLogs = actionLogs.filter(log => log.timestamp >= oneHourAgo);
      actionLogs.length = 0;
      actionLogs.push(...remainingLogs);

      logger.debug('Очищены старые логи действий', {
        removed: removedCount,
        remaining: actionLogs.length
      });
    }
  }, 60 * 60 * 1000); // Каждый час

  /**
   * Плагин Pinia для логирования действий
   */
  const plugin = (context: PiniaPluginContext) => {
    const store = context.store;
    const storeName = context.store.$id || 'unknown';

    // Настройки для конкретного стора
    const storeSpecificConfig = mergedConfig.storeSpecific[storeName];
    let shouldLog = mergedConfig.logSuccess;
    let shouldTrackPerformance = mergedConfig.performanceTracking;

    // Если есть конфигурация для конкретного стора
    if (storeSpecificConfig !== undefined) {
      if (typeof storeSpecificConfig === 'boolean') {
        shouldLog = storeSpecificConfig;
        shouldTrackPerformance = storeSpecificConfig;
      } else if (typeof storeSpecificConfig === 'object') {
        if (storeSpecificConfig.logging !== undefined) {
          shouldLog = storeSpecificConfig.logging;
        }
        if (storeSpecificConfig.performanceTracking !== undefined) {
          shouldTrackPerformance = storeSpecificConfig.performanceTracking;
        }
      }
    }

    logger.info('Middleware инициализирован для стора', {
      store: storeName,
      config: { shouldLog, shouldTrackPerformance }
    });

    // Сохраняем оригинальные действия
    const originalActions = { ...store };

    // Перехватываем все function свойства как действия
    Object.keys(originalActions).forEach(actionName => {
      const originalAction = originalActions[actionName as keyof typeof originalActions];

      if (typeof originalAction === 'function') {
        // Создаем обертку для перехвата вызова
        const wrappedAction = async function (this: any, ...args: unknown[]) {
          const startTime = Date.now();
          const logEntry: StoreActionLog = {
            store: storeName,
            action: actionName,
            args,
            timestamp: startTime,
            metadata: {
              component: 'unknown',
              userId: 'unknown',
              sessionId: 'unknown',
              timestamp: startTime
            }
          };

          try {
            const result = await originalAction.apply(this, args);
            const duration = Date.now() - startTime;

            logEntry.duration = duration;
            logEntry.success = true;

            // Логирование успешных действий
            if (shouldLog) {
              logger.debug(`Действие стора завершено`, {
                store: storeName,
                action: actionName,
                duration,
                success: true
              });
            }

            // Отслеживание производительности
            if (shouldTrackPerformance && duration > 1000) {
              logger.warn(`Медленное действие стора`, {
                store: storeName,
                action: actionName,
                duration,
                threshold: 1000
              });
            }

            actionLogs.push(logEntry);

            // Ограничиваем размер логов
            if (actionLogs.length > mergedConfig.maxLogs) {
              const removed = actionLogs.shift();
              logger.debug('Старый лог удален для сохранения лимита', {
                store: removed?.store,
                action: removed?.action,
                maxLogs: mergedConfig.maxLogs
              });
            }

            return result;
          } catch (error) {
            const duration = Date.now() - startTime;

            logEntry.duration = duration;
            logEntry.success = false;
            logEntry.error = error;

            // Логирование ошибок
            if (mergedConfig.logErrors) {
              logger.error(`Действие стора завершилось ошибкой`, {
                store: storeName,
                action: actionName,
                error,
                duration,
                args: args.length > 0 ? args : undefined
              });
            }

            actionLogs.push(logEntry);
            throw error;
          }
        };

        // Заменяем оригинальное действие оберткой
        (store as any)[actionName] = wrappedAction;
      }
    });

    return store;
  };

  /**
   * Получение всех логов
   */
  const getLogs = (filter?: { store?: string; action?: string; success?: boolean }) => {
    let filteredLogs = [...actionLogs];

    if (filter) {
      if (filter.store) {
        filteredLogs = filteredLogs.filter(log => log.store === filter.store);
      }
      if (filter.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filter.action);
      }
      if (filter.success !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.success === filter.success);
      }
    }

    return filteredLogs;
  };

  /**
   * Очистка логов
   */
  const clearLogs = () => {
    const count = actionLogs.length;
    actionLogs.length = 0;
    logger.info('Логи действий очищены', { cleared: count });
  };

  /**
   * Получение метрик производительности
   */
  const getPerformanceMetrics = (): PerformanceMetrics => {
    const byStore: Record<string, { count: number; avgDuration: number; errorCount: number }> = {};

    actionLogs.forEach(log => {
      if (!byStore[log.store]) {
        byStore[log.store] = { count: 0, avgDuration: 0, errorCount: 0 };
      }

      byStore[log.store].count++;
      byStore[log.store].avgDuration += log.duration || 0;
      if (!log.success) {
        byStore[log.store].errorCount++;
      }
    });

    // Рассчитываем средние значения
    Object.keys(byStore).forEach(store => {
      byStore[store].avgDuration = byStore[store].count > 0
        ? byStore[store].avgDuration / byStore[store].count
        : 0;
    });

    const totalActions = actionLogs.length;
    const successRate = totalActions > 0
      ? actionLogs.filter(l => l.success).length / totalActions
      : 0;
    const averageDuration = totalActions > 0
      ? actionLogs.reduce((sum, l) => sum + (l.duration || 0), 0) / totalActions
      : 0;
    const errorRate = totalActions > 0
      ? actionLogs.filter(l => !l.success).length / totalActions
      : 0;

    const slowestActions = actionLogs
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10);

    const metrics: PerformanceMetrics = {
      totalActions,
      successRate,
      averageDuration,
      errorRate,
      slowestActions,
      byStore
    };

    logger.debug('Метрики производительности собраны', metrics);

    return metrics;
  };

  /**
   * Экспорт логов для отладки
   */
  const exportLogs = (format: 'json' | 'csv' = 'json') => {
    const data = getLogs();

    if (format === 'csv') {
      const headers = ['Store', 'Action', 'Timestamp', 'Duration', 'Success', 'Error'];
      const rows = data.map(log => [
        log.store,
        log.action,
        new Date(log.timestamp).toISOString(),
        log.duration || 'N/A',
        log.success ? 'Yes' : 'No',
        log.error ? (log.error as Error).message : 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      return csvContent;
    }

    return data;
  };

  /**
   * Остановка middleware
   */
  const stop = () => {
    clearInterval(cleanupInterval);
    clearLogs();
    logger.info('Store middleware остановлен');
  };

  return {
    plugin,
    getLogs,
    clearLogs,
    getPerformanceMetrics,
    exportLogs,
    stop
  };
}

// Экспортируем дефолтный экземпляр логгера
export const storeLogger = createStoreLogger();
