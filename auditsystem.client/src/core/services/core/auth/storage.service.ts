// src/core/services/core/auth/storage.service.ts
import { logger } from '@/core/utils/logger';
import type { StorageService, StorageType, StorageOptions, StorageItem, UserDto, Theme } from '@/core/types';

class StorageServiceImpl implements StorageService {
  private readonly logger = logger.create('StorageService');
  private readonly version = '2.0';
  private changeListeners: Map<string, Array<(newValue: unknown, oldValue: unknown) => void>> = new Map();

  // Storage keys
  private readonly STORAGE_KEYS = {
    AUTH_TOKEN: 'auth-token',
    AUTH_USER: 'auth-user',
    APP_STATE: 'app-state',
    THEME: 'app-theme'
  };

  constructor() {
    this.setupStorageListener();
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

      const serializedValue = JSON.stringify(item);
      const oldValue = storage.getItem(key);

      storage.setItem(key, serializedValue);
      this.notifyChangeListeners(key, value, oldValue ? JSON.parse(oldValue).value : null);

      this.logger.storage('Data saved to storage', {
        key,
        type: options.type || 'local',
        size: serializedValue.length,
        ttl: options.ttl
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to save data to storage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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

      const parsedItem: StorageItem<T> = JSON.parse(item);

      // Check expiration
      if (parsedItem.expiresAt && Date.now() > parsedItem.expiresAt) {
        storage.removeItem(key);
        this.logger.storage('Expired data removed', { key, type });
        return null;
      }

      // Validate version
      if (parsedItem.version !== this.version) {
        this.logger.warn('Storage version mismatch', {
          key,
          expected: this.version,
          actual: parsedItem.version
        });
      }

      return parsedItem.value;
    } catch (error) {
      this.logger.error('Failed to get data from storage', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  remove(key: string, type: StorageType = 'local'): boolean {
    try {
      const storage = this.getStorage(type);
      const oldValue = storage.getItem(key);

      storage.removeItem(key);
      this.notifyChangeListeners(key, null, oldValue ? JSON.parse(oldValue).value : null);

      this.logger.storage('Data removed from storage', { key, type });
      return true;
    } catch (error) {
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
        const storage = this.getStorage(type);
        storage.clear();
        this.logger.storage('Storage cleared', { type });
      } else {
        localStorage.clear();
        sessionStorage.clear();
        this.logger.storage('All storages cleared');
      }
      return true;
    } catch (error) {
      this.logger.error('Failed to clear storage', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  keys(type: StorageType = 'local'): string[] {
    try {
      const storage = this.getStorage(type);
      const keys: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) keys.push(key);
      }

      return keys;
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
      let totalSize = 0;

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          totalSize += (key.length + (value?.length || 0)) * 2; // UTF-16
        }
      }

      return totalSize;
    } catch (error) {
      this.logger.error('Failed to calculate storage size', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  subscribe(key: string, callback: (newValue: unknown, oldValue: unknown) => void): () => void {
    if (!this.changeListeners.has(key)) {
      this.changeListeners.set(key, []);
    }

    const listeners = this.changeListeners.get(key)!;
    listeners.push(callback);

    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  cleanupExpired(): string[] {
    const removedKeys: string[] = [];

    ['local', 'session'].forEach(type => {
      const storage = this.getStorage(type as StorageType);
      const keys = this.keys(type as StorageType);

      keys.forEach(key => {
        const item = storage.getItem(key);
        if (item) {
          try {
            const parsedItem: StorageItem<unknown> = JSON.parse(item);
            if (parsedItem.expiresAt && Date.now() > parsedItem.expiresAt) {
              storage.removeItem(key);
              removedKeys.push(`${type}:${key}`);
            }
          } catch {
            // Invalid JSON, remove corrupted data
            storage.removeItem(key);
            removedKeys.push(`${type}:${key}`);
          }
        }
      });
    });

    if (removedKeys.length > 0) {
      this.logger.storage('Expired data cleaned up', { removedKeys });
    }

    return removedKeys;
  }

  // Auth-specific methods
  setToken(token: string): void {
    this.set(this.STORAGE_KEYS.AUTH_TOKEN, token, { type: 'local' });
  }

  getToken(): string | null {
    return this.get<string>(this.STORAGE_KEYS.AUTH_TOKEN);
  }

  setUser(user: UserDto): void {
    this.set(this.STORAGE_KEYS.AUTH_USER, user, { type: 'local' });
  }

  getUser(): UserDto | null {
    return this.get<UserDto>(this.STORAGE_KEYS.AUTH_USER);
  }

  clearAuth(): void {
    this.remove(this.STORAGE_KEYS.AUTH_TOKEN);
    this.remove(this.STORAGE_KEYS.AUTH_USER);
    this.logger.storage('Auth data cleared');
  }

  // Добавлен отсутствующий метод для совместимости
  clearAuthData(): void {
    this.clearAuth();
  }

  // Theme methods
  setTheme(theme: Theme): void {
    this.set(this.STORAGE_KEYS.THEME, theme, { type: 'local' });
  }

  getTheme(): Theme | null {
    return this.get<Theme>(this.STORAGE_KEYS.THEME);
  }

  // Добавлен метод isValidToken для роутера
  isValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Базовая проверка формата токена
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;

    try {
      // Проверяем, можно ли декодировать payload
      const payload = JSON.parse(atob(tokenParts[1]));
      // Проверяем expiration time
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private getStorage(type: StorageType): Storage {
    return type === 'session' ? sessionStorage : localStorage;
  }

  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.storageArea === localStorage || event.storageArea === sessionStorage) {
          const type: StorageType = event.storageArea === sessionStorage ? 'session' : 'local';
          const oldValue = event.oldValue ? JSON.parse(event.oldValue).value : null;
          const newValue = event.newValue ? JSON.parse(event.newValue).value : null;

          if (event.key) {
            this.notifyChangeListeners(event.key, newValue, oldValue);
          }

          this.logger.storage('Storage changed from another tab', {
            key: event.key,
            type,
            oldValue: oldValue !== null,
            newValue: newValue !== null
          });
        }
      });
    }
  }

  private notifyChangeListeners(key: string, newValue: unknown, oldValue: unknown): void {
    const listeners = this.changeListeners.get(key);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(newValue, oldValue);
        } catch (error) {
          this.logger.error('Error in storage change listener', {
            key,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }
  }
}

export const storageService: StorageService = new StorageServiceImpl();
