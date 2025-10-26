// src/framework/stores/auth.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { storageService } from '@/core/services/core/auth/storage.service';
import { tokenService } from '@/core/services/core/auth/token.service';
import { logger } from '@/core/utils/logger';
import type { UserDto } from '@/modules/auth/api/auth.types';

export const useAuthStore = defineStore('auth', () => {
  // State - получаем данные из storageService
  const token = ref(storageService.getToken());
  const user = ref(storageService.getUser());
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => {
    if (!token.value) return false;
    try {
      return tokenService.isValidFormat(token.value) && !tokenService.isTokenExpired(token.value);
    } catch {
      return false;
    }
  });

  const userInfo = computed(() => user.value);
  const hasRole = computed(() => (role: string) => user.value?.role === role);

  // Actions
  const setAuthData = (newToken: string, userData: UserDto) => {
    token.value = newToken;
    user.value = userData;
    error.value = null;

    // Сохраняем в storage
    storageService.setToken(newToken);
    storageService.setUser(userData);

    logger.auth('Auth data set', {
      userId: userData.id,
      username: userData.username
    });
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    error.value = null;

    storageService.clearAuth();
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

  // Улучшенная функция проверки необходимости обновления токена
  const shouldRefreshToken = computed(() => {
    if (!token.value) return false;
    try {
      const remainingTime = tokenService.getTokenRemainingTime(token.value);
      return remainingTime < 300000; // 5 минут
    } catch {
      return false;
    }
  });

  const getTokenRemainingTime = () => {
    if (!token.value) return 0;
    return tokenService.getTokenRemainingTime(token.value);
  };

  // State для удобства
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
    clearAuthData: clearAuth, // Алиас
    setLoading,
    setError,
    shouldRefreshToken,
    getTokenRemainingTime,
    state
  };
});
