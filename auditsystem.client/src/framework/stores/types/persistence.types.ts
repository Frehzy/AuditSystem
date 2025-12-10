// framework/stores/types/persistence.types.ts

/**
 * Конфигурация сохранения состояния
 */
export interface PersistenceConfig {
  store: string;
  keys: string[];
  storage: 'local' | 'session';
  version: number;
  migrate?: (oldData: any) => any;
  encrypt?: boolean;
  ttl?: number; // время жизни в миллисекундах
}

/**
 * Сохраненное состояние
 */
export interface PersistedState {
  version: number;
  timestamp: number;
  data: Record<string, unknown>;
  hash?: string;
}

/**
 * Миграция данных
 */
export interface DataMigration {
  fromVersion: number;
  toVersion: number;
  migrate: (data: any) => any;
}
