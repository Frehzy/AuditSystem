/**
 * Сбор всех маршрутов приложения
 * Добавлен улучшенный обработчик 404 ошибок
 */

import type { RouteRecordRaw } from 'vue-router';
import authRoutes from './auth.routes';
import auditRoutes from './audit.routes';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/audit/monitoring',
    meta: {
      requiresAuth: true,
      category: 'navigation'
    }
  },
  ...authRoutes,
  ...auditRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/modules/common/views/NotFoundView.vue'), // Рекомендуется создать
    meta: {
      title: 'Страница не найдена - AuditSystem Client',
      requiresAuth: false
    }
  }
];

export default routes;
