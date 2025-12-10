// framework/stores/app.store.ts
import { defineStore } from 'pinia';
import { computed, onUnmounted } from 'vue';
import { logger } from '@/core/utils/logger';
import { useAuthStore } from './auth.store';
import { useThemeStore } from './theme.store';
import { useErrorStore } from './error.store';
import { useAppStateStore } from './app-state.store';
import { useActivityStore } from './activity.store';
import type { StoreSnapshot, StoreConfig } from './types/app.types';
import type { StoreHealthCheck, HealthReport } from './types/health.types';

/**
 * Координирующий стор, который объединяет все специализированные сторе
 * Обеспечивает централизованное управление состоянием приложения
 */
export const useAppStore = defineStore('app', () => {
  // Подключаем все специализированные сторе
  const authStore = useAuthStore();
  const themeStore = useThemeStore();
  const errorStore = useErrorStore();
  const appStateStore = useAppStateStore();
  const activityStore = useActivityStore();

  // ==================== КОМПЬЮТЕД СВОЙСТВА ====================

  /** Авторизован ли пользователь */
  const isAuthenticated = computed(() => authStore.isAuthenticated);

  /** Есть ли ошибки в системе */
  const hasErrors = computed(() => errorStore.hasErrors);

  /** Текущая тема (с учетом автоматического режима) */
  const resolvedTheme = computed(() => themeStore.resolved);

  /** Онлайн ли приложение */
  const isOnline = computed(() => appStateStore.isOnline);

  /** Загружается ли приложение */
  const isLoading = computed(() => appStateStore.isLoading);

  // ==================== КООРДИНИРУЮЩИЕ ДЕЙСТВИЯ ====================

  /**
   * Инициализация всех систем приложения
   * @returns Функция очистки для использования в onUnmounted
   */
  const initialize = (config?: StoreConfig) => {
    try {
      logger.info('Начинаем инициализацию приложения', { config });

      // Инициализация темы
      themeStore.initialize();
      logger.debug('Тема инициализирована');

      // Валидация начального состояния аутентификации
      if (authStore.token && authStore.user) {
        const tokenValidation = authStore.validateToken();
        if (!tokenValidation.isValid) {
          logger.warn('Невалидный токен при инициализации, очищаем авторизацию', {
            errors: tokenValidation.errors
          });
          authStore.clearAuth();
        } else {
          logger.info('Токен валиден при инициализации');
        }
      }

      // Настройка слушателей сетевого статуса
      const handleOnline = () => {
        logger.info('Соединение восстановлено');
        appStateStore.setOnlineStatus(true);
      };

      const handleOffline = () => {
        logger.warn('Потеряно соединение с интернетом');
        appStateStore.setOnlineStatus(false);
        // Добавляем предупреждение об отсутствии соединения
        errorStore.addError(
          'Отсутствует подключение к интернету',
          'warning',
          'network.offline',
          null,
          { autoResolve: true, timeout: 30000 }
        );
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      logger.debug('Слушатели сетевого статуса установлены');

      // Сохраняем ссылки для последующей очистки
      const cleanupNetworkListeners = () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        logger.debug('Слушатели сетевого статуса удалены');
      };

      logger.info('Стор приложения успешно инициализирован', getCurrentState());

      // Возвращаем функцию очистки для onUnmounted
      return cleanupNetworkListeners;
    } catch (error) {
      logger.error('Ошибка при инициализации стора приложения', { error });
      errorStore.addError(
        'Не удалось инициализировать приложение',
        'error',
        'app.initialize',
        error
      );
      throw error;
    }
  };

  /**
   * Установка данных аутентификации с обновлением активности
   * @param token - JWT токен
   * @param user - Данные пользователя
   */
  const setAuthData = (token: string, user: any) => {
    try {
      logger.info('Устанавливаем данные аутентификации', {
        userId: user?.id,
        username: user?.username
      });

      authStore.setAuthData(token, user);
      activityStore.updateLastActivity();

      logger.info('Данные аутентификации успешно установлены');
    } catch (error) {
      logger.error('Ошибка при установке данных аутентификации', { error });
      errorStore.addError(
        'Не удалось выполнить аутентификацию',
        'error',
        'auth.setAuthData',
        error
      );
      throw error;
    }
  };

  /**
   * Очистка данных аутентификации
   */
  const clearAuth = () => {
    logger.info('Очищаем данные аутентификации');
    authStore.clearAuth();
    activityStore.updateLastActivity();
    logger.info('Данные аутентификации очищены');
  };

  /**
   * Установка ошибки аутентификации
   * @param errorMessage - Сообщение об ошибке или null для очистки
   */
  const setAuthError = (errorMessage: string | null) => {
    logger.info('Устанавливаем ошибку аутентификации', { errorMessage });
    authStore.setError(errorMessage);
    if (errorMessage) {
      errorStore.addError(errorMessage, 'error', 'auth');
      logger.warn('Ошибка аутентификации добавлена в error store');
    }
  };

  /**
   * Переключение темы с обновлением активности
   * @returns Новая тема
   */
  const toggleTheme = () => {
    try {
      logger.info('Переключаем тему');
      const newTheme = themeStore.toggleTheme();
      activityStore.updateLastActivity();

      logger.info('Тема переключена', { newTheme });
      return newTheme;
    } catch (error) {
      logger.error('Ошибка при переключении темы', { error });
      errorStore.addError(
        'Не удалось изменить тему',
        'error',
        'theme.toggle',
        error
      );
      throw error;
    }
  };

  /**
   * Добавление ошибки с обновлением активности
   * @param message - Сообщение об ошибке
   * @param type - Тип ошибки
   * @param context - Контекст ошибки
   * @param details - Детали ошибки
   * @returns ID созданной ошибки
   */
  const addError = (
    message: string,
    type: 'error' | 'warning' | 'info' = 'error',
    context?: string,
    details?: unknown
  ) => {
    logger.info('Добавляем ошибку через app store', { message, type, context });
    const errorId = errorStore.addError(message, type, context, details);
    activityStore.updateLastActivity();
    return errorId;
  };

  /**
   * Установка состояния загрузки с обновлением активности
   * @param loading - Флаг загрузки
   */
  const setLoading = (loading: boolean) => {
    logger.debug('Устанавливаем состояние загрузки', { loading });
    appStateStore.setLoading(loading);
    if (!loading) {
      activityStore.updateLastActivity();
      logger.debug('Загрузка завершена, обновляем активность');
    }
  };

  /**
   * Получение текущего состояния для отладки
   * @returns Снимок текущего состояния всех сторов
   */
  const getCurrentState = (): StoreSnapshot => {
    const snapshot = {
      auth: {
        token: authStore.token,
        user: authStore.user,
        isAuthenticated: authStore.isAuthenticated,
        isLoading: authStore.loading
      },
      theme: {
        current: themeStore.current,
        preference: themeStore.preference,
        resolved: themeStore.resolved
      },
      app: {
        isOnline: appStateStore.isOnline,
        isLoading: appStateStore.isLoading,
        serverHealth: appStateStore.serverHealth,
        lastActivity: activityStore.lastActivity
      },
      errors: {
        count: errorStore.errorCount,
        latest: errorStore.latestError
      }
    };

    logger.debug('Текущее состояние приложения', snapshot);
    return snapshot;
  };

  /**
   * Сброс всех сторов к начальному состоянию
   */
  const reset = () => {
    try {
      logger.info('Сбрасываем все сторе к начальному состоянию');

      authStore.clearAuth();
      errorStore.clearErrors();
      appStateStore.setLoading(false);
      appStateStore.setServerHealth(false);
      activityStore.resetInactivityTimer();

      logger.info('Все сторе успешно сброшены');
    } catch (error) {
      logger.error('Ошибка при сбросе сторов', { error });
      errorStore.addError(
        'Не удалось сбросить состояние приложения',
        'error',
        'app.reset',
        error
      );
      throw error;
    }
  };

  /**
   * Очистка всех ресурсов
   */
  const cleanup = () => {
    try {
      logger.info('Начинаем очистку ресурсов приложения');

      themeStore.cleanup();
      activityStore.cleanupActivityListeners();

      logger.info('Очистка ресурсов завершена');
    } catch (error) {
      logger.error('Ошибка при очистке ресурсов', { error });
      // Не бросаем ошибку здесь, так как cleanup вызывается в onUnmounted
    }
  };

  /**
   * Проверка возможности выполнить действие (комбинация нескольких условий)
   */
  const canPerformAction = computed(() => ({
    // Можно выполнять действия, если приложение онлайн и не загружается
    basic: isOnline.value && !appStateStore.isLoading,

    // Можно выполнять защищённые действия, если аутентифицирован и онлайн
    authenticated: isAuthenticated.value && isOnline.value && !appStateStore.isLoading,

    // Можно выполнять действия, требующие сервера
    withServer: isOnline.value && appStateStore.serverHealth && !appStateStore.isLoading,

    // Можно выполнять критические действия
    critical: isOnline.value && appStateStore.serverHealth && isAuthenticated.value && !appStateStore.isLoading
  }));

  /**
   * Проверка здоровья системы (внутренняя проверка состояния сторов)
   * @returns Отчет о здоровье
   */
  const checkHealth = (): HealthReport => {
    const checks: StoreHealthCheck[] = [
      {
        name: 'auth',
        status: authStore.isAuthenticated ? 'healthy' : 'degraded',
        issues: authStore.error ? [authStore.error] : [],
        lastChecked: Date.now(),
        metrics: {
          isAuthenticated: authStore.isAuthenticated,
          tokenValid: authStore.validateToken().isValid
        }
      },
      {
        name: 'network',
        status: appStateStore.isOnline ? 'healthy' : 'unhealthy',
        issues: appStateStore.isOnline ? [] : ['Нет сетевого соединения'],
        lastChecked: Date.now(),
        metrics: {
          isOnline: appStateStore.isOnline,
          serverHealth: appStateStore.serverHealth
        }
      },
      {
        name: 'errors',
        status: errorStore.errorCount > 5 ? 'degraded' : 'healthy',
        issues: errorStore.errorCount > 5 ? [`Активных ошибок: ${errorStore.errorCount}`] : [],
        lastChecked: Date.now(),
        metrics: {
          errorCount: errorStore.errorCount,
          latestError: errorStore.latestError?.message
        }
      },
      {
        name: 'performance',
        status: 'healthy',
        issues: [],
        lastChecked: Date.now(),
        metrics: {
          lastActivity: activityStore.lastActivity,
          timeSinceActivity: activityStore.timeSinceLastActivity
        }
      }
    ];

    const allHealthy = checks.every(c => c.status === 'healthy');
    const overallStatus = allHealthy ? 'healthy' :
      checks.some(c => c.status === 'unhealthy') ? 'unhealthy' : 'degraded';

    const report: HealthReport = {
      timestamp: Date.now(),
      overallStatus,
      checks,
      uptime: Date.now() - (activityStore.lastActivity || Date.now())
    };

    logger.info('Проверка здоровья завершена', report);
    return report;
  };

  /**
   * Получение метрик состояния приложения
   */
  const getMetrics = () => ({
    auth: {
      isAuthenticated: authStore.isAuthenticated,
      tokenValid: authStore.validateToken().isValid
    },
    performance: {
      lastActivity: activityStore.lastActivity,
      timeSinceActivity: activityStore.timeSinceLastActivity
    },
    errors: {
      count: errorStore.errorCount,
      severity: errorStore.errorsBySeverity,
      categories: errorStore.errorCategories
    },
    network: {
      isOnline: appStateStore.isOnline,
      serverHealth: appStateStore.serverHealth
    }
  });

  // Автоматическая инициализация
  let cleanupNetworkListeners: (() => void) | null = null;

  try {
    cleanupNetworkListeners = initialize();
    logger.info('Автоматическая инициализация завершена');
  } catch (error) {
    logger.error('Ошибка при автоматической инициализации', { error });
  }

  /**
   * Полная очистка всех ресурсов
   */
  const fullCleanup = () => {
    logger.info('Начинаем полную очистку приложения');

    if (cleanupNetworkListeners) {
      cleanupNetworkListeners();
    }

    cleanup();

    logger.info('Полная очистка завершена');
  };

  // Автоматическая очистка при размонтировании
  onUnmounted(() => {
    logger.info('Компонент размонтируется, выполняем очистку');
    fullCleanup();
  });

  return {
    // ==================== КОМПЬЮТЕД СВОЙСТВА ====================
    isAuthenticated,
    hasErrors,
    resolvedTheme,
    isOnline,
    isLoading,
    canPerformAction,

    // ==================== АУТЕНТИФИКАЦИЯ ====================
    auth: {
      token: authStore.token,
      user: authStore.user,
      loading: authStore.loading,
      error: authStore.error,
      isAuthenticated: authStore.isAuthenticated,
      setAuthData,
      clearAuth,
      setLoading: authStore.setLoading,
      setError: setAuthError,
      hasRole: authStore.hasRole,
      hasAnyRole: authStore.hasAnyRole,
      hasPermission: authStore.hasPermission,
      validateToken: authStore.validateToken
    },

    // ==================== ТЕМА ====================
    theme: {
      current: themeStore.current,
      preference: themeStore.preference,
      resolved: themeStore.resolved,
      isDark: themeStore.isDark,
      isLight: themeStore.isLight,
      initialize: themeStore.initialize,
      setTheme: themeStore.setTheme,
      toggleTheme
    },

    // ==================== ОШИБКИ ====================
    errors: {
      list: errorStore.errors,
      hasErrors,
      latest: errorStore.latestError,
      count: errorStore.errorCount,
      active: errorStore.activeErrors,
      addError,
      removeError: errorStore.removeError,
      clearErrors: errorStore.clearErrors,
      clearByContext: errorStore.clearErrorsByContext,
      clearByType: errorStore.clearErrorsByType,
      filterErrors: errorStore.filterErrors,
      getInsights: errorStore.getErrorInsights
    },

    // ==================== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ====================
    appState: {
      isOnline: appStateStore.isOnline,
      isLoading: appStateStore.isLoading,
      serverHealth: appStateStore.serverHealth,
      setOnlineStatus: appStateStore.setOnlineStatus,
      setLoading,
      setServerHealth: appStateStore.setServerHealth
    },

    // ==================== АКТИВНОСТЬ ====================
    activity: {
      lastActivity: activityStore.lastActivity,
      timeSinceLastActivity: activityStore.timeSinceLastActivity,
      isInactive: activityStore.isInactive,
      updateLastActivity: activityStore.updateLastActivity,
      resetInactivityTimer: activityStore.resetInactivityTimer
    },

    // ==================== ЗДОРОВЬЕ СИСТЕМЫ ====================
    health: {
      checkHealth,
      getMetrics
    },

    // ==================== УПРАВЛЕНИЕ СТОРОМ ====================
    getCurrentState,
    reset,
    initialize,
    cleanup: fullCleanup,

    // ==================== ЛОГИРОВАНИЕ ====================
    logs: {
      logAction: (action: string, metadata?: Record<string, unknown>) => {
        logger.info(`Действие: ${action}`, metadata);
      },
      logError: (error: Error, context?: string) => {
        logger.error(`Ошибка в контексте: ${context || 'unknown'}`, { error });
        addError(error.message, 'error', context, error.stack);
      },
      logWarning: (warning: string, context?: string) => {
        logger.warn(`Предупреждение: ${warning}`, { context });
        addError(warning, 'warning', context);
      }
    }
  };
});

export type AppStore = ReturnType<typeof useAppStore>;
