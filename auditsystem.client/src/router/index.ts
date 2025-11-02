// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { logger } from '@/core/utils/logger';
import { useAppStore } from '@/framework/stores/app.store';
import { tokenService } from '@/core/services/auth/token.service';

// Динамические импорты для code splitting
const AuthView = () => import('@/modules/auth/views/AuthView.vue');
const AuditView = () => import('@/modules/audit/views/AuditView.vue');
const MonitoringView = () => import('@/modules/audit/components/views/MonitoringView.vue');
const ReportsView = () => import('@/modules/audit/components/views/ReportsView.vue');
const SettingsView = () => import('@/modules/audit/components/views/SettingsView.vue');
const ScriptsView = () => import('@/modules/audit/components/views/ScriptsView.vue');
const MilitaryUnitsView = () => import('@/modules/audit/components/views/MilitaryUnitsView.vue');

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresGuest?: boolean;
    title?: string;
    layout?: 'default' | 'auth';
    breadcrumb?: string;
    transition?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/audit/monitoring',
    meta: {
      requiresAuth: true
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
    },
    redirect: '/audit/monitoring',
    children: [
      {
        path: 'monitoring',
        name: 'Monitoring',
        component: MonitoringView,
        meta: {
          title: 'Мониторинг - AuditSystem Client',
          breadcrumb: 'Мониторинг'
        }
      },
      {
        path: 'reports',
        name: 'Reports',
        component: ReportsView,
        meta: {
          title: 'Отчеты - AuditSystem Client',
          breadcrumb: 'Отчеты'
        }
      },
      {
        path: 'scripts',
        name: 'Scripts',
        component: ScriptsView,
        meta: {
          title: 'Скрипты - AuditSystem Client',
          breadcrumb: 'Скрипты'
        }
      },
      {
        path: 'units',
        name: 'MilitaryUnits',
        component: MilitaryUnitsView,
        meta: {
          title: 'Войсковые части - AuditSystem Client',
          breadcrumb: 'Войсковые части'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView,
        meta: {
          title: 'Настройки - AuditSystem Client',
          breadcrumb: 'Настройки'
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
 * Проверка доступности сервера (упрощенная версия для роутера)
 */
const checkServerAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health', {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Проверка локальной валидности токена
 */
const isTokenLocallyValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    // Используем tokenService для проверки валидности токена
    const isValid = tokenService.isValidFormat(token) && !tokenService.isTokenExpired(token);

    logger.debug('Local token validation', {
      isValid,
      hasToken: !!token,
      tokenPreview: token.substring(0, 20) + '...'
    });

    return isValid;
  } catch (error) {
    logger.error('Local token validation error', { error });
    return false;
  }
};

/**
 * Навигационные guards
 */
router.beforeEach(async (to, from, next) => {
  const loggerContext = logger.create('Router');

  loggerContext.router('Navigation guard check', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest
  });

  // Получаем store через создание экземпляра
  const appStore = useAppStore();

  // Используем прямые computed свойства вместо getStoreState
  const authenticated = appStore.isAuthenticated;
  const token = appStore.token;

  // Проверка доступности сервера для защищенных маршрутов
  const isServerAvailable = to.meta?.requiresAuth ? await checkServerAvailability() : true;
  appStore.setServerHealth(isServerAvailable);

  // ДЛЯ ЗАЩИЩЕННЫХ МАРШРУТОВ: проверяем аутентификацию и доступность сервера
  if (to.meta?.requiresAuth) {
    // Проверяем локальную валидность токена
    const isTokenValid = isTokenLocallyValid(token);

    // СЦЕНАРИЙ 1: Токен валиден + сервер доступен = доступ разрешен
    if (authenticated && isTokenValid && isServerAvailable) {
      loggerContext.debug('Access granted - authenticated with valid token and server available');
      next();
      return;
    }

    // СЦЕНАРИЙ 2: Токен валиден + сервер недоступен = перенаправление на логин
    if (authenticated && isTokenValid && !isServerAvailable) {
      loggerContext.warn('Token valid but server unavailable, redirecting to login');
      appStore.clearAuth();
      appStore.addError('Сервер недоступен. Пожалуйста, попробуйте позже.', 'error', 'server.unavailable');
      next('/login');
      return;
    }

    // СЦЕНАРИЙ 3: Токен невалиден (независимо от сервера) = перенаправление на логин
    if (!authenticated || !isTokenValid) {
      loggerContext.warn('Token invalid or user not authenticated, redirecting to login');
      appStore.clearAuth();

      if (!isTokenValid) {
        appStore.addError('Сессия истекла. Пожалуйста, войдите снова.', 'error', 'auth.session_expired');
      } else {
        appStore.addError('Для доступа к этой странице требуется авторизация.', 'error', 'auth.required');
      }

      next('/login');
      return;
    }
  }

  // ДЛЯ ГОСТЕВЫХ МАРШРУТОВ (например, /login): если пользователь уже аутентифицирован, перенаправляем
  if (to.meta?.requiresGuest && authenticated) {
    // Проверяем валидность токена и доступность сервера
    const isTokenValid = isTokenLocallyValid(token);
    const serverAvailable = await checkServerAvailability();

    // Если токен валиден и сервер доступен - перенаправляем в приложение
    if (isTokenValid && serverAvailable) {
      loggerContext.warn('User already authenticated with valid token, redirecting to audit');
      next('/audit/monitoring');
      return;
    } else {
      // Если что-то не так - очищаем аутентификацию и разрешаем остаться на странице логина
      loggerContext.warn('Token invalid or server unavailable on guest route, clearing auth');
      appStore.clearAuth();
    }
  }

  // Обработка несуществующих маршрутов
  if (to.matched.length === 0) {
    loggerContext.warn('Route not found');

    // Если пользователь аутентифицирован с валидным токеном и сервер доступен - перенаправляем в audit
    const isTokenValid = isTokenLocallyValid(token);
    const serverAvailable = await checkServerAvailability();

    if (authenticated && isTokenValid && serverAvailable) {
      appStore.addError('Страница не найдена.', 'warning', 'router.not_found');
      next('/audit/monitoring');
    } else {
      // В противном случае - на логин
      appStore.clearAuth();
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

  loggerContext.router('Navigation completed', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    transition: to.meta?.transition,
  });

  // Track page view for analytics
  if (to.name) {
    logger.info('Page view', { page: to.name.toString(), path: to.path });
  }
});

router.onError((error) => {
  const loggerContext = logger.create('Router');

  // Логируем детальную информацию об ошибке
  loggerContext.error('Router navigation error', {
    error: error.message,
    stack: error.stack,
    path: window.location.pathname,
    isChunkError: error.message.includes('Loading chunk') || error.message.includes('dynamically imported module')
  });

  // Для ошибок загрузки chunks - предлагаем перезагрузку
  if (error.message.includes('Loading chunk') || error.message.includes('dynamically imported module')) {
    // Можно показать диалог с предложением перезагрузить страницу
    if (confirm('Произошла ошибка при загрузке страницы. Хотите перезагрузить страницу?')) {
      window.location.reload();
    }
  }
});

export default router;
