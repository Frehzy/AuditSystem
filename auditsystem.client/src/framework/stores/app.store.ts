// src/framework/stores/app.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logger } from '@/core/utils/logger';
import { storageService } from '@/core/services/core/auth/storage.service';
import { tokenService } from '@/core/services/core/auth/token.service';
import { themeService } from '@/core/services/core/ui/theme.service';
import type { UserDto } from '@/modules/auth/api/auth.types';
import type { Theme } from '@/core/types';

interface AppError {
  id: string;
  message: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  context?: string;
}

export const useAppStore = defineStore('app', () => {
  // Auth state
  const token = ref(storageService.getToken());
  const user = ref(storageService.getUser());
  const authLoading = ref(false);
  const authError = ref<string | null>(null);

  // Theme state
  const currentTheme = ref<Theme>(themeService.getCurrentTheme());

  // App state
  const isOnline = ref(navigator.onLine);
  const isLoading = ref(false);
  const errors = ref<AppError[]>([]);
  const serverHealth = ref(false);

  // Computed
  const isAuthenticated = computed(() => {
    const hasToken = !!token.value;
    const hasUser = !!user.value;

    logger.debug('Auth check', {
      hasToken,
      hasUser,
      token: token.value ? `${token.value.substring(0, 20)}...` : 'null',
      user: user.value ? user.value.username : 'null'
    });

    // Для mock режима просто проверяем наличие токена и пользователя
    if (import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === 'true') {
      return hasToken && hasUser;
    }

    // Для продакшена используем полную проверку токена
    if (!hasToken || !hasUser) return false;

    try {
      const isValid = tokenService.isValidFormat(token.value!) && !tokenService.isTokenExpired(token.value!);
      logger.debug('Token validation result', { isValid });
      return isValid;
    } catch (error) {
      logger.error('Token validation error', { error });
      return false;
    }
  });

  const userInfo = computed(() => user.value);
  const hasRole = computed(() => (role: string) => user.value?.role === role);
  const hasErrors = computed(() => errors.value.length > 0);
  const latestError = computed(() => errors.value[errors.value.length - 1]);
  const isDark = computed(() => currentTheme.value === 'dark');
  const isLight = computed(() => currentTheme.value === 'light');
  const resolvedTheme = computed(() => {
    if (currentTheme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme.value;
  });

  // Auth actions
  const setAuthData = (newToken: string, userData: UserDto) => {
    logger.debug('Setting auth data', {
      token: newToken ? `${newToken.substring(0, 20)}...` : 'null',
      user: userData.username
    });

    token.value = newToken;
    user.value = userData;
    authError.value = null;

    storageService.setToken(newToken);
    storageService.setUser(userData);

    // Принудительно вызываем обновление computed свойств
    setTimeout(() => {
      logger.debug('Auth data set - verification', {
        isAuthenticated: isAuthenticated.value,
        tokenStored: !!storageService.getToken(),
        userStored: !!storageService.getUser()
      });
    }, 0);

    logger.auth('Auth data set', {
      userId: userData.id,
      username: userData.username,
      isAuthenticated: isAuthenticated.value
    });
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    authError.value = null;

    storageService.clearAuth();
    logger.auth('Auth data cleared', {
      isAuthenticated: isAuthenticated.value
    });
  };

  const setAuthLoading = (loading: boolean) => {
    authLoading.value = loading;
  };

  const setAuthError = (errorMessage: string | null) => {
    authError.value = errorMessage;
    if (errorMessage) {
      logger.auth('Auth error:', errorMessage);
    }
  };

  // Theme actions
  const initializeTheme = () => {
    themeService.initialize();
    currentTheme.value = themeService.getCurrentTheme();
    logger.info('Theme initialized');
  };

  const setTheme = (theme: Theme) => {
    themeService.setTheme(theme);
    currentTheme.value = theme;
    logger.info('Theme set to:', theme);
  };

  const toggleTheme = () => {
    const newTheme = themeService.toggleTheme();
    currentTheme.value = newTheme;
    logger.info('Theme toggled to:', newTheme);
    return newTheme;
  };

  // App actions
  const setOnlineStatus = (status: boolean) => {
    isOnline.value = status;
    logger.info(`Network status: ${status ? 'online' : 'offline'}`);
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
    logger.debug(`Global loading: ${loading}`);
  };

  const setServerHealth = (health: boolean) => {
    serverHealth.value = health;
    logger.info(`Server health: ${health ? 'healthy' : 'unhealthy'}`);
  };

  const addError = (message: string, type: AppError['type'] = 'error', context?: string) => {
    const error: AppError = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type,
      context
    };

    errors.value.push(error);

    // Автоматически очищаем старые ошибки (максимум 50)
    if (errors.value.length > 50) {
      errors.value = errors.value.slice(-50);
    }

    const logMethod = type === 'error' ? 'error' : type === 'warning' ? 'warn' : 'info';
    logger[logMethod]('App error:', { message, context });
  };

  const removeError = (id: string) => {
    const index = errors.value.findIndex(error => error.id === id);
    if (index > -1) {
      errors.value.splice(index, 1);
    }
  };

  const clearErrors = () => {
    errors.value = [];
    logger.debug('All errors cleared');
  };

  // Event listeners
  const setupEventListeners = () => {
    window.addEventListener('online', () => setOnlineStatus(true));
    window.addEventListener('offline', () => setOnlineStatus(false));
  };

  // Theme subscription
  const unsubscribeTheme = themeService.subscribe((newTheme: Theme) => {
    currentTheme.value = newTheme;
    logger.debug('Theme updated:', newTheme);
  });

  // Initialize store
  const initialize = () => {
    setupEventListeners();
    initializeTheme();

    // Проверяем начальное состояние аутентификации
    logger.debug('Store initialized', {
      initialToken: !!token.value,
      initialUser: !!user.value,
      initialIsAuthenticated: isAuthenticated.value
    });

    logger.info('App store initialized');
  };

  // Cleanup
  const cleanup = () => {
    unsubscribeTheme();
    logger.debug('App store cleanup completed');
  };

  // Initialize immediately
  initialize();

  return {
    // State
    token: computed(() => token.value),
    user: userInfo,
    authLoading: computed(() => authLoading.value),
    authError: computed(() => authError.value),
    currentTheme: computed(() => currentTheme.value),
    resolvedTheme: computed(() => resolvedTheme.value),
    isOnline: computed(() => isOnline.value),
    isLoading: computed(() => isLoading.value),
    errors: computed(() => errors.value),
    serverHealth: computed(() => serverHealth.value),

    // Computed
    isAuthenticated,
    hasRole,
    hasErrors,
    latestError,
    isDark,
    isLight,

    // Auth actions
    setAuthData,
    clearAuth,
    setAuthLoading,
    setAuthError,

    // Theme actions
    initializeTheme,
    setTheme,
    toggleTheme,

    // App actions
    setOnlineStatus,
    setLoading,
    setServerHealth,
    addError,
    removeError,
    clearErrors,

    // Store management
    initialize,
    cleanup
  };
});
