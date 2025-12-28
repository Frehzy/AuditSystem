/**
 * Навигационный гард для проверки прав доступа
 * Оптимизирована логика проверки и добавлено кэширование
 */

import type { NavigationGuard } from 'vue-router';
import { logger } from '@/core/services/logger/logger.service';
import { notificationService } from '@/core/services/notification/notification.service';

// Кэш для хранения результатов проверки прав (ускоряет повторные проверки)
const permissionCache = new Map<string, boolean>();

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

  // Создаем ключ кэша для маршрута и пользователя
  const cacheKey = `${to.path}-${JSON.stringify(requiresRoles)}-${JSON.stringify(requiresPermissions)}`;

  // Динамический импорт чтобы избежать циклических зависимостей
  const { useAuthStore } = await import('@/framework/stores');
  const authStore = useAuthStore();

  // ОПТИМИЗАЦИЯ: Проверяем кэш
  if (permissionCache.has(cacheKey)) {
    const hasAccess = permissionCache.get(cacheKey);
    if (hasAccess) {
      loggerContext.debug('Permission check passed (from cache)');
      next();
      return;
    }
  }

  // Проверка ролей
  let hasAccess = true;

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

  // Сохраняем результат в кэш (только для успешных проверок)
  permissionCache.set(cacheKey, true);

  // Очищаем кэш при выходе из системы
  if (to.name === 'Logout') {
    permissionCache.clear();
  }

  loggerContext.debug('Permission check passed');
  next();
};
