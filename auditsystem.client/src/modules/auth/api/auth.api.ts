/**
 * API клиент для модуля авторизации
 */

import { httpClient } from '@/core/services/api/http-client.service';
import { ApiErrorHandler } from '@/core/services/api/api-error.handler';
import { logger } from '@/core/services/logger/logger.service';
import type {
  LoginRequest,
  LogoutRequest,
  ValidateTokenRequest,
  RefreshTokenRequest,
  LoginResponse,
  ValidateTokenResponse,
  RefreshTokenResponse
} from './types';

export class AuthApi {
  private readonly logger = logger.create('AuthApi');

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      this.logger.info('Запрос входа', { username: credentials.username });

      const response = await httpClient.post<LoginResponse>('/Auth/login', credentials, {
        requireAuth: false,
        timeout: 15000
      });

      this.logger.info('Вход выполнен успешно', {
        userId: response.data.user?.id,
        username: response.data.user?.username
      });

      return response.data;
    } catch (error: any) {
      ApiErrorHandler.handle(error, 'Auth:Login');
      throw error;
    }
  }

  async logout(data: LogoutRequest): Promise<void> {
    try {
      this.logger.info('Запрос выхода', { userId: data.userId });

      await httpClient.post('/Auth/logout', data, {
        requireAuth: true,
        timeout: 10000
      });

      this.logger.info('Выход выполнен успешно', { userId: data.userId });
    } catch (error: any) {
      // Не бросаем ошибку для logout, просто логируем
      this.logger.warn('Ошибка API выхода', { error: error.message, userId: data.userId });
    }
  }

  async validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      this.logger.debug('Запрос проверки токена');

      const response = await httpClient.post<ValidateTokenResponse>('/Auth/validate', data, {
        requireAuth: false,
        timeout: 10000
      });

      this.logger.debug('Результат проверки токена', { isValid: response.data.isValid });
      return response.data;
    } catch (error: any) {
      this.logger.error('Ошибка проверки токена', { error: error.message });
      return { isValid: false };
    }
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    try {
      this.logger.info('Запрос обновления токена');

      const response = await httpClient.post<RefreshTokenResponse>('/Auth/refresh', data, {
        requireAuth: false,
        timeout: 10000
      });

      this.logger.info('Токен успешно обновлен');
      return response.data;
    } catch (error: any) {
      ApiErrorHandler.handle(error, 'Auth:RefreshToken');
      throw error;
    }
  }
}

// Экспортируем синглтон
export const authApi = new AuthApi();
