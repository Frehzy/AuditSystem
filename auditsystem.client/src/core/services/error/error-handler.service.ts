import { logger } from '@/core/utils/logger/logger';
import type { AppError, ErrorHandler } from '../types';

class ErrorHandlerImpl implements ErrorHandler {
  private readonly logger = logger.create('ErrorHandler');
  private readonly errorConfig = {
    maxErrorHistory: 50,
    autoReport: import.meta.env.PROD,
  };

  handle(error: unknown, context?: string): AppError {
    let appError: AppError;

    if (this.isAppError(error)) {
      appError = error;
      if (context) {
        appError.context = context;
      }
    } else if (this.isAxiosError(error)) {
      appError = this.handleAxiosError(error);
      appError.context = context;
    } else if (error instanceof Error) {
      appError = this.create(
        error.message,
        'UNKNOWN_ERROR',
        {
          originalError: error,
          stack: error.stack,
          context
        },
        500
      );
    } else {
      appError = this.create(
        'An unexpected error occurred',
        'UNKNOWN_ERROR',
        { originalError: error, context },
        500
      );
    }

    this.logError(appError);
    this.trackError(appError);

    return appError;
  }

  create(message: string, code: string = 'UNKNOWN_ERROR', details?: any, status?: number): AppError {
    const error = new Error(message) as AppError;

    Object.assign(error, {
      code,
      details,
      status,
      timestamp: Date.now(),
      name: 'AppError',
      context: details?.context
    });

    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, this.create);
    }

    return error;
  }

  wrap(error: unknown, message: string, code: string = 'WRAPPED_ERROR'): AppError {
    const originalError = error instanceof Error ? error : new Error(String(error));

    return this.create(
      `${message}: ${originalError.message}`,
      code,
      {
        originalError: originalError.message,
        originalStack: originalError.stack,
        wrapped: true
      }
    );
  }

  isNetworkError(error: unknown): boolean {
    if (!this.isAppError(error)) return false;

    return error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('timeout');
  }

  isAuthError(error: unknown): boolean {
    if (!this.isAppError(error)) return false;

    return error.status === 401 ||
      error.status === 403 ||
      error.code === 'UNAUTHORIZED' ||
      error.code === 'FORBIDDEN' ||
      error.code === 'TOKEN_EXPIRED';
  }

  isServerError(error: unknown): boolean {
    if (!this.isAppError(error)) return false;

    return error.status !== undefined && error.status >= 500;
  }

  isClientError(error: unknown): boolean {
    if (!this.isAppError(error)) return false;

    return error.status !== undefined && error.status >= 400 && error.status < 500;
  }

  isValidationError(error: unknown): boolean {
    if (!this.isAppError(error)) return false;

    return error.code === 'VALIDATION_ERROR' ||
      error.status === 422 ||
      error.message.includes('validation') ||
      error.message.includes('invalid');
  }

  getUserMessage(error: unknown): string {
    if (!(error instanceof Error)) {
      return 'Произошла непредвиденная ошибка.';
    }

    const appError = error as AppError;

    if (this.isNetworkError(appError)) {
      return 'Ошибка соединения. Проверьте подключение к интернету.';
    }

    if (this.isServerError(appError)) {
      return 'Временные проблемы с сервером. Попробуйте позже.';
    }

    if (this.isAuthError(appError)) {
      return 'Ошибка авторизации. Пожалуйста, войдите снова.';
    }

    if (this.isValidationError(appError)) {
      return 'Ошибка валидации данных. Проверьте введенные данные.';
    }

    if (appError.code === 'RATE_LIMITED') {
      return 'Слишком много запросов. Пожалуйста, подождите.';
    }

    // Возвращаем оригинальное сообщение если оно user-friendly
    if (appError.message && !appError.message.includes('Error:') && !appError.message.includes('Exception')) {
      return appError.message;
    }

    return 'Произошла непредвиденная ошибка.';
  }

  getErrorDetails(error: unknown): Record<string, any> {
    if (!this.isAppError(error)) {
      return {
        message: String(error),
        type: typeof error
      };
    }

    return {
      code: error.code,
      status: error.status,
      context: error.context,
      timestamp: new Date(error.timestamp).toISOString(),
      details: error.details
    };
  }

  private isAppError(error: unknown): error is AppError {
    return error instanceof Error &&
      'code' in error &&
      'timestamp' in error &&
      (error as any).name === 'AppError';
  }

  private isAxiosError(error: any): error is {
    isAxiosError: boolean;
    response?: any;
    code?: string;
    message: string;
    config?: any;
  } {
    return error?.isAxiosError === true;
  }

  private handleAxiosError(error: any): AppError {
    const status = error.response?.status;
    const data = error.response?.data;
    const code = error.code;
    const url = error.config?.url;

    let message = error.message;
    let errorCode = code;
    let errorDetails: any = { url };

    // Extract message from response
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string') {
        message = data.message;
      } else if (Array.isArray(data.errors)) {
        message = data.errors.join(', ');
        errorDetails.errors = data.errors;
      } else if (typeof data.error === 'string') {
        message = data.error;
      }

      errorDetails.responseData = data;
    }

    // Map status codes to error codes
    if (status) {
      switch (status) {
        case 400:
          errorCode = 'VALIDATION_ERROR';
          break;
        case 401:
          errorCode = 'UNAUTHORIZED';
          break;
        case 403:
          errorCode = 'FORBIDDEN';
          break;
        case 404:
          errorCode = 'NOT_FOUND';
          break;
        case 409:
          errorCode = 'CONFLICT';
          break;
        case 422:
          errorCode = 'UNPROCESSABLE_ENTITY';
          break;
        case 429:
          errorCode = 'RATE_LIMITED';
          break;
        case 500:
          errorCode = 'SERVER_ERROR';
          break;
        case 502:
          errorCode = 'BAD_GATEWAY';
          break;
        case 503:
          errorCode = 'SERVICE_UNAVAILABLE';
          break;
        case 504:
          errorCode = 'GATEWAY_TIMEOUT';
          break;
      }
    }

    return this.create(message, errorCode, errorDetails, status);
  }

  private logError(error: AppError): void {
    const logData = {
      message: error.message,
      code: error.code,
      status: error.status,
      context: error.context,
      timestamp: new Date(error.timestamp).toISOString(),
      details: this.sanitizeErrorDetails(error.details)
    };

    if (this.isServerError(error) || error.code === 'UNKNOWN_ERROR') {
      this.logger.error('Application error occurred', logData);
    } else if (this.isAuthError(error)) {
      this.logger.warn('Authentication error occurred', logData);
    } else if (this.isNetworkError(error)) {
      this.logger.warn('Network error occurred', logData);
    } else if (this.isValidationError(error)) {
      this.logger.info('Validation error occurred', logData);
    } else {
      this.logger.info('Client error occurred', logData);
    }
  }

  private trackError(error: AppError): void {
    // Можно интегрировать с внешними сервисами трекинга ошибок
    // Sentry, Bugsnag, etc.
    if (this.errorConfig.autoReport && this.shouldReportError(error)) {
      this.reportToExternalService(error);
    }
  }

  private shouldReportError(error: AppError): boolean {
    // Не репортим network errors и validation errors
    return !this.isNetworkError(error) &&
      !this.isValidationError(error) &&
      error.code !== 'UNAUTHORIZED';
  }

  private reportToExternalService(error: AppError): void {
    // Заглушка для интеграции с внешними сервисами
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }
  }

  private sanitizeErrorDetails(details: any): any {
    if (!details) return details;

    const sanitized = { ...details };

    // Удаляем чувствительные данные
    const sensitiveFields = ['password', 'token', 'authorization', 'cookie'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    // Очищаем вложенные объекты
    if (sanitized.config && sanitized.config.headers) {
      if (sanitized.config.headers.Authorization) {
        sanitized.config.headers.Authorization = '***REDACTED***';
      }
      if (sanitized.config.headers.Cookie) {
        sanitized.config.headers.Cookie = '***REDACTED***';
      }
    }

    return sanitized;
  }
}

export const errorHandler: ErrorHandler = new ErrorHandlerImpl();
