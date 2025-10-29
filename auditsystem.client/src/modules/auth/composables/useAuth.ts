// src/modules/auth/composables/useAuth.ts
import { computed } from 'vue';
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

  const login = async (credentials: LoginCommand): Promise<boolean> => {
    if (appStore.authLoading) {
      loggerContext.warn('Login attempt while already loading');
      return false;
    }

    appStore.setAuthLoading(true);
    appStore.setAuthError(null);

    try {
      const response = await authApiService.login(credentials);

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
      const handledError = errorHandler.handle(error, 'auth.login');
      appStore.setAuthError(handledError.message);

      loggerContext.error('Login failed', {
        error: handledError.message,
        code: handledError.code
      });
      return false;
    } finally {
      appStore.setAuthLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    loggerContext.auth('Logout initiated');

    try {
      await authApiService.logout();
    } catch (error) {
      const handledError = errorHandler.handle(error, 'auth.logout');
      loggerContext.error('Logout API call failed', { error: handledError.message });
    } finally {
      appStore.clearAuth();
      loggerContext.auth('Logout completed');

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
      return tokenService.getTokenRemainingTime(token);
    } catch {
      return 0;
    }
  };

  // Проверка необходимости обновления токена
  const shouldRefreshToken = computed(() => {
    const remainingTime = getTokenRemainingTime();
    return remainingTime > 0 && remainingTime < 5 * 60 * 1000; // 5 minutes
  });

  return {
    // State
    isLoading: computed(() => appStore.authLoading),
    error: computed(() => appStore.authError),
    isAuthenticated: computed(() => appStore.isAuthenticated),
    user: computed(() => appStore.user),
    token: computed(() => appStore.token),

    // Actions
    login,
    logout,
    validateCurrentToken,
    refreshToken,
    checkAuthStatus,
    register: authApiService.register,
    requestPasswordReset: authApiService.requestPasswordReset,

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
    shouldRefreshToken,
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;

// Import tokenService for token utilities
import { tokenService } from '@/core/services/core/auth/token.service';
