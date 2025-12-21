/**
 * Обработчик ошибок API
 */

import { type HttpError } from '@/core/types/api.types';
import { notificationService } from '@/core/services/notification/notification.service';
import { logger } from '@/core/services/logger/logger.service';

export class ApiErrorHandler {
  static handle(error: HttpError, context?: string): void {
    const errorContext = context || 'API';

    // Логируем ошибку
    logger.error(`${errorContext} Error`, {
      message: error.message,
      code: error.code,
      status: error.status,
      url: error.config?.url
    });

    // Преобразуем ошибку в пользовательское сообщение
    const userMessage = this.getUserFriendlyMessage(error);

    // Показываем уведомление пользователю
    if (this.shouldShowNotification(error)) {
      notificationService.error(userMessage, {
        title: 'Ошибка',
        duration: 8000
      });
    }
  }

  private static getUserFriendlyMessage(error: HttpError): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    switch (error.status) {
      case 400:
        return 'Некорректный запрос';
      case 401:
        return 'Требуется авторизация';
      case 403:
        return 'Доступ запрещен';
      case 404:
        return 'Ресурс не найден';
      case 422:
        return 'Ошибка валидации данных';
      case 429:
        return 'Слишком много запросов. Попробуйте позже';
      case 500:
        return 'Внутренняя ошибка сервера';
      case 502:
      case 503:
      case 504:
        return 'Сервер временно недоступен';
      default:
        if (error.message.includes('Network Error')) {
          return 'Ошибка сети. Проверьте подключение к интернету';
        }
        if (error.message.includes('timeout')) {
          return 'Превышено время ожидания ответа от сервера';
        }
        return 'Произошла ошибка при выполнении запроса';
    }
  }

  private static shouldShowNotification(error: HttpError): boolean {
    // Не показываем уведомления для 401 ошибок (их обрабатывает auth)
    if (error.status === 401) return false;

    // Не показывать для отмененных запросов
    if (error.code === 'ERR_CANCELED') return false;

    // Показывать для клиентских ошибок (4xx) и серверных (5xx)
    return error.status !== undefined;
  }

  static isNetworkError(error: HttpError): boolean {
    return !error.status && error.message.includes('Network');
  }

  static isTimeoutError(error: HttpError): boolean {
    return error.code === 'ECONNABORTED' || error.message.includes('timeout');
  }

  static isServerError(error: HttpError): boolean {
    return error.status !== undefined && error.status >= 500;
  }

  static isClientError(error: HttpError): boolean {
    return error.status !== undefined && error.status >= 400 && error.status < 500;
  }
}
