/**
 * Сервис проверки здоровья сервера
 */

import { healthApi } from '../api';
import { notificationService } from '@/core/services/notification/notification.service';
import { logger } from '@/core/services/logger/logger.service';

export interface HealthCheckConfig {
  checkInterval: number;
  retryInterval: number;
  maxRetries: number;
  timeout: number;
  notifyOnChange: boolean;
}

export type ServerStatus = 'checking' | 'online' | 'offline';

export type StatusChangeCallback = (status: ServerStatus) => void;

export class HealthService {
  private readonly logger = logger.create('HealthService');
  private config: HealthCheckConfig = {
    checkInterval: 30000,
    retryInterval: 10000,
    maxRetries: 5,
    timeout: 8000,
    notifyOnChange: true
  };

  private status: ServerStatus = 'checking';
  private lastCheck: Date | null = null;
  private lastResponseTime: number | null = null;
  private retryCount = 0;
  private checkIntervalId: NodeJS.Timeout | null = null;
  private lastOnline: Date | null = null;
  private statusChangeCallbacks: StatusChangeCallback[] = [];

  constructor(config?: Partial<HealthCheckConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  async check(): Promise<ServerStatus> {
    const previousStatus = this.status;
    this.status = 'checking';
    this.notifyStatusChange();
    this.lastCheck = new Date();

    try {
      const startTime = Date.now();
      const isHealthy = await healthApi.quickCheck();
      const responseTime = Date.now() - startTime;

      // Убеждаемся что это число
      this.lastResponseTime = Number.isFinite(responseTime) ? responseTime : null;

      this.status = isHealthy ? 'online' : 'offline';
      this.notifyStatusChange();

      if (isHealthy) {
        this.retryCount = 0;
        this.lastOnline = new Date();
        this.logger.info('Сервер доступен', { responseTime: this.lastResponseTime });
      } else {
        this.retryCount++;
        this.logger.warn('Сервер недоступен', { retryCount: this.retryCount });
      }

      if (this.config.notifyOnChange && previousStatus !== this.status) {
        this.notifyStatusChangeUI(previousStatus, this.status);
      }

      return this.status;
    } catch (error) {
      this.status = 'offline';
      this.notifyStatusChange();
      this.retryCount++;
      this.lastResponseTime = null;

      this.logger.error('Ошибка проверки здоровья', {
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        retryCount: this.retryCount
      });

      if (this.retryCount >= this.config.maxRetries) {
        this.logger.error('Достигнуто максимальное количество попыток, проверки приостановлены');
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

    this.checkIntervalId = setInterval(() => {
      if (this.retryCount < this.config.maxRetries) {
        this.check();
      }
    }, checkInterval);

    this.logger.info('Запущены периодические проверки здоровья', { interval: checkInterval });
  }

  stopPeriodicChecks(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
      this.logger.info('Периодические проверки здоровья остановлены');
    }
  }

  async manualCheck(): Promise<ServerStatus> {
    this.logger.info('Запрошена ручная проверка здоровья');
    this.retryCount = 0;
    return await this.check();
  }

  getStatus(): ServerStatus {
    return this.status;
  }

  getLastCheck(): Date | null {
    return this.lastCheck;
  }

  getLastResponseTime(): number | null {
    return this.lastResponseTime;
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

  onStatusChange(callback: StatusChangeCallback): { unsubscribe: () => void } {
    this.statusChangeCallbacks.push(callback);

    return {
      unsubscribe: () => {
        const index = this.statusChangeCallbacks.indexOf(callback);
        if (index > -1) {
          this.statusChangeCallbacks.splice(index, 1);
        }
      }
    };
  }

  private notifyStatusChange(): void {
    this.statusChangeCallbacks.forEach(callback => {
      try {
        callback(this.status);
      } catch (error) {
        this.logger.error('Ошибка в callback уведомления о статусе', { error });
      }
    });
  }

  private notifyStatusChangeUI(previous: ServerStatus, current: ServerStatus): void {
    if (previous === 'online' && current === 'offline') {
      notificationService.warning('Потеряно соединение с сервером', {
        title: 'Соединение',
        duration: 10000
      });
    } else if (previous === 'offline' && current === 'online') {
      notificationService.success('Соединение с сервером восстановлено', {
        title: 'Соединение',
        duration: 5000
      });
    }
  }

  updateConfig(config: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.debug('Конфигурация проверки здоровья обновлена', { config: this.config });
  }

  dispose(): void {
    this.stopPeriodicChecks();
    this.statusChangeCallbacks = [];
    this.logger.info('Сервис здоровья освобожден');
  }
}

// Экспортируем инстанс по умолчанию
export const healthService = new HealthService();
