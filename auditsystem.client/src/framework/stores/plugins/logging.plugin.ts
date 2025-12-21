/**
 * Pinia plugin: Логирование действий store
 */

import { PiniaPluginContext } from 'pinia';
import { logger } from '@/core/services/logger/logger.service';

interface LoggingConfig {
  logActions?: boolean;
  logStateChanges?: boolean;
  excludedActions?: string[];
  storeName?: string;
}

export function loggingPlugin(context: PiniaPluginContext) {
  const { store, options } = context;
  const loggingConfig = (options as any).logging as LoggingConfig | undefined;

  if (!loggingConfig) return;

  const {
    logActions = true,
    logStateChanges = false,
    excludedActions = [],
    storeName = store.$id
  } = loggingConfig;

  const storeLogger = logger.create(`Store:${storeName}`);

  // Логирование действий
  if (logActions) {
    store.$onAction(({ name, args, store, after, onError }) => {
      if (excludedActions.includes(name)) return;

      const actionLogger = logger.create(`Action:${name}`);
      const startTime = Date.now();

      actionLogger.debug('Action started', {
        args,
        timestamp: startTime
      });

      after((result) => {
        const duration = Date.now() - startTime;
        actionLogger.debug('Action completed', {
          result,
          duration,
          timestamp: Date.now()
        });

        // Логируем медленные действия
        if (duration > 1000) {
          actionLogger.warn('Slow action detected', {
            duration,
            threshold: 1000
          });
        }
      });

      onError((error: unknown) => {
        const duration = Date.now() - startTime;
        actionLogger.error('Action failed', {
          error: error instanceof Error ? error.message : String(error),
          duration,
          timestamp: Date.now()
        });
      });
    });
  }

  // Логирование изменений состояния
  if (logStateChanges) {
    store.$subscribe((mutation, state) => {
      if (mutation.type === 'direct') return;

      storeLogger.debug('State changed', {
        mutation,
        newState: state,
        timestamp: Date.now()
      });
    }, { detached: true });
  }

  logger.info('Logging plugin initialized', { store: store.$id });
}
