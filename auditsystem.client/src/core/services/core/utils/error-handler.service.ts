// src/core/services/core/utils/error-handler.service.ts
import { logger } from '@/core/utils/logger';
import type { AppError, ErrorHandler } from '@/core/types';

class ErrorHandlerImpl implements ErrorHandler {
  private readonly logger = logger.create('ErrorHandler');

  handle(error: unknown, context?: string): AppError {
    const appError = this.normalizeError(error, context);

    this.logger.error('Error handled', {
      message: appError.message,
      code: appError.code,
      context: appError.context,
      status: appError.status
    });

    return appError;
  }

  create(message: string, code?: string, details?: unknown, status?: number): AppError {
    return {
      name: 'AppError',
      message,
      code: code || 'UNKNOWN_ERROR',
      details,
      status,
      timestamp: Date.now(),
      context: 'manual'
    };
  }

  wrap(error: unknown, message: string, code?: string): AppError {
    const originalError = error instanceof Error ? error : new Error(String(error));
    const appError = this.normalizeError(originalError);

    return {
      ...appError,
      message: `${message}: ${appError.message}`,
      code: code || appError.code,
      timestamp: Date.now()
    };
  }

  isNetworkError(error: unknown): boolean {
    const err = error as AppError;
    return err.code === 'NETWORK_ERROR' ||
      err.message?.includes('network') ||
      err.message?.includes('fetch') ||
      err.message?.includes('timeout');
  }

  isAuthError(error: unknown): boolean {
    const err = error as AppError;
    return err.status === 401 ||
      err.status === 403 ||
      err.code === 'UNAUTHORIZED' ||
      err.code === 'FORBIDDEN' ||
      err.message?.includes('auth') ||
      err.message?.includes('token');
  }

  isServerError(error: unknown): boolean {
    const err = error as AppError;
    return (err.status !== undefined && err.status >= 500) ||
      err.code === 'SERVER_ERROR' ||
      err.code === 'SERVICE_UNAVAILABLE';
  }

  isClientError(error: unknown): boolean {
    const err = error as AppError;
    return (err.status !== undefined && err.status >= 400 && err.status < 500);
  }

  isValidationError(error: unknown): boolean {
    const err = error as AppError;
    return err.status === 400 ||
      err.code === 'VALIDATION_ERROR' ||
      err.message?.includes('validation');
  }

  getUserMessage(error: unknown): string {
    const err = error as AppError;

    if (this.isNetworkError(error)) {
      return 'Ошибка сети. Проверьте подключение к интернету.';
    }

    if (this.isAuthError(error)) {
      return 'Ошибка авторизации. Пожалуйста, войдите снова.';
    }

    if (this.isServerError(error)) {
      return 'Ошибка сервера. Пожалуйста, попробуйте позже.';
    }

    if (this.isValidationError(error)) {
      return 'Ошибка в данных. Проверьте введенные значения.';
    }

    return err.message || 'Произошла непредвиденная ошибка.';
  }

  private normalizeError(error: unknown, context?: string): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        code: this.getErrorCode(error),
        details: error.stack,
        timestamp: Date.now(),
        context: context || 'unknown'
      };
    }

    return {
      name: 'UnknownError',
      message: String(error),
      code: 'UNKNOWN_ERROR',
      timestamp: Date.now(),
      context: context || 'unknown'
    };
  }

  private isAppError(error: unknown): error is AppError {
    return typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'timestamp' in error;
  }

  private getErrorCode(error: Error): string {
    if (error.name === 'TypeError') return 'TYPE_ERROR';
    if (error.name === 'ReferenceError') return 'REFERENCE_ERROR';
    if (error.name === 'RangeError') return 'RANGE_ERROR';
    if (error.name === 'SyntaxError') return 'SYNTAX_ERROR';
    if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error.message.includes('network')) return 'NETWORK_ERROR';
    return 'UNKNOWN_ERROR';
  }
}

// Создаем экземпляр для экспорта
const errorHandler = new ErrorHandlerImpl();

// Экспортируем как named export
export { errorHandler };

// И как default export для совместимости
export default errorHandler;
