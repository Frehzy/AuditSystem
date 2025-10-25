import type { UserDto } from '@/modules/auth/api/auth.types';
import { logger } from '@/core/utils/logger';
import { STORAGE_KEYS } from '@/core/constants/storage-keys';

class StorageService {
  private readonly TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
  private readonly USER_KEY = STORAGE_KEYS.AUTH_USER;

  // Token methods
  setToken(token: string): void {
    this.set(this.TOKEN_KEY, token);
    logger.storage('Token saved', { length: token.length });
  }

  getToken(): string | null {
    return this.get(this.TOKEN_KEY);
  }

  // User methods
  setUser(user: UserDto): void {
    this.set(this.USER_KEY, JSON.stringify(user));
    logger.storage('User saved', { userId: user.id });
  }

  getUser(): UserDto | null {
    const data = this.get(this.USER_KEY);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      this.remove(this.USER_KEY);
      logger.error('Failed to parse user data');
      return null;
    }
  }

  // Auth management
  clearAuth(): void {
    this.remove(this.TOKEN_KEY);
    this.remove(this.USER_KEY);
    logger.auth('Auth data cleared');
  }

  isValidAuth(): boolean {
    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) return false;

    // Basic validation
    return token.length > 10 &&
      typeof user.id === 'string' &&
      user.id.length > 0;
  }

  // Generic methods
  set(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      this.handleError('set', error);
      return false;
    }
  }

  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      this.handleError('get', error);
      return null;
    }
  }

  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      this.handleError('remove', error);
      return false;
    }
  }

  private handleError(operation: string, error: unknown): void {
    logger.error(`Storage ${operation} error:`, error);

    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      logger.error('Storage quota exceeded - clearing auth data');
      this.clearAuth();
    }
  }
}

export const storage = new StorageService();
