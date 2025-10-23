import { logger } from '@/core/utils/logger/logger';
import type { TokenService, TokenPayload } from '../types';

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload: TokenPayload | null;
  errors: string[];
}

interface TokenServiceConfig {
  refreshThreshold: number;
  maxTokenAge: number;
  validateIssuer: boolean;
  allowedIssuers: string[];
  clockTolerance: number;
}

class TokenServiceImpl implements TokenService {
  private readonly logger = logger.create('TokenService');
  private readonly config: TokenServiceConfig = {
    refreshThreshold: 5 * 60 * 1000, // 5 minutes
    maxTokenAge: 24 * 60 * 60 * 1000, // 24 hours
    validateIssuer: true,
    allowedIssuers: ['auditsystem-client'],
    clockTolerance: 60 * 1000, // 1 minute
  };

  private tokenCache = new Map<string, { payload: TokenPayload; expiresAt: number }>();

  constructor(config?: Partial<TokenServiceConfig>) {
    this.config = { ...this.config, ...config };
  }

  parseToken(token: string): TokenPayload | null {
    if (!this.isValidFormat(token)) {
      this.logger.warn('Invalid token format', {
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 10) + '...'
      });
      return null;
    }

    // Проверяем кэш
    const cached = this.tokenCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.payload;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = this.safeBase64Decode(payloadBase64);
      const payload = JSON.parse(decodedPayload);

      // Валидируем базовую структуру payload
      if (!this.isValidPayload(payload)) {
        this.logger.warn('Invalid token payload structure', {
          hasExp: !!payload.exp,
          hasIat: !!payload.iat,
          hasSub: !!payload.sub
        });
        return null;
      }

      // Кэшируем результат
      const expiresAt = payload.exp ? payload.exp * 1000 : Date.now() + 3600000;
      this.tokenCache.set(token, { payload, expiresAt });

      // Очистка старых записей в кэше
      this.cleanupCache();

      return payload;
    } catch (error) {
      this.logger.error('Failed to parse token payload', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const validation = this.validateToken(token);
    return validation.isExpired;
  }

  getTokenExpiration(token: string): number | null {
    const payload = this.parseToken(token);
    return payload?.exp ? payload.exp * 1000 : null;
  }

  isValidFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Check if all parts are valid base64url
    try {
      parts.forEach(part => {
        this.safeBase64Decode(part);
      });
      return true;
    } catch {
      return false;
    }
  }

  getTokenRemainingTime(token: string): number {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return 0;

    const now = Date.now();
    return Math.max(0, expiration - now);
  }

  shouldRefreshToken(token: string, refreshThreshold?: number): boolean {
    if (!this.isValidFormat(token)) {
      return false;
    }

    const threshold = refreshThreshold ?? this.config.refreshThreshold;
    const remainingTime = this.getTokenRemainingTime(token);

    return remainingTime > 0 && remainingTime <= threshold;
  }

  getTokenPayload<T = TokenPayload>(token: string): T | null {
    return this.parseToken(token) as T | null;
  }

  validateToken(token: string): TokenValidationResult {
    const result: TokenValidationResult = {
      isValid: false,
      isExpired: false,
      payload: null,
      errors: []
    };

    if (!token) {
      result.errors.push('Token is empty');
      return result;
    }

    // Проверка формата
    if (!this.isValidFormat(token)) {
      result.errors.push('Invalid token format');
      return result;
    }

    const payload = this.parseToken(token);
    if (!payload) {
      result.errors.push('Failed to parse token payload');
      return result;
    }

    result.payload = payload;

    // Проверка срока действия
    const now = Math.floor(Date.now() / 1000);
    const clockTolerance = this.config.clockTolerance / 1000;

    if (payload.exp && payload.exp < (now - clockTolerance)) {
      result.isExpired = true;
      result.errors.push('Token has expired');
    }

    // Проверка времени выдачи
    if (payload.iat && payload.iat > (now + clockTolerance)) {
      result.errors.push('Token issued in the future');
    }

    // Проверка времени "не ранее"
    if (payload.nbf && payload.nbf > (now + clockTolerance)) {
      result.errors.push('Token not yet valid');
    }

    // Проверка issuer
    if (this.config.validateIssuer && payload.iss) {
      if (!this.config.allowedIssuers.includes(payload.iss)) {
        result.errors.push(`Invalid issuer: ${payload.iss}`);
      }
    }

    // Проверка максимального возраста
    if (payload.iat) {
      const tokenAge = now - payload.iat;
      const maxAge = this.config.maxTokenAge / 1000;
      if (tokenAge > maxAge) {
        result.errors.push('Token too old');
      }
    }

    // Проверка аудитории
    if (payload.aud && typeof payload.aud === 'string') {
      // Можно добавить проверку допустимых аудиторий
      this.logger.debug('Token audience', { aud: payload.aud });
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  private isValidPayload(payload: any): payload is TokenPayload {
    return (
      payload &&
      typeof payload === 'object' &&
      (payload.exp === undefined || typeof payload.exp === 'number') &&
      (payload.iat === undefined || typeof payload.iat === 'number') &&
      (payload.sub === undefined || typeof payload.sub === 'string') &&
      (payload.iss === undefined || typeof payload.iss === 'string') &&
      (payload.aud === undefined || typeof payload.aud === 'string' || Array.isArray(payload.aud))
    );
  }

  private safeBase64Decode(base64url: string): string {
    // Convert base64url to base64
    const base64 = base64url
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    // Add padding if necessary
    const padding = base64.length % 4;
    const paddedBase64 = padding > 0
      ? base64 + '='.repeat(4 - padding)
      : base64;

    try {
      return decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      // Fallback for non-UTF8 payloads
      return atob(paddedBase64);
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [token, data] of this.tokenCache.entries()) {
      if (data.expiresAt <= now) {
        this.tokenCache.delete(token);
      }
    }

    // Ограничиваем размер кэша
    if (this.tokenCache.size > 100) {
      const entries = Array.from(this.tokenCache.entries());
      entries.sort(([, a], [, b]) => a.expiresAt - b.expiresAt);

      const toRemove = entries.slice(0, Math.floor(entries.length * 0.1)); // Удаляем 10% самых старых
      toRemove.forEach(([token]) => {
        this.tokenCache.delete(token);
      });
    }
  }

  // Методы для управления кэшем
  clearCache(): void {
    this.tokenCache.clear();
    this.logger.debug('Token cache cleared');
  }

  getCacheSize(): number {
    return this.tokenCache.size;
  }

  getCacheStats(): { size: number; hitRate: number } {
    // Простая статистика кэша
    return {
      size: this.tokenCache.size,
      hitRate: 0.95 // Заглушка - в реальном приложении нужно считать хиты/миссы
    };
  }

  // Утилиты для работы с refresh token
  shouldUseRefreshToken(token: string): boolean {
    if (!this.isValidFormat(token)) {
      return false;
    }

    const remainingTime = this.getTokenRemainingTime(token);
    const refreshThreshold = this.config.refreshThreshold;

    return remainingTime <= refreshThreshold && remainingTime > 0;
  }

  // Валидация refresh token (базовая реализация)
  validateRefreshToken(refreshToken: string): boolean {
    // В реальном приложении здесь была бы более сложная логика
    return this.isValidFormat(refreshToken) && !this.isTokenExpired(refreshToken);
  }

  // Генерация fingerprint для безопасности
  generateTokenFingerprint(token: string): string {
    // Простая реализация - в production используйте более безопасные методы
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }
}

export const tokenService: TokenService = new TokenServiceImpl();
