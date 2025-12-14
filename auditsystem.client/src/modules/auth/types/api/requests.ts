// src/modules/auth/types/api/requests.ts

/** Команда для входа в систему */
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

/** Команда для выхода из системы */
export interface LogoutRequest {
  userId: string;
  token: string;
}

/** Запрос валидации токена */
export interface ValidateTokenRequest {
  token: string;
}

/** Запрос обновления токена */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** Запрос проверки здоровья сервера */
export interface HealthCheckRequest {
  checkType?: 'basic' | 'full';
}
