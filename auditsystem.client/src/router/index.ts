// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAppStore } from '@/framework/stores/app.store';
import { logger } from '@/core/utils/logger';

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
 * Навигационные guards
 */
router.beforeEach(async (to, from, next) => {
  const loggerContext = logger.create('Router');
  const appStore = useAppStore();

  loggerContext.router('Navigation guard check', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest
  });

  const authenticated = appStore.isAuthenticated;

  // Проверка аутентификации для защищенных маршрутов
  if (to.meta?.requiresAuth && !authenticated) {
    loggerContext.warn('Redirecting to login - authentication required');
    next('/login');
    return;
  }

  // Перенаправление авторизованных пользователей с гостевых маршрутов
  if (to.meta?.requiresGuest && authenticated) {
    loggerContext.warn('Redirecting to audit - user already authenticated');
    next('/audit/monitoring');
    return;
  }

  // Обработка несуществующих маршрутов
  if (to.matched.length === 0) {
    loggerContext.warn('Route not found, redirecting to monitoring');
    next('/audit/monitoring');
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
  const appStore = useAppStore();

  loggerContext.error('Router error', {
    error: error.message,
    stack: error.stack,
  });

  // Добавляем ошибку в store для отображения пользователю
  appStore.addError('Ошибка загрузки страницы', 'error', 'router');
});

export default router;
