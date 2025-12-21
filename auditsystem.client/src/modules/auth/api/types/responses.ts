/**
 * Ответы API для авторизации
 */

import type { UserDto } from './dto';

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: UserDto;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  expiresAt?: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: UserDto;
}
