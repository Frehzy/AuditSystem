/**
 * Основной файл роутера
 */

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { logger } from '@/core/services/logger/logger.service';
import { useErrorStore } from '@/framework/stores';
import { useActivityStore } from '@/framework/stores';
import { notificationService } from '@/core/services/notification/notification.service';
import { httpClient } from '@/core/services/api/http-client.service';
import routes from './routes';
import { authGuard, permissionGuard } from './guards';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    const activityStore = useActivityStore();

    // Записываем событие скролла
    activityStore.updateLastActivity('scroll', {
      fromRoute: from.name?.toString() || from.path,
      toRoute: to.name?.toString() || to.path,
      savedPosition: !!savedPosition
    });

    if (savedPosition) {
      return savedPosition;
    }

    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80
      };
    }

    if (to.path !== from.path) {
      return { top: 0, behavior: 'smooth' };
    }

    return { top: 0 };
  }
});

// Глобальные навигационные гарды
router.beforeEach(authGuard);
router.beforeEach(permissionGuard);

// Проверка доступности сервера (для логирования)
const checkServerAvailability = async (): Promise<boolean> => {
  try {
    await httpClient.head('/health', {
      requireAuth: false,
      timeout: 5000
    });
    return true;
  } catch (error) {
    logger.error('Server unavailable', { error });
    return false;
  }
};

// Обработчики навигации
router.beforeEach(async (to, from) => {
  const activityStore = useActivityStore();
  const loggerContext = logger.create('Router');

  // Записываем начало навигации
  activityStore.updateLastActivity('navigation_start', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    timestamp: Date.now()
  });

  loggerContext.info('Navigation started', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest
  });

  // Проверяем доступность сервера для защищенных маршрутов
  if (to.meta?.requiresAuth) {
    const isServerAvailable = await checkServerAvailability();
    if (!isServerAvailable) {
      loggerContext.warn('Server unavailable for protected route');
    }
  }

  // Установка заголовка страницы
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }
});

router.afterEach((to, from) => {
  const activityStore = useActivityStore();
  const loggerContext = logger.create('Router');

  loggerContext.info('Navigation completed', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    transition: to.meta?.transition
  });

  // Записываем завершение навигации
  activityStore.recordActivityEvent('navigation_complete', {
    fromRoute: from.name?.toString() || from.path || 'unknown',
    toRoute: to.name?.toString() || to.path,
    category: to.meta?.category,
    timestamp: Date.now()
  });

  // Аналитика просмотра страницы
  if (to.name) {
    logger.info('Page viewed', {
      page: to.name.toString(),
      path: to.path,
      category: to.meta?.category
    });
  }
});

router.onError((error) => {
  const loggerContext = logger.create('Router');
  const errorStore = useErrorStore();
  const activityStore = useActivityStore();

  loggerContext.error('Router navigation error', {
    error: error.message,
    stack: error.stack,
    path: window.location.pathname,
    isChunkError: error.message.includes('Loading chunk') || error.message.includes('dynamically imported module')
  });

  // Записываем ошибку
  const errorId = errorStore.addError(
    `Ошибка навигации: ${error.message}`,
    'error',
    'router.navigation',
    {
      message: error.message,
      stack: error.stack,
      path: window.location.pathname
    },
    {
      retryable: true,
      category: 'navigation',
      userActionRequired: true
    }
  );

  // Записываем событие
  activityStore.recordActivityEvent('navigation_error', {
    errorId,
    errorMessage: error.message,
    path: window.location.pathname,
    timestamp: Date.now()
  });

  // Для ошибок загрузки chunks
  if (error.message.includes('Loading chunk') || error.message.includes('dynamically imported module')) {
    notificationService.error('Ошибка при загрузке страницы. Пожалуйста, перезагрузите страницу.', {
      title: 'Ошибка загрузки',
      duration: 10000
    });
  }
});

// Экспортируем функцию для инициализации
export const initializeRouter = () => {
  logger.info('Router initialized');
  return router;
};

export default router;
