/**
 * Сервис бизнес-логики авторизации
 */

import { authApi } from '../api';
import { logger } from '@/core/services/logger/logger.service';
import type { LoginRequest, UserDto } from '../api/types';

export class AuthService {
  private readonly logger = logger.create('AuthService');

  async login(credentials: LoginRequest) {
    try {
      // Валидация перед отправкой
      this.validateCredentials(credentials);

      // Вызов API
      return await authApi.login(credentials);
    } catch (error) {
      this.handleLoginError(error);
      throw error;
    }
  }

  async logout(userId: string, token: string) {
    try {
      await authApi.logout({ userId, token });
    } catch (error) {
      this.logger.warn('Logout completed with errors', { error });
      // Не бросаем ошибку, так как logout должен завершиться в любом случае
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      if (!token) return false;

      const response = await authApi.validateToken({ token });
      return response.isValid;
    } catch (error) {
      this.logger.error('Token validation error', { error });
      return false;
    }
  }

  private validateCredentials(credentials: LoginRequest) {
    const errors: string[] = [];

    if (!credentials.username?.trim()) {
      errors.push('Имя пользователя обязательно');
    }

    if (!credentials.password?.trim()) {
      errors.push('Пароль обязателен');
    }

    if (credentials.username && credentials.username.length < 2) {
      errors.push('Имя пользователя слишком короткое');
    }

    if (credentials.password && credentials.password.length < 3) {
      errors.push('Пароль слишком короткий');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  private handleLoginError(error: any) {
    this.logger.error('Authentication error', {
      message: error.message,
      code: error.code
    });
  }

  hasPermission(user: UserDto, permission: string): boolean {
    return user.permissions?.includes(permission) || false;
  }

  hasRole(user: UserDto, role: string): boolean {
    return user.role === role;
  }

  hasAnyRole(user: UserDto, roles: string[]): boolean {
    return roles.includes(user.role);
  }
}

// Экспортируем синглтон
export const authService = new AuthService();
