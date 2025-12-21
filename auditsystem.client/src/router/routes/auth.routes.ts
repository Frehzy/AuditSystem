/**
 * Маршруты модуля авторизации
 */

import type { RouteRecordRaw } from 'vue-router';

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/modules/auth/views/AuthView.vue'),
    meta: {
      requiresGuest: true,
      title: 'Вход - AuditSystem Client',
      transition: 'slide-left',
      category: 'auth'
    }
  },
  {
    path: '/logout',
    name: 'Logout',
    redirect: () => {
      // Динамический импорт для избежания циклических зависимостей
      import('@/framework/stores').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        authStore.logout();
      });
      return '/login';
    }
  }
];

export default authRoutes;
