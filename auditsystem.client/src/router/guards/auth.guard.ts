/**
 * Навигационный гард для проверки авторизации
 */

import type { NavigationGuard } from 'vue-router';
import { logger } from '@/core/services/logger/logger.service';
import { notificationService } from '@/core/services/notification/notification.service';

export const authGuard: NavigationGuard = async (to, from, next) => {
  const loggerContext = logger.create('AuthGuard');

  // Динамический импорт чтобы избежать циклических зависимостей
  const { useAuthStore } = await import('@/framework/stores');
  const authStore = useAuthStore();

  loggerContext.debug('Auth guard triggered', {
    to: to.name?.toString() || to.path,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest
  });

  // Для защищенных маршрутов
  if (to.meta?.requiresAuth) {
    if (!authStore.isAuthenticated) {
      loggerContext.warn('Access denied: user not authenticated');
      notificationService.warning('Требуется авторизация для доступа к этой странице');
      next('/login');
      return;
    }

    // Проверка валидности токена
    const isValid = await authStore.validateToken();
    if (!isValid) {
      loggerContext.warn('Access denied: invalid token');
      notificationService.warning('Сессия истекла. Пожалуйста, войдите снова.');
      authStore.clearAuthData();
      next('/login');
      return;
    }

    loggerContext.debug('Access granted to protected route');
    next();
    return;
  }

  // Для гостевых маршрутов
  if (to.meta?.requiresGuest && authStore.isAuthenticated) {
    loggerContext.debug('Redirecting authenticated user from guest route');
    next('/audit/monitoring');
    return;
  }

  next();
};
