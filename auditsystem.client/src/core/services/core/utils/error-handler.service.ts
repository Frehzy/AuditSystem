// src/core/services/core/utils/error-handler.service.ts
import { logger } from '@/core/utils/logger';
import type { AppError, ErrorHandler } from '@/core/types';

class ErrorHandlerImpl implements ErrorHandler {
  private readonly logger = logger.create('ErrorHandler');

  handle(error: unknown, context?: string): AppError {
    const appError = this.normalizeError(error, context);

    // Log based on error type
    if (this.isAuthError(appError)) {
      this.logger.warn('Authentication error', {
        context,
        message: appError.message,
        code: appError.code
      });
    } else if (this.isNetworkError(appError)) {
      this.logger.error('Network error', {
        context,
        message: appError.message,
        code: appError.code
      });
    } else if (this.isServerError(appError)) {
      this.logger.error('Server error', {
        context,
        message: appError.message,
        code: appError.code,
        status: appError.status
      });
    } else if (this.isValidationError(appError)) {
      this.logger.warn('Validation error', {
        context,
        message: appError.message,
        code: appError.code
      });
    } else {
      this.logger.error('Application error', {
        context,
        message: appError.message,
        code: appError.code,
        details: appError.details
      });
    }

    return appError;
  }

  create(message: string, code?: string, details?: unknown, status?: number): AppError {
    const error: AppError = {
      name: 'AppError',
      message,
      code: code || 'UNKNOWN_ERROR',
      details,
      status,
      timestamp: Date.now(),
      stack: new Error().stack
    } as AppError;

    return error;
  }

  wrap(error: unknown, message: string, code?: string): AppError {
    const appError = this.normalizeError(error);
    appError.message = `${message}: ${appError.message}`;

    if (code) {
      appError.code = code;
    }

    return appError;
  }

  isNetworkError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    return [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'CONNECTION_ERROR',
      'NETWORK_REQUEST_FAILED'
    ].includes(appError.code) ||
      appError.message.includes('Network Error') ||
      appError.message.includes('Failed to fetch') ||
      appError.message.includes('timeout');
  }

  isAuthError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    return [
      'UNAUTHORIZED',
      'FORBIDDEN',
      'AUTH_ERROR',
      'TOKEN_EXPIRED',
      'INVALID_TOKEN'
    ].includes(appError.code) ||
      appError.status === 401 ||
      appError.status === 403;
  }

  isServerError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    return appError.status ? appError.status >= 500 : false;
  }

  isClientError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    return appError.status ? appError.status >= 400 && appError.status < 500 : false;
  }

  isValidationError(error: unknown): boolean {
    const appError = this.normalizeError(error);
    return [
      'VALIDATION_ERROR',
      'UNPROCESSABLE_ENTITY'
    ].includes(appError.code) ||
      appError.status === 400 ||
      appError.status === 422;
  }

  getUserMessage(error: unknown): string {
    const appError = this.normalizeError(error);

    // User-friendly messages based on error type
    if (this.isNetworkError(appError)) {
      return 'Проблемы с подключением к интернету. Проверьте соединение и попробуйте снова.';
    }

    if (this.isAuthError(appError)) {
      if (appError.code === 'TOKEN_EXPIRED') {
        return 'Сессия истекла. Пожалуйста, войдите снова.';
      }
      return 'Ошибка авторизации. Проверьте свои учетные данные.';
    }

    if (this.isServerError(appError)) {
      return 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
    }

    if (this.isValidationError(appError)) {
      return 'Проверьте введенные данные и попробуйте снова.';
    }

    // Default message
    return appError.message || 'Произошла непредвиденная ошибка.';
  }

  private normalizeError(error: unknown, context?: string): AppError {
    if (this.isAppError(error)) {
      return error;
    }

    if (error instanceof Error) {
      // Исправлено: правильное преобразование через unknown
      const errorAny = error as unknown as Record<string, unknown>;
      return {
        name: error.name,
        message: error.message,
        code: this.getErrorCode(error),
        details: errorAny.details,
        status: errorAny.status as number | undefined,
        timestamp: Date.now(),
        stack: error.stack,
        context
      } as AppError;
    }

    if (typeof error === 'string') {
      return this.create(error, 'UNKNOWN_ERROR');
    }

    // Исправлено: правильное преобразование через unknown
    const errorDetails = error as unknown as Record<string, unknown>;
    return this.create(
      'An unknown error occurred',
      'UNKNOWN_ERROR',
      errorDetails
    );
  }

  private isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'code' in error &&
      'timestamp' in error
    );
  }

  private getErrorCode(error: Error): string {
    // Исправлено: правильное преобразование через unknown
    const errorAny = error as unknown as Record<string, unknown>;

    // Extract code from error object
    if (errorAny.code) {
      return errorAny.code as string;
    }

    // Map common error types
    if (error.name === 'TypeError') return 'TYPE_ERROR';
    if (error.name === 'RangeError') return 'RANGE_ERROR';
    if (error.name === 'ReferenceError') return 'REFERENCE_ERROR';
    if (error.name === 'SyntaxError') return 'SYNTAX_ERROR';
    if (error.name === 'URIError') return 'URI_ERROR';

    // Map from message
    if (error.message.includes('Network Error')) return 'NETWORK_ERROR';
    if (error.message.includes('timeout')) return 'TIMEOUT_ERROR';
    if (error.message.includes('aborted')) return 'REQUEST_ABORTED';

    return 'UNKNOWN_ERROR';
  }
}

export const errorHandler: ErrorHandler = new ErrorHandlerImpl();
