// framework/stores/auth.store.ts
import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { logger } from '@/core/utils/logger';
import { storageService } from '@/core/services/auth/storage.service';
import { tokenService } from '@/core/services/auth/token.service';
import type { UserDto } from '@/modules/auth/api/auth.types';
import type { TokenValidationResult } from './types/auth.types';

/**
 * Стор для управления аутентификацией и данными пользователя
 */
export const useAuthStore = defineStore('auth', () => {
  // ==================== СОСТОЯНИЕ ====================
  const token = ref<string | null>(storageService.getToken());
  const user = ref<UserDto | null>(storageService.getUser());
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastTokenRefresh = ref<number | null>(null);

  // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
  const isAuthenticated = computed(() => {
    const hasToken = !!token.value;
    const hasUser = !!user.value;

    if (import.meta.env.DEV) {
      logger.debug('Режим разработки: проверка аутентификации', {
        hasToken,
        hasUser
      });
      return hasToken && hasUser;
    }

    if (!hasToken || !hasUser) {
      logger.debug('Нет токена или пользователя');
      return false;
    }

    try {
      const isValidFormat = tokenService.isValidFormat(token.value!);
      const isExpired = tokenService.isExpired(token.value!);
      const isValid = isValidFormat && !isExpired;

      logger.debug('Проверка валидности токена', {
        isValidFormat,
        isExpired,
        isValid
      });

      return isValid;
    } catch (err) {
      logger.error('Ошибка при валидации токена', { err });
      return false;
    }
  });

  const userInfo = computed(() => user.value);

  /** Время до истечения токена в миллисекундах */
  const tokenExpiresIn = computed(() => {
    if (!token.value) return 0;
    try {
      const expiration = tokenService.getExpiration(token.value);
      return expiration ? expiration - Date.now() : 0;
    } catch {
      return 0;
    }
  });

  /** Нужно ли обновить токен */
  const needsTokenRefresh = computed(() => {
    if (!token.value) return false;
    return tokenExpiresIn.value < 5 * 60 * 1000; // 5 минут до истечения
  });

  // ==================== МЕТОДЫ ДЛЯ РОЛЕЙ И РАЗРЕШЕНИЙ ====================
  const hasRole = (role: string) => {
    const result = user.value?.role === role;
    logger.debug(`Проверка роли: ${role}`, { result, userRole: user.value?.role });
    return result;
  };

  const hasAnyRole = (roles: string[]) => {
    const result = roles.includes(user.value?.role || '');
    logger.debug(`Проверка любой из ролей: ${roles}`, { result, userRole: user.value?.role });
    return result;
  };

  const hasPermission = (permission: string) => {
    const result = user.value?.permissions?.includes(permission) || false;
    logger.debug(`Проверка разрешения: ${permission}`, { result, userPermissions: user.value?.permissions });
    return result;
  };

  // ==================== ДЕЙСТВИЯ ====================
  /**
   * Установка данных аутентификации
   * @param newToken - Новый JWT токен
   * @param userData - Данные пользователя
   */
  const setAuthData = (newToken: string, userData: UserDto) => {
    try {
      logger.info('Устанавливаем данные аутентификации', {
        userId: userData.id,
        username: userData.username,
        tokenPreview: newToken ? `${newToken.substring(0, 20)}...` : 'null'
      });

      token.value = newToken;
      user.value = userData;
      error.value = null;
      lastTokenRefresh.value = Date.now();

      storageService.setToken(newToken);
      storageService.setUser(userData);

      logger.info('Данные аутентификации успешно установлены', {
        userId: userData.id,
        username: userData.username,
        isAuthenticated: isAuthenticated.value,
        tokenExpiresIn: tokenExpiresIn.value
      });
    } catch (error) {
      logger.error('Ошибка при установке данных аутентификации', { error });
      throw error;
    }
  };

  /**
   * Очистка данных аутентификации
   */
  const clearAuth = () => {
    const wasAuthenticated = isAuthenticated.value;
    const userId = user.value?.id;

    logger.info('Очищаем данные аутентификации', {
      userId,
      wasAuthenticated
    });

    token.value = null;
    user.value = null;
    error.value = null;
    lastTokenRefresh.value = null;

    storageService.clearAuth();

    logger.info('Данные аутентификации очищены', {
      userId,
      wasAuthenticated,
      isAuthenticated: isAuthenticated.value
    });
  };

  /**
   * Установка состояния загрузки
   * @param value - Флаг загрузки
   */
  const setLoading = (value: boolean) => {
    logger.debug('Устанавливаем состояние загрузки', { loading: value });
    loading.value = value;
  };

  /**
   * Установка ошибки
   * @param errorMessage - Сообщение об ошибке или null для очистки
   */
  const setError = (errorMessage: string | null) => {
    logger.info('Устанавливаем ошибку аутентификации', { errorMessage });
    error.value = errorMessage;
    if (errorMessage) {
      logger.info('Ошибка аутентификации установлена', { errorMessage });
    }
  };

  /**
   * Валидация токена
   * @returns Результат валидации
   */
  const validateToken = (): TokenValidationResult => {
    if (!token.value) {
      logger.debug('Нет токена для валидации');
      return { isValid: false, errors: ['Нет токена'] };
    }

    try {
      const validation = tokenService.validate(token.value);
      logger.debug('Валидация токена завершена', validation);
      return validation;
    } catch (err) {
      logger.error('Ошибка при валидации токена', { err });
      return { isValid: false, errors: ['Ошибка при валидации токена'] };
    }
  };

  // Автоматическая проверка токена каждые 30 секунд
  const tokenCheckInterval = setInterval(() => {
    if (isAuthenticated.value && needsTokenRefresh.value) {
      logger.info('Токен скоро истечет, требуется обновление');
      // Здесь только логируем, обновление должно быть инициировано извне
    }
  }, 30000);

  // Очистка интервала при размонтировании
  onUnmounted(() => {
    clearInterval(tokenCheckInterval);
    logger.debug('Интервал проверки токена очищен');
  });

  return {
    // ==================== СОСТОЯНИЕ ====================
    token: computed(() => token.value),
    user: userInfo,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    lastTokenRefresh: computed(() => lastTokenRefresh.value),

    // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
    isAuthenticated,
    tokenExpiresIn,
    needsTokenRefresh,

    // ==================== МЕТОДЫ ====================
    setAuthData,
    clearAuth,
    setLoading,
    setError,
    hasRole,
    hasAnyRole,
    hasPermission,
    validateToken
  };
});
