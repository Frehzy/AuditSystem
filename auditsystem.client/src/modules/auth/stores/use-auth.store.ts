// src/modules/auth/stores/use-auth.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logger } from '@/core/utils/logger';
import { authService } from '../services';
import { tokenService } from '../services';
import type { UserDto } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const loggerContext = logger.create('AuthStore');

  // Состояние
  const user = ref<UserDto | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Инициализация из хранилища
  const initialize = () => {
    const storedUser = tokenService.getUser();
    const storedToken = tokenService.getToken();

    if (storedUser && storedToken) {
      user.value = storedUser;
      token.value = storedToken;
      loggerContext.info('Auth initialized from storage', {
        userId: storedUser.id,
        username: storedUser.username
      });
    }
  };

  // Вычисляемые свойства
  const isAuthenticated = computed(() => {
    if (!user.value || !token.value) return false;

    // В режиме разработки пропускаем проверку срока действия
    if (import.meta.env.DEV) return true;

    try {
      return !tokenService.isTokenExpired(token.value);
    } catch {
      return false;
    }
  });

  const userRole = computed(() => user.value?.role);
  const userName = computed(() => user.value?.username || user.value?.fullName);
  const userPermissions = computed(() => user.value?.permissions || []);

  // Методы
  const setAuthData = (newToken: string, userData: UserDto) => {
    token.value = newToken;
    user.value = userData;

    // Сохраняем в хранилище
    tokenService.setToken(newToken);
    tokenService.setUser(userData);

    loggerContext.info('Auth data set', {
      userId: userData.id,
      username: userData.username
    });
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    error.value = null;

    // Очищаем хранилище
    tokenService.clear();

    loggerContext.info('Auth data cleared');
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (message: string | null) => {
    error.value = message;
    if (message) {
      loggerContext.warn('Auth error set', { message });
    }
  };

  // Валидация
  const validateToken = async (): Promise<boolean> => {
    if (!token.value) return false;

    try {
      const isValid = await authService.validateToken(token.value);
      if (!isValid) {
        loggerContext.warn('Token validation failed, clearing auth');
        clearAuth();
      }
      return isValid;
    } catch (error) {
      loggerContext.error('Token validation error', { error });
      return false;
    }
  };

  // Проверки ролей и разрешений
  const hasRole = (role: string) => {
    if (!user.value) return false;
    return authService.hasRole(user.value, role);
  };

  const hasAnyRole = (roles: string[]) => {
    if (!user.value) return false;
    return authService.hasAnyRole(user.value, roles);
  };

  const hasPermission = (permission: string) => {
    if (!user.value) return false;
    return authService.hasPermission(user.value, permission);
  };

  // Информация о токене
  const getTokenExpiration = () => {
    if (!token.value) return null;
    return tokenService.getTokenExpiration(token.value);
  };

  const getTokenRemainingTime = () => {
    if (!token.value) return 0;
    return tokenService.getTokenRemainingTime(token.value);
  };

  const shouldRefreshToken = computed(() => {
    if (!token.value) return false;
    return tokenService.shouldRefresh(token.value);
  });

  // Инициализация при создании
  initialize();

  return {
    // Состояние
    user: computed(() => user.value),
    token: computed(() => token.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Вычисляемые свойства
    isAuthenticated,
    userRole,
    userName,
    userPermissions,
    shouldRefreshToken,

    // Методы
    setAuthData,
    clearAuth,
    setLoading,
    setError,
    validateToken,
    hasRole,
    hasAnyRole,
    hasPermission,
    getTokenExpiration,
    getTokenRemainingTime,

    // Утилиты
    initialize,
  };
});

export type AuthStore = ReturnType<typeof useAuthStore>;
