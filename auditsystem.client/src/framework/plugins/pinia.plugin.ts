/**
 * Плагин Pinia для глобальной обработки
 */

import type { PiniaPluginContext } from 'pinia';
import { logger } from '@/core/services/logger/logger.service';

export const piniaPlugin = (context: PiniaPluginContext) => {
  const { store } = context;
  const loggerContext = logger.create(`Store:${store.$id}`);

  // Логирование изменений состояния
  store.$subscribe((mutation, state) => {
    if (import.meta.env.DEV) {
      loggerContext.debug('State changed', {
        mutation,
        newState: state
      });
    }
  });

  // Логирование действий
  const originalDispatch = store.$onAction;
  store.$onAction(({ name, store, args, after, onError }) => {
    const startTime = Date.now();

    loggerContext.debug('Action started', {
      action: name,
      args,
      store: store.$id
    });

    after((result) => {
      const duration = Date.now() - startTime;
      loggerContext.debug('Action completed', {
        action: name,
        duration: `${duration}ms`,
        result
      });
    });

    onError((error) => {
      loggerContext.error('Action failed', {
        action: name,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    });
  });

  return {
    $logger: loggerContext
  };
};
