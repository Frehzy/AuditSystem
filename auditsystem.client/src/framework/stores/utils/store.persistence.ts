/**
 * Утилиты для сохранения состояния сторов
 */

import { logger } from '@/core/services/logger/logger.service';

interface PersistedState {
  version: number;
  timestamp: number;
  data: Record<string, unknown>;
}

export class StorePersistence {
  private readonly logger = logger.create('StorePersistence');

  saveToStorage(storage: Storage, key: string, data: any): void {
    try {
      const persistedState: PersistedState = {
        version: 1,
        timestamp: Date.now(),
        data
      };
      storage.setItem(key, JSON.stringify(persistedState));
    } catch (error) {
      this.logger.error('Failed to save to storage', { key, error });
    }
  }

  loadFromStorage(storage: Storage, key: string): Record<string, unknown> | null {
    try {
      const saved = storage.getItem(key);
      if (!saved) return null;

      const parsed: PersistedState = JSON.parse(saved);
      return parsed.data;
    } catch (error) {
      this.logger.error('Failed to load from storage', { key, error });
      return null;
    }
  }

  removeFromStorage(storage: Storage, key: string): void {
    try {
      storage.removeItem(key);
    } catch (error) {
      this.logger.error('Failed to remove from storage', { key, error });
    }
  }

  migrateData(oldData: any, version: number, migrate?: (oldData: any) => any): any {
    if (!migrate || version <= 1) return oldData;
    return migrate(oldData);
  }
}

export const storePersistence = new StorePersistence();
