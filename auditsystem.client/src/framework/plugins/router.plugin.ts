/**
 * Плагин для интеграции с Vue Router
 */

import type { App } from 'vue';
import router from '@/router';
import { useActivityStore, useErrorStore } from '@/framework/stores';
import { logger } from '@/core/services/logger/logger.service';

export const routerPlugin = {
  install(app: App) {
    const loggerContext = logger.create('RouterPlugin');

    // Регистрируем глобальный обработчик ошибок маршрутизации
    router.onError((error: Error) => {
      const errorStore = useErrorStore();

      errorStore.addError(
        `Ошибка навигации: ${error.message}`,
        'error',
        'router.navigation',
        { error },
        { retryable: true, category: 'navigation' }
      );

      loggerContext.error('Router navigation error', { error: error.message });
    });

    // Логирование навигации
    router.beforeEach((to, from) => {
      const activityStore = useActivityStore();

      activityStore.recordActivityEvent('navigation_start', {
        fromRoute: from.name?.toString() || from.path,
        toRoute: to.name?.toString() || to.path,
        timestamp: Date.now()
      });

      loggerContext.debug('Navigation started', {
        from: from.name?.toString() || from.path,
        to: to.name?.toString() || to.path
      });
    });

    router.afterEach((to, from) => {
      const activityStore = useActivityStore();

      activityStore.recordActivityEvent('navigation_complete', {
        fromRoute: from.name?.toString() || from.path,
        toRoute: to.name?.toString() || to.path,
        timestamp: Date.now()
      });

      loggerContext.debug('Navigation completed', {
        from: from.name?.toString() || from.path,
        to: to.name?.toString() || to.path
      });
    });

    loggerContext.info('Router plugin installed');
  }
};
