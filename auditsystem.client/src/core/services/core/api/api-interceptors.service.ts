// src/core/services/core/api/api-interceptors.service.ts
import { storageService } from '../auth/storage.service';
import { logger } from '@/core/utils/logger';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

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

        // Add authorization token
        const token = storageService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          loggerContext.debug('Auth token added to request');
        }

        // Add request meta-information
        (config as InternalAxiosRequestConfig & { metadata?: Record<string, unknown> }).metadata = {
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
      const config = response.config as InternalAxiosRequestConfig & { metadata?: Record<string, unknown> };
      const duration = config.metadata?.startTime ? Date.now() - (config.metadata.startTime as number) : undefined;

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
      const config = error.config as InternalAxiosRequestConfig & { metadata?: Record<string, unknown> };
      const duration = config.metadata?.startTime ? Date.now() - (config.metadata.startTime as number) : undefined;

      loggerContext.error('Response error', {
        status,
        url,
        method,
        message: error.message,
        code: error.code,
        duration: duration ? `${duration}ms` : undefined
      });

      // Handle 401 Unauthorized
      if (status === 401) {
        loggerContext.warn('Authentication required, clearing auth data');
        storageService.clearAuth();

        const isAuthRequest = url?.includes('/Auth/');
        if (!isAuthRequest && typeof window !== 'undefined') {
          // Redirect to login page only if not auth request
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 1000);
        }
      }

      // Handle network errors
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

export const apiInterceptors = { setupInterceptors };
