/**
 * Core store: Управление аутентификацией
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { APP_CONFIG } from '@/core/config/app.config';
import { logger } from '@/core/services/logger/logger.service';
import { httpClient } from '@/core/services/api/http-client.service';
import type { UserDto, LoginRequest, LoginResponse } from '@/modules/auth/api/types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(null);
  const user = ref<UserDto | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const lastTokenRefresh = ref<number | null>(null);

  // Вспомогательные функции
  const clearAuthData = (): void => {
    const wasAuthenticated = isAuthenticated.value;
    const userId = user.value?.id;

    token.value = null;
    user.value = null;
    refreshToken.value = null;
    error.value = null;
    lastTokenRefresh.value = null;

    logger.info('Auth data cleared', {
      userId,
      wasAuthenticated
    });
  };

  // Getters
  const isAuthenticated = computed(() => {
    if (!token.value || !user.value) return false;

    try {
      // Проверка формата JWT токена
      const parts = token.value.split('.');
      if (parts.length !== 3) return false;

      // Проверка срока действия
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const expiresAt = payload.exp * 1000;

      return Date.now() < expiresAt;
    } catch {
      return false;
    }
  });

  const tokenExpiresIn = computed(() => {
    if (!token.value) return 0;

    try {
      const parts = token.value.split('.');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const expiresAt = payload.exp * 1000;

      return Math.max(0, expiresAt - Date.now());
    } catch {
      return 0;
    }
  });

  const needsTokenRefresh = computed(() => {
    return tokenExpiresIn.value < APP_CONFIG.AUTH.TOKEN_REFRESH_THRESHOLD;
  });

  // Actions
  const setAuthData = (newToken: string, userData: UserDto, newRefreshToken?: string): void => {
    token.value = newToken;
    user.value = userData;
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken;
    }

    lastTokenRefresh.value = Date.now();
    error.value = null;

    logger.debug('Auth data set', {
      userId: userData.id,
      username: userData.username
    });
  };

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      logger.info('Попытка входа', { username: credentials.username });

      const response = await httpClient.post<LoginResponse>('/Auth/login', credentials, {
        requireAuth: false
      });

      setAuthData(response.data.token, response.data.user, response.data.refreshToken);

      logger.info('Вход выполнен успешно', {
        userId: response.data.user.id,
        username: response.data.user.username
      });

      return true;
    } catch (err: any) {
      error.value = err.message || 'Ошибка при входе в систему';
      logger.error('Ошибка входа', { error: err.message, username: credentials.username });
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token.value && user.value) {
        await httpClient.post('/Auth/logout', {
          userId: user.value.id,
          token: token.value
        }, {
          requireAuth: true
        });
      }
    } catch (err) {
      logger.warn('Ошибка вызова API logout', { error: err });
    } finally {
      clearAuthData();
      logger.info('Пользователь вышел из системы');
    }
  };

  const validateToken = async (): Promise<boolean> => {
    if (!token.value) return false;

    try {
      await httpClient.post('/Auth/validate', { token: token.value }, {
        requireAuth: false
      });

      return true;
    } catch {
      return false;
    }
  };

  const refreshAuthToken = async (): Promise<string | null> => {
    if (!refreshToken.value) {
      logger.warn('Refresh token отсутствует');
      return null;
    }

    try {
      const response = await httpClient.post<LoginResponse>('/Auth/refresh', {
        refreshToken: refreshToken.value
      }, {
        requireAuth: false
      });

      setAuthData(response.data.token, response.data.user, response.data.refreshToken);
      lastTokenRefresh.value = Date.now();

      logger.info('Токен успешно обновлен');
      return response.data.token;
    } catch (err) {
      logger.error('Ошибка обновления токена', { error: err });
      clearAuthData();
      return null;
    }
  };

  const setLoading = (loading: boolean): void => {
    isLoading.value = loading;
    logger.debug('Состояние загрузки изменено', { loading });
  };

  const setError = (errorMessage: string | null): void => {
    error.value = errorMessage;
    if (errorMessage) {
      logger.warn('Ошибка аутентификации', { error: errorMessage });
    }
  };

  // Проверки прав доступа
  const hasRole = (role: string): boolean => {
    return user.value?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(user.value?.role || '');
  };

  const hasPermission = (permission: string): boolean => {
    return user.value?.permissions?.includes(permission) || false;
  };

  return {
    // State
    token: computed(() => token.value),
    user: computed(() => user.value),
    refreshToken: computed(() => refreshToken.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    lastTokenRefresh: computed(() => lastTokenRefresh.value),

    // Getters
    isAuthenticated,
    tokenExpiresIn,
    needsTokenRefresh,

    // Actions
    login,
    logout,
    validateToken,
    refreshAuthToken,
    setAuthData,
    clearAuthData,
    setLoading,
    setError,
    hasRole,
    hasAnyRole,
    hasPermission
  };
});
