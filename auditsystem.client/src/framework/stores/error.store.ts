// framework/stores/error.store.ts
import { defineStore } from 'pinia';
import { ref, computed, watch, onUnmounted } from 'vue';
import { logger } from '@/core/utils/logger';
import type {
  AppError,
  ErrorFilter,
  ErrorResolution,
  ErrorStats
} from './types/error.types';

/**
 * Стор для управления ошибками приложения
 */
export const useErrorStore = defineStore('error', () => {
  // ==================== СОСТОЯНИЕ ====================
  const errors = ref<AppError[]>([]);
  const resolvedErrors = ref<Set<string>>(new Set());
  const errorCategories = ref<Record<string, number>>({});
  const errorStats = ref<ErrorStats>({
    total: 0,
    unresolved: 0,
    byType: { critical: 0, error: 0, warning: 0, info: 0 },
    byContext: {},
    bySeverity: { high: 0, medium: 0, low: 0 }
  });

  // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
  /** Есть ли ошибки */
  const hasErrors = computed(() => errors.value.length > 0);

  /** Последняя ошибка */
  const latestError = computed(() => errors.value[errors.value.length - 1]);

  /** Количество ошибок */
  const errorCount = computed(() => errors.value.length);

  /** Количество неразрешенных ошибок */
  const unresolvedCount = computed(() =>
    errors.value.filter(error => !resolvedErrors.value.has(error.id)).length
  );

  /** Активные (неразрешенные) ошибки */
  const activeErrors = computed(() =>
    errors.value.filter(error => !resolvedErrors.value.has(error.id))
  );

  /** Ошибки по степени важности */
  const errorsBySeverity = computed(() => {
    const severityMap = {
      critical: 0,
      error: 0,
      warning: 0,
      info: 0
    };

    activeErrors.value.forEach(error => {
      severityMap[error.type] = (severityMap[error.type] || 0) + 1;
    });

    return severityMap;
  });

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================
  /**
   * Определение степени важности ошибки
   */
  const determineSeverity = (error: AppError): 'high' | 'medium' | 'low' => {
    if (error.type === 'critical') return 'high';
    if (error.type === 'error') return 'medium';
    return 'low';
  };

  /**
   * Категоризация ошибки
   */
  const categorizeError = (error: AppError) => {
    const category = error.context || 'general';
    errorCategories.value[category] = (errorCategories.value[category] || 0) + 1;

    // Обновляем статистику
    updateErrorStats(error);

    logger.debug('Ошибка категоризирована', {
      id: error.id,
      category,
      severity: determineSeverity(error)
    });
  };

  /**
   * Обновление статистики ошибок
   */
  const updateErrorStats = (error: AppError) => {
    const severity = determineSeverity(error);

    errorStats.value = {
      total: errorStats.value.total + 1,
      unresolved: errorStats.value.unresolved + (resolvedErrors.value.has(error.id) ? 0 : 1),
      byType: {
        ...errorStats.value.byType,
        [error.type]: (errorStats.value.byType[error.type] || 0) + 1
      },
      byContext: {
        ...errorStats.value.byContext,
        [error.context || 'general']: (errorStats.value.byContext[error.context || 'general'] || 0) + 1
      },
      bySeverity: {
        ...errorStats.value.bySeverity,
        [severity]: (errorStats.value.bySeverity[severity] || 0) + 1
      }
    };
  };

  /**
   * Автоматическое разрешение временных ошибок
   */
  const setupAutoResolution = (error: AppError) => {
    // Автоматически разрешаем предупреждения через 30 секунд
    if (error.type === 'warning' && !error.context?.includes('auth')) {
      const timeout = error.metadata?.timeout || 30000;

      logger.debug('Настраиваем автоматическое разрешение ошибки', {
        id: error.id,
        timeout,
        type: error.type
      });

      setTimeout(() => {
        if (!resolvedErrors.value.has(error.id)) {
          markAsResolved(error.id, 'auto-resolved');
          logger.info('Ошибка автоматически разрешена', { id: error.id });
        }
      }, timeout);
    }

    // Критические ошибки требуют внимания пользователя
    if (error.type === 'critical' && error.metadata?.userActionRequired) {
      logger.warn('Критическая ошибка требует внимания пользователя', {
        id: error.id,
        message: error.message
      });
    }
  };

  // ==================== ОСНОВНЫЕ ДЕЙСТВИЯ ====================
  /**
   * Добавление ошибки
   * @param message - Сообщение об ошибке
   * @param type - Тип ошибки
   * @param context - Контекст ошибки
   * @param details - Детали ошибки
   * @param metadata - Метаданные ошибки
   * @returns ID созданной ошибки
   */
  const addError = (
    message: string,
    type: AppError['type'] = 'error',
    context?: string,
    details?: unknown,
    metadata?: {
      autoResolve?: boolean;
      timeout?: number;
      category?: string;
      retryable?: boolean;
      userActionRequired?: boolean;
    }
  ): string => {
    try {
      const error: AppError = {
        id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        message,
        timestamp: new Date(),
        type,
        context,
        details,
        metadata
      };

      logger.info('Добавляем ошибку', {
        id: error.id,
        message,
        type,
        context,
        severity: determineSeverity(error)
      });

      errors.value.push(error);
      categorizeError(error);
      setupAutoResolution(error);

      // Логирование в зависимости от типа ошибки
      const logMethod = type === 'critical' ? 'error' :
        type === 'error' ? 'error' :
          type === 'warning' ? 'warn' : 'info';

      logger[logMethod]('Ошибка зарегистрирована', {
        id: error.id,
        message,
        context,
        type,
        severity: determineSeverity(error),
        category: metadata?.category
      });

      // Автоматическое разрешение, если указано
      if (metadata?.autoResolve) {
        const timeout = metadata.timeout || 10000;
        setTimeout(() => {
          markAsResolved(error.id, 'auto-resolved');
          logger.debug('Ошибка автоматически разрешена по таймауту', { id: error.id });
        }, timeout);
      }

      return error.id;
    } catch (error) {
      logger.error('Ошибка при добавлении ошибки в стор', { error });
      throw error;
    }
  };

  /**
   * Отметить ошибку как разрешенную
   * @param id - ID ошибки
   * @param resolution - Способ разрешения
   */
  const markAsResolved = (id: string, resolution: ErrorResolution = 'manual') => {
    if (!resolvedErrors.value.has(id)) {
      resolvedErrors.value.add(id);

      // Обновляем статистику
      errorStats.value.unresolved = Math.max(0, errorStats.value.unresolved - 1);

      logger.info('Ошибка отмечена как разрешенная', {
        id,
        resolution,
        unresolvedCount: errorStats.value.unresolved
      });
    }
  };

  /**
   * Удаление ошибки
   * @param id - ID ошибки
   */
  const removeError = (id: string) => {
    const index = errors.value.findIndex(error => error.id === id);
    if (index > -1) {
      const wasResolved = resolvedErrors.value.has(id);
      errors.value.splice(index, 1);
      resolvedErrors.value.delete(id);

      // Обновляем статистику
      errorStats.value.total = Math.max(0, errorStats.value.total - 1);
      if (!wasResolved) {
        errorStats.value.unresolved = Math.max(0, errorStats.value.unresolved - 1);
      }

      logger.debug('Ошибка удалена', {
        id,
        wasResolved,
        totalErrors: errorStats.value.total
      });
    }
  };

  /**
   * Очистка всех ошибок
   */
  const clearErrors = () => {
    const count = errors.value.length;
    const unresolved = unresolvedCount.value;

    logger.info('Очищаем все ошибки', {
      total: count,
      unresolved
    });

    errors.value = [];
    resolvedErrors.value.clear();
    errorCategories.value = {};
    errorStats.value = {
      total: 0,
      unresolved: 0,
      byType: { critical: 0, error: 0, warning: 0, info: 0 },
      byContext: {},
      bySeverity: { high: 0, medium: 0, low: 0 }
    };

    logger.info('Все ошибки очищены', { cleared: count });
  };

  /**
   * Очистка ошибок по контексту
   * @param context - Контекст ошибок
   */
  const clearErrorsByContext = (context: string) => {
    const initialCount = errors.value.length;
    const toRemove = errors.value.filter(error => error.context === context);

    errors.value = errors.value.filter(error => error.context !== context);

    // Удаляем из разрешенных
    toRemove.forEach(error => resolvedErrors.value.delete(error.id));

    const removedCount = initialCount - errors.value.length;

    if (removedCount > 0) {
      logger.info('Ошибки очищены по контексту', {
        context,
        count: removedCount
      });
    }
  };

  /**
   * Очистка ошибок по типу
   * @param type - Тип ошибок
   */
  const clearErrorsByType = (type: AppError['type']) => {
    const initialCount = errors.value.length;
    const toRemove = errors.value.filter(error => error.type === type);

    errors.value = errors.value.filter(error => error.type !== type);

    // Удаляем из разрешенных
    toRemove.forEach(error => resolvedErrors.value.delete(error.id));

    const removedCount = initialCount - errors.value.length;

    if (removedCount > 0) {
      logger.info('Ошибки очищены по типу', {
        type,
        count: removedCount
      });
    }
  };

  /**
   * Фильтрация ошибок
   * @param filter - Фильтр для поиска
   * @returns Отфильтрованные ошибки
   */
  const filterErrors = (filter: ErrorFilter) => {
    const filtered = activeErrors.value.filter(error => {
      if (filter.context && error.context !== filter.context) return false;
      if (filter.type && error.type !== filter.type) return false;
      if (filter.startDate && error.timestamp < filter.startDate) return false;
      if (filter.endDate && error.timestamp > filter.endDate) return false;
      if (filter.severity && determineSeverity(error) !== filter.severity) return false;
      return true;
    });

    logger.debug('Ошибки отфильтрованы', {
      filter,
      count: filtered.length
    });

    return filtered;
  };

  /**
   * Получение аналитических данных об ошибках
   * @returns Аналитические данные
   */
  const getErrorInsights = () => {
    const insights = {
      mostCommonContext: Object.entries(errorCategories.value)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
      errorRate: errors.value.length / (Date.now() - (errors.value[0]?.timestamp.getTime() || Date.now())) * 1000,
      resolutionRate: resolvedErrors.value.size / Math.max(errors.value.length, 1),
      trends: {
        daily: errorStats.value.total / Math.max((Date.now() - (errors.value[0]?.timestamp.getTime() || Date.now())) / (24 * 60 * 60 * 1000), 1),
        weekly: errorStats.value.total / Math.max((Date.now() - (errors.value[0]?.timestamp.getTime() || Date.now())) / (7 * 24 * 60 * 60 * 1000), 1),
        monthly: errorStats.value.total / Math.max((Date.now() - (errors.value[0]?.timestamp.getTime() || Date.now())) / (30 * 24 * 60 * 60 * 1000), 1)
      }
    };

    logger.debug('Аналитика ошибок получена', insights);
    return insights;
  };

  /**
   * Получение статистики ошибок
   * @returns Статистика ошибок
   */
  const getErrorStats = (): ErrorStats => {
    logger.debug('Статистика ошибок запрошена', errorStats.value);
    return { ...errorStats.value };
  };

  // ==================== АВТОМАТИЧЕСКАЯ ОЧИСТКА ====================
  /**
   * Автоматическая очистка старых ошибок
   */
  const cleanupOldErrors = () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 час
    const oldErrors = errors.value.filter(
      error => error.timestamp.getTime() < oneHourAgo
    );

    if (oldErrors.length > 0) {
      const resolvedOld = oldErrors.filter(error => resolvedErrors.value.has(error.id));
      const unresolvedOld = oldErrors.filter(error => !resolvedErrors.value.has(error.id));

      // Удаляем только разрешенные старые ошибки
      errors.value = errors.value.filter(error => !resolvedOld.includes(error));
      resolvedOld.forEach(error => resolvedErrors.value.delete(error.id));

      logger.info('Очищены старые разрешенные ошибки', {
        totalCleaned: resolvedOld.length,
        unresolvedRemaining: unresolvedOld.length,
        totalRemaining: errors.value.length
      });
    }
  };

  // Наблюдатель за количеством ошибок
  watch(errors, (newErrors) => {
    // Автоматическая очистка при превышении лимита
    if (newErrors.length > 200) {
      const toRemove = newErrors.slice(0, 100);
      errors.value = newErrors.slice(100);
      toRemove.forEach(error => resolvedErrors.value.delete(error.id));

      logger.warn('Автоматически очищены старые ошибки', {
        removed: 100,
        remaining: errors.value.length
      });
    }
  }, { deep: true });

  // Периодическая очистка старых разрешенных ошибок (каждый час)
  const cleanupInterval = setInterval(() => {
    cleanupOldErrors();
  }, 60 * 60 * 1000); // Каждый час

  // Очистка интервала при размонтировании
  onUnmounted(() => {
    clearInterval(cleanupInterval);
    logger.debug('Интервал очистки ошибок остановлен');
  });

  return {
    // ==================== СОСТОЯНИЕ ====================
    errors: computed(() => errors.value),
    activeErrors,
    errorCategories: computed(() => errorCategories.value),
    errorStats: computed(() => errorStats.value),

    // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
    hasErrors,
    latestError,
    errorCount,
    unresolvedCount,
    errorsBySeverity,

    // Методы для фильтрации
    errorsByType: (type: AppError['type']) =>
      activeErrors.value.filter(error => error.type === type),
    errorsByContext: (context: string) =>
      activeErrors.value.filter(error => error.context === context),

    // ==================== ДЕЙСТВИЯ ====================
    addError,
    removeError,
    markAsResolved,
    clearErrors,
    clearErrorsByContext,
    clearErrorsByType,
    filterErrors,
    getErrorInsights,
    getErrorStats,
    cleanupOldErrors
  };
});
