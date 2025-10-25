// src/core/services/core/auth/token.service.ts
import { logger } from '@/core/utils/logger';
import type { TokenService, TokenPayload } from '@/core/types';

class TokenServiceImpl implements TokenService {
  private readonly logger = logger.create('TokenService');

  parseToken(token: string): TokenPayload | null {
    try {
      if (!token || typeof token !== 'string') {
        this.logger.warn('Invalid token format', { type: typeof token });
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        this.logger.warn('Token does not have 3 parts', { parts: parts.length });
        return null;
      }

      const payload = parts[1];
      const decodedPayload = this.base64UrlDecode(payload);
      const parsedPayload = JSON.parse(decodedPayload);

      this.logger.debug('Token parsed successfully', {
        subject: parsedPayload.sub,
        expiration: parsedPayload.exp ? new Date(parsedPayload.exp * 1000).toISOString() : 'none'
      });

      return parsedPayload;
    } catch (error) {
      this.logger.error('Failed to parse token', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;

    if (isExpired) {
      this.logger.debug('Token is expired', {
        expiration: new Date(payload.exp * 1000).toISOString(),
        currentTime: new Date(now * 1000).toISOString()
      });
    }

    return isExpired;
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

    try {
      const payload = this.parseToken(token);
      return payload !== null;
    } catch {
      return false;
    }
  }

  getTokenRemainingTime(token: string): number {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return 0;
    }

    const remaining = expiration - Date.now();
    return Math.max(0, remaining);
  }

  shouldRefreshToken(token: string, refreshThreshold: number = 300000): boolean {
    if (!this.isValidFormat(token)) {
      return false;
    }

    const remainingTime = this.getTokenRemainingTime(token);
    const shouldRefresh = remainingTime > 0 && remainingTime <= refreshThreshold;

    if (shouldRefresh) {
      this.logger.debug('Token should be refreshed', {
        remainingTime: `${Math.round(remainingTime / 1000)}s`,
        threshold: `${refreshThreshold / 1000}s`
      });
    }

    return shouldRefresh;
  }

  getTokenPayload<T = TokenPayload>(token: string): T | null {
    return this.parseToken(token) as T | null;
  }

  validateToken(token: string): { isValid: boolean; isExpired: boolean; payload: TokenPayload | null; errors: string[] } {
    const errors: string[] = [];
    let payload: TokenPayload | null = null;

    // Check format
    if (!this.isValidFormat(token)) {
      errors.push('Invalid token format');
      return { isValid: false, isExpired: true, payload: null, errors };
    }

    // Parse token
    payload = this.parseToken(token);
    if (!payload) {
      errors.push('Failed to parse token payload');
      return { isValid: false, isExpired: true, payload: null, errors };
    }

    // Check expiration
    const isExpired = this.isTokenExpired(token);
    if (isExpired) {
      errors.push('Token is expired');
    }

    // Check required claims
    if (!payload.exp) {
      errors.push('Token missing expiration claim (exp)');
    }

    if (!payload.iat) {
      errors.push('Token missing issued at claim (iat)');
    }

    const isValid = errors.length === 0 && !isExpired;

    this.logger.debug('Token validation completed', {
      isValid,
      isExpired,
      errors: errors.length,
      subject: payload.sub
    });

    return { isValid, isExpired, payload, errors };
  }

  private base64UrlDecode(str: string): string {
    // Replace URL-safe base64 to standard base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding
    while (base64.length % 4) {
      base64 += '=';
    }

    try {
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      // Fallback for non-UTF-8 content
      return atob(base64);
    }
  }
}

export const tokenService: TokenService = new TokenServiceImpl();
