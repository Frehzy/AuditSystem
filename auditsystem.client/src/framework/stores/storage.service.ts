import type { UserDto } from '@/modules/auth/api/auth.types';
import { logger } from '@/core/utils/logger/logger';
import { STORAGE_KEYS } from '@/core/constants/storage-keys';

class StorageService {
  private readonly TOKEN_KEY = STORAGE_KEYS.AUTH_TOKEN;
  private readonly USER_KEY = STORAGE_KEYS.AUTH_USER;
  private readonly APP_STATE_KEY = STORAGE_KEYS.APP_STATE;

  /**
   * Сохранение токена
   */
  setToken(token: string): void {
    this.set(this.TOKEN_KEY, token);
    logger.storage('Token saved', { length: token.length });
  }

  /**
   * Получение токена
   */
  getToken(): string | null {
    return this.get(this.TOKEN_KEY);
  }

  /**
   * Сохранение данных пользователя
   */
  setUser(user: UserDto): void {
    this.set(this.USER_KEY, JSON.stringify(user));
    logger.storage('User data saved', { userId: user.id, username: user.username });
  }

  /**
   * Получение данных пользователя
   */
  getUser(): UserDto | null {
    const userData = this.get(this.USER_KEY);
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('Failed to parse user data:', error);
      this.remove(this.USER_KEY); // Удаляем поврежденные данные
      return null;
    }
  }

  /**
   * Очистка данных аутентификации
   */
  clearAuthData(): void {
    this.remove(this.TOKEN_KEY);
    this.remove(this.USER_KEY);
    logger.auth('Auth data cleared from storage');
  }

  /**
   * Проверка валидности токена
   */
  isValidToken(): boolean {
    const token = this.getToken();
    
    if (!token) {
      return false;
    }

    // Проверка формата JWT токена
    const isValidFormat = token.split('.').length === 3;
    if (!isValidFormat) {
      logger.warn('Invalid token format detected');
      this.clearAuthData();
      return false;
    }

    // Проверка минимальной длины
    const isValidLength = token.length > 10;
    if (!isValidLength) {
      logger.warn('Invalid token length detected');
      this.clearAuthData();
      return false;
    }

    // Дополнительная проверка срока действия (если есть payload)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000; // Convert to milliseconds
      
      if (Date.now() >= expiration) {
        logger.warn('Token expired');
        this.clearAuthData();
        return false;
      }
    } catch {
      // Если не можем распарсить payload, продолжаем с базовыми проверками
    }

    return true;
  }

  /**
   * Сохранение состояния приложения
   */
  setAppState<T>(key: string, value: T): void {
    try {
      const state = this.getAppState() || {};
      const newState = { ...state, [key]: value };
      localStorage.setItem(this.APP_STATE_KEY, JSON.stringify(newState));
    } catch (error) {
      logger.error('Failed to save app state:', error);
    }
  }

  /**
   * Получение состояния приложения
   */
  getAppState<T>(key?: string): T | null {
    try {
      const state = localStorage.getItem(this.APP_STATE_KEY);
      const parsedState = state ? JSON.parse(state) : {};
      
      return key ? parsedState[key] : parsedState;
    } catch (error) {
      logger.error('Failed to get app state:', error);
      return null;
    }
  }

  /**
   * Очистка всего хранилища
   */
  clearAll(): void {
    try {
      localStorage.clear();
      logger.storage('All storage data cleared');
    } catch (error) {
      logger.error('Failed to clear storage:', error);
    }
  }

  // ==================== PRIVATE METHODS ====================

  private set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      logger.error('Storage set error:', error);
      this.handleStorageError(error);
    }
  }

  private get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logger.error('Storage get error:', error);
      this.handleStorageError(error);
      return null;
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('Storage remove error:', error);
      this.handleStorageError(error);
    }
  }

  private handleStorageError(error: unknown): void {
    // Можно добавить логику для обработки переполнения хранилища
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      logger.error('Storage quota exceeded');
      // Автоматическая очистка устаревших данных
      this.clearAuthData();
    }
  }
}

export const storage = new StorageService();
