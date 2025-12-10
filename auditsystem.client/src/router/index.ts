// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { logger } from '@/core/utils/logger';
import { useAppStore } from '@/framework/stores/app.store';
import { useAuthStore } from '@/framework/stores/auth.store';
import { useErrorStore } from '@/framework/stores/error.store';
import { useAppStateStore } from '@/framework/stores/app-state.store';
import { useActivityStore } from '@/framework/stores/activity.store';
import { tokenService } from '@/core/services/auth/token.service';
import { storeHealthMonitor } from '@/framework/stores/app.health';
import { storeLogger } from '@/framework/stores/store.middleware';

// Динамические импорты для code splitting
const AuthView = () => import('@/modules/auth/views/AuthView.vue');
const AuditView = () => import('@/modules/audit/views/AuditView.vue');
const MonitoringView = () => import('@/modules/audit/components/views/MonitoringView.vue');
const ReportsView = () => import('@/modules/audit/components/views/ReportsView.vue');
const SettingsView = () => import('@/modules/audit/components/views/settings/SettingsView.vue');
const ScriptsView = () => import('@/modules/audit/components/views/ScriptsView.vue');
const MilitaryUnitsView = () => import('@/modules/audit/components/views/military-units/MilitaryUnitsView.vue');

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresGuest?: boolean;
    requiresRoles?: string[];
    requiresPermissions?: string[];
    title?: string;
    layout?: 'default' | 'auth';
    breadcrumb?: string;
    transition?: string;
    category?: string; // Для категоризации навигации в activity store
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/audit/monitoring',
    meta: {
      requiresAuth: true,
      category: 'navigation'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthView,
    meta: {
      requiresGuest: true,
      title: 'Вход - AuditSystem Client',
      layout: 'auth',
      transition: 'slide-left',
      category: 'auth'
    }
  },
  {
    path: '/audit',
    name: 'Audit',
    component: AuditView,
    meta: {
      requiresAuth: true,
      title: 'Аудит - AuditSystem Client',
      layout: 'default',
      transition: 'slide-right',
      breadcrumb: 'Аудит',
      category: 'navigation'
    },
    redirect: '/audit/monitoring',
    children: [
      {
        path: 'monitoring',
        name: 'Monitoring',
        component: MonitoringView,
        meta: {
          title: 'Мониторинг - AuditSystem Client',
          breadcrumb: 'Мониторинг',
          category: 'monitoring',
          requiresPermissions: ['view_monitoring']
        }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: ReportsView,
        meta: {
          title: 'Отчеты - AuditSystem Client',
          breadcrumb: 'Отчеты',
          category: 'reports',
          requiresPermissions: ['view_reports']
        }
      },
      {
        path: 'scripts',
        name: 'Scripts',
        component: ScriptsView,
        meta: {
          title: 'Скрипты - AuditSystem Client',
          breadcrumb: 'Скрипты',
          category: 'scripts',
          requiresPermissions: ['manage_scripts']
        }
      },
      {
        path: 'units',
        name: 'MilitaryUnits',
        component: MilitaryUnitsView,
        meta: {
          title: 'Войсковые части - AuditSystem Client',
          breadcrumb: 'Войсковые части',
          category: 'military_units',
          requiresPermissions: ['view_units']
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView,
        meta: {
          title: 'Настройки - AuditSystem Client',
          breadcrumb: 'Настройки',
          category: 'settings',
          requiresRoles: ['admin', 'supervisor']
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/audit/monitoring'

  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Записываем событие скролла в activity store
    const activityStore = useActivityStore();
    activityStore.recordActivityEvent('scroll', {
      fromRoute: from.name?.toString() || from.path,
      toRoute: to.name?.toString() || to.path,
      savedPosition: !!savedPosition
    });

    // Сохраняем позицию скролла при переходе назад/вперед
    if (savedPosition) {
      return savedPosition;
    }

    // Плавный скролл к якорю
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80 // Отступ для фиксированного header'а
      };
    }

    // Сброс скролла наверх для новых маршрутов
    if (to.path !== from.path) {
      return { top: 0, behavior: 'smooth' };
    }

    return { top: 0 };
  },
});

/**
 * Проверка доступности сервера с использованием app-state store
 */
const checkServerAvailability = async (): Promise<boolean> => {
  const appStateStore = useAppStateStore();

  try {
    const response = await fetch('/api/health', {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: AbortSignal.timeout(5000)
    });

    const isAvailable = response.ok;
    appStateStore.setServerHealth(isAvailable);

    // Записываем событие проверки сервера
    if (!isAvailable) {
      const errorStore = useErrorStore();
      errorStore.addError(
        'Сервер недоступен',
        'warning',
        'server.health',
        { status: response.status, url: '/api/health' },
        { autoResolve: true, timeout: 30000, category: 'network' }
      );
    }

    return isAvailable;
  } catch (error) {
    appStateStore.setServerHealth(false);

    // Записываем ошибку соединения
    const errorStore = useErrorStore();
    errorStore.addError(
      'Ошибка соединения с сервером',
      'error',
      'server.connection',
      error,
      { retryable: true, category: 'network' }
    );

    return false;
  }
};

/**
 * Проверка ролей и разрешений пользователя
 */
const checkAccessPermissions = (to: any): boolean => {
  const authStore = useAuthStore();

  // Проверка ролей
  if (to.meta?.requiresRoles && to.meta.requiresRoles.length > 0) {
    const hasAnyRole = authStore.hasAnyRole(to.meta.requiresRoles);
    if (!hasAnyRole) {
      const errorStore = useErrorStore();
      errorStore.addError(
        `Недостаточно прав для доступа к ${to.meta.title || 'этой странице'}`,
        'warning',
        'auth.permission',
        {
          requiredRoles: to.meta.requiresRoles,
          userRole: authStore.user?.role,
          path: to.path
        },
        { userActionRequired: true, category: 'security' }
      );
      return false;
    }
  }

  // Проверка разрешений
  if (to.meta?.requiresPermissions && to.meta.requiresPermissions.length > 0) {
    const hasAllPermissions = to.meta.requiresPermissions.every((permission: string) =>
      authStore.hasPermission(permission)
    );

    if (!hasAllPermissions) {
      const errorStore = useErrorStore();
      errorStore.addError(
        `Отсутствуют необходимые разрешения для ${to.meta.title || 'этой страницы'}`,
        'warning',
        'auth.permission',
        {
          requiredPermissions: to.meta.requiresPermissions,
          userPermissions: authStore.user?.permissions,
          path: to.path
        },
        { userActionRequired: true, category: 'security' }
      );
      return false;
    }
  }

  return true;
};

/**
 * Навигационные guards
 */
router.beforeEach(async (to, from, next) => {
  const loggerContext = logger.create('Router');

  // Получаем все необходимые сторе
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const errorStore = useErrorStore();
  const activityStore = useActivityStore();
  const appStateStore = useAppStateStore();

  // Записываем начало навигации в activity store
  activityStore.updateLastActivity('navigation_start', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    timestamp: Date.now()
  });

  // Записываем действие в store logger
  const navigationLogId = storeLogger.getLogs().length + 1;
  const startTime = Date.now();

  loggerContext.router('Navigation guard check', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest,
    navigationLogId
  });

  // Проверка доступности сервера для защищенных маршрутов
  const isServerAvailable = to.meta?.requiresAuth ? await checkServerAvailability() : true;

  // Мониторинг здоровья системы
  if (to.meta?.requiresAuth) {
    storeHealthMonitor.registerStore('router', () => ({
      status: isServerAvailable ? 'healthy' : 'unhealthy',
      issues: isServerAvailable ? [] : ['Сервер недоступен'],
      metrics: {
        lastNavigation: Date.now(),
        serverAvailable: isServerAvailable,
        authRequired: to.meta?.requiresAuth
      }
    }));
  }

  // ДЛЯ ЗАЩИЩЕННЫХ МАРШРУТОВ: проверяем аутентификацию и доступность сервера
  if (to.meta?.requiresAuth) {
    // Проверяем локальную валидность токена
    const isTokenValid = authStore.validateToken().isValid;

    // Проверяем разрешения
    const hasAccess = checkAccessPermissions(to);

    // СЦЕНАРИЙ 1: Полный доступ
    if (authStore.isAuthenticated && isTokenValid && isServerAvailable && hasAccess) {
      loggerContext.debug('Access granted - full access');

      // Обновляем активность пользователя
      activityStore.updateLastActivity('navigation_success', {
        route: to.name?.toString() || to.path,
        category: to.meta?.category,
        duration: Date.now() - startTime
      });

      // Записываем успешную навигацию в middleware лог
      storeLogger.exportLogs();

      next();
      return;
    }

    // СЦЕНАРИЙ 2: Сервер недоступен
    if (authStore.isAuthenticated && isTokenValid && !isServerAvailable) {
      loggerContext.warn('Token valid but server unavailable, redirecting to login');

      errorStore.addError(
        'Сервер недоступен. Пожалуйста, попробуйте позже.',
        'error',
        'server.unavailable',
        { path: to.path, attemptedAt: new Date().toISOString() },
        { autoResolve: true, timeout: 60000, category: 'network', retryable: true }
      );

      // Записываем событие в activity store
      activityStore.recordActivityEvent('server_unavailable', {
        route: to.path,
        tokenValid: true,
        authenticated: true
      });

      next('/login');
      return;
    }

    // СЦЕНАРИЙ 3: Нет доступа по разрешениям
    if (authStore.isAuthenticated && isTokenValid && isServerAvailable && !hasAccess) {
      loggerContext.warn('Access denied - insufficient permissions');

      // Записываем событие отказа в доступе
      activityStore.recordActivityEvent('access_denied', {
        route: to.path,
        reason: 'insufficient_permissions',
        requiredRoles: to.meta?.requiresRoles,
        requiredPermissions: to.meta?.requiresPermissions
      });

      next('/audit/monitoring');
      return;
    }

    // СЦЕНАРИЙ 4: Токен невалиден или нет аутентификации
    if (!authStore.isAuthenticated || !isTokenValid) {
      loggerContext.warn('Token invalid or user not authenticated, redirecting to login');

      if (!isTokenValid) {
        errorStore.addError(
          'Сессия истекла. Пожалуйста, войдите снова.',
          'error',
          'auth.session_expired',
          { tokenPreview: authStore.token?.substring(0, 20) + '...' },
          { userActionRequired: true, category: 'auth' }
        );
      } else {
        errorStore.addError(
          'Для доступа к этой странице требуется авторизация.',
          'error',
          'auth.required',
          { path: to.path },
          { userActionRequired: true, category: 'auth' }
        );
      }

      // Записываем событие истечения сессии
      activityStore.recordActivityEvent('session_expired', {
        route: to.path,
        tokenValid: isTokenValid,
        authenticated: authStore.isAuthenticated
      });

      authStore.clearAuth();
      next('/login');
      return;
    }
  }

  // ДЛЯ ГОСТЕВЫХ МАРШРУТОВ
  if (to.meta?.requiresGuest && authStore.isAuthenticated) {
    const isTokenValid = authStore.validateToken().isValid;
    const serverAvailable = await checkServerAvailability();

    if (isTokenValid && serverAvailable) {
      loggerContext.warn('User already authenticated with valid token, redirecting to audit');

      // Записываем событие редиректа
      activityStore.recordActivityEvent('redirect_authenticated', {
        from: to.path,
        to: '/audit/monitoring',
        reason: 'already_authenticated'
      });

      next('/audit/monitoring');
      return;
    } else {
      loggerContext.warn('Token invalid or server unavailable on guest route, clearing auth');

      errorStore.addError(
        'Проблемы с аутентификацией. Пожалуйста, войдите снова.',
        'warning',
        'auth.revalidation',
        { tokenValid: isTokenValid, serverAvailable },
        { autoResolve: true, category: 'auth' }
      );

      authStore.clearAuth();
    }
  }

  // Обработка несуществующих маршрутов
  if (to.matched.length === 0) {
    loggerContext.warn('Route not found');

    const isTokenValid = authStore.validateToken().isValid;
    const serverAvailable = await checkServerAvailability();

    if (authStore.isAuthenticated && isTokenValid && serverAvailable) {
      errorStore.addError(
        'Страница не найдена.',
        'warning',
        'router.not_found',
        { path: to.path, attemptedAt: new Date().toISOString() },
        { autoResolve: true, timeout: 10000, category: 'navigation' }
      );

      // Записываем событие 404
      activityStore.recordActivityEvent('route_not_found', {
        path: to.path,
        authenticated: true,
        redirectTo: '/audit/monitoring'
      });

      next('/audit/monitoring');
    } else {
      // Записываем событие 404 для неаутентифицированного пользователя
      activityStore.recordActivityEvent('route_not_found_unauthenticated', {
        path: to.path,
        authenticated: false,
        redirectTo: '/login'
      });

      authStore.clearAuth();
      next('/login');
    }
    return;
  }

  // Установка заголовка страницы
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }

  next();
});

router.afterEach((to, from) => {
  const loggerContext = logger.create('Router');

  // Получаем activity store для записи завершения навигации
  const activityStore = useActivityStore();

  loggerContext.router('Navigation completed', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    transition: to.meta?.transition,
  });

  // Записываем завершение навигации
  activityStore.recordActivityEvent('navigation_complete', {
    fromRoute: from.name?.toString() || from.path || 'unknown',
    toRoute: to.name?.toString() || to.path,
    category: to.meta?.category,
    timestamp: Date.now()
  });

  // Track page view for analytics
  if (to.name) {
    logger.info('Page view', {
      page: to.name.toString(),
      path: to.path,
      category: to.meta?.category
    });
  }

  // Обновляем метрики производительности
  const appStore = useAppStore();
  if (to.meta?.requiresAuth) {
    const healthReport = appStore.health.checkHealth();
    loggerContext.debug('Health check after navigation', healthReport);
  }
});

router.onError((error) => {
  const loggerContext = logger.create('Router');

  // Получаем error store для записи ошибки навигации
  const errorStore = useErrorStore();
  const activityStore = useActivityStore();

  // Логируем детальную информацию об ошибке
  loggerContext.error('Router navigation error', {
    error: error.message,
    stack: error.stack,
    path: window.location.pathname,
    isChunkError: error.message.includes('Loading chunk') || error.message.includes('dynamically imported module')
  });

  // Записываем ошибку в error store
  const errorId = errorStore.addError(
    `Ошибка навигации: ${error.message}`,
    'error',
    'router.navigation',
    {
      message: error.message,
      stack: error.stack,
      path: window.location.pathname,
      isChunkError: error.message.includes('Loading chunk') || error.message.includes('dynamically imported module')
    },
    {
      retryable: true,
      category: 'navigation',
      userActionRequired: true
    }
  );

  // Записываем событие ошибки в activity store
  activityStore.recordActivityEvent('navigation_error', {
    errorId,
    errorMessage: error.message,
    isChunkError: error.message.includes('Loading chunk') || error.message.includes('dynamically imported module'),
    path: window.location.pathname,
    timestamp: Date.now()
  });

  // Для ошибок загрузки chunks - предлагаем перезагрузку
  if (error.message.includes('Loading chunk') || error.message.includes('dynamically imported module')) {
    // Записываем специальное событие для ошибок chunk
    activityStore.recordActivityEvent('chunk_load_error', {
      errorMessage: error.message,
      attemptedRoute: window.location.pathname
    });

    // Можно показать диалог с предложением перезагрузить страницу
    if (confirm('Произошла ошибка при загрузке страницы. Хотите перезагрузить страницу?')) {
      // Записываем событие перезагрузки
      activityStore.recordActivityEvent('manual_reload', {
        reason: 'chunk_load_error',
        confirmed: true
      });

      window.location.reload();
    } else {
      activityStore.recordActivityEvent('reload_declined', {
        reason: 'chunk_load_error',
        confirmed: false
      });
    }
  }
});

/**
 * Регистрируем глобальные обработчики ошибок роутера
 */
export const setupRouterErrorHandling = () => {
  // Регистрируем router в мониторинге здоровья
  storeHealthMonitor.registerStore('router', () => ({
    name: 'router',
    status: 'healthy',
    issues: [],
    lastChecked: Date.now(),
    metrics: {
      totalRoutes: routes.length,
      lastNavigation: Date.now()
    }
  }));

  // Настраиваем middleware логирование для роутера
  storeLogger.getLogs();

  logger.info('Router error handling initialized');
};

// Экспортируем функцию для инициализации
export const initializeRouter = () => {
  setupRouterErrorHandling();
  return router;
};

export default router;
