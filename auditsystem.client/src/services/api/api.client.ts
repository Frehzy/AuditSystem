import { apiClient } from '@/core/services/api/api-client.service';
import { errorHandler } from '@/core/services/error/error-handler.service';
import { logger } from '@/core/utils/logger/logger';
import { APP_CONFIG } from '@/core/config/app.config';
import type { ApiResult } from '@/modules/auth/api/auth.types';
import type { ApiRequestConfig, RequestContext, RequestMetadata } from './api.types';

// Настройка базового API клиента
apiClient.setBaseUrl(APP_CONFIG.API.BASE_URL);

class ApiHelper {
  private readonly logger = logger.create('ApiHelper');

  /**
   * Универсальный обработчик API запросов
   */
  async makeRequest<T>(
    request: () => Promise<T>,
    context: RequestContext
  ): Promise<ApiResult<T>> {
    const startTime = performance.now();

    try {
      const data = await request();
      const duration = Math.round(performance.now() - startTime);

      context.metadata.duration = duration;

      this.logger.api(`Request completed successfully`, {
        url: context.metadata.url,
        duration: `${duration}ms`,
      });

      return { success: true, data };

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const handledError = errorHandler.handle(error, `api:${context.metadata.method}:${context.metadata.url}`);

      this.logger.api(`Request failed`, {
        url: context.metadata.url,
        duration: `${duration}ms`,
        error: handledError.message
      });

      return {
        success: false,
        error: handledError.message,
        status: handledError.status
      };
    }
  }

  /**
   * Проверка доступности сервера
   */
  async checkServerHealth(timeout?: number): Promise<boolean> {
    try {
      const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(timeout || 5000),
      });

      const isHealthy = response.status === 200;
      this.logger.debug('Health check completed', {
        status: response.status,
        healthy: isHealthy
      });

      return isHealthy;
    } catch (error) {
      this.logger.debug('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Получение базового URL API
   */
  getBaseURL(): string {
    return APP_CONFIG.API.BASE_URL;
  }

  /**
   * Создание контекста запроса
   */
  createRequestContext(url: string, method: string, config?: ApiRequestConfig): RequestContext {
    const metadata: RequestMetadata = {
      url,
      method,
      timestamp: new Date().toISOString()
    };

    return {
      metadata,
      config: {
        timeout: APP_CONFIG.API.TIMEOUT,
        retryAttempts: APP_CONFIG.API.MAX_RETRIES,
        retryDelay: APP_CONFIG.API.RETRY_DELAY,
        requireAuth: true,
        skipErrorHandler: false,
        ...config
      }
    };
  }

  /**
   * Установка заголовков авторизации
   */
  setAuthToken(token: string): void {
    apiClient.setAuthToken(token);
    this.logger.debug('Auth token set in API client');
  }

  /**
   * Очистка заголовков авторизации
   */
  clearAuthToken(): void {
    apiClient.clearAuthToken();
    this.logger.debug('Auth token cleared from API client');
  }
}

export const apiHelper = new ApiHelper();
