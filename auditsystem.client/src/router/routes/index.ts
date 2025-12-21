/**
 * Сбор всех маршрутов приложения
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
    redirect: '/audit/monitoring'
  }
];

export default routes;
