/**
 * Интерсептор для обработки ошибок
 */

import type { AxiosResponse, AxiosError } from 'axios';
import { ApiErrorHandler } from '../api-error.handler';
import { logger } from '@/core/services/logger/logger.service';

export class ErrorInterceptor {
  private readonly logger = logger.create('ErrorInterceptor');

  onResponse(response: AxiosResponse): AxiosResponse {
    // Проверяем статус ответа даже при успешном HTTP коде
    if (response.data?.status === 'error') {
      this.logger.warn('API returned error status in successful response', {
        url: response.config.url,
        message: response.data.message
      });
    }

    return response;
  }

  onError(error: AxiosError): Promise<never> {
    const config = error.config;

    // Логирование ошибки
    this.logger.error('Request failed', {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      code: error.code,
      message: error.message
    });

    // Преобразуем ошибку в формат HttpError
    const httpError = this.transformToHttpError(error);

    // Обработка ошибки через ApiErrorHandler
    ApiErrorHandler.handle(httpError, config?.url);

    return Promise.reject(httpError);
  }

  private transformToHttpError(error: AxiosError): any {
    return {
      ...error,
      status: error.response?.status || 0,
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response,
      isAxiosError: error.isAxiosError
    };
  }
}

// Экспортируем синглтон
export const errorInterceptor = new ErrorInterceptor();
