/**
 * Core store: Управление ошибками приложения
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { logger } from '@/core/services/logger/logger.service';
import type { AppError, ErrorFilter, ErrorResolution, ErrorStats } from './error.types';

export const useErrorStore = defineStore('error', () => {
  // State
  const errors = ref<AppError[]>([]);
  const resolvedErrorIds = ref<Set<string>>(new Set());
  const errorStats = ref<ErrorStats>({
    total: 0,
    unresolved: 0,
    byType: { critical: 0, error: 0, warning: 0, info: 0 },
    byContext: {},
    bySeverity: { high: 0, medium: 0, low: 0 }
  });

  // Log entries для UI
  const logEntries = ref<any[]>([]);

  // Getters
  const hasErrors = computed(() => errors.value.length > 0);
  const latestError = computed(() => errors.value[errors.value.length - 1]);
  const errorCount = computed(() => errors.value.length);
  const unresolvedCount = computed(() => errorStats.value.unresolved);

  const activeErrors = computed(() =>
    errors.value.filter(error => !resolvedErrorIds.value.has(error.id))
  );

  // Actions
  const addError = (
    message: string,
    type: AppError['type'] = 'error',
    context?: string,
    details?: unknown,
    metadata?: AppError['metadata']
  ): string => {
    const error: AppError = {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      message,
      timestamp: new Date(),
      type,
      context,
      details,
      metadata
    };

    errors.value.push(error);
    updateStats();

    // Автоматическое разрешение для warning через 30 секунд
    if (type === 'warning' && metadata?.autoResolve !== false) {
      setTimeout(() => {
        markAsResolved(error.id, 'auto-resolved');
      }, metadata?.timeout || 30000);
    }

    // Используем правильные методы логгера
    if (type === 'error' || type === 'critical') {
      logger.error(`Error added: ${message}`, {
        id: error.id,
        context,
        type
      });
    } else if (type === 'warning') {
      logger.warn(`Warning added: ${message}`, {
        id: error.id,
        context,
        type
      });
    } else {
      logger.info(`Info added: ${message}`, {
        id: error.id,
        context,
        type
      });
    }

    return error.id;
  };

  // Метод для добавления логов в UI
  const addLogEntry = (logEntry: any) => {
    logEntries.value.push(logEntry);

    // Ограничиваем размер
    if (logEntries.value.length > 100) {
      logEntries.value = logEntries.value.slice(-100);
    }
  };

  const markAsResolved = (id: string, resolution: ErrorResolution = 'manual') => {
    if (!resolvedErrorIds.value.has(id)) {
      resolvedErrorIds.value.add(id);
      updateStats();

      logger.info(`Error marked as resolved: ${id}`, { resolution });
    }
  };

  const removeError = (id: string) => {
    const index = errors.value.findIndex(error => error.id === id);
    if (index > -1) {
      errors.value.splice(index, 1);
      resolvedErrorIds.value.delete(id);
      updateStats();

      logger.debug(`Error removed: ${id}`);
    }
  };

  const clearErrors = (filter?: ErrorFilter) => {
    if (!filter) {
      errors.value = [];
      resolvedErrorIds.value.clear();
      updateStats();
      logger.info('All errors cleared');
      return;
    }

    const initialCount = errors.value.length;
    errors.value = errors.value.filter(error => !matchesFilter(error, filter));

    // Обновляем resolved ids
    errors.value.forEach(error => resolvedErrorIds.value.delete(error.id));

    updateStats();

    if (initialCount !== errors.value.length) {
      logger.info('Errors cleared by filter', {
        filter,
        cleared: initialCount - errors.value.length,
        remaining: errors.value.length
      });
    }
  };

  const filterErrors = (filter: ErrorFilter): AppError[] => {
    return activeErrors.value.filter(error => matchesFilter(error, filter));
  };

  const getErrorInsights = () => {
    const now = Date.now();
    const oldestError = errors.value[0]?.timestamp.getTime() || now;
    const timeRange = Math.max(now - oldestError, 1);

    return {
      mostCommonContext: Object.entries(errorStats.value.byContext)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none',
      errorRate: errors.value.length / (timeRange / 1000),
      resolutionRate: resolvedErrorIds.value.size / Math.max(errors.value.length, 1),
      trends: {
        daily: errorStats.value.total / Math.max(timeRange / (24 * 60 * 60 * 1000), 1),
        weekly: errorStats.value.total / Math.max(timeRange / (7 * 24 * 60 * 60 * 1000), 1),
        monthly: errorStats.value.total / Math.max(timeRange / (30 * 24 * 60 * 60 * 1000), 1)
      }
    };
  };

  // Helper methods
  const updateStats = () => {
    const stats: ErrorStats = {
      total: errors.value.length,
      unresolved: activeErrors.value.length,
      byType: { critical: 0, error: 0, warning: 0, info: 0 },
      byContext: {},
      bySeverity: { high: 0, medium: 0, low: 0 }
    };

    activeErrors.value.forEach(error => {
      // По типу
      stats.byType[error.type]++;

      // По контексту
      const context = error.context || 'general';
      stats.byContext[context] = (stats.byContext[context] || 0) + 1;

      // По важности
      const severity = determineSeverity(error);
      stats.bySeverity[severity]++;
    });

    errorStats.value = stats;
  };

  const determineSeverity = (error: AppError): 'high' | 'medium' | 'low' => {
    if (error.type === 'critical') return 'high';
    if (error.type === 'error') return 'medium';
    return 'low';
  };

  const matchesFilter = (error: AppError, filter: ErrorFilter): boolean => {
    if (filter.context && error.context !== filter.context) return false;
    if (filter.type && error.type !== filter.type) return false;
    if (filter.severity && determineSeverity(error) !== filter.severity) return false;
    if (filter.startDate && error.timestamp < filter.startDate) return false;
    if (filter.endDate && error.timestamp > filter.endDate) return false;
    if (filter.resolved !== undefined) {
      const isResolved = resolvedErrorIds.value.has(error.id);
      if (filter.resolved !== isResolved) return false;
    }
    return true;
  };

  // Автоматическая очистка старых ошибок
  watch(errors, (newErrors) => {
    // Очистка если больше 1000 ошибок
    if (newErrors.length > 1000) {
      const toRemove = newErrors.slice(0, 500);
      errors.value = newErrors.slice(500);
      toRemove.forEach(error => resolvedErrorIds.value.delete(error.id));
      updateStats();

      logger.warn('Old errors auto-cleared', {
        removed: 500,
        remaining: errors.value.length
      });
    }

    // Очистка старых разрешенных ошибок (старше 24 часов)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const oldResolved = newErrors.filter(
      error => resolvedErrorIds.value.has(error.id) && error.timestamp.getTime() < oneDayAgo
    );

    if (oldResolved.length > 0) {
      errors.value = errors.value.filter(error => !oldResolved.includes(error));
      oldResolved.forEach(error => resolvedErrorIds.value.delete(error.id));
      updateStats();

      logger.debug('Old resolved errors cleaned', {
        count: oldResolved.length,
        remaining: errors.value.length
      });
    }
  }, { deep: true });

  return {
    // State
    errors: computed(() => errors.value),
    stats: computed(() => errorStats.value),
    logEntries: computed(() => logEntries.value),

    // Getters
    hasErrors,
    latestError,
    errorCount,
    unresolvedCount,
    activeErrors,

    // Actions
    addError,
    addLogEntry,
    markAsResolved,
    removeError,
    clearErrors,
    filterErrors,
    getErrorInsights
  };
});
