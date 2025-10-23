import { defineStore } from 'pinia';
import { computed, reactive, watch } from 'vue';
import { storage } from '@/core/services/storage/storage.service';
import { tokenService } from '@/core/services/auth/token.service';
import { logger } from '@/core/utils/logger/logger';
import type { AuthState, UserDto } from '@/modules/auth/api/auth.types';

export const useAuthStore = defineStore('auth', () => {
  const state = reactive<AuthState>({
    token: storage.getToken(),
    user: storage.getUser(),
    isLoading: false,
    error: null,
    lastActivity: null,
    sessionTimeout: null,
  });

  // Computed properties
  const isAuthenticated = computed(() =>
    !!state.token && tokenService.isValidFormat(state.token) && !tokenService.isTokenExpired(state.token)
  );

  const isLoading = computed(() => state.isLoading);
  const error = computed(() => state.error);
  const user = computed(() => state.user);
  const token = computed(() => state.token);
  const lastActivity = computed(() => state.lastActivity);

  // Actions
  const setLoading = (loading: boolean): void => {
    state.isLoading = loading;
    logger.auth(`Auth loading: ${loading}`);
  };

  const setError = (errorMessage: string | null): void => {
    state.error = errorMessage;
    if (errorMessage) {
      logger.auth(`Auth error: ${errorMessage}`);
    }
  };

  const setAuthData = (token: string, userData: UserDto): void => {
    state.token = token;
    state.user = userData;
    state.lastActivity = new Date().toISOString();
    state.error = null;

    storage.setToken(token);
    storage.setUser(userData);

    logger.auth('Auth data set', {
      userId: userData.id,
      username: userData.username
    });
  };

  const clearAuthData = (): void => {
    state.token = null;
    state.user = null;
    state.error = null;
    state.lastActivity = null;
    state.sessionTimeout = null;

    storage.clearAuthData();
    logger.auth('Auth data cleared');
  };

  const updateLastActivity = (): void => {
    state.lastActivity = new Date().toISOString();
    logger.debug('Last activity updated');
  };

  const setSessionTimeout = (timeout: number | null): void => {
    state.sessionTimeout = timeout;
  };

  const getTokenRemainingTime = (): number => {
    if (!state.token) return 0;
    return tokenService.getTokenRemainingTime(state.token);
  };

  const shouldRefreshToken = (): boolean => {
    if (!state.token) return false;
    return tokenService.shouldRefreshToken(state.token);
  };

  // Watchers
  watch(
    () => state.token,
    (newToken) => {
      if (!newToken) {
        logger.auth('Token was cleared');
      }
    }
  );

  watch(
    () => state.user,
    (newUser) => {
      if (newUser) {
        logger.auth('User data updated', { username: newUser.username });
      }
    }
  );

  return {
    // State
    state,

    // Computed
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    lastActivity,

    // Actions
    setLoading,
    setError,
    setAuthData,
    clearAuthData,
    updateLastActivity,
    setSessionTimeout,
    getTokenRemainingTime,
    shouldRefreshToken,
  };
});

export type AuthStore = ReturnType<typeof useAuthStore>;
