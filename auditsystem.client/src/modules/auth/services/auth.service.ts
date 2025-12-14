// src/modules/auth/services/auth.service.ts
import { authApi } from '../api';
import { logger } from '@/core/utils/logger';
import type { LoginRequest, UserDto } from '../types';

class AuthService {
  private readonly logger = logger.create('AuthService');

  async login(credentials: LoginRequest) {
    try {
      this.validateCredentials(credentials);
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
    if (!credentials.username?.trim()) {
      throw new Error('Имя пользователя обязательно');
    }
    if (!credentials.password?.trim()) {
      throw new Error('Пароль обязателен');
    }
    if (credentials.username.length < 2) {
      throw new Error('Имя пользователя слишком короткое');
    }
    if (credentials.password.length < 3) {
      throw new Error('Пароль слишком короткий');
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

export const authService = new AuthService();
