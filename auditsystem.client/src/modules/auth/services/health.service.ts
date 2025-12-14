// src/modules/auth/services/health.service.ts
import { healthApi } from '../api';
import { logger } from '@/core/utils/logger';
import { notificationService } from '@/core/services/ui/notification.service';
import type { HealthCheckConfig, ServerStatus } from '../types';

class HealthService {
  private readonly logger = logger.create('HealthService');
  private config: HealthCheckConfig = {
    checkInterval: 30000,
    retryInterval: 10000,
    maxRetries: 5,
    timeout: 8000,
    notifyOnChange: true,
  };

  private status: ServerStatus = 'checking';
  private lastCheck: Date | null = null;
  private retryCount = 0;
  private checkIntervalId: number | null = null;
  private lastOnline: Date | null = null;

  constructor(config?: Partial<HealthCheckConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  async check(): Promise<ServerStatus> {
    const previousStatus = this.status;
    this.status = 'checking';
    this.lastCheck = new Date();

    try {
      const isHealthy = await healthApi.quickCheck();

      this.status = isHealthy ? 'online' : 'offline';

      if (isHealthy) {
        this.retryCount = 0;
        this.lastOnline = new Date();
        this.logger.info('Server is online');
      } else {
        this.retryCount++;
        this.logger.warn('Server is offline', { retryCount: this.retryCount });
      }

      if (this.config.notifyOnChange && previousStatus !== this.status) {
        this.notifyStatusChange(previousStatus, this.status);
      }

      return this.status;
    } catch (error) {
      this.status = 'offline';
      this.retryCount++;

      this.logger.error('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: this.retryCount
      });

      if (this.retryCount >= this.config.maxRetries) {
        this.logger.error('Max retries reached, pausing health checks');
        this.stopPeriodicChecks();
      }

      return this.status;
    }
  }

  startPeriodicChecks(interval?: number): void {
    this.stopPeriodicChecks();

    const checkInterval = interval || this.config.checkInterval;

    // Немедленная первая проверка
    this.check();

    this.checkIntervalId = window.setInterval(() => {
      if (this.retryCount < this.config.maxRetries) {
        this.check();
      }
    }, checkInterval);

    this.logger.info('Periodic health checks started', { interval: checkInterval });
  }

  stopPeriodicChecks(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
      this.logger.info('Periodic health checks stopped');
    }
  }

  async manualCheck(): Promise<ServerStatus> {
    this.logger.info('Manual health check requested');
    this.retryCount = 0;
    return await this.check();
  }

  getStatus(): ServerStatus {
    return this.status;
  }

  getLastCheck(): Date | null {
    return this.lastCheck;
  }

  getLastOnline(): Date | null {
    return this.lastOnline;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  isOnline(): boolean {
    return this.status === 'online';
  }

  private notifyStatusChange(previous: ServerStatus, current: ServerStatus): void {
    if (previous === 'online' && current === 'offline') {
      notificationService.warning('Потеряно соединение с сервером');
    } else if (previous === 'offline' && current === 'online') {
      notificationService.success('Соединение с сервером восстановлено');
    }
  }

  updateConfig(config: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.debug('Health check config updated', { config: this.config });
  }

  dispose(): void {
    this.stopPeriodicChecks();
    this.logger.info('Health service disposed');
  }
}

// Экспортируем инстанс по умолчанию
export const healthService = new HealthService();
