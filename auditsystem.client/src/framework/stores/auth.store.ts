import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { storage } from './storage.service';
import { tokenService } from '@/core/services/core/auth/token.service';
import { logger } from '@/core/utils/logger';
import type { UserDto } from '@/modules/auth/api/auth.types';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(storage.getToken());
  const user = ref(storage.getUser());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => {
    if (!token.value) return false;
    return tokenService.isValidFormat(token.value) &&
      !tokenService.isTokenExpired(token.value);
  });

  const userInfo = computed(() => user.value);
  const hasRole = computed(() => (role: string) =>
    user.value?.role === role
  );

  // Actions
  const setAuthData = (newToken: string, userData: UserDto) => {
    token.value = newToken;
    user.value = userData;
    error.value = null;

    storage.setToken(newToken);
    storage.setUser(userData);

    logger.auth('Auth data set', {
      userId: userData.id,
      username: userData.username
    });
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    error.value = null;

    storage.clearAuth();
    logger.auth('Auth data cleared');
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage;
    if (errorMessage) {
      logger.auth('Auth error:', errorMessage);
    }
  };

  const refreshToken = async () => {
    if (!token.value) return null;

    try {
      // Здесь будет логика обновления токена
      logger.auth('Token refresh attempted');
      return token.value;
    } catch (err) {
      clearAuth();
      throw err;
    }
  };

  // Дополнительные методы для совместимости
  const clearAuthData = clearAuth; // Алиас для clearAuth

  const shouldRefreshToken = () => {
    if (!token.value) return false;
    try {
      const remainingTime = tokenService.getTokenRemainingTime(token.value);
      return remainingTime < 300000; // 5 минут
    } catch {
      return false;
    }
  };

  const getTokenRemainingTime = () => {
    if (!token.value) return 0;
    return tokenService.getTokenRemainingTime(token.value);
  };

  const state = computed(() => ({
    token: token.value,
    user: user.value,
    isLoading: isLoading.value,
    error: error.value,
    isAuthenticated: isAuthenticated.value
  }));

  return {
    // State
    token: computed(() => token.value),
    user: userInfo,
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Computed
    isAuthenticated,
    hasRole,

    // Actions
    setAuthData,
    clearAuth,
    clearAuthData,
    setLoading,
    setError,
    refreshToken,
    shouldRefreshToken,
    getTokenRemainingTime,
    state
  };
});
