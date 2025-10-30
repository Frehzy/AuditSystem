// src/modules/auth/composables/useAuth.ts
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/framework/stores/app.store';
import { authApiService } from '../api/authApi.service';
import { errorHandler } from '@/core/services/core/utils/error-handler.service';
import { logger } from '@/core/utils/logger';
import type { LoginCommand, UserDto } from '../api/auth.types';

export const useAuth = () => {
  const router = useRouter();
  const appStore = useAppStore();
  const loggerContext = logger.create('useAuth');

  // Local state for better reactivity
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const login = async (credentials: LoginCommand): Promise<boolean> => {
    if (isLoading.value) {
      loggerContext.warn('Login attempt while already loading');
      return false;
    }

    isLoading.value = true;
    error.value = null;
    appStore.setAuthLoading(true);
    appStore.setAuthError(null);

    // Добавляем таймаут для всей операции
    const loginTimeout = 20000; // 20 секунд максимум
    let timeoutId: number | null = null;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error('Превышено время ожидания ответа от сервера'));
        }, loginTimeout);
      });

      const loginPromise = authApiService.login(credentials);

      const response = await Promise.race([loginPromise, timeoutPromise]);

      // Убедимся, что данные корректны перед сохранением
      if (!response.token || !response.user) {
        throw new Error('Invalid response: missing token or user data');
      }

      appStore.setAuthData(response.token, response.user);

      loggerContext.auth('Login completed successfully', {
        userId: response.user.id,
        username: response.user.username
      });
      return true;
    } catch (error: unknown) {
      let errorMessage = 'Неизвестная ошибка';

      if (error instanceof Error) {
        // Улучшенная обработка ошибок с учетом структуры бэкенда
        if (error.message.includes('timeout') || error.message.includes('таймаут')) {
          errorMessage = 'Сервер не отвежает. Проверьте подключение к сети.';
        } else if (error.message.includes('network') || error.message.includes('сеть')) {
          errorMessage = 'Ошибка сети. Сервер недоступен.';
        } else if (error.message.includes('Invalid username or password') ||
          error.message.includes('Invalid credentials')) {
          errorMessage = 'Неверное имя пользователя или пароль';
        } else if (error.message.includes('Account is deactivated')) {
          errorMessage = 'Учетная запись деактивирована';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Пользователь не найден';
        } else {
          errorMessage = error.message;
        }
      }

      error.value = errorMessage;
      appStore.setAuthError(errorMessage);

      loggerContext.error('Login failed', {
        error: errorMessage,
        code: error instanceof Error ? error.name : 'UNKNOWN',
        originalError: error
      });
      return false;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      isLoading.value = false;
      appStore.setAuthLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    loggerContext.auth('Logout initiated');

    try {
      // Получаем текущие данные пользователя перед выходом
      const userId = appStore.user?.id;
      const token = appStore.token;

      if (!userId || !token) {
        loggerContext.warn('Missing user data for logout');
        return;
      }

      // Создаем команду logout с правильными данными
      const logoutCommand = {
        userId: userId,
        token: token
      };

      await authApiService.logout(logoutCommand);
      loggerContext.auth('Logout API call completed');
    } catch (error) {
      const handledError = errorHandler.handle(error, 'auth.logout');
      loggerContext.error('Logout API call failed', { error: handledError.message });
    } finally {
      // Всегда очищаем данные аутентификации
      appStore.clearAuth();
      error.value = null;
      loggerContext.auth('Logout completed - auth data cleared');

      // Redirect to login after logout
      await router.push('/login');
    }
  };

  const validateCurrentToken = async (): Promise<boolean> => {
    const token = appStore.token;

    if (!token || !appStore.isAuthenticated) {
      loggerContext.warn('Token validation failed - invalid or missing token');
      appStore.clearAuth();
      return false;
    }

    try {
      const isValid = await authApiService.validateToken(token);

      if (!isValid) {
        loggerContext.warn('Token validation failed - server rejected token');
        appStore.clearAuth();
      } else {
        loggerContext.auth('Token validation successful');
      }

      return isValid;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'auth.validateToken');
      loggerContext.error('Token validation error', { error: handledError.message });
      appStore.clearAuth();
      return false;
    }
  };

  // Улучшенная функция обновления токена
  const refreshToken = async (): Promise<boolean> => {
    // TODO: Implement actual token refresh logic
    // For now, just check if token exists and is valid
    if (appStore.token && appStore.isAuthenticated) {
      return true;
    }
    return false;
  };

  // Вспомогательная функция для проверки аутентификации
  const checkAuthStatus = (): boolean => {
    return appStore.isAuthenticated;
  };

  // Получение оставшегося времени токена
  const getTokenRemainingTime = (): number => {
    const token = appStore.token;
    if (!token) return 0;

    try {
      // Простая проверка - токен валиден если он есть и пользователь аутентифицирован
      return appStore.isAuthenticated ? 3600 : 0;
    } catch {
      return 0;
    }
  };

  // Метод для очистки ошибок
  const clearError = (): void => {
    error.value = null;
    appStore.setAuthError(null);
  };

  return {
    // State
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isAuthenticated: computed(() => appStore.isAuthenticated),
    user: computed(() => appStore.user),
    token: computed(() => appStore.token),

    // Actions
    login,
    logout,
    validateCurrentToken,
    refreshToken,
    checkAuthStatus,
    clearError,

    // User management
    updateUserProfile: (userData: Partial<UserDto>): void => {
      const currentUser = appStore.user;
      const currentToken = appStore.token;
      if (currentUser && currentToken) {
        const updatedUser = { ...currentUser, ...userData };
        appStore.setAuthData(currentToken, updatedUser);
        loggerContext.auth('User profile updated', { userId: updatedUser.id });
      }
    },

    hasRole: (role: string): boolean => {
      return appStore.user?.role === role;
    },

    hasAnyRole: (roles: string[]): boolean => {
      return roles.includes(appStore.user?.role || '');
    },

    // Token utilities
    getTokenRemainingTime,
    shouldRefreshToken: computed(() => {
      const remainingTime = getTokenRemainingTime();
      return remainingTime > 0 && remainingTime < 5 * 60 * 1000; // 5 minutes
    }),
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;
