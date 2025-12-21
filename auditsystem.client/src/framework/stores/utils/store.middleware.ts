/**
 * Middleware для сторов Pinia
 */

import { logger } from '@/core/services/logger/logger.service';

export interface StoreMiddlewareConfig {
  logActions?: boolean;
  validateState?: boolean;
  debounceUpdates?: number;
}

export const createStoreMiddleware = (config: StoreMiddlewareConfig = {}) => {
  const {
    logActions = true,
    validateState = false,
    debounceUpdates = 0
  } = config;

  const storeLogger = logger.create('StoreMiddleware');

  return {
    beforeAction: (store: any, action: string, args: any[]) => {
      if (logActions) {
        storeLogger.debug('Action started', {
          store: store.$id,
          action,
          args
        });
      }
    },

    afterAction: (store: any, action: string, result: any, duration: number) => {
      if (logActions) {
        storeLogger.debug('Action completed', {
          store: store.$id,
          action,
          duration: `${duration}ms`,
          result
        });
      }

      if (duration > 1000) {
        storeLogger.warn('Slow action detected', {
          store: store.$id,
          action,
          duration: `${duration}ms`
        });
      }
    },

    onError: (store: any, action: string, error: unknown) => {
      storeLogger.error('Action failed', {
        store: store.$id,
        action,
        error: error instanceof Error ? error.message : String(error)
      });
    },

    validateStateChange: (store: any, mutation: any, newState: any) => {
      if (validateState) {
        // Здесь можно добавить валидацию состояния
        return true;
      }
      return true;
    }
  };
};

export const storeMiddleware = createStoreMiddleware();
