// src/framework/stores/app.store.ts
import { defineStore } from 'pinia';
import { ref, computed, watch, onUnmounted } from 'vue';
import { logger } from '@/core/utils/logger';
import { storageService } from '@/core/services/auth/storage.service';
import { tokenService } from '@/core/services/auth/token.service';
import { themeService } from '@/core/services/ui/theme.service';
import type { UserDto } from '@/modules/auth/api/auth.types';
import type { Theme, AppError as CoreAppError } from '@/core/types';

// Локальные типы для store
interface AppError {
  id: string;
  message: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  context?: string;
  details?: unknown;
}

interface AppState {
  token: string | null;
  user: UserDto | null;
  authLoading: boolean;
  authError: string | null;
  currentTheme: Theme;
  themePreference: Theme;
  isOnline: boolean;
  isLoading: boolean;
  errors: AppError[];
  serverHealth: boolean;
  lastActivity: number;
}

/**
 * Улучшенный App Store с оптимизированной производительностью
 * и расширенной функциональностью
 */
export const useAppStore = defineStore('app', () => {
  // ==================== REACTIVE STATE ====================

  // Auth state
  const token = ref<string | null>(storageService.getToken());
  const user = ref<UserDto | null>(storageService.getUser());
  const authLoading = ref(false);
  const authError = ref<string | null>(null);

  // Theme state
  const currentTheme = ref<Theme>(themeService.getCurrentTheme());
  const themePreference = ref<Theme>(themeService.getCurrentTheme());

  // App state
  const isOnline = ref(navigator.onLine);
  const isLoading = ref(false);
  const errors = ref<AppError[]>([]);
  const serverHealth = ref(false);
  const lastActivity = ref(Date.now());

  // ==================== COMPUTED PROPERTIES ====================

  /**
   * Оптимизированная проверка аутентификации с мемоизацией
   */
  const isAuthenticated = computed(() => {
    const hasToken = !!token.value;
    const hasUser = !!user.value;

    // Быстрая проверка без валидации токена в development
    if (import.meta.env.DEV) {
      return hasToken && hasUser;
    }

    // Полная проверка в production
    if (!hasToken || !hasUser) return false;

    try {
      return tokenService.isValidFormat(token.value!) &&
        !tokenService.isTokenExpired(token.value!);
    } catch (error) {
      logger.error('Token validation error in store', { error });
      return false;
    }
  });

  // User information with safe access
  const userInfo = computed(() => user.value);

  // Role-based access control
  const hasRole = computed(() => (role: string) =>
    user.value?.role === role
  );

  const hasAnyRole = computed(() => (roles: string[]) =>
    roles.includes(user.value?.role || '')
  );

  const hasPermission = computed(() => (permission: string) =>
    user.value?.permissions?.includes(permission) || false
  );

  // Error management
  const hasErrors = computed(() => errors.value.length > 0);
  const latestError = computed(() => errors.value[errors.value.length - 1]);
  const errorCount = computed(() => errors.value.length);

  // Theme utilities
  const isDark = computed(() => currentTheme.value === 'dark');
  const isLight = computed(() => currentTheme.value === 'light');

  const resolvedTheme = computed(() => {
    if (currentTheme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme.value;
  });

  // Activity tracking
  const timeSinceLastActivity = computed(() => Date.now() - lastActivity.value);
  const isInactive = computed(() => timeSinceLastActivity.value > 300000); // 5 minutes

  // ==================== ACTIONS ====================

  // Auth actions
  const setAuthData = (newToken: string, userData: UserDto) => {
    logger.debug('Setting auth data in store', {
      tokenPreview: newToken ? `${newToken.substring(0, 20)}...` : 'null',
      user: userData.username
    });

    token.value = newToken;
    user.value = userData;
    authError.value = null;

    // Сохраняем в storage
    storageService.setToken(newToken);
    storageService.setUser(userData);

    // Обновляем активность
    updateLastActivity();

    logger.auth('Auth data set successfully', {
      userId: userData.id,
      username: userData.username,
      isAuthenticated: isAuthenticated.value
    });
  };

  const clearAuth = () => {
    const wasAuthenticated = isAuthenticated.value;

    token.value = null;
    user.value = null;
    authError.value = null;

    storageService.clearAuth();

    logger.auth('Auth data cleared', {
      wasAuthenticated,
      isAuthenticated: isAuthenticated.value
    });
  };

  const setAuthLoading = (loading: boolean) => {
    authLoading.value = loading;
    if (loading) {
      updateLastActivity();
    }
  };

  const setAuthError = (errorMessage: string | null) => {
    authError.value = errorMessage;
    if (errorMessage) {
      logger.auth('Auth error set', { errorMessage });
      addError(errorMessage, 'error', 'auth');
    }
  };

  // Theme actions
  const initializeTheme = () => {
    themeService.initialize();
    currentTheme.value = themeService.getCurrentTheme();
    themePreference.value = themeService.getCurrentTheme();
    logger.info('Theme system initialized', { theme: currentTheme.value });
  };

  const setTheme = (theme: Theme) => {
    themeService.setTheme(theme);
    currentTheme.value = theme;
    themePreference.value = theme;
    updateLastActivity();

    logger.info('Theme changed', {
      previous: currentTheme.value,
      new: theme
    });
  };

  const toggleTheme = () => {
    const newTheme = themeService.toggleTheme();
    currentTheme.value = newTheme;
    themePreference.value = newTheme;
    updateLastActivity();

    logger.info('Theme toggled', { newTheme });
    return newTheme;
  };

  // App state actions
  const setOnlineStatus = (status: boolean) => {
    const previousStatus = isOnline.value;
    isOnline.value = status;

    if (previousStatus !== status) {
      logger.info('Network status changed', {
        previous: previousStatus ? 'online' : 'offline',
        current: status ? 'online' : 'offline'
      });

      // Добавляем уведомление об изменении статуса сети
      if (!status) {
        addError('Потеряно подключение к интернету', 'warning', 'network');
      }
    }
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
    if (!loading) {
      updateLastActivity();
    }
  };

  const setServerHealth = (health: boolean) => {
    const previousHealth = serverHealth.value;
    serverHealth.value = health;

    if (previousHealth !== health) {
      logger.info('Server health changed', {
        previous: previousHealth ? 'healthy' : 'unhealthy',
        current: health ? 'healthy' : 'unhealthy'
      });
    }
  };

  // Error management actions
  const addError = (
    message: string,
    type: AppError['type'] = 'error',
    context?: string,
    details?: unknown
  ) => {
    const error: AppError = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      timestamp: new Date(),
      type,
      context,
      details
    };

    errors.value.push(error);
    updateLastActivity();

    // Автоматически очищаем старые ошибки
    if (errors.value.length > 50) {
      errors.value = errors.value.slice(-50);
    }

    // Логируем в соответствующий канал
    const logMethod = type === 'error' ? 'error' :
      type === 'warning' ? 'warn' : 'info';
    logger[logMethod]('App error recorded', {
      message,
      context,
      details
    });
  };

  const removeError = (id: string) => {
    const index = errors.value.findIndex(error => error.id === id);
    if (index > -1) {
      errors.value.splice(index, 1);
      logger.debug('Error removed', { id });
    }
  };

  const clearErrors = () => {
    const count = errors.value.length;
    errors.value = [];
    logger.debug('All errors cleared', { count });
  };

  const clearErrorsByContext = (context: string) => {
    const initialCount = errors.value.length;
    errors.value = errors.value.filter(error => error.context !== context);
    const removedCount = initialCount - errors.value.length;

    if (removedCount > 0) {
      logger.debug('Errors cleared by context', { context, count: removedCount });
    }
  };

  // Activity tracking
  const updateLastActivity = () => {
    lastActivity.value = Date.now();
  };

  const resetInactivityTimer = () => {
    updateLastActivity();
  };

  // ==================== EVENT HANDLERS ====================

  const setupEventListeners = () => {
    // Network status
    window.addEventListener('online', () => setOnlineStatus(true));
    window.addEventListener('offline', () => setOnlineStatus(false));

    // User activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        updateLastActivity();
      }
    });

    logger.debug('App store event listeners initialized');
  };

  const cleanupEventListeners = () => {
    // Будет реализовано при необходимости
  };

  // ==================== STORE MANAGEMENT ====================

  /**
   * Получение текущего состояния store для отладки
   */
  const getCurrentState = () => ({
    auth: {
      token: token.value,
      user: user.value,
      isAuthenticated: isAuthenticated.value,
      isLoading: authLoading.value
    },
    theme: {
      current: currentTheme.value,
      preference: themePreference.value,
      resolved: resolvedTheme.value
    },
    app: {
      isOnline: isOnline.value,
      isLoading: isLoading.value,
      serverHealth: serverHealth.value,
      lastActivity: lastActivity.value
    },
    errors: {
      count: errorCount.value,
      latest: latestError.value
    }
  });

  /**
   * Сброс store к начальному состоянию
   */
  const reset = () => {
    clearAuth();
    clearErrors();
    setLoading(false);
    setServerHealth(false);

    logger.info('App store reset to initial state');
  };

  // ==================== WATCHERS ====================

  // Автоматическая очистка старых ошибок
  watch(errors, (newErrors) => {
    if (newErrors.length > 100) {
      errors.value = newErrors.slice(-50);
      logger.debug('Auto-trimmed error history', {
        from: newErrors.length,
        to: errors.value.length
      });
    }
  }, { deep: true });

  // Отслеживание изменений темы
  const unsubscribeTheme = themeService.subscribe((newTheme: Theme) => {
    currentTheme.value = newTheme;
    logger.debug('Theme updated from service', { newTheme });
  });

  // ==================== INITIALIZATION ====================

  const initialize = () => {
    setupEventListeners();
    initializeTheme();

    // Валидация начального состояния аутентификации
    if (token.value && user.value) {
      const tokenValidation = tokenService.validateToken(token.value);
      if (!tokenValidation.isValid) {
        logger.warn('Invalid token on initialization, clearing auth', {
          errors: tokenValidation.errors
        });
        clearAuth();
      }
    }

    logger.info('App store initialized successfully', getCurrentState());
  };

  const cleanup = () => {
    cleanupEventListeners();
    unsubscribeTheme();
    logger.debug('App store cleanup completed');
  };

  // Автоматическая инициализация при создании store
  initialize();

  // ==================== STORE EXPORTS ====================

  return {
    // State
    token: computed(() => token.value),
    user: userInfo,
    authLoading: computed(() => authLoading.value),
    authError: computed(() => authError.value),
    currentTheme: computed(() => currentTheme.value),
    themePreference: computed(() => themePreference.value),
    resolvedTheme,
    isOnline: computed(() => isOnline.value),
    isLoading: computed(() => isLoading.value),
    errors: computed(() => errors.value),
    serverHealth: computed(() => serverHealth.value),
    lastActivity: computed(() => lastActivity.value),

    // Computed
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasErrors,
    latestError,
    errorCount,
    isDark,
    isLight,
    timeSinceLastActivity,
    isInactive,

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

    // Error actions
    addError,
    removeError,
    clearErrors,
    clearErrorsByContext,

    // Activity actions
    updateLastActivity,
    resetInactivityTimer,

    // Store management
    getCurrentState,
    reset,
    initialize,
    cleanup
  };
});

// Тип для использования в компонентах
export type AppStore = ReturnType<typeof useAppStore>;
