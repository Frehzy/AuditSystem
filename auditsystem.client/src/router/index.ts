/**
 * Основной файл роутера
 * Полностью оптимизирован с улучшенной обработкой ошибок и производительностью
 */

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { logger } from '@/core/services/logger/logger.service';
import routes from './routes';
import { authGuard, permissionGuard } from './guards';

// Импорты, которые используются в хуках
let errorStore: any;
let activityStore: any;
let notificationService: any;
let httpClient: any;

// Ленивая загрузка зависимостей для оптимизации начальной загрузки
const lazyImports = {
  async getErrorStore() {
    if (!errorStore) {
      const module = await import('@/framework/stores');
      errorStore = module.useErrorStore;
    }
    return errorStore;
  },

  async getActivityStore() {
    if (!activityStore) {
      const module = await import('@/framework/stores');
      activityStore = module.useActivityStore;
    }
    return activityStore;
  },

  async getNotificationService() {
    if (!notificationService) {
      const module = await import('@/core/services/notification/notification.service');
      notificationService = module.notificationService;
    }
    return notificationService;
  },

  async getHttpClient() {
    if (!httpClient) {
      const module = await import('@/core/services/api/http-client.service');
      httpClient = module.httpClient;
    }
    return httpClient;
  }
};

// Кэш для проверки доступности сервера
const serverAvailabilityCache = {
  lastCheck: 0,
  isAvailable: true,
  cacheDuration: 60000 // 1 минута
};

const checkServerAvailability = async (): Promise<boolean> => {
  const now = Date.now();

  // Используем кэшированный результат, если проверка была недавно
  if (now - serverAvailabilityCache.lastCheck < serverAvailabilityCache.cacheDuration) {
    return serverAvailabilityCache.isAvailable;
  }

  try {
    const httpClient = await lazyImports.getHttpClient();
    await httpClient.head('/health', {
      requireAuth: false,
      timeout: 3000 // Уменьшено время ожидания
    });

    serverAvailabilityCache.isAvailable = true;
    serverAvailabilityCache.lastCheck = now;
    return true;
  } catch (error) {
    serverAvailabilityCache.isAvailable = false;
    serverAvailabilityCache.lastCheck = now;

    const loggerContext = logger.create('Router');
    loggerContext.warn('Server unavailable', { error });
    return false;
  }
};

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Записываем событие скролла (лениво)
    lazyImports.getActivityStore().then((storeFn) => {
      const store = storeFn();
      store.updateLastActivity('scroll', {
        fromRoute: from.name?.toString() || from.path,
        toRoute: to.name?.toString() || to.path,
        savedPosition: !!savedPosition
      });
    }).catch(() => { }); // Игнорируем ошибки в этом не критичном действии

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

// Основные обработчики навигации
router.beforeEach(async (to, from) => {
  const loggerContext = logger.create('Router');

  // Устанавливаем заголовок страницы сразу (не блокируя навигацию)
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }

  // Логируем начало навигации
  loggerContext.info('Navigation started', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    requiresAuth: to.meta?.requiresAuth,
    requiresGuest: to.meta?.requiresGuest
  });

  // Асинхронно записываем активность (не блокируем навигацию)
  lazyImports.getActivityStore().then((storeFn) => {
    const store = storeFn();
    store.updateLastActivity('navigation_start', {
      from: from.name?.toString() || from.path || 'unknown',
      to: to.name?.toString() || to.path,
      timestamp: Date.now()
    });
  }).catch(() => { });

  // Проверяем доступность сервера для защищенных маршрутов (асинхронно)
  if (to.meta?.requiresAuth) {
    checkServerAvailability().then((isAvailable) => {
      if (!isAvailable) {
        loggerContext.warn('Server unavailable for protected route');
      }
    }).catch(() => { });
  }
});

router.afterEach((to, from) => {
  const loggerContext = logger.create('Router');

  loggerContext.info('Navigation completed', {
    from: from.name?.toString() || from.path || 'unknown',
    to: to.name?.toString() || to.path,
    transition: to.meta?.transition
  });

  // Асинхронно записываем завершение навигации
  lazyImports.getActivityStore().then((storeFn) => {
    const store = storeFn();
    store.recordActivityEvent('navigation_complete', {
      fromRoute: from.name?.toString() || from.path || 'unknown',
      toRoute: to.name?.toString() || to.path,
      category: to.meta?.category,
      timestamp: Date.now()
    });
  }).catch(() => { });

  // Аналитика просмотра страницы
  if (to.name) {
    logger.info('Page viewed', {
      page: to.name.toString(),
      path: to.path,
      category: to.meta?.category
    });
  }
});

router.onError(async (error) => {
  const loggerContext = logger.create('Router');

  // Определяем тип ошибки
  const isChunkError = error.message.includes('Loading chunk') ||
    error.message.includes('dynamically imported module');

  loggerContext.error('Router navigation error', {
    error: error.message,
    stack: error.stack,
    path: window.location.pathname,
    isChunkError
  });

  try {
    const [errorStoreFn, activityStoreFn, notificationServiceFn] = await Promise.all([
      lazyImports.getErrorStore(),
      lazyImports.getActivityStore(),
      lazyImports.getNotificationService()
    ]);

    const errorStore = errorStoreFn();
    const activityStore = activityStoreFn();
    const notificationService = notificationServiceFn();

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

    // Для ошибок загрузки chunks - предлагаем перезагрузку
    if (isChunkError) {
      notificationService.error('Ошибка при загрузке страницы. Пожалуйста, перезагрузите страницу.', {
        title: 'Ошибка загрузки',
        duration: 10000,
        actions: [{
          label: 'Перезагрузить',
          handler: () => window.location.reload()
        }]
      });
    }
  } catch (importError) {
    loggerContext.error('Failed to handle navigation error', { importError });

    // Fallback: просто перезагружаем при chunk ошибках
    if (isChunkError) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }
});

// Экспортируем функцию для инициализации
export const initializeRouter = () => {
  logger.info('Router initialized');
  return router;
};

export default router;
