// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { storage } from '@/core/services/storage/storage.service';
import { logger } from '@/core/utils/logger/logger';

// Динамические импорты для code splitting
const AuthView = () => import('@/modules/auth/views/AuthView.vue');
const AuditView = () => import('@/modules/audit/views/AuditView.vue');

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
    name: 'AuditSystem',
    component: AuditView,
    meta: {
      requiresAuth: true,
      title: 'Чат - AuditSystem Client',
      layout: 'default',
      transition: 'slide-right',
      breadcrumb: 'Чат',
    }
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
 * Навигационные guards
 */
const authGuard = (to: RouteLocationNormalized, from: RouteLocationNormalized): boolean | string => {
  // Добавляем проверку на существование meta
  if (!to.meta) {
    logger.warn('Route meta is undefined', { path: to.path, name: to.name });
    return true;
  }

  const isAuthenticated = storage.isValidToken();

  logger.router('Navigation guard check', {
    from: from?.name || 'unknown',
    to: to.name,
    isAuthenticated,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest,
  });

  // Проверка аутентификации для защищенных маршрутов
  if (to.meta.requiresAuth && !isAuthenticated) {
    logger.router('Redirecting to login - authentication required');
    return '/login';
  }

  // Перенаправление авторизованных пользователей с гостевых маршрутов
  if (to.meta.requiresGuest && isAuthenticated) {
    logger.router('Redirecting to audit - user already authenticated');
    return '/audit';
  }

  return true;
};

/**
 * Глобальная навигационная охрана
 */
router.beforeEach((to, from, next) => {
  const result = authGuard(to, from);

  if (result === true) {
    // Установка заголовка страницы
    if (to.meta.title) {
      document.title = to.meta.title as string;
    }
    next();
  } else {
    if (typeof result === 'string') {
      next(result);
    } else if (result === false) {
      next(false);
    } else {
      next();
    }
  }
});

router.afterEach((to, from) => {
  logger.router('Navigation completed', {
    from: from?.name || 'unknown',
    to: to.name,
    transition: to.meta.transition,
  });
});

router.onError((error) => {
  logger.error('Router error', {
    error: error.message,
    stack: error.stack,
  });
});

export default router;
