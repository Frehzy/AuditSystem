import { logger } from '@/core/utils/logger/logger';
import type { StorageType, StorageOptions, StorageItem } from '../types';

interface StorageMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  totalSize: number;
  lastOperation: string;
}

interface EncryptionService {
  encrypt(data: string): string;
  decrypt(data: string): string;
}

class BrowserStorageService {
  private readonly version = '2.0';
  private readonly logger = logger.create('BrowserStorageService');
  private metrics: StorageMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    totalSize: 0,
    lastOperation: ''
  };

  private encryptionService: EncryptionService | null = null;
  private changeListeners: Map<string, Array<(newValue: any, oldValue: any) => void>> = new Map();
  private readonly compressionThreshold = 1024; // 1KB

  constructor() {
    this.setupStorageListener();
    this.loadMetrics();
  }

  setEncryptionService(service: EncryptionService): void {
    this.encryptionService = service;
    this.logger.info('Encryption service configured');
  }

  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      const storage = this.getStorage(options.type || 'local');
      const item: StorageItem<T> = {
        value,
        createdAt: Date.now(),
        version: this.version
      };

      if (options.ttl) {
        item.expiresAt = Date.now() + options.ttl;
      }

      let serializedValue = JSON.stringify(item);

      // Сжатие для больших данных
      if (serializedValue.length > this.compressionThreshold) {
        serializedValue = this.compress(serializedValue);
      }

      // Шифрование если включено
      if (options.encrypt && this.encryptionService) {
        serializedValue = this.encryptionService.encrypt(serializedValue);
      }

      const oldValue = storage.getItem(key);
      storage.setItem(key, serializedValue);

      this.updateMetrics('set', true);
      this.notifyChangeListeners(key, value, oldValue ? JSON.parse(oldValue).value : null);

      this.logger.storage('Data saved to storage', {
        key,
        type: options.type || 'local',
        hasTTL: !!options.ttl,
        valueType: typeof value,
        size: serializedValue.length,
        encrypted: !!options.encrypt,
        compressed: serializedValue.length > this.compressionThreshold
      });

      return true;
    } catch (error) {
      this.updateMetrics('set', false);
      this.logger.error('Failed to save data to storage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.handleStorageError(error);
      return false;
    }
  }

  get<T>(key: string, type: StorageType = 'local'): T | null {
    try {
      const storage = this.getStorage(type);
      const item = storage.getItem(key);

      if (!item) {
        return null;
      }

      let processedItem = item;

      // Дешифрование если данные зашифрованы
      if (this.isEncrypted(item) && this.encryptionService) {
        try {
          processedItem = this.encryptionService.decrypt(item);
        } catch (error) {
          this.logger.warn('Failed to decrypt data, treating as plain text', { key });
        }
      }

      // Декомпрессия если данные сжаты
      if (this.isCompressed(processedItem)) {
        processedItem = this.decompress(processedItem);
      }

      const parsedItem: StorageItem<T> = JSON.parse(processedItem);

      // Проверка срока действия
      if (parsedItem.expiresAt && Date.now() > parsedItem.expiresAt) {
        this.remove(key, type);
        this.logger.debug('Expired data removed from storage', { key });
        return null;
      }

      // Проверка версии
      if (parsedItem.version !== this.version) {
        this.logger.debug('Data version mismatch', {
          key,
          storedVersion: parsedItem.version,
          currentVersion: this.version
        });
      }

      this.updateMetrics('get', true);

      this.logger.storage('Data retrieved from storage', {
        key,
        type,
        hasTTL: !!parsedItem.expiresAt,
        version: parsedItem.version,
        age: Date.now() - parsedItem.createdAt
      });

      return parsedItem.value;
    } catch (error) {
      this.updateMetrics('get', false);
      this.logger.error('Failed to get data from storage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Удаляем поврежденные данные
      this.remove(key, type);
      return null;
    }
  }

  remove(key: string, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      const oldValue = storage.getItem(key);
      storage.removeItem(key);

      this.updateMetrics('remove', true);
      this.notifyChangeListeners(key, null, oldValue ? JSON.parse(oldValue).value : null);

      this.logger.storage('Data removed from storage', { key, type });
      return true;
    } catch (error) {
      this.updateMetrics('remove', false);
      this.logger.error('Failed to remove data from storage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  clear(type?: StorageType): boolean {
    try {
      if (type) {
        this.getStorage(type).clear();
        this.logger.storage('Storage cleared', { type });
      } else {
        localStorage.clear();
        sessionStorage.clear();
        this.logger.storage('All storage cleared');
      }

      this.updateMetrics('clear', true);
      return true;
    } catch (error) {
      this.updateMetrics('clear', false);
      this.logger.error('Failed to clear storage', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  keys(type: StorageType = 'local'): string[] {
    try {
      const storage = this.getStorage(type);
      return Object.keys(storage);
    } catch (error) {
      this.logger.error('Failed to get storage keys', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  has(key: string, type: StorageType = 'local'): boolean {
    return this.get(key, type) !== null;
  }

  getSize(type: StorageType = 'local'): number {
    try {
      const storage = this.getStorage(type);
      let total = 0;

      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          total += (key.length + storage.getItem(key)!.length) * 2; // UTF-16
        }
      }

      return total;
    } catch (error) {
      this.logger.error('Failed to calculate storage size', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  getUsageStats(): { local: number; session: number; total: number } {
    const localSize = this.getSize('local');
    const sessionSize = this.getSize('session');

    return {
      local: localSize,
      session: sessionSize,
      total: localSize + sessionSize
    };
  }

  subscribe(key: string, callback: (newValue: any, oldValue: any) => void): () => void {
    if (!this.changeListeners.has(key)) {
      this.changeListeners.set(key, []);
    }

    const listeners = this.changeListeners.get(key)!;
    listeners.push(callback);

    return () => {
      const listeners = this.changeListeners.get(key);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  getWithDefault<T>(key: string, defaultValue: T, type: StorageType = 'local'): T {
    const value = this.get<T>(key, type);
    return value !== null ? value : defaultValue;
  }

  setMultiple<T>(items: Record<string, T>, options: StorageOptions = {}): Record<string, boolean> {
    const results: Record<string, boolean> = {};

    Object.entries(items).forEach(([key, value]) => {
      results[key] = this.set(key, value, options);
    });

    return results;
  }

  getMultiple<T>(keys: string[], type: StorageType = 'local'): Record<string, T | null> {
    const results: Record<string, T | null> = {};

    keys.forEach(key => {
      results[key] = this.get<T>(key, type);
    });

    return results;
  }

  removeMultiple(keys: string[], type: StorageType = 'local'): Record<string, boolean> {
    const results: Record<string, boolean> = {};

    keys.forEach(key => {
      results[key] = this.remove(key, type);
    });

    return results;
  }

  cleanupExpired(): string[] {
    const types: StorageType[] = ['local', 'session'];
    const removedKeys: string[] = [];

    types.forEach(type => {
      const keys = this.keys(type);
      keys.forEach(key => {
        // Пытаемся получить данные - если они просрочены, они будут удалены
        const value = this.get(key, type);
        if (value === null) {
          removedKeys.push(`${type}:${key}`);
        }
      });
    });

    this.logger.debug('Expired data cleanup completed', {
      removed: removedKeys.length,
      keys: removedKeys
    });

    return removedKeys;
  }

  exportData(type?: StorageType): Record<string, any> {
    const data: Record<string, any> = {};
    const types = type ? [type] : (['local', 'session'] as StorageType[]);

    types.forEach(storageType => {
      const keys = this.keys(storageType);
      keys.forEach(key => {
        const value = this.get(key, storageType);
        if (value !== null) {
          data[`${storageType}:${key}`] = value;
        }
      });
    });

    return data;
  }

  importData(data: Record<string, any>, options: StorageOptions = {}): void {
    Object.entries(data).forEach(([fullKey, value]) => {
      const [type, key] = fullKey.split(':') as [StorageType, string];
      if (type && key && (type === 'local' || type === 'session')) {
        this.set(key, value, { ...options, type });
      }
    });

    this.logger.info('Data imported to storage', {
      items: Object.keys(data).length
    });
  }

  getMetrics(): StorageMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalSize: 0,
      lastOperation: ''
    };
    this.saveMetrics();
  }

  private getStorage(type: StorageType): Storage {
    return type === 'session' ? sessionStorage : localStorage;
  }

  private compress(data: string): string {
    // Простая компрессия для демонстрации
    // В реальном приложении можно использовать более сложные алгоритмы
    try {
      return btoa(unescape(encodeURIComponent(data)));
    } catch {
      return data;
    }
  }

  private decompress(data: string): string {
    try {
      return decodeURIComponent(escape(atob(data)));
    } catch {
      return data;
    }
  }

  private isCompressed(data: string): boolean {
    // Простая проверка на base64
    try {
      return btoa(atob(data)) === data;
    } catch {
      return false;
    }
  }

  private isEncrypted(data: string): boolean {
    // Простая эвристика для определения зашифрованных данных
    return data.startsWith('enc:') || data.length % 4 === 0 && /^[A-Za-z0-9+/]*={0,2}$/.test(data);
  }

  private setupStorageListener(): void {
    // Слушаем изменения в localStorage из других вкладок
    window.addEventListener('storage', (event) => {
      if (event.key && event.newValue !== event.oldValue) {
        this.notifyChangeListeners(event.key, event.newValue, event.oldValue);
      }
    });
  }

  private notifyChangeListeners(key: string, newValue: any, oldValue: any): void {
    const listeners = this.changeListeners.get(key);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(newValue, oldValue);
        } catch (error) {
          this.logger.error('Error in storage change listener', { key, error });
        }
      });
    }
  }

  private updateMetrics(operation: string, success: boolean): void {
    this.metrics.totalOperations++;

    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
    }

    this.metrics.lastOperation = `${operation}:${success ? 'success' : 'failure'}`;
    this.saveMetrics();
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem('browser-storage-metrics', JSON.stringify(this.metrics));
    } catch (error) {
      this.logger.warn('Failed to save storage metrics', { error });
    }
  }

  private loadMetrics(): void {
    try {
      const saved = localStorage.getItem('browser-storage-metrics');
      if (saved) {
        this.metrics = JSON.parse(saved);
      }
    } catch (error) {
      this.logger.warn('Failed to load storage metrics', { error });
    }
  }

  private handleStorageError(error: unknown): void {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'QuotaExceededError':
          this.logger.error('Storage quota exceeded - performing cleanup');
          this.performEmergencyCleanup();
          break;
        case 'SecurityError':
          this.logger.error('Storage security error - check domain permissions');
          break;
        default:
          this.logger.error('Storage error', { error: error.name });
      }
    }
  }

  private performEmergencyCleanup(): void {
    try {
      // Удаляем старые данные сначала
      const allKeys = [...this.keys('local'), ...this.keys('session')];
      const now = Date.now();

      allKeys.forEach(key => {
        try {
          const item = localStorage.getItem(key) || sessionStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            // Удаляем данные старше 24 часов
            if (now - parsed.createdAt > 24 * 60 * 60 * 1000) {
              this.remove(key);
            }
          }
        } catch {
          // Если данные повреждены, удаляем их
          this.remove(key);
        }
      });
    } catch (error) {
      this.logger.error('Emergency cleanup failed', { error });
    }
  }
}

export const browserStorage = new BrowserStorageService();
export default browserStorage;
