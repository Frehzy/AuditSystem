// framework/stores/types/auth.types.ts

import type { UserDto } from '@/modules/auth/api/auth.types';

/**
 * Результат валидации токена
 */
export interface TokenValidationResult {
  isValid: boolean;
  errors: string[];
  expiresAt?: Date;
  issuedAt?: Date;
}

/**
 * Роли и разрешения
 */
export interface AuthPermissions {
  roles: string[];
  permissions: string[];
  scopes: string[];
}

/**
 * Метаданные сессии
 */
export interface SessionMetadata {
  startedAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}
