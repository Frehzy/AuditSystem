/**
 * Навигационный гард для проверки прав доступа
 */

import type { NavigationGuard, RouteLocationNormalized } from 'vue-router';
import { logger } from '@/core/services/logger/logger.service';
import { notificationService } from '@/core/services/notification/notification.service';

export const permissionGuard: NavigationGuard = async (to, from, next) => {
  const loggerContext = logger.create('PermissionGuard');

  // Пропускаем маршруты без требований к правам
  const requiresRoles = to.meta?.requiresRoles as string[] | undefined;
  const requiresPermissions = to.meta?.requiresPermissions as string[] | undefined;

  if ((!requiresRoles || requiresRoles.length === 0) &&
    (!requiresPermissions || requiresPermissions.length === 0)) {
    next();
    return;
  }

  // Динамический импорт чтобы избежать циклических зависимостей
  const { useAuthStore } = await import('@/framework/stores');
  const authStore = useAuthStore();

  // Проверка ролей
  if (requiresRoles && requiresRoles.length > 0) {
    const hasAnyRole = authStore.hasAnyRole(requiresRoles);
    if (!hasAnyRole) {
      loggerContext.warn('Access denied: insufficient roles', {
        required: requiresRoles,
        userRole: authStore.user?.role
      });

      notificationService.warning(
        `Недостаточно прав для доступа к ${to.meta?.title || 'этой странице'}`,
        { title: 'Доступ запрещен' }
      );

      // Редирект на доступную страницу или предыдущую
      const fallbackRoute = authStore.isAuthenticated ? '/audit/monitoring' : '/login';
      next(fallbackRoute);
      return;
    }
  }

  // Проверка разрешений
  if (requiresPermissions && requiresPermissions.length > 0) {
    const hasAllPermissions = requiresPermissions.every(
      (permission: string) => authStore.hasPermission(permission)
    );

    if (!hasAllPermissions) {
      loggerContext.warn('Access denied: insufficient permissions', {
        required: requiresPermissions,
        userPermissions: authStore.user?.permissions
      });

      notificationService.warning(
        `Отсутствуют необходимые разрешения для ${to.meta?.title || 'этой странице'}`,
        { title: 'Доступ запрещен' }
      );

      const fallbackRoute = authStore.isAuthenticated ? '/audit/monitoring' : '/login';
      next(fallbackRoute);
      return;
    }
  }

  loggerContext.debug('Permission check passed');
  next();
};
