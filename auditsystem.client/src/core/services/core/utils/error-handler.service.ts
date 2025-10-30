// src/core/services/core/utils/error-handler.service.ts
import { logger } from '@/core/utils/logger';
import { notificationService } from '../ui/notification.service';

interface ErrorDetails {
  code?: string;
  status?: number;
  url?: string;
  method?: string;
  backendErrors?: string[];
  backendMessage?: string;
  originalError?: unknown;
}

interface AppError extends Error {
  code?: string;
  status?: number;
  details?: ErrorDetails;
}

class ErrorHandlerService {
  private readonly logger = logger.create('ErrorHandler');
  private readonly errorMessages: Record<string, string> = {
    // Network errors
    'NETWORK_ERROR': 'Ошибка сети. Проверьте подключение к интернету.',
    'NETWORK_TIMEOUT': 'Сервер не отвечает. Проверьте подключение к сети.',
    'REQUEST_ABORTED': 'Запрос был отменен.',

    // Auth errors
    'AUTHENTICATION_FAILED': 'Ошибка аутентификации. Проверьте логин и пароль.',
    'UNAUTHORIZED': 'Доступ запрещен. Требуется авторизация.',
    'FORBIDDEN': 'У вас недостаточно прав для выполнения этого действия.',
    'TOKEN_EXPIRED': 'Сессия истекла. Пожалуйста, войдите снова.',
    'TOKEN_REFRESH_FAILED': 'Не удалось обновить сессию.',

    // Validation errors
    'VALIDATION_ERROR': 'Ошибка валидации данных.',
    'INVALID_CREDENTIALS': 'Неверные учетные данные.',

    // Server errors
    'SERVER_ERROR': 'Ошибка сервера. Пожалуйста, попробуйте позже.',
    'SERVICE_UNAVAILABLE': 'Сервис временно недоступен.',
    'BAD_GATEWAY': 'Проблема с подключением к серверу.',

    // Client errors
    'INVALID_RESPONSE_FORMAT': 'Некорректный ответ от сервера.',
    'BASE_URL_NOT_SET': 'Базовая ссылка API не настроена.',
    'INVALID_ENDPOINT': 'Некорректный эндпоинт.',

    // Default
    'UNKNOWN_ERROR': 'Произошла неизвестная ошибка.',
  };

  create(message: string, code?: string, details?: ErrorDetails): AppError {
    const error = new Error(message) as AppError;
    error.code = code;
    error.details = details;

    if (code && this.errorMessages[code]) {
      error.message = this.errorMessages[code];
    }

    return error;
  }

  handle(error: unknown, context?: string): AppError {
    const appError = this.normalizeError(error);
    this.logError(appError, context);

    // Показываем уведомление пользователю только для определенных типов ошибок
    if (this.shouldShowNotification(appError)) {
      this.showNotification(appError);
    }

    return appError;
  }

  private normalizeError(error: unknown): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      const code = this.extractErrorCode(error);
      const status = this.extractHttpStatus(error);

      return this.create(
        error.message,
        code,
        {
          code,
          status,
          originalError: error,
        }
      );
    }

    if (typeof error === 'string') {
      return this.create(error, 'UNKNOWN_ERROR');
    }

    return this.create('Неизвестная ошибка', 'UNKNOWN_ERROR', {
      originalError: error,
    });
  }

  private isAppError(error: unknown): error is AppError {
    return error instanceof Error &&
      'code' in error &&
      typeof (error as AppError).code === 'string';
  }

  private extractErrorCode(error: Error): string {
    // Извлекаем код из сообщения об ошибке
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('timeout')) {
      return 'NETWORK_TIMEOUT';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'UNAUTHORIZED';
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return 'FORBIDDEN';
    }
    if (message.includes('validation')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('server') || message.includes('500')) {
      return 'SERVER_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  private extractHttpStatus(error: Error): number | undefined {
    const statusMatch = error.message.match(/\b(\d{3})\b/);
    if (statusMatch) {
      return parseInt(statusMatch[1], 10);
    }

    // Проверяем свойства ошибки
    const errorWithStatus = error as { status?: number };
    if (errorWithStatus.status) {
      return errorWithStatus.status;
    }

    return undefined;
  }

  private logError(error: AppError, context?: string): void {
    const logContext = context ? `[${context}]` : '';
    const logDetails = {
      code: error.code,
      status: error.status,
      message: error.message,
      details: error.details,
      stack: error.stack,
    };

    if (this.isAuthError(error)) {
      this.logger.auth(`Auth error ${logContext}`, logDetails);
    } else if (this.isNetworkError(error)) {
      this.logger.network(`Network error ${logContext}`, logDetails);
    } else if (this.isServerError(error)) {
      this.logger.error(`Server error ${logContext}`, logDetails);
    } else {
      this.logger.error(`Error ${logContext}`, logDetails);
    }
  }

  private shouldShowNotification(error: AppError): boolean {
    // Не показываем уведомления для этих типов ошибок
    const silentErrors = [
      'REQUEST_ABORTED',
      'UNAUTHORIZED', // обрабатывается отдельно в компонентах
      'TOKEN_EXPIRED', // обрабатывается отдельно
    ];

    return !silentErrors.includes(error.code || '');
  }

  private showNotification(error: AppError): void {
    let type: 'error' | 'warning' | 'info' = 'error';
    let title = 'Ошибка';

    // Определяем тип уведомления по коду ошибки
    if (error.code === 'NETWORK_ERROR' || error.code === 'NETWORK_TIMEOUT') {
      type = 'warning';
      title = 'Проблемы с сетью';
    } else if (error.code === 'VALIDATION_ERROR') {
      type = 'warning';
      title = 'Ошибка в данных';
    }

    // Используем метод notificationService в соответствии с его API
    if (type === 'error') {
      notificationService.error(error.message, { title });
    } else if (type === 'warning') {
      notificationService.warning(error.message, { title });
    } else {
      notificationService.info(error.message, { title });
    }
  }

  isAuthError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    const authCodes = [
      'AUTHENTICATION_FAILED',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'TOKEN_EXPIRED',
      'TOKEN_REFRESH_FAILED',
    ];

    return authCodes.includes(appError.code || '');
  }

  isNetworkError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    const networkCodes = [
      'NETWORK_ERROR',
      'NETWORK_TIMEOUT',
      'REQUEST_ABORTED',
    ];

    return networkCodes.includes(appError.code || '');
  }

  isServerError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    const serverCodes = [
      'SERVER_ERROR',
      'SERVICE_UNAVAILABLE',
      'BAD_GATEWAY',
    ];

    return serverCodes.includes(appError.code || '') ||
      (appError.status !== undefined && appError.status >= 500);
  }

  isValidationError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    return appError.code === 'VALIDATION_ERROR' ||
      (appError.status !== undefined && appError.status === 422);
  }

  // Метод для извлечения ошибок валидации из ответа бэкенда
  extractValidationErrors(error: unknown): Record<string, string[]> {
    const appError = this.normalizeError(error);

    if (appError.details?.backendErrors) {
      // Если бэкенд возвращает массив ошибок
      return { general: appError.details.backendErrors };
    }

    // TODO: Добавить парсинг структурированных ошибок валидации
    // когда бэкенд будет возвращать их в формате { field: ['error1', 'error2'] }

    return {};
  }

  // Метод для получения пользовательского сообщения об ошибке
  getUserMessage(error: unknown): string {
    const appError = this.normalizeError(error);
    return appError.message;
  }

  // Метод для логирования ошибок без показа уведомлений
  logOnly(error: unknown, context?: string): void {
    const appError = this.normalizeError(error);
    this.logError(appError, context);
  }
}

// Создаем экземпляр для экспорта
const errorHandler = new ErrorHandlerService();

// Экспортируем как named export
export { errorHandler };

// И как default export для совместимости
export default errorHandler;
