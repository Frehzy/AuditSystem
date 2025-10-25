// src/modules/auth/composables/useAuth.ts
import { computed } from 'vue';
import { useAuthStore } from '@/framework/stores/auth.store';
import { authApiService } from '../api/authApi.service';
import { errorHandler } from '@/core/services/core/utils/error-handler.service';
import { logger } from '@/core/utils/logger';
import type { LoginCommand, ApiResult, UserDto } from '../api/auth.types';

export const useAuth = () => {
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
      authStore.setAuthData(response.token, response.user);

      loggerContext.auth('Login completed successfully');
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
      authStore.clearAuthData();
      loggerContext.auth('Logout completed');
    }
  };

  const validateCurrentToken = async (): Promise<boolean> => {
    const token = authStore.token;

    if (!token || !authStore.isAuthenticated) {
      loggerContext.warn('Token validation failed - invalid or missing token');
      authStore.clearAuthData();
      return false;
    }

    try {
      const isValid = await authApiService.validateToken(token);

      if (!isValid) {
        loggerContext.warn('Token validation failed - server rejected token');
        authStore.clearAuthData();
      } else {
        loggerContext.auth('Token validation successful');
      }

      return isValid;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'auth.validateToken');
      loggerContext.error('Token validation error', { error: handledError.message });
      authStore.clearAuthData();
      return false;
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!authStore.shouldRefreshToken()) {
      return true;
    }

    loggerContext.auth('Token refresh required');
    return false;
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResult<UserDto>> => {
    return await authApiService.register(userData);
  };

  const requestPasswordReset = async (email: string): Promise<ApiResult<void>> => {
    return await authApiService.requestPasswordReset(email);
  };

  const updateUserProfile = (userData: Partial<UserDto>): void => {
    const currentUser = authStore.user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      authStore.setAuthData(authStore.token!, updatedUser);
      loggerContext.auth('User profile updated', { userId: updatedUser.id });
    }
  };

  const hasRole = (role: string): boolean => {
    return authStore.user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.includes(authStore.user?.role || '');
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
    register,
    requestPasswordReset,
    updateUserProfile,
    hasRole,
    hasAnyRole,

    // Token utilities
    getTokenRemainingTime: authStore.getTokenRemainingTime,
    shouldRefreshToken: authStore.shouldRefreshToken,
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;
