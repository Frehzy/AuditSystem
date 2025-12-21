/**
 * Сервис для работы с токенами авторизации
 */

import { logger } from '@/core/services/logger/logger.service';

export interface TokenData {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  issuedAt: Date;
  userId: string;
}

export class TokenService {
  private readonly logger = logger.create('TokenService');

  decodeToken(token: string): any {
    try {
      // JWT токен состоит из трех частей: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));

      return decoded;
    } catch (error) {
      this.logger.error('Failed to decode token', { error });
      return null;
    }
  }

  getTokenClaims(token?: string): Record<string, any> {
    if (!token) {
      return {};
    }

    return this.decodeToken(token) || {};
  }

  isTokenValid(token: string): boolean {
    if (!token) {
      return false;
    }

    try {
      const claims = this.getTokenClaims(token);
      if (!claims.exp) {
        return true; // Если нет даты истечения, считаем токен валидным
      }

      const now = Math.floor(Date.now() / 1000);
      const isValid = claims.exp > now;

      if (!isValid) {
        this.logger.debug('Token expired', { expiresAt: new Date(claims.exp * 1000), now: new Date() });
      }

      return isValid;
    } catch {
      return false;
    }
  }

  isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
    try {
      const claims = this.getTokenClaims(token);
      if (!claims.exp) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = claims.exp - now;
      const thresholdSeconds = thresholdMinutes * 60;

      return timeUntilExpiry > 0 && timeUntilExpiry <= thresholdSeconds;
    } catch {
      return false;
    }
  }

  getTokenLifetime(token: string): { total: number; remaining: number; percentage: number } | null {
    try {
      const claims = this.getTokenClaims(token);

      if (!claims.iat || !claims.exp) {
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
      const total = claims.exp - claims.iat;
      const remaining = claims.exp - now;
      const percentage = Math.max(0, Math.min(100, (remaining / total) * 100));

      return {
        total: total * 1000,
        remaining: remaining * 1000,
        percentage
      };
    } catch {
      return null;
    }
  }
}

// Экспортируем синглтон
export const tokenService = new TokenService();
