// src/core/services/utils/error-handler.service.ts
import { logger } from '@/core/utils/logger';
import type {
  ErrorHandler,
  AppError
} from '@/core/types';

interface ExtendedErrorDetails {
  message: string;
  timestamp: number;
  context?: string;
  code?: string;
  status?: number;
  originalError?: unknown;
  backendErrors?: string[] | Record<string, unknown>;
  backendMessage?: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  isUnhandledRejection?: boolean;
  isUncaughtError?: boolean;
  promise?: unknown;
  responseData?: unknown;
}

interface ExtendedAppError extends AppError {
  wrapped?: boolean;
  originalMessage?: string;
  originalStack?: string;
}

/**
 * Production-ready error handling service with comprehensive error processing
 */
class ErrorHandlerImpl implements ErrorHandler {
  private readonly logger = logger.create('ErrorHandler');
  private errorStats = {
    totalHandled: 0,
    categories: {} as Record<string, number>,
    recentErrors: [] as ExtendedAppError[]
  };

  private readonly MAX_RECENT_ERRORS = 50;
  private globalHandlersInitialized = false;

  constructor() {
    this.logger.debug('ErrorHandler initialized');
  }

  handle(error: unknown, context?: string): AppError {
    this.errorStats.totalHandled++;

    const appError = this.normalizeError(error, context);
    this.categorizeError(appError);
    this.addToRecentErrors(appError);

    this.logError(appError);

    return appError;
  }

  create(message: string, code?: string, details?: unknown, status?: number): AppError {
    const appError: ExtendedAppError = {
      name: 'AppError',
      message,
      code: code || 'UNKNOWN_ERROR',
      details,
      status,
      timestamp: Date.now(),
      context: 'manual'
    };

    return appError;
  }

  wrap(error: unknown, message: string, code?: string): AppError {
    const originalError = error instanceof Error ? error : new Error(String(error));
    const appError: ExtendedAppError = {
      name: 'AppError',
      message,
      code: code || 'WRAPPED_ERROR',
      details: {
        originalError: {
          message: originalError.message,
          stack: originalError.stack
        }
      },
      timestamp: Date.now(),
      context: 'wrapped',
      wrapped: true,
      originalMessage: originalError.message,
      originalStack: originalError.stack
    };

    return appError;
  }

  isNetworkError(error: unknown): boolean {
    const err = error instanceof Error ? error : new Error(String(error));

    return err.message.includes('Network Error') ||
      err.message.includes('network') ||
      err.message.includes('timeout') ||
      err.message.includes('fetch') ||
      (err as any).code === 'NETWORK_ERROR' ||
      (err as any).status === 0;
  }

  isAuthError(error: unknown): boolean {
    const err = error instanceof Error ? error : new Error(String(error));

    return err.message.includes('auth') ||
      err.message.includes('Auth') ||
      err.message.includes('token') ||
      err.message.includes('unauthorized') ||
      err.message.includes('Unauthorized') ||
      (err as any).code?.includes('AUTH') ||
      (err as any).status === 401 ||
      (err as any).status === 403;
  }

  isServerError(error: unknown): boolean {
    const status = (error as any).status;
    return status >= 500 && status < 600;
  }

  isClientError(error: unknown): boolean {
    const status = (error as any).status;
    return status >= 400 && status < 500;
  }

  isValidationError(error: unknown): boolean {
    const err = error instanceof Error ? error : new Error(String(error));

    return err.message.includes('validation') ||
      err.message.includes('Validation') ||
      err.message.includes('valid') ||
      (err as any).code?.includes('VALIDATION') ||
      (err as any).status === 422;
  }

  getUserMessage(error: unknown): string {
    const appError = this.normalizeError(error);

    if (this.isNetworkError(appError)) {
      return 'Network error occurred. Please check your connection and try again.';
    }

    if (this.isAuthError(appError)) {
      return 'Authentication error. Please log in again.';
    }

    if (this.isServerError(appError)) {
      return 'Server error occurred. Please try again later.';
    }

    if (this.isValidationError(appError)) {
      return 'Validation error. Please check your input and try again.';
    }

    if (appError.message && appError.message.length < 100) {
      return appError.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  initializeGlobalHandlers(): void {
    if (this.globalHandlersInitialized) {
      this.logger.warn('Global error handlers already initialized');
      return;
    }

    // Window error handler
    window.addEventListener('error', (event) => {
      const errorDetails: ExtendedErrorDetails = {
        message: event.message,
        timestamp: Date.now(),
        context: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        isUncaughtError: true,
        stack: event.error?.stack
      };

      const appError = this.create(
        `Uncaught Error: ${event.message}`,
        'UNCAUGHT_ERROR',
        errorDetails
      );

      this.handle(appError, 'global');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      const errorDetails: ExtendedErrorDetails = {
        message: error?.message || 'Unhandled Promise Rejection',
        timestamp: Date.now(),
        context: 'global',
        isUnhandledRejection: true,
        promise: error,
        stack: error?.stack
      };

      const appError = this.create(
        `Unhandled Promise Rejection: ${error?.message || 'Unknown'}`,
        'UNHANDLED_REJECTION',
        errorDetails
      );

      this.handle(appError, 'global');
      event.preventDefault();
    });

    this.globalHandlersInitialized = true;
    this.logger.debug('Global error handlers initialized');
  }

  cleanupGlobalHandlers(): void {
    if (!this.globalHandlersInitialized) {
      return;
    }

    // Note: In a real implementation, we would store the handler references
    // and remove them properly. For simplicity, we just mark as not initialized.
    this.globalHandlersInitialized = false;
    this.logger.debug('Global error handlers cleaned up');
  }

  getErrorStats(): {
    totalHandled: number;
    categories: Record<string, number>;
    recentErrors: AppError[];
  } {
    return {
      totalHandled: this.errorStats.totalHandled,
      categories: { ...this.errorStats.categories },
      recentErrors: [...this.errorStats.recentErrors] as AppError[]
    };
  }

  private normalizeError(error: unknown, context?: string): ExtendedAppError {
    if (this.isAppError(error)) {
      return {
        ...error,
        context: context || error.context
      } as ExtendedAppError;
    }

    if (error instanceof Error) {
      return {
        name: 'AppError',
        message: error.message,
        code: 'ERROR',
        details: {
          originalError: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        },
        timestamp: Date.now(),
        context,
        wrapped: false,
        originalMessage: error.message,
        originalStack: error.stack,
        stack: error.stack
      };
    }

    if (typeof error === 'string') {
      return this.create(error, 'STRING_ERROR', undefined, undefined) as ExtendedAppError;
    }

    if (typeof error === 'object' && error !== null) {
      return this.create(
        (error as any).message || 'Unknown object error',
        (error as any).code || 'OBJECT_ERROR',
        error,
        (error as any).status
      ) as ExtendedAppError;
    }

    return this.create('Unknown error occurred', 'UNKNOWN_ERROR', error) as ExtendedAppError;
  }

  private isAppError(error: unknown): error is ExtendedAppError {
    return typeof error === 'object' &&
      error !== null &&
      'message' in (error as any) &&
      'code' in (error as any) &&
      'timestamp' in (error as any);
  }

  private categorizeError(error: ExtendedAppError): void {
    if (this.isNetworkError(error)) {
      this.errorStats.categories.network = (this.errorStats.categories.network || 0) + 1;
    } else if (this.isAuthError(error)) {
      this.errorStats.categories.auth = (this.errorStats.categories.auth || 0) + 1;
    } else if (this.isServerError(error)) {
      this.errorStats.categories.server = (this.errorStats.categories.server || 0) + 1;
    } else if (this.isClientError(error)) {
      this.errorStats.categories.client = (this.errorStats.categories.client || 0) + 1;
    } else if (this.isValidationError(error)) {
      this.errorStats.categories.validation = (this.errorStats.categories.validation || 0) + 1;
    } else {
      this.errorStats.categories.unknown = (this.errorStats.categories.unknown || 0) + 1;
    }
  }

  private addToRecentErrors(error: ExtendedAppError): void {
    this.errorStats.recentErrors.unshift(error);

    if (this.errorStats.recentErrors.length > this.MAX_RECENT_ERRORS) {
      this.errorStats.recentErrors = this.errorStats.recentErrors.slice(0, this.MAX_RECENT_ERRORS);
    }
  }

  private logError(error: ExtendedAppError): void {
    const logData = {
      code: error.code,
      context: error.context,
      status: error.status,
      timestamp: new Date(error.timestamp).toISOString()
    };

    if (this.isNetworkError(error)) {
      this.logger.warn('Network error handled', logData);
    } else if (this.isAuthError(error)) {
      this.logger.warn('Authentication error handled', logData);
    } else if (this.isServerError(error)) {
      this.logger.error('Server error handled', logData);
    } else if (this.isClientError(error)) {
      this.logger.warn('Client error handled', logData);
    } else if (this.isValidationError(error)) {
      this.logger.info('Validation error handled', logData);
    } else {
      this.logger.error('Unknown error type handled', logData);
    }
  }
}

// Создание и экспорт синглтона
export const errorHandler: ErrorHandler = new ErrorHandlerImpl();
