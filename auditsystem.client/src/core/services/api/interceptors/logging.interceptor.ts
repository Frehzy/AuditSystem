/**
 * Интерсептор для логирования запросов и ответов
 */

import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { APP_CONFIG } from '@/core/config/app.config';
import { logger } from '@/core/services/logger/logger.service';

export class LoggingInterceptor {
  private readonly logger = logger.create('LoggingInterceptor');

  onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    if (APP_CONFIG.FEATURES.DEBUG_LOGS) {
      const sanitizedConfig = this.sanitizeConfig(config);

      this.logger.debug('Request initiated', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: sanitizedConfig.headers,
        data: sanitizedConfig.data,
        timeout: config.timeout
      });
    }

    // Добавляем метку времени для измерения производительности
    (config as any)._startTime = Date.now();

    return config;
  }

  onResponse(response: AxiosResponse): AxiosResponse {
    if (APP_CONFIG.FEATURES.DEBUG_LOGS) {
      const config = response.config as any;
      const duration = Date.now() - (config._startTime || Date.now());

      this.logger.debug('Response received', {
        status: response.status,
        statusText: response.statusText,
        url: config.url,
        duration: `${duration}ms`,
        data: this.sanitizeResponseData(response.data)
      });
    }

    return response;
  }

  onError(error: any): Promise<never> {
    const config = error.config;
    const duration = config?._startTime ? Date.now() - config._startTime : 0;

    this.logger.error('Request failed', {
      url: config?.url,
      method: config?.method?.toUpperCase(),
      status: error.response?.status,
      duration: `${duration}ms`,
      error: error.message,
      code: error.code
    });

    return Promise.reject(error);
  }

  private sanitizeConfig(config: InternalAxiosRequestConfig): any {
    const sanitized = { ...config };

    // Убираем чувствительные данные из логирования
    if (sanitized.headers?.Authorization) {
      sanitized.headers.Authorization = 'Bearer [REDACTED]';
    }

    if (sanitized.data?.password) {
      sanitized.data = { ...sanitized.data, password: '[REDACTED]' };
    }

    if (sanitized.data?.token) {
      sanitized.data = { ...sanitized.data, token: '[REDACTED]' };
    }

    return sanitized;
  }

  private sanitizeResponseData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };

    if (sanitized.token) {
      sanitized.token = '[REDACTED]';
    }

    if (sanitized.refreshToken) {
      sanitized.refreshToken = '[REDACTED]';
    }

    if (sanitized.password) {
      sanitized.password = '[REDACTED]';
    }

    // Рекурсивно обрабатываем вложенные объекты
    if (Array.isArray(sanitized)) {
      return sanitized.map(item => this.sanitizeResponseData(item));
    }

    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeResponseData(sanitized[key]);
      }
    }

    return sanitized;
  }
}

// Экспортируем синглтон
export const loggingInterceptor = new LoggingInterceptor();
