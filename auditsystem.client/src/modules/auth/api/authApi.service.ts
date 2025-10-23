import { apiClient } from '@/core/services/api/api-client.service';
import { errorHandler } from '@/core/services/error/error-handler.service';
import { logger } from '@/core/utils/logger/logger';
import type {
  LoginCommand,
  ValidateTokenRequest,
  LoginResponseData,
  ValidateTokenResponseData,
  RegisterCommand,
  ApiResult,
  UserDto
} from './auth.types';

interface AuthApiConfig {
  basePath: string;
  timeout: number;
  retryAttempts: number;
  enableLogging: boolean;
}

class AuthApiService {
  private readonly logger = logger.create('AuthApiService');
  private readonly config: AuthApiConfig = {
    basePath: 'api/auth',
    timeout: 15000,
    retryAttempts: 2,
    enableLogging: import.meta.env.DEV,
  };

  private requestQueue = new Map<string, Promise<any>>();
  private activeRequests = new Set<string>();

  constructor(config?: Partial<AuthApiConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Авторизация пользователя
   */
  async login(credentials: LoginCommand): Promise<LoginResponseData> {
    const endpoint = `${this.config.basePath}/login`;
    const requestKey = `login:${credentials.username}`;

    // Дедупликация запросов
    if (this.requestQueue.has(requestKey)) {
      this.logger.debug('Returning cached login request', { username: credentials.username });
      return this.requestQueue.get(requestKey)!;
    }

    if (this.activeRequests.has(requestKey)) {
      throw errorHandler.create('Login request already in progress', 'REQUEST_IN_PROGRESS');
    }

    this.logger.auth('Login request', {
      username: credentials.username,
      rememberMe: credentials.rememberMe
    });

    try {
      this.activeRequests.add(requestKey);

      const requestPromise = this.executeRequest<LoginResponseData>(
        endpoint,
        'POST',
        credentials,
        { requireAuth: false }
      );

      this.requestQueue.set(requestKey, requestPromise);

      const response = await requestPromise;

      // Проверка обязательных полей
      if (!response.token || !response.user) {
        throw errorHandler.create('Invalid response format: missing token or user data', 'INVALID_RESPONSE');
      }

      this.logger.auth('Login successful', {
        userId: response.user.id,
        username: response.user.username
      });

      return response;

    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.login');
      this.logger.error('Login failed', {
        error: handledError.message,
        username: credentials.username,
        code: handledError.code
      });
      throw handledError;
    } finally {
      this.activeRequests.delete(requestKey);
      this.requestQueue.delete(requestKey);
    }
  }

  /**
   * Валидация токена на сервере
   */
  async validateToken(token: string): Promise<boolean> {
    const endpoint = `${this.config.basePath}/validate`;
    const requestData: ValidateTokenRequest = { token };

    try {
      const response = await this.executeRequest<ValidateTokenResponseData>(
        endpoint,
        'POST',
        requestData,
        { requireAuth: false }
      );

      const isValid = response.isValid;
      this.logger.auth('Token validation', { isValid });
      return isValid;

    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.validateToken');
      this.logger.error('Token validation error', {
        error: handledError.message
      });
      return false;
    }
  }

  /**
   * Регистрация пользователя
   */
  async register(command: RegisterCommand): Promise<ApiResult<UserDto>> {
    const endpoint = `${this.config.basePath}/register`;

    this.logger.auth('Registration request', {
      username: command.username,
      email: command.email
    });

    try {
      const userData = await this.executeRequest<UserDto>(
        endpoint,
        'POST',
        command,
        { requireAuth: false }
      );

      this.logger.auth('Registration successful', {
        userId: userData.id
      });

      return { success: true, data: userData };

    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.register');
      this.logger.error('Registration failed', {
        error: handledError.message
      });

      return {
        success: false,
        error: handledError.message,
        status: handledError.status
      };
    }
  }

  /**
   * Получение профиля пользователя
   */
  async getProfile(): Promise<UserDto> {
    const endpoint = `${this.config.basePath}/profile`;

    try {
      const userData = await this.executeRequest<UserDto>(endpoint, 'GET');

      if (!userData?.id) {
        throw errorHandler.create('Invalid profile response format', 'INVALID_RESPONSE');
      }

      this.logger.auth('Profile fetched', {
        userId: userData.id
      });

      return userData;

    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.getProfile');
      this.logger.error('Profile fetch failed', {
        error: handledError.message
      });
      throw handledError;
    }
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    const endpoint = `${this.config.basePath}/logout`;

    try {
      await this.executeRequest(endpoint, 'POST');
      this.logger.auth('Logout completed');
    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.logout');
      this.logger.error('Logout error', {
        error: handledError.message
      });
      // Не бросаем ошибку, так как выход должен завершиться в любом случае
    }
  }

  /**
   * Сброс пароля
   */
  async requestPasswordReset(email: string): Promise<ApiResult<void>> {
    const endpoint = `${this.config.basePath}/forgot-password`;

    try {
      await this.executeRequest(endpoint, 'POST', { email });
      this.logger.auth('Password reset requested', { email });
      return { success: true, data: undefined };
    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.requestPasswordReset');
      this.logger.error('Password reset request failed', {
        error: handledError.message
      });

      return {
        success: false,
        error: handledError.message
      };
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(userData: Partial<UserDto>): Promise<UserDto> {
    const endpoint = `${this.config.basePath}/profile`;

    try {
      const updatedUser = await this.executeRequest<UserDto>(endpoint, 'PUT', userData);

      this.logger.auth('Profile updated', {
        userId: updatedUser.id
      });

      return updatedUser;
    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.updateProfile');
      this.logger.error('Profile update failed', {
        error: handledError.message
      });
      throw handledError;
    }
  }

  /**
   * Проверка доступности имени пользователя
   */
  async checkUsernameAvailability(username: string): Promise<boolean> {
    const endpoint = `${this.config.basePath}/check-username`;

    try {
      const response = await this.executeRequest<{ available: boolean }>(
        endpoint,
        'POST',
        { username },
        { requireAuth: false }
      );

      return response.available;
    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.checkUsername');
      this.logger.error('Username check failed', {
        error: handledError.message
      });
      return false;
    }
  }

  /**
   * Обновление токена
   */
  async refreshToken(refreshToken: string): Promise<LoginResponseData> {
    const endpoint = `${this.config.basePath}/refresh`;

    try {
      const response = await this.executeRequest<LoginResponseData>(
        endpoint,
        'POST',
        { refreshToken },
        { requireAuth: false }
      );

      this.logger.auth('Token refreshed', {
        hasNewToken: !!response.token,
        hasNewRefreshToken: !!response.refreshToken
      });

      return response;
    } catch (error: any) {
      const handledError = errorHandler.handle(error, 'auth.refreshToken');
      this.logger.error('Token refresh failed', {
        error: handledError.message
      });
      throw handledError;
    }
  }

  /**
   * Универсальный метод выполнения запросов
   */
  private async executeRequest<T>(
    endpoint: string,
    method: string,
    data?: any,
    options: { requireAuth?: boolean } = {}
  ): Promise<T> {
    const requestOptions = {
      requireAuth: options.requireAuth ?? true,
      timeout: this.config.timeout,
      retryAttempts: this.config.retryAttempts,
    };

    switch (method) {
      case 'GET':
        return await apiClient.get<T>(endpoint, requestOptions);
      case 'POST':
        return await apiClient.post<T>(endpoint, data, requestOptions);
      case 'PUT':
        return await apiClient.put<T>(endpoint, data, requestOptions);
      case 'DELETE':
        return await apiClient.delete<T>(endpoint, requestOptions);
      default:
        throw errorHandler.create(`Unsupported HTTP method: ${method}`, 'UNSUPPORTED_METHOD');
    }
  }

  /**
   * Методы для управления запросами
   */
  cancelRequest(key: string): void {
    this.requestQueue.delete(key);
    this.activeRequests.delete(key);
  }

  cancelAllRequests(): void {
    this.requestQueue.clear();
    this.activeRequests.clear();
  }

  getActiveRequests(): string[] {
    return Array.from(this.activeRequests);
  }

  getQueueSize(): number {
    return this.requestQueue.size;
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newConfig: Partial<AuthApiConfig>): void {
    Object.assign(this.config, newConfig);
    this.logger.debug('Auth API config updated', { config: this.config });
  }
}

export const authApiService = new AuthApiService();
