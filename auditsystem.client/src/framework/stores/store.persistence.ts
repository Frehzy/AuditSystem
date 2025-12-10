// framework/stores/store.persistence.ts
import { logger } from '@/core/utils/logger';
import type {
  PersistenceConfig,
  PersistedState,
  DataMigration
} from './types/persistence.types';

/**
 * Интерфейс для элемента хранилища
 */
export interface StorageItem {
  store: string;
  size: number;
  timestamp: number;
}

/**
 * Сервис для сохранения и восстановления состояния сторов
 */
export class StorePersistence {
  private static readonly PREFIX = 'store_persist_';
  private static readonly VERSION_KEY = 'persist_version';
  private static readonly MIGRATIONS_KEY = 'persist_migrations';

  // Регистр миграций
  private static migrations = new Map<string, DataMigration[]>();

  /**
   * Регистрация миграции для стора
   * @param storeName - Имя стора
   * @param migration - Миграция
   */
  static registerMigration(storeName: string, migration: DataMigration) {
    if (!StorePersistence.migrations.has(storeName)) {
      StorePersistence.migrations.set(storeName, []);
    }

    StorePersistence.migrations.get(storeName)!.push(migration);
    logger.debug('Миграция зарегистрирована', {
      store: storeName,
      migration: `${migration.fromVersion} → ${migration.toVersion}`
    });
  }

  /**
   * Сохранение состояния стора
   * @param storeName - Имя стора
   * @param data - Данные для сохранения
   * @param config - Конфигурация сохранения
   */
  static save(
    storeName: string,
    data: Record<string, unknown>,
    config?: Partial<PersistenceConfig>
  ) {
    try {
      const key = `${this.PREFIX}${storeName}`;
      const version = config?.version || this.getVersion(storeName);

      const toSave: PersistedState = {
        version,
        timestamp: Date.now(),
        data,
        hash: this.generateHash(data)
      };

      const storage = config?.storage === 'session' ? sessionStorage : localStorage;
      storage.setItem(key, JSON.stringify(toSave));

      logger.debug('Состояние стора сохранено', {
        store: storeName,
        version,
        storage: config?.storage || 'local',
        dataSize: JSON.stringify(data).length
      });
    } catch (error) {
      logger.error('Ошибка при сохранении состояния стора', {
        store: storeName,
        error
      });
    }
  }

  /**
   * Загрузка состояния стора
   * @param storeName - Имя стора
   * @param config - Конфигурация загрузки
   * @returns Загруженные данные или null
   */
  static load<T>(storeName: string, config?: Partial<PersistenceConfig>): T | null {
    try {
      const key = `${this.PREFIX}${storeName}`;
      const storage = config?.storage === 'session' ? sessionStorage : localStorage;
      const saved = storage.getItem(key);

      if (!saved) {
        logger.debug('Нет сохраненного состояния для стора', { store: storeName });
        return null;
      }

      const parsed: PersistedState = JSON.parse(saved);

      // Проверка целостности данных
      if (parsed.hash !== this.generateHash(parsed.data)) {
        logger.warn('Целостность данных нарушена, очищаем', { store: storeName });
        this.clear(storeName);
        return null;
      }

      // Проверка TTL (время жизни)
      if (config?.ttl && parsed.timestamp + config.ttl < Date.now()) {
        logger.debug('Данные устарели по TTL, очищаем', {
          store: storeName,
          ttl: config.ttl,
          age: Date.now() - parsed.timestamp
        });
        this.clear(storeName);
        return null;
      }

      const currentVersion = config?.version || this.getVersion(storeName);

      // Применение миграций, если версия изменилась
      if (parsed.version < currentVersion) {
        logger.info('Применяем миграции данных', {
          store: storeName,
          from: parsed.version,
          to: currentVersion
        });

        const migratedData = this.applyMigrations(storeName, parsed.data, parsed.version, currentVersion);
        parsed.data = migratedData;
        parsed.version = currentVersion;

        // Сохраняем мигрированные данные
        this.save(storeName, migratedData, config);
      }

      logger.debug('Состояние стора загружено', {
        store: storeName,
        version: parsed.version,
        age: Date.now() - parsed.timestamp
      });

      return parsed.data as T;
    } catch (error) {
      logger.error('Ошибка при загрузке состояния стора', {
        store: storeName,
        error
      });
      return null;
    }
  }

  /**
   * Очистка сохраненного состояния
   * @param storeName - Имя стора (опционально)
   */
  static clear(storeName?: string) {
    try {
      if (storeName) {
        // Очистка конкретного стора
        localStorage.removeItem(`${this.PREFIX}${storeName}`);
        sessionStorage.removeItem(`${this.PREFIX}${storeName}`);
        logger.debug('Состояние стора очищено', { store: storeName });
      } else {
        // Очистка всех сохраненных состояний
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(this.PREFIX)) {
            localStorage.removeItem(key);
          }
        });

        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith(this.PREFIX)) {
            sessionStorage.removeItem(key);
          }
        });

        logger.info('Все сохраненные состояния очищены');
      }
    } catch (error) {
      logger.error('Ошибка при очистке состояния стора', {
        store: storeName || 'all',
        error
      });
    }
  }

  /**
   * Получение информации о сохраненных данных
   */
  static getStorageInfo(): {
    localStorage: StorageItem[];
    sessionStorage: StorageItem[];
    totalSize: number;
  } {
    const info: {
      localStorage: StorageItem[];
      sessionStorage: StorageItem[];
      totalSize: number;
    } = {
      localStorage: [],
      sessionStorage: [],
      totalSize: 0
    };

    // Проверяем localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          const storeName = key.substring(this.PREFIX.length);
          const parsed = JSON.parse(value) as PersistedState;
          const size = value.length;

          info.localStorage.push({
            store: storeName,
            size,
            timestamp: parsed.timestamp
          });

          info.totalSize += size;
        }
      }
    });

    // Проверяем sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        const value = sessionStorage.getItem(key);
        if (value) {
          const storeName = key.substring(this.PREFIX.length);
          const parsed = JSON.parse(value) as PersistedState;
          const size = value.length;

          info.sessionStorage.push({
            store: storeName,
            size,
            timestamp: parsed.timestamp
          });

          info.totalSize += size;
        }
      }
    });

    logger.debug('Информация о хранилище собрана', info);

    return info;
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

  private static getVersion(storeName: string): number {
    const versionKey = `${this.VERSION_KEY}_${storeName}`;
    const savedVersion = localStorage.getItem(versionKey);
    return savedVersion ? parseInt(savedVersion, 10) : 1;
  }

  private static generateHash(data: unknown): string {
    const str = JSON.stringify(data);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(36);
  }

  private static applyMigrations(
    storeName: string,
    data: any,
    fromVersion: number,
    toVersion: number
  ): any {
    const storeMigrations = this.migrations.get(storeName) || [];
    let migratedData = data;

    // Сортируем миграции по версии
    const relevantMigrations = storeMigrations
      .filter(m => m.fromVersion >= fromVersion && m.toVersion <= toVersion)
      .sort((a, b) => a.fromVersion - b.fromVersion);

    // Применяем миграции последовательно
    for (const migration of relevantMigrations) {
      try {
        logger.debug('Применяем миграцию', {
          store: storeName,
          from: migration.fromVersion,
          to: migration.toVersion
        });

        migratedData = migration.migrate(migratedData);
      } catch (error) {
        logger.error('Ошибка при применении миграции', {
          store: storeName,
          migration: `${migration.fromVersion} → ${migration.toVersion}`,
          error
        });
        throw error;
      }
    }

    return migratedData;
  }
}

/**
 * Декоратор для автоматического сохранения/загрузки состояния стора
 */
export function persistStore(config: PersistenceConfig) {
  return function (target: any) {
    const originalSetup = target.setup;

    target.setup = function (...args: any[]) {
      const store = originalSetup.apply(this, args);

      // Загрузка сохраненного состояния
      const savedState = StorePersistence.load(config.store, config);
      if (savedState) {
        config.keys.forEach(key => {
          const savedData = savedState as Record<string, unknown>;
          if (savedData[key] !== undefined) {
            (store as any)[key] = savedData[key];
          }
        });

        logger.info('Состояние стора восстановлено', {
          store: config.store,
          keys: config.keys,
          storage: config.storage
        });
      }

      // Автоматическое сохранение при изменении
      if (typeof store.$subscribe === 'function') {
        const unsubscribe = store.$subscribe((mutation: any, state: any) => {
          const dataToSave: Record<string, unknown> = {};
          config.keys.forEach(key => {
            dataToSave[key] = state[key];
          });

          StorePersistence.save(config.store, dataToSave, config);
        });

        // Сохраняем функцию отписки для очистки
        store.$onUnmounted = () => {
          unsubscribe();
          logger.debug('Отписаны от изменений стора', {
            store: config.store
          });
        };
      }

      logger.info('Автосохранение настроено для стора', {
        store: config.store,
        keys: config.keys,
        version: config.version
      });

      return store;
    };

    return target;
  };
}
