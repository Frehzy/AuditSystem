// src/modules/auth/api/auth.api.ts
import { apiClient } from '@/core/services/api/api-client.service';
import { logger } from '@/core/utils/logger';
import type {
  LoginRequest,
  LogoutRequest,
  ValidateTokenRequest,
  RefreshTokenRequest,
  LoginResponse,
  ValidateTokenResponse,
  ApiResponse,
} from '../types';

class AuthApi {
  private readonly logger = logger.create('AuthApi');

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      this.logger.info('Login request', { username: credentials.username });

      const response = await apiClient.post<LoginResponse>('/auth/login', credentials, {
        requireAuth: false,
        timeout: 15000,
      });

      this.logger.info('Login successful', {
        userId: response.user?.id,
        username: response.user?.username
      });

      return response;
    } catch (error) {
      this.logger.error('Login failed', { error, username: credentials.username });
      throw error;
    }
  }

  async logout(data: LogoutRequest): Promise<void> {
    try {
      this.logger.info('Logout request', { userId: data.userId });

      await apiClient.post('/auth/logout', data, {
        requireAuth: true,
        timeout: 10000,
      });

      this.logger.info('Logout successful', { userId: data.userId });
    } catch (error) {
      this.logger.warn('Logout error', { error, userId: data.userId });
      // Не бросаем ошибку, так как выход должен завершиться в любом случае
    }
  }

  async validateToken(data: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      const response = await apiClient.post<ValidateTokenResponse>('/auth/validate', data, {
        requireAuth: false,
        timeout: 10000,
      });

      this.logger.debug('Token validation result', { isValid: response.isValid });
      return response;
    } catch (error) {
      this.logger.error('Token validation failed', { error });
      return { isValid: false };
    }
  }

  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    try {
      this.logger.info('Refresh token request');

      const response = await apiClient.post<LoginResponse>('/auth/refresh', data, {
        requireAuth: false,
        timeout: 10000,
      });

      this.logger.info('Token refreshed successfully');
      return response;
    } catch (error) {
      this.logger.error('Token refresh failed', { error });
      throw error;
    }
  }
}

export const authApi = new AuthApi();
