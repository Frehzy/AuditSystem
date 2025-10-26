// src/modules/auth/composables/useAuth.ts
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/framework/stores/auth.store';
import { authApiService } from '../api/authApi.service';
import { errorHandler } from '@/core/services/core/utils/error-handler.service';
import { logger } from '@/core/utils/logger';
import type { LoginCommand, ApiResult, UserDto } from '../api/auth.types';

export const useAuth = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const loggerContext = logger.create('useAuth');

  const login = async (credentials: LoginCommand): Promise<boolean> => {
    if (authStore.isLoading) {
      loggerContext.warn('Login attempt while already loading');
      return false;
    }

    authStore.setLoading(true);
    authStore.setError(null);

    try {
      const response = await authApiService.login(credentials);

      // Убедимся, что данные корректны перед сохранением
      if (!response.token || !response.user) {
        throw new Error('Invalid response: missing token or user data');
      }

      authStore.setAuthData(response.token, response.user);

      loggerContext.auth('Login completed successfully', {
        userId: response.user.id,
        username: response.user.username
      });
      return true;
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'auth.login');
      authStore.setError(handledError.message);

      loggerContext.error('Login failed', {
        error: handledError.message,
        code: handledError.code
      });
      return false;
    } finally {
      authStore.setLoading(false);
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
      authStore.clearAuth();
      loggerContext.auth('Logout completed');

      // Redirect to login after logout
      await router.push('/login');
    }
  };

  const validateCurrentToken = async (): Promise<boolean> => {
    const token = authStore.token;

    if (!token || !authStore.isAuthenticated) {
      loggerContext.warn('Token validation failed - invalid or missing token');
      authStore.clearAuth();
      return false;
    }

    try {
      const isValid = await authApiService.validateToken(token);

      if (!isValid) {
        loggerContext.warn('Token validation failed - server rejected token');
        authStore.clearAuth();
      } else {
        loggerContext.auth('Token validation successful');
      }

      return isValid;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'auth.validateToken');
      loggerContext.error('Token validation error', { error: handledError.message });
      authStore.clearAuth();
      return false;
    }
  };

  // Улучшенная функция обновления токена
  const refreshToken = async (): Promise<boolean> => {
    if (!authStore.shouldRefreshToken) {
      return true;
    }

    loggerContext.auth('Token refresh required');
    // TODO: Implement actual token refresh logic
    return false;
  };

  // Вспомогательная функция для проверки аутентификации
  const checkAuthStatus = (): boolean => {
    return authStore.isAuthenticated;
  };

  return {
    // State
    state: authStore.state,
    isLoading: computed(() => authStore.isLoading),
    error: computed(() => authStore.error),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    user: computed(() => authStore.user),
    token: computed(() => authStore.token),

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
      const currentUser = authStore.user;
      if (currentUser && authStore.token) {
        const updatedUser = { ...currentUser, ...userData };
        authStore.setAuthData(authStore.token, updatedUser);
        loggerContext.auth('User profile updated', { userId: updatedUser.id });
      }
    },

    hasRole: (role: string): boolean => {
      return authStore.user?.role === role;
    },

    hasAnyRole: (roles: string[]): boolean => {
      return roles.includes(authStore.user?.role || '');
    },

    // Token utilities
    getTokenRemainingTime: authStore.getTokenRemainingTime,
    shouldRefreshToken: computed(() => authStore.shouldRefreshToken),
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;
