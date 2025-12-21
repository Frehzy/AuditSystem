/**
 * Pinia plugin: Автосохранение состояния в localStorage
 */

import { PiniaPluginContext } from 'pinia';
import { APP_CONFIG } from '@/core/config/app.config';
import { logger } from '@/core/services/logger/logger.service';
import { storePersistence } from '../utils/store.persistence';

interface PersistenceConfig {
  keys?: string[];
  storage?: 'local' | 'session';
  keyPrefix?: string;
  version?: number;
  migrate?: (oldData: any) => any;
}

interface PersistedState {
  version: number;
  timestamp: number;
  data: Record<string, unknown>;
}

export function persistencePlugin(context: PiniaPluginContext) {
  const { store, options } = context;
  const persistenceConfig = (options as any).persistence as PersistenceConfig | undefined;

  if (!persistenceConfig) return;

  const {
    keys = Object.keys(store.$state),
    storage = 'local',
    keyPrefix = 'store_',
    version = 1,
    migrate
  } = persistenceConfig;

  const storageKey = `${keyPrefix}${store.$id}`;
  const storageApi = storage === 'local' ? localStorage : sessionStorage;
  const storeLogger = logger.create(`Persistence:${store.$id}`);

  // Загрузка сохраненного состояния
  try {
    const savedData = storePersistence.loadFromStorage(storageApi, storageKey);

    if (savedData) {
      // Применяем миграцию если нужна
      let data = savedData;
      if (migrate && version > 1) {
        data = storePersistence.migrateData(data, version, migrate);
      }

      // Восстанавливаем состояние
      keys.forEach(key => {
        if (data[key] !== undefined) {
          (store.$state as any)[key] = data[key];
        }
      });

      storeLogger.debug('Store state restored', {
        keys: keys.length,
        version
      });
    }
  } catch (error) {
    storeLogger.error('Failed to restore store state', { error });
  }

  // Подписка на изменения
  const unsubscribe = store.$subscribe((mutation, state) => {
    try {
      const dataToSave: Record<string, unknown> = {};
      keys.forEach(key => {
        dataToSave[key] = (state as any)[key];
      });

      storePersistence.saveToStorage(storageApi, storageKey, dataToSave);

      if (APP_CONFIG.FEATURES.DEBUG_LOGS) {
        storeLogger.debug('Store state saved', {
          keys: keys.length
        });
      }
    } catch (error) {
      storeLogger.error('Failed to save store state', { error });
    }
  }, { detached: true });

  // Очистка при размонтировании
  store.$onAction(({ name, after }) => {
    if (name === '$dispose') {
      unsubscribe();
    }
  });

  logger.info('Persistence plugin initialized', { store: store.$id });
}
