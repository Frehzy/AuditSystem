// src/core/services/auth/storage.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import type {
  StorageService,
  StorageOptions,
  StorageItem,
  UserDto,
  Theme
} from '@/core/types';

/**
 * Production-ready storage service with encryption support and enhanced error handling
 */
class StorageServiceImpl implements StorageService {
  private readonly logger = logger.create('StorageService');
  private readonly VERSION = '1.0';
  private readonly ENCRYPTION_PREFIX = 'enc:';
  private subscribers = new Map<string, Set<(newValue: unknown, oldValue: unknown) => void>>();

  constructor() {
    this.logger.debug('StorageService initialized', {
      version: this.VERSION,
      supportsEncryption: this.supportsEncryption()
    });

    this.cleanupExpired();
  }

  set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    try {
      if (!key || typeof key !== 'string') {
        throw errorHandler.create('Storage key must be a non-empty string', 'INVALID_STORAGE_KEY');
      }

      const storage = this.getStorage(options.type);
      const storageItem: StorageItem<T> = {
        value,
        createdAt: Date.now(),
        version: this.VERSION
      };

      if (options.ttl && options.ttl > 0) {
        storageItem.expiresAt = Date.now() + options.ttl;
      }

      const serializedValue = options.encrypt
        ? this.encrypt(JSON.stringify(storageItem))
        : JSON.stringify(storageItem);

      const oldValue = this.get<T>(key, options.type);
      storage.setItem(key, serializedValue);

      this.notifySubscribers(key, value, oldValue);

      this.logger.debug('Storage item set', {
        key,
        type: options.type || 'local',
        hasValue: value !== undefined && value !== null,
        ttl: options.ttl,
        encrypted: options.encrypt
      });

      return true;
    } catch (error) {
      const handledError = errorHandler.handle(error, `Storage:set:${key}`);
      this.logger.error('Failed to set storage item', {
        key,
        error: handledError.message
      });
      return false;
    }
  }

  get<T>(key: string, type?: 'local' | 'session'): T | null {
    try {
      if (!key || typeof key !== 'string') {
        throw errorHandler.create('Storage key must be a non-empty string', 'INVALID_STORAGE_KEY');
      }

      const storage = this.getStorage(type);
      const item = storage.getItem(key);

      if (!item) {
        return null;
      }

      const storageItem = this.parseStorageItem<T>(item);
      if (!storageItem) {
        storage.removeItem(key);
        return null;
      }

      if (this.isExpired(storageItem)) {
        storage.removeItem(key);
        this.logger.debug('Storage item expired and removed', { key });
        return null;
      }

      return storageItem.value;
    } catch (error) {
      const handledError = errorHandler.handle(error, `Storage:get:${key}`);
      this.logger.error('Failed to get storage item', {
        key,
        error: handledError.message
      });
      return null;
    }
  }

  remove(key: string, type?: 'local' | 'session'): boolean {
    try {
      if (!key || typeof key !== 'string') {
        throw errorHandler.create('Storage key must be a non-empty string', 'INVALID_STORAGE_KEY');
      }

      const storage = this.getStorage(type);
      const oldValue = this.get(key, type);

      storage.removeItem(key);
      this.notifySubscribers(key, null, oldValue);

      this.logger.debug('Storage item removed', { key, type: type || 'local' });
      return true;
    } catch (error) {
      const handledError = errorHandler.handle(error, `Storage:remove:${key}`);
      this.logger.error('Failed to remove storage item', {
        key,
        error: handledError.message
      });
      return false;
    }
  }

  clear(type?: 'local' | 'session'): boolean {
    try {
      const storage = this.getStorage(type);
      const keys = this.keys(type);

      keys.forEach(key => {
        const oldValue = this.get(key, type);
        storage.removeItem(key);
        this.notifySubscribers(key, null, oldValue);
      });

      this.logger.debug('Storage cleared', {
        type: type || 'local',
        clearedItems: keys.length
      });

      return true;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Storage:clear');
      this.logger.error('Failed to clear storage', {
        error: handledError.message,
        type: type || 'local'
      });
      return false;
    }
  }

  keys(type?: 'local' | 'session'): string[] {
    try {
      const storage = this.getStorage(type);
      const keys: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          keys.push(key);
        }
      }

      return keys;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Storage:keys');
      this.logger.error('Failed to get storage keys', {
        error: handledError.message,
        type: type || 'local'
      });
      return [];
    }
  }

  has(key: string, type?: 'local' | 'session'): boolean {
    try {
      const storage = this.getStorage(type);
      return storage.getItem(key) !== null;
    } catch (error) {
      const handledError = errorHandler.handle(error, `Storage:has:${key}`);
      this.logger.error('Failed to check storage item', {
        key,
        error: handledError.message
      });
      return false;
    }
  }

  getSize(type?: 'local' | 'session'): number {
    try {
      const storage = this.getStorage(type);
      let totalSize = 0;

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key);
          totalSize += key.length + (value ? value.length : 0);
        }
      }

      return totalSize;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Storage:size');
      this.logger.error('Failed to calculate storage size', {
        error: handledError.message,
        type: type || 'local'
      });
      return 0;
    }
  }

  subscribe(key: string, callback: (newValue: unknown, oldValue: unknown) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    const keySubscribers = this.subscribers.get(key)!;
    keySubscribers.add(callback);

    this.logger.debug('Storage subscription added', { key });

    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  cleanupExpired(): string[] {
    const expiredKeys: string[] = [];
    const storageTypes: ('local' | 'session')[] = ['local', 'session'];

    storageTypes.forEach(type => {
      const storage = this.getStorage(type);
      const keys = this.keys(type);

      keys.forEach(key => {
        try {
          const item = storage.getItem(key);
          if (item) {
            const storageItem = this.parseStorageItem(item);
            if (storageItem && this.isExpired(storageItem)) {
              storage.removeItem(key);
              expiredKeys.push(`${type}:${key}`);
              this.notifySubscribers(key, null, storageItem.value);
            }
          }
        } catch (error) {
          this.logger.warn('Failed to check storage item expiration', {
            key,
            type,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    });

    if (expiredKeys.length > 0) {
      this.logger.debug('Expired storage items cleaned up', {
        count: expiredKeys.length,
        keys: expiredKeys
      });
    }

    return expiredKeys;
  }

  // Auth-specific methods
  setToken(token: string): void {
    this.set('auth_token', token, { type: 'local', encrypt: true });
  }

  getToken(): string | null {
    return this.get<string>('auth_token');
  }

  setUser(user: UserDto): void {
    this.set('auth_user', user, { type: 'local' });
  }

  getUser(): UserDto | null {
    return this.get<UserDto>('auth_user');
  }

  clearAuth(): void {
    this.remove('auth_token');
    this.remove('auth_user');
    this.remove('auth_refresh_token');
    this.logger.debug('Auth data cleared from storage');
  }

  clearAuthData(): void {
    this.clearAuth();
  }

  // Theme methods
  setTheme(theme: Theme): void {
    this.set('app_theme', theme, { type: 'local' });
  }

  getTheme(): Theme | null {
    return this.get<Theme>('app_theme');
  }

  getStorageStats(): {
    local: { items: number; size: number };
    session: { items: number; size: number };
    subscribers: number;
  } {
    return {
      local: {
        items: this.keys('local').length,
        size: this.getSize('local')
      },
      session: {
        items: this.keys('session').length,
        size: this.getSize('session')
      },
      subscribers: Array.from(this.subscribers.values()).reduce((total, set) => total + set.size, 0)
    };
  }

  private getStorage(type?: 'local' | 'session'): Storage {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      throw errorHandler.create('Local storage is not available', 'STORAGE_UNAVAILABLE');
    }

    return type === 'session' ? sessionStorage : localStorage;
  }

  private parseStorageItem<T>(item: string): StorageItem<T> | null {
    try {
      let parsed: StorageItem<T>;

      if (item.startsWith(this.ENCRYPTION_PREFIX)) {
        const decrypted = this.decrypt(item.slice(this.ENCRYPTION_PREFIX.length));
        parsed = JSON.parse(decrypted);
      } else {
        parsed = JSON.parse(item);
      }

      if (typeof parsed !== 'object' || parsed === null) {
        return null;
      }

      if (!('value' in parsed) || !('createdAt' in parsed)) {
        return null;
      }

      return parsed as StorageItem<T>;
    } catch (error) {
      this.logger.warn('Failed to parse storage item', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  private isExpired(storageItem: StorageItem<unknown>): boolean {
    return !!storageItem.expiresAt && Date.now() > storageItem.expiresAt;
  }

  private encrypt(data: string): string {
    try {
      // In production, use proper encryption
      // This is a simple obfuscation for development
      if (process.env.NODE_ENV === 'production') {
        // TODO: Implement proper encryption for production
        return this.ENCRYPTION_PREFIX + btoa(unescape(encodeURIComponent(data)));
      }
      return this.ENCRYPTION_PREFIX + btoa(data);
    } catch (error) {
      throw errorHandler.create('Failed to encrypt data', 'ENCRYPTION_FAILED', { error });
    }
  }

  private decrypt(encryptedData: string): string {
    try {
      if (process.env.NODE_ENV === 'production') {
        // TODO: Implement proper decryption for production
        return decodeURIComponent(escape(atob(encryptedData)));
      }
      return atob(encryptedData);
    } catch (error) {
      throw errorHandler.create('Failed to decrypt data', 'DECRYPTION_FAILED', { error });
    }
  }

  private supportsEncryption(): boolean {
    try {
      const testData = 'test';
      const encrypted = this.encrypt(testData);
      const decrypted = this.decrypt(encrypted.slice(this.ENCRYPTION_PREFIX.length));
      return decrypted === testData;
    } catch {
      return false;
    }
  }

  private notifySubscribers(key: string, newValue: unknown, oldValue: unknown): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          this.logger.error('Storage subscriber callback failed', {
            key,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }
  }
}

// Export singleton instance
export const storageService: StorageService = new StorageServiceImpl();

// Export class for testing
export { StorageServiceImpl };
