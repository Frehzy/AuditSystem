// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { storageService } from '@/core/services/core/auth/storage.service';
import { tokenService } from '@/core/services/core/auth/token.service';
import { logger } from '@/core/utils/logger';

// Динамические импорты для code splitting
const AuthView = () => import('@/modules/auth/views/AuthView.vue');
const AuditView = () => import('@/modules/audit/views/AuditView.vue');
const MonitoringView = () => import('@/modules/audit/components/views/MonitoringView.vue');
const ReportsView = () => import('@/modules/audit/components/views/ReportsView.vue');
const SettingsView = () => import('@/modules/audit/components/views/SettingsView.vue');

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
    redirect: '/login',
    meta: {
      requiresGuest: true,
      layout: 'auth'
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
    children: [
      {
        path: '',
        name: 'Reports',
        component: ReportsView,
        meta: {
          title: 'Отчеты - AuditSystem Client',
          breadcrumb: 'Отчеты'
        }
      },
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
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }

    return { top: 0, behavior: 'smooth' };
  },
});

/**
 * Проверка аутентификации
 */
const isAuthenticated = (): boolean => {
  const token = storageService.getToken();
  if (!token) return false;

  try {
    return tokenService.isValidFormat(token) && !tokenService.isTokenExpired(token);
  } catch {
    return false;
  }
};

/**
 * Навигационные guards
 */
router.beforeEach((to, from, next) => {
  const loggerContext = logger.create('Router');

  loggerContext.router('Navigation guard check', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest
  });

  const authenticated = isAuthenticated();

  // Проверка аутентификации для защищенных маршрутов
  if (to.meta?.requiresAuth && !authenticated) {
    loggerContext.warn('Redirecting to login - authentication required');
    next('/login');
    return;
  }

  // Перенаправление авторизованных пользователей с гостевых маршрутов
  if (to.meta?.requiresGuest && authenticated) {
    loggerContext.warn('Redirecting to audit - user already authenticated');
    next('/audit');
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
});

router.onError((error) => {
  const loggerContext = logger.create('Router');

  loggerContext.error('Router error', {
    error: error.message,
    stack: error.stack,
  });
});

export default router;
