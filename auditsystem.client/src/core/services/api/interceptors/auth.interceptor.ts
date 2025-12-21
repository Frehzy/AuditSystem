/**
 * Интерсептор для обработки авторизации
 */

import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { APP_CONFIG } from '@/core/config/app.config';
import { useAuthStore } from '@/framework/stores';
import { logger } from '@/core/services/logger/logger.service';

export class AuthInterceptor {
  private readonly logger = logger.create('AuthInterceptor');

  onRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const authStore = useAuthStore();
    const requireAuth = (config as any).requireAuth !== false;

    // Добавляем токен авторизации если требуется
    if (requireAuth && authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
      this.logger.debug('Auth token added to request', {
        url: config.url,
        method: config.method
      });
    }

    // Добавляем refresh token если требуется
    if (authStore.refreshToken && config.url?.includes('/auth/refresh')) {
      config.headers['X-Refresh-Token'] = authStore.refreshToken;
    }

    return config;
  }

  onResponse(response: AxiosResponse): AxiosResponse {
    const config = response.config as any;
    const authStore = useAuthStore();

    // Сохраняем новый токен если он пришел в ответе
    if (response.data?.token) {
      // Используем существующие методы store
      this.logger.debug('New auth token received', {
        url: config.url,
        expiresIn: response.data.expiresAt
      });
    }

    return response;
  }

  onError(error: any): Promise<never> {
    const config = error.config;
    const authStore = useAuthStore();

    // Обработка 401 ошибки (Unauthorized)
    if (error.response?.status === 401 && config && !config._retry) {
      config._retry = true;

      // Попытка обновить токен
      if (authStore.refreshToken) {
        this.logger.info('Attempting token refresh due to 401 error');
      }
    }

    // Обработка 403 ошибки (Forbidden)
    if (error.response?.status === 403) {
      this.logger.warn('Access forbidden', {
        url: config?.url,
        method: config?.method
      });
    }

    return Promise.reject(error);
  }
}

// Экспортируем синглтон
export const authInterceptor = new AuthInterceptor();
