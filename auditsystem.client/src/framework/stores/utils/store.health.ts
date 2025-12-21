/**
 * Утилита для мониторинга здоровья сторов
 */

import type { Store } from 'pinia';
import { logger } from '@/core/services/logger/logger.service';

export interface StoreHealthMetrics {
  storeId: string;
  actionCount: number;
  errorCount: number;
  lastActionTime: Date | null;
  averageActionTime: number;
  isHealthy: boolean;
}

export class StoreHealthMonitor {
  private static instance: StoreHealthMonitor;
  private metrics = new Map<string, StoreHealthMetrics>();
  private logger = logger.create('StoreHealthMonitor');

  private constructor() { }

  static getInstance(): StoreHealthMonitor {
    if (!StoreHealthMonitor.instance) {
      StoreHealthMonitor.instance = new StoreHealthMonitor();
    }
    return StoreHealthMonitor.instance;
  }

  registerStore(store: Store): void {
    const storeId = store.$id;

    if (!this.metrics.has(storeId)) {
      this.metrics.set(storeId, {
        storeId,
        actionCount: 0,
        errorCount: 0,
        lastActionTime: null,
        averageActionTime: 0,
        isHealthy: true
      });

      this.logger.info('Store registered', { storeId });
    }
  }

  recordAction(storeId: string, duration: number): void {
    const metrics = this.metrics.get(storeId);
    if (!metrics) return;

    metrics.actionCount++;
    metrics.lastActionTime = new Date();

    // Обновляем среднее время
    metrics.averageActionTime =
      (metrics.averageActionTime * (metrics.actionCount - 1) + duration) / metrics.actionCount;
  }

  recordError(storeId: string): void {
    const metrics = this.metrics.get(storeId);
    if (!metrics) return;

    metrics.errorCount++;

    // Если много ошибок - помечаем как нездоровый
    if (metrics.errorCount > 10) {
      metrics.isHealthy = false;
      this.logger.warn('Store marked as unhealthy', { storeId, errorCount: metrics.errorCount });
    }
  }

  getMetrics(storeId?: string): StoreHealthMetrics | StoreHealthMetrics[] {
    if (storeId) {
      return this.metrics.get(storeId) || this.createEmptyMetrics(storeId);
    }

    return Array.from(this.metrics.values());
  }

  resetStore(storeId: string): void {
    const metrics = this.metrics.get(storeId);
    if (metrics) {
      metrics.actionCount = 0;
      metrics.errorCount = 0;
      metrics.lastActionTime = null;
      metrics.averageActionTime = 0;
      metrics.isHealthy = true;

      this.logger.info('Store metrics reset', { storeId });
    }
  }

  private createEmptyMetrics(storeId: string): StoreHealthMetrics {
    return {
      storeId,
      actionCount: 0,
      errorCount: 0,
      lastActionTime: null,
      averageActionTime: 0,
      isHealthy: true
    };
  }

  // Периодическая проверка здоровья
  startHealthChecks(intervalMs = 60000): () => void {
    const interval = setInterval(() => {
      this.checkHealth();
    }, intervalMs);

    this.logger.info('Store health checks started', { intervalMs });

    return () => {
      clearInterval(interval);
      this.logger.info('Store health checks stopped');
    };
  }

  private checkHealth(): void {
    const unhealthyStores = Array.from(this.metrics.values())
      .filter(metrics => !metrics.isHealthy);

    if (unhealthyStores.length > 0) {
      this.logger.warn('Unhealthy stores detected', {
        stores: unhealthyStores.map(s => s.storeId),
        count: unhealthyStores.length
      });
    }
  }
}

export const storeHealthMonitor = StoreHealthMonitor.getInstance();
