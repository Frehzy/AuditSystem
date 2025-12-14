// src/modules/auth/services/token.service.ts
import { storageService } from '@/core/services/auth/storage.service';
import { logger } from '@/core/utils/logger';

class TokenService {
  private readonly logger = logger.create('TokenService');
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  getToken(): string | null {
    return storageService.get<string>(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    storageService.set(this.TOKEN_KEY, token);
    this.logger.debug('Token saved to storage');
  }

  getRefreshToken(): string | null {
    return storageService.get<string>(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    storageService.set(this.REFRESH_TOKEN_KEY, token);
    this.logger.debug('Refresh token saved to storage');
  }

  getUser<T = any>(): T | null {
    try {
      const user = storageService.get<string>(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      this.logger.error('Failed to parse user data from storage', { error });
      return null;
    }
  }

  setUser<T = any>(user: T): void {
    try {
      storageService.set(this.USER_KEY, JSON.stringify(user));
      this.logger.debug('User data saved to storage');
    } catch (error) {
      this.logger.error('Failed to save user data to storage', { error });
    }
  }

  clear(): void {
    storageService.remove(this.TOKEN_KEY);
    storageService.remove(this.REFRESH_TOKEN_KEY);
    storageService.remove(this.USER_KEY);
    this.logger.info('Auth data cleared from storage');
  }

  parseToken(token: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      this.logger.error('Failed to parse token', { error });
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseToken(token);
      if (!payload?.exp) return true;

      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      const isExpired = now >= expiresAt;

      if (isExpired) {
        this.logger.debug('Token expired', {
          expiresAt: new Date(expiresAt),
          currentTime: new Date(now)
        });
      }

      return isExpired;
    } catch {
      return true;
    }
  }

  getTokenExpiration(token: string): number | null {
    try {
      const payload = this.parseToken(token);
      return payload?.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  getTokenRemainingTime(token: string): number {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return 0;

    const remaining = expiration - Date.now();
    return Math.max(0, remaining);
  }

  shouldRefresh(token: string): boolean {
    if (!token) return false;
    if (this.isTokenExpired(token)) return true;

    const remainingTime = this.getTokenRemainingTime(token);
    // Обновляем если осталось меньше 5 минут
    return remainingTime < 5 * 60 * 1000;
  }
}

export const tokenService = new TokenService();
