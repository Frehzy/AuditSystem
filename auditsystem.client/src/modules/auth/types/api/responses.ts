// src/modules/auth/types/api/responses.ts
import type { UserDto } from './dto';

/** Базовый ответ API */
export interface ApiResponse<T = unknown> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: string[];
  timestamp: string;
  statusCode?: number;
}

/** Ответ на логин */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresAt: string;
  user: UserDto;
}

/** Ответ на валидацию токена */
export interface ValidateTokenResponse {
  isValid: boolean;
  expiresAt?: string;
}

/** Ответ на проверку здоровья */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    name: string;
    status: string;
    responseTime?: number;
  }[];
}
