// framework/stores/app.health.ts
import { logger } from '@/core/utils/logger';
import type {
  StoreHealthCheck,
  HealthMetrics,
  HealthReport
} from './types/health.types';

/**
 * Монитор здоровья сторов
 * Отслеживает состояние и производительность всех сторов приложения
 */
export class StoreHealthMonitor {
  private checks = new Map<string, StoreHealthCheck>();
  private lastFullCheck = 0;
  private readonly CHECK_INTERVAL = 30000; // 30 секунд
  private intervals = new Map<string, number>();

  /**
   * Регистрация стора для мониторинга
   * @param name - Имя стора
   * @param checkFn - Функция проверки здоровья
   * @param interval - Интервал проверки (мс)
   */
  registerStore(
    name: string,
    checkFn: () => Partial<StoreHealthCheck>,
    interval?: number
  ) {
    const checkInterval = interval || this.CHECK_INTERVAL;

    this.checks.set(name, {
      name,
      status: 'healthy',
      issues: [],
      lastChecked: Date.now(),
    });

    logger.info('Стор зарегистрирован для мониторинга здоровья', {
      store: name,
      checkInterval
    });

    // Периодическая проверка
    const intervalId = window.setInterval(() => {
      this.performCheck(name, checkFn);
    }, checkInterval);

    this.intervals.set(name, intervalId);

    // Немедленная первая проверка
    setTimeout(() => {
      this.performCheck(name, checkFn);
    }, 1000);
  }

  /**
   * Выполнение проверки здоровья
   * @param name - Имя стора
   * @param checkFn - Функция проверки
   */
  private performCheck(name: string, checkFn: () => Partial<StoreHealthCheck>) {
    try {
      const startTime = Date.now();
      const result = checkFn();
      const duration = Date.now() - startTime;

      const currentCheck = this.checks.get(name)!;
      const previousStatus = currentCheck.status;

      currentCheck.status = result.status || 'healthy';
      currentCheck.issues = result.issues || [];
      currentCheck.lastChecked = Date.now();
      currentCheck.metrics = {
        ...result.metrics,
        checkDuration: duration,
        lastUpdate: currentCheck.lastChecked
      };

      // Логируем изменение статуса
      if (previousStatus !== currentCheck.status) {
        logger.warn(`Статус здоровья стора изменился: ${name}`, {
          previous: previousStatus,
          current: currentCheck.status,
          issues: currentCheck.issues,
          duration
        });
      } else if (currentCheck.status !== 'healthy') {
        logger.debug(`Проблема со здоровьем стора: ${name}`, {
          status: currentCheck.status,
          issues: currentCheck.issues,
          duration
        });
      }

      // Детальное логирование для отладки
      if (import.meta.env.DEV) {
        logger.debug(`Проверка здоровья завершена: ${name}`, {
          status: currentCheck.status,
          duration,
          metrics: currentCheck.metrics
        });
      }
    } catch (error) {
      logger.error(`Ошибка при проверке здоровья стора: ${name}`, { error });

      // Обновляем статус при ошибке проверки
      const currentCheck = this.checks.get(name)!;
      currentCheck.status = 'unhealthy';
      currentCheck.issues = ['Ошибка при проверке здоровья'];
      currentCheck.lastChecked = Date.now();
    }
  }

  /**
   * Получение статуса всех сторов
   * @returns Массив проверок здоровья
   */
  getStatus(): StoreHealthCheck[] {
    const status = Array.from(this.checks.values());

    logger.debug('Текущий статус здоровья сторов', {
      totalStores: status.length,
      healthy: status.filter(s => s.status === 'healthy').length,
      degraded: status.filter(s => s.status === 'degraded').length,
      unhealthy: status.filter(s => s.status === 'unhealthy').length
    });

    return status;
  }

  /**
   * Получение полного отчета о здоровье системы
   * @returns Полный отчет о здоровье
   */
  getFullReport(): HealthReport {
    const checks = this.getStatus();
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }

    const recommendations: string[] = [];

    if (unhealthyCount > 0) {
      recommendations.push('Критические проблемы требуют немедленного внимания');
    }

    if (degradedCount > 0) {
      recommendations.push('Некоторые системы работают в деградированном режиме');
    }

    const report: HealthReport = {
      timestamp: Date.now(),
      overallStatus,
      checks,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      uptime: Date.now() - this.lastFullCheck
    };

    this.lastFullCheck = Date.now();

    logger.info('Полный отчет о здоровье системы сгенерирован', report);

    return report;
  }

  /**
   * Проверка здоровья всей системы
   * @returns Система здорова?
   */
  isSystemHealthy(): boolean {
    const allHealthy = Array.from(this.checks.values()).every(check =>
      check.status === 'healthy'
    );

    if (!allHealthy) {
      const unhealthyStores = Array.from(this.checks.values())
        .filter(c => c.status !== 'healthy')
        .map(c => `${c.name} (${c.status})`);

      logger.warn('Система не полностью здорова', {
        unhealthyStores,
        totalStores: this.checks.size
      });
    }

    return allHealthy;
  }

  /**
   * Получение метрик производительности
   * @returns Метрики производительности
   */
  getPerformanceMetrics(): Record<string, HealthMetrics> {
    const metrics: Record<string, HealthMetrics> = {};

    this.checks.forEach((check, name) => {
      metrics[name] = {
        memoryUsage: this.estimateMemoryUsage(check),
        storeSize: this.estimateStoreSize(check),
        updateFrequency: this.calculateUpdateFrequency(check),
        responseTime: this.getAverageResponseTime(check),
        errorRate: this.calculateErrorRate(check)
      };
    });

    logger.debug('Метрики производительности собраны', {
      stores: Object.keys(metrics),
      totalMetrics: Object.keys(metrics).length
    });

    return metrics;
  }

  /**
   * Остановка мониторинга для конкретного стора
   * @param name - Имя стора
   */
  unregisterStore(name: string) {
    const intervalId = this.intervals.get(name);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(name);
    }

    this.checks.delete(name);

    logger.info('Мониторинг здоровья остановлен для стора', { store: name });
  }

  /**
   * Остановка всего мониторинга
   */
  stopAllMonitoring() {
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });

    this.intervals.clear();
    this.checks.clear();

    logger.info('Весь мониторинг здоровья остановлен');
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

  private estimateMemoryUsage(check: StoreHealthCheck): number {
    // Оценка использования памяти на основе данных проверки
    return check.issues.length * 100 + (check.metrics ? Object.keys(check.metrics).length * 50 : 0);
  }

  private estimateStoreSize(check: StoreHealthCheck): number {
    // Оценка размера стора
    return JSON.stringify(check).length;
  }

  private calculateUpdateFrequency(check: StoreHealthCheck): number {
    const now = Date.now();
    const timeSinceLastCheck = now - check.lastChecked;
    return timeSinceLastCheck > 0 ? 1 / (timeSinceLastCheck / 1000) : 0;
  }

  private getAverageResponseTime(check: StoreHealthCheck): number {
    const duration = check.metrics?.checkDuration as number || 0;
    return duration;
  }

  private calculateErrorRate(check: StoreHealthCheck): number {
    return check.issues.length > 0 ? check.issues.length / 10 : 0;
  }
}

// Экспортируем синглтон монитора здоровья
export const storeHealthMonitor = new StoreHealthMonitor();
