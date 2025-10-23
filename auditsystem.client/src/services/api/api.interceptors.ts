import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { storage } from '@/framework/stores/storage.service';
import { logger } from '@/core/utils/logger/logger';

export const setupInterceptors = (instance: AxiosInstance): AxiosInstance => {
  const loggerContext = logger.create('ApiInterceptors');

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const isHealthCheck = config.url?.includes('/api/health');
      
      if (!isHealthCheck) {
        loggerContext.api('Outgoing request', {
          url: config.url,
          method: config.method?.toUpperCase(),
          baseURL: config.baseURL
        });

        // Добавление токена авторизации
        const token = storage.getToken();
        if (token && storage.isValidToken()) {
          config.headers.Authorization = `Bearer ${token}`;
          loggerContext.debug('Auth token added to request');
        } else if (token) {
          loggerContext.warn('Invalid token detected, skipping authorization header');
        }

        // Добавление мета-информации о запросе
        (config as any).metadata = {
          startTime: Date.now(),
          url: config.url,
          method: config.method
        };
      }

      return config;
    },
    (error: AxiosError) => {
      loggerContext.error('Request interceptor error', {
        message: error.message,
        url: error.config?.url,
        code: error.code
      });
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as InternalAxiosRequestConfig & { metadata?: any };
      const duration = config.metadata ? Date.now() - config.metadata.startTime : undefined;

      loggerContext.api('Response received', {
        url: response.config.url,
        status: response.status,
        duration: duration ? `${duration}ms` : undefined
      });

      return response;
    },
    (error: AxiosError) => {
      const status = error.response?.status;
      const url = error.config?.url;
      const method = error.config?.method?.toUpperCase();
      const config = error.config as InternalAxiosRequestConfig & { metadata?: any };
      const duration = config.metadata ? Date.now() - config.metadata.startTime : undefined;

      loggerContext.error('Response error', {
        status,
        url,
        method,
        message: error.message,
        code: error.code,
        duration: duration ? `${duration}ms` : undefined
      });

      // Обработка 401 Unauthorized
      if (status === 401) {
        loggerContext.warn('Authentication required, clearing auth data');
        storage.clearAuthData();
        
        const isAuthRequest = url?.includes('/Auth/');
        if (!isAuthRequest && typeof window !== 'undefined') {
          // Перенаправление на страницу логина только если это не auth запрос
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 1000);
        }
      }

      // Обработка сетевых ошибок
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        loggerContext.error('Network error detected', {
          url,
          code: error.code
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
