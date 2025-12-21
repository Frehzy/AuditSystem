/**
 * Запросы API для авторизации
 */

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LogoutRequest {
  userId: string;
  token: string;
}

export interface ValidateTokenRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
