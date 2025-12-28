/**
 * Навигационный гард для проверки авторизации
 * Исправлена логика переходов и добавлена более четкая структура проверок
 */

import type { NavigationGuard } from 'vue-router';
import { logger } from '@/core/services/logger/logger.service';
import { notificationService } from '@/core/services/notification/notification.service';

export const authGuard: NavigationGuard = async (to, from, next) => {
  const loggerContext = logger.create('AuthGuard');

  loggerContext.debug('Auth guard triggered', {
    to: to.name?.toString() || to.path,
    from: from.name?.toString() || from.path,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest
  });

  // Динамический импорт чтобы избежать циклических зависимостей
  const { useAuthStore } = await import('@/framework/stores');
  const authStore = useAuthStore();

  // ОПТИМИЗАЦИЯ: Получаем состояние аутентификации один раз
  const isAuthenticated = authStore.isAuthenticated;

  // 1. Проверка защищенных маршрутов (требуют аутентификации)
  if (to.meta?.requiresAuth) {
    if (!isAuthenticated) {
      loggerContext.warn('Access denied: user not authenticated');
      notificationService.warning('Требуется авторизация для доступа к этой странице');

      // Добавляем redirect параметр для возврата после входа
      const redirectPath = to.path !== '/' ? `?redirect=${encodeURIComponent(to.fullPath)}` : '';
      next(`/login${redirectPath}`);
      return;
    }

    // Проверка валидности токена (только для аутентифицированных пользователей)
    try {
      const isValid = await authStore.validateToken();
      if (!isValid) {
        loggerContext.warn('Access denied: invalid token');
        notificationService.warning('Сессия истекла. Пожалуйста, войдите снова.');
        authStore.clearAuthData();
        next('/login');
        return;
      }
    } catch (error) {
      loggerContext.error('Token validation error', { error });
      notificationService.error('Ошибка проверки сессии');
      authStore.clearAuthData();
      next('/login');
      return;
    }

    loggerContext.debug('Access granted to protected route');
    next();
    return;
  }

  // 2. Проверка гостевых маршрутов (только для неаутентифицированных)
  if (to.meta?.requiresGuest) {
    if (isAuthenticated) {
      loggerContext.debug('Redirecting authenticated user from guest route');

      // Пробуем получить redirect параметр или используем маршрут по умолчанию
      const redirectParam = from.query.redirect as string;
      const redirectPath = redirectParam || '/audit/monitoring';
      next(redirectPath);
      return;
    }

    // Неаутентифицированный пользователь может получить доступ к гостевому маршруту
    next();
    return;
  }

  // 3. Маршруты без ограничений по аутентификации
  next();
};
