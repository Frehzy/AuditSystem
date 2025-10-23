import { logger } from '@/core/utils/logger/logger';
import { STORAGE_KEYS } from '@/core/constants/storage-keys';
import { tokenService } from '../auth/token.service';
import type { UserDto, StorageService, StorageInfo } from '../types';

class StorageServiceImpl implements StorageService {
  private readonly logger = logger.create('StorageService');
  private readonly storage: Storage = localStorage;

  setToken(token: string): void {
    if (!token || typeof token !== 'string') {
      this.logger.warn('Attempted to set invalid token', { token: token?.substring(0, 10) + '...' });
      return;
    }

    this.set(STORAGE_KEYS.AUTH_TOKEN, token);
    this.logger.storage('Token saved', {
      length: token.length,
      isValid: tokenService.isValidFormat(token)
    });
  }

  getToken(): string | null {
    const token = this.get(STORAGE_KEYS.AUTH_TOKEN);

    if (token && !tokenService.isValidFormat(token)) {
      this.logger.warn('Retrieved invalid token format, clearing...');
      this.remove(STORAGE_KEYS.AUTH_TOKEN);
      return null;
    }

    return token;
  }

  setUser(user: UserDto): void {
    if (!user || typeof user !== 'object') {
      this.logger.warn('Attempted to set invalid user data', { user });
      return;
    }

    try {
      this.set(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
      this.logger.storage('User data saved', {
        userId: user.id,
        username: user.username
      });
    } catch (error) {
      this.logger.error('Failed to serialize user data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id
      });
    }
  }

  getUser(): UserDto | null {
    const userData = this.get(STORAGE_KEYS.AUTH_USER);

    if (!userData) {
      return null;
    }

    try {
      const user = JSON.parse(userData) as UserDto;

      if (!user.id || !user.username) {
        throw new Error('Invalid user data structure');
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to parse user data', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.remove(STORAGE_KEYS.AUTH_USER);
      return null;
    }
  }

  clearAuthData(): void {
    this.remove(STORAGE_KEYS.AUTH_TOKEN);
    this.remove(STORAGE_KEYS.AUTH_USER);
    this.logger.auth('Auth data cleared from storage');
  }

  isValidToken(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    const isValid = tokenService.isValidFormat(token) && !tokenService.isTokenExpired(token);

    if (!isValid) {
      this.logger.warn('Token validation failed', {
        hasToken: !!token,
        isValidFormat: tokenService.isValidFormat(token),
        isExpired: tokenService.isTokenExpired(token)
      });
      this.clearAuthData();
    }

    return isValid;
  }

  setAppState<T>(key: string, value: T): void {
    if (!key || typeof key !== 'string') {
      this.logger.warn('Invalid app state key', { key });
      return;
    }

    try {
      const state = this.getAppState() || {};
      const newState = { ...state, [key]: value };

      Object.keys(newState).forEach((k: string) => {
        if ((newState as Record<string, any>)[k] === undefined) {
          delete (newState as Record<string, any>)[k];
        }
      });

      this.storage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(newState));

      this.logger.storage('App state saved', {
        key,
        valueType: typeof value,
        hasValue: value !== undefined && value !== null
      });
    } catch (error) {
      this.logger.error('Failed to save app state', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.handleStorageError(error);
    }
  }

  getAppState<T>(key?: string): T | null {
    try {
      const state = this.storage.getItem(STORAGE_KEYS.APP_STATE);
      if (!state) return null;

      const parsedState = JSON.parse(state);
      return key ? parsedState[key] : parsedState;
    } catch (error) {
      this.logger.error('Failed to get app state', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  clearAppState(): void {
    try {
      this.storage.removeItem(STORAGE_KEYS.APP_STATE);
      this.logger.storage('App state cleared');
    } catch (error) {
      this.logger.error('Failed to clear app state', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  clearAll(): void {
    try {
      this.storage.clear();
      this.logger.storage('All storage data cleared');
    } catch (error) {
      this.logger.error('Failed to clear storage', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  getStorageInfo(): StorageInfo {
    let totalKeys = 0;
    let totalSize = 0;
    let authDataSize = 0;
    let appStateSize = 0;

    try {
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key) {
          const value = this.storage.getItem(key);
          const itemSize = (key.length + (value?.length || 0)) * 2;

          totalKeys++;
          totalSize += itemSize;

          if (key === STORAGE_KEYS.AUTH_TOKEN || key === STORAGE_KEYS.AUTH_USER) {
            authDataSize += itemSize;
          } else if (key === STORAGE_KEYS.APP_STATE) {
            appStateSize += itemSize;
          }
        }
      }
    } catch (error) {
      this.logger.error('Failed to calculate storage info', { error });
    }

    return {
      totalKeys,
      totalSize,
      authDataSize,
      appStateSize
    };
  }

  private set(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      this.logger.error('Storage set error', {
        key,
        valueLength: value.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.handleStorageError(error);
    }
  }

  private get(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      this.logger.error('Storage get error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.handleStorageError(error);
      return null;
    }
  }

  private remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      this.logger.error('Storage remove error', {
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      this.handleStorageError(error);
    }
  }

  private handleStorageError(error: unknown): void {
    if (error instanceof DOMException) {
      switch (error.name) {
        case 'QuotaExceededError':
          this.logger.error('Storage quota exceeded - performing emergency cleanup');
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
      this.clearAppState();
      setTimeout(() => {
        try {
          this.clearAuthData();
        } catch {
          this.clearAll();
        }
      }, 100);
    } catch {
      this.clearAll();
    }
  }
}

export const storage: StorageService = new StorageServiceImpl();
