import { logger } from '@/core/utils/logger/logger';
import type { AxiosError } from 'axios';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
    public status?: number
  ) {
    super(message);
    this.name = 'AppError';
    
    // Сохранение оригинального stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Создание AppError из AxiosError
   */
  static fromAxiosError(error: AxiosError): AppError {
    const status = error.response?.status;
    const data = error.response?.data;
    
    let message = error.message;
    let code = error.code;

    // Извлечение сообщения об ошибке из ответа сервера
    if (data && typeof data === 'object') {
      if ('message' in data) {
        message = (data as any).message;
      } else if ('errors' in data && Array.isArray((data as any).errors)) {
        message = (data as any).errors.join(', ');
      }
    }

    // Специфичные коды ошибок для разных статусов
    if (status) {
      switch (status) {
        case 400:
          code = 'VALIDATION_ERROR';
          break;
        case 401:
          code = 'UNAUTHORIZED';
          break;
        case 403:
          code = 'FORBIDDEN';
          break;
        case 404:
          code = 'NOT_FOUND';
          break;
        case 429:
          code = 'RATE_LIMITED';
          break;
        case 500:
          code = 'SERVER_ERROR';
          break;
        case 502:
        case 503:
        case 504:
          code = 'SERVICE_UNAVAILABLE';
          break;
      }
    }

    return new AppError(message, code, data, status);
  }

  /**
   * Проверка типа ошибки
   */
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'ECONNABORTED';
  }

  isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }

  isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }

  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Получение пользовательского сообщения об ошибке
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Ошибка соединения. Проверьте подключение к интернету.';
    }

    if (this.isServerError()) {
      return 'Временные проблемы с сервером. Попробуйте позже.';
    }

    if (this.isAuthError()) {
      return 'Ошибка авторизации. Пожалуйста, войдите снова.';
    }

    // Возвращаем оригинальное сообщение или общее сообщение по умолчанию
    return this.message || 'Произошла непредвиденная ошибка.';
  }
}

/**
 * Обработка ошибок приложения
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof AppError) {
    logger.error('Application error handled:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
    return error.getUserMessage();
  }

  if (error instanceof Error) {
    logger.error('Unexpected error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Преобразование обычной ошибки в AppError для единообразной обработки
    const appError = new AppError(error.message);
    return appError.getUserMessage();
  }

  logger.error('Unknown error type:', error);
  return 'Произошла непредвиденная ошибка.';
};

/**
 * Проверка сетевой ошибки
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.isNetworkError();
  }

  const axiosError = error as any;
  return axiosError?.code === 'NETWORK_ERROR' || 
         axiosError?.code === 'ECONNABORTED' ||
         axiosError?.message?.includes('Network Error');
};

/**
 * Проверка ошибки таймаута
 */
export const isTimeoutError = (error: unknown): boolean => {
  const axiosError = error as any;
  return axiosError?.code === 'ECONNABORTED' && 
         axiosError?.message?.includes('timeout');
};

/**
 * Проверка ошибки авторизации
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.isAuthError();
  }

  const axiosError = error as any;
  return axiosError?.response?.status === 401 || 
         axiosError?.response?.status === 403;
};

/**
 * Проверка ошибки валидации
 */
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.code === 'VALIDATION_ERROR';
  }

  const axiosError = error as any;
  return axiosError?.response?.status === 400;
};

/**
 * Извлечение ошибок валидации из ответа
 */
export const extractValidationErrors = (error: unknown): string[] => {
  if (error instanceof AppError && error.details) {
    if (Array.isArray(error.details.errors)) {
      return error.details.errors;
    }
    if (typeof error.details.message === 'string') {
      return [error.details.message];
    }
  }

  const axiosError = error as any;
  if (axiosError?.response?.data?.errors) {
    return Array.isArray(axiosError.response.data.errors) 
      ? axiosError.response.data.errors 
      : [axiosError.response.data.errors];
  }

  if (axiosError?.response?.data?.message) {
    return [axiosError.response.data.message];
  }

  return [];
};

/**
 * Создание пользовательских ошибок для разных сценариев
 */
export const createError = {
  network: (message: string = 'Ошибка сети'): AppError => {
    return new AppError(message, 'NETWORK_ERROR');
  },
  
  validation: (message: string, details?: any): AppError => {
    return new AppError(message, 'VALIDATION_ERROR', details, 400);
  },
  
  auth: (message: string = 'Ошибка авторизации'): AppError => {
    return new AppError(message, 'UNAUTHORIZED', undefined, 401);
  },
  
  server: (message: string = 'Ошибка сервера'): AppError => {
    return new AppError(message, 'SERVER_ERROR', undefined, 500);
  },
  
  notFound: (message: string = 'Ресурс не найден'): AppError => {
    return new AppError(message, 'NOT_FOUND', undefined, 404);
  },
};
