/**
 * API клиент для проверки здоровья сервера
 */

import { httpClient } from '@/core/services/api/http-client.service';
import { ApiErrorHandler } from '@/core/services/api/api-error.handler';
import { logger } from '@/core/services/logger/logger.service';

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Array<{
    name: string;
    status: string;
    responseTime?: number;
  }>;
}

export class HealthApi {
  private readonly logger = logger.create('HealthApi');

  async check(): Promise<HealthCheckResponse> {
    try {
      this.logger.debug('Запрос проверки здоровья');

      const response = await httpClient.get<HealthCheckResponse>('/health', {
        requireAuth: false,
        timeout: 8000
      });

      this.logger.debug('Проверка здоровья завершена', {
        status: response.data.status,
        services: response.data.services?.length
      });

      return response.data;
    } catch (error: any) {
      ApiErrorHandler.handle(error, 'Health:Check');
      throw error;
    }
  }

  async quickCheck(): Promise<boolean> {
    try {
      this.logger.debug('Быстрая проверка здоровья');

      await httpClient.head('/health', {
        requireAuth: false,
        timeout: 3000
      });

      this.logger.debug('Быстрая проверка здоровья пройдена');
      return true;
    } catch (error: any) {
      this.logger.warn('Быстрая проверка здоровья не пройдена', { error: error.message });
      return false;
    }
  }
}

// Экспортируем синглтон
export const healthApi = new HealthApi();
