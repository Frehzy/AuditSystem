// src/core/services/auth/token.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import type {
  TokenService,
  TokenPayload,
  TokenValidationResult
} from '@/core/types';

/**
 * Production-ready token service with JWT parsing and validation
 */
class TokenServiceImpl implements TokenService {
  private readonly logger = logger.create('TokenService');

  constructor() {
    this.logger.debug('TokenService initialized');
  }

  parseToken(token: string): TokenPayload | null {
    try {
      if (!this.isValidFormat(token)) {
        throw errorHandler.create('Invalid token format', 'INVALID_TOKEN_FORMAT');
      }

      const payload = this.decodeToken(token);
      this.validatePayloadStructure(payload);

      this.logger.debug('Token parsed successfully', {
        hasExp: !!payload.exp,
        hasIat: !!payload.iat,
        subject: payload.sub,
        username: payload.username
      });

      return payload;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Token:parse');
      this.logger.error('Failed to parse token', {
        error: handledError.message,
        tokenPreview: token ? `${token.substring(0, 10)}...` : 'empty'
      });
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseToken(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;

      if (isExpired) {
        this.logger.debug('Token is expired', {
          expiredAt: new Date(payload.exp * 1000).toISOString(),
          currentTime: new Date().toISOString()
        });
      }

      return isExpired;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Token:expired');
      this.logger.error('Failed to check token expiration', {
        error: handledError.message
      });
      return true;
    }
  }

  getTokenExpiration(token: string): number | null {
    try {
      const payload = this.parseToken(token);
      return payload?.exp ? payload.exp * 1000 : null;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Token:expiration');
      this.logger.error('Failed to get token expiration', {
        error: handledError.message
      });
      return null;
    }
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
      // Check if parts are valid base64
      parts.forEach(part => {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      });
      return true;
    } catch {
      return false;
    }
  }

  getTokenRemainingTime(token: string): number {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) {
        return 0;
      }

      const now = Date.now();
      const remaining = expiration - now;

      this.logger.debug('Token remaining time calculated', {
        remainingTime: `${Math.round(remaining / 1000)}s`,
        expiration: new Date(expiration).toISOString()
      });

      return Math.max(0, remaining);
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Token:remainingTime');
      this.logger.error('Failed to calculate token remaining time', {
        error: handledError.message
      });
      return 0;
    }
  }

  shouldRefreshToken(token: string, refreshThreshold: number = 300000): boolean {
    try {
      if (!this.isValidFormat(token)) {
        return true;
      }

      const remainingTime = this.getTokenRemainingTime(token);
      const shouldRefresh = remainingTime > 0 && remainingTime <= refreshThreshold;

      this.logger.debug('Token refresh check', {
        shouldRefresh,
        remainingTime: `${Math.round(remainingTime / 1000)}s`,
        refreshThreshold: `${Math.round(refreshThreshold / 1000)}s`
      });

      return shouldRefresh;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Token:shouldRefresh');
      this.logger.error('Failed to check if token should be refreshed', {
        error: handledError.message
      });
      return true;
    }
  }

  getTokenPayload<T = TokenPayload>(token: string): T | null {
    try {
      return this.parseToken(token) as T;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Token:payload');
      this.logger.error('Failed to get token payload', {
        error: handledError.message
      });
      return null;
    }
  }

  validateToken(token: string): TokenValidationResult {
    const result: TokenValidationResult = {
      isValid: false,
      isExpired: true,
      payload: null,
      errors: [],
      timestamp: Date.now()
    };

    try {
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
      result.isExpired = this.isTokenExpired(token);
      result.isValid = !result.isExpired;

      if (result.isValid) {
        this.logger.debug('Token validation successful', {
          subject: payload.sub,
          issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'unknown',
          expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown'
        });
      } else {
        result.errors.push('Token is expired');
      }

      return result;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'Token:validate');
      result.errors.push(handledError.message);

      this.logger.error('Token validation failed', {
        error: handledError.message,
        errors: result.errors
      });

      return result;
    }
  }

  getTokenInfo(token: string): {
    isValid: boolean;
    isExpired: boolean;
    issuedAt?: string;
    expiresAt?: string;
    subject?: string;
    remainingTime: number;
  } {
    const validation = this.validateToken(token);
    const payload = validation.payload;

    return {
      isValid: validation.isValid,
      isExpired: validation.isExpired,
      issuedAt: payload?.iat ? new Date(payload.iat * 1000).toISOString() : undefined,
      expiresAt: payload?.exp ? new Date(payload.exp * 1000).toISOString() : undefined,
      subject: payload?.sub,
      remainingTime: this.getTokenRemainingTime(token)
    };
  }

  private decodeToken(token: string): TokenPayload {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      throw errorHandler.create('Failed to decode token', 'TOKEN_DECODE_FAILED', { error });
    }
  }

  private validatePayloadStructure(payload: unknown): void {
    if (typeof payload !== 'object' || payload === null) {
      throw errorHandler.create('Token payload must be an object', 'INVALID_PAYLOAD_STRUCTURE');
    }

    const payloadObj = payload as Record<string, unknown>;

    if (payloadObj.exp !== undefined && typeof payloadObj.exp !== 'number') {
      throw errorHandler.create('Token expiration must be a number', 'INVALID_EXP_CLAIM');
    }

    if (payloadObj.iat !== undefined && typeof payloadObj.iat !== 'number') {
      throw errorHandler.create('Token issued at must be a number', 'INVALID_IAT_CLAIM');
    }

    if (payloadObj.sub !== undefined && typeof payloadObj.sub !== 'string') {
      throw errorHandler.create('Token subject must be a string', 'INVALID_SUB_CLAIM');
    }
  }
}

// Export singleton instance
export const tokenService: TokenService = new TokenServiceImpl();

// Export class for testing
export { TokenServiceImpl };
