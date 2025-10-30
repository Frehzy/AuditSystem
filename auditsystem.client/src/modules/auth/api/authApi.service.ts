// src/modules/auth/api/authApi.service.ts
import { apiClient } from '@/core/services/core/api/api-client.service';
import { errorHandler } from '@/core/services/core/utils/error-handler.service';
import { logger } from '@/core/utils/logger';
import type {
  LoginCommand,
  ValidateTokenRequest,
  LoginResponseData
} from './auth.types';

interface AuthApiConfig {
  basePath: string;
  timeout: number;
  retryAttempts: number;
  enableLogging: boolean;
}

// Интерфейс для команды logout
interface LogoutCommand {
  userId: string;
  token: string;
}

class AuthApiService {
  private readonly logger = logger.create('AuthApiService');
  private readonly config: AuthApiConfig = {
    basePath: 'api/auth',
    timeout: 15000,
    retryAttempts: 2,
    enableLogging: import.meta.env.DEV,
  };

  private requestQueue = new Map<string, Promise<unknown>>();
  private activeRequests = new Set<string>();
  private abortControllers = new Map<string, AbortController>();

  constructor(config?: Partial<AuthApiConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Авторизация пользователя с улучшенной обработкой ошибок
   */
  async login(credentials: LoginCommand): Promise<LoginResponseData> {
    const endpoint = `${this.config.basePath}/login`;
    const requestKey = `login:${credentials.username}`;

    // Отменяем предыдущий запрос с тем же ключом
    if (this.abortControllers.has(requestKey)) {
      this.abortControllers.get(requestKey)?.abort();
      this.abortControllers.delete(requestKey);
    }

    // Дедупликация запросов
    if (this.requestQueue.has(requestKey)) {
      this.logger.debug('Returning cached login request', { username: credentials.username });
      return this.requestQueue.get(requestKey)! as Promise<LoginResponseData>;
    }

    if (this.activeRequests.has(requestKey)) {
      throw errorHandler.create('Login request already in progress', 'REQUEST_IN_PROGRESS');
    }

    this.logger.auth('Login request', {
      username: credentials.username,
      rememberMe: credentials.rememberMe
    });

    // Создаем AbortController для возможности отмены запроса
    const abortController = new AbortController();
    this.abortControllers.set(requestKey, abortController);

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, this.config.timeout);

    try {
      this.activeRequests.add(requestKey);

      const requestPromise = this.executeRequest<LoginResponseData>(
        endpoint,
        'POST',
        credentials,
        {
          requireAuth: false,
          signal: abortController.signal // передаем сигнал отмены
        }
      );

      this.requestQueue.set(requestKey, requestPromise);

      const response = await requestPromise;
      clearTimeout(timeoutId);

      // Упрощенная проверка ответа - бекенд возвращает данные напрямую
      if (!response || typeof response !== 'object') {
        throw errorHandler.create('Invalid response format', 'INVALID_RESPONSE');
      }

      // Проверяем наличие обязательных полей в ответе
      if (!response.token || !response.user) {
        this.logger.warn('Response missing token or user data', { response });
        throw errorHandler.create('Invalid response: missing token or user data', 'INVALID_RESPONSE');
      }

      this.logger.auth('Login successful', {
        userId: response.user.id,
        username: response.user.username
      });

      return response;

    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // Обработка различных типов ошибок
      let handledError;

      if (error instanceof Error && error.name === 'AbortError') {
        handledError = errorHandler.create(
          'Сервер не отвечает. Проверьте подключение к сети.',
          'NETWORK_TIMEOUT',
          { originalError: error }
        );
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        handledError = errorHandler.create(
          'Ошибка сети. Сервер недоступен.',
          'NETWORK_ERROR',
          { originalError: error }
        );
      } else {
        handledError = errorHandler.handle(error, 'auth.login');
      }

      this.logger.error('Login failed', {
        error: handledError.message,
        username: credentials.username,
        code: handledError.code,
        timeout: this.config.timeout
      });

      throw handledError;
    } finally {
      this.activeRequests.delete(requestKey);
      this.requestQueue.delete(requestKey);
      this.abortControllers.delete(requestKey);
    }
  }

  /**
   * Валидация токена на сервере
   */
  async validateToken(token: string): Promise<boolean> {
    const endpoint = `${this.config.basePath}/validate`;
    const requestData: ValidateTokenRequest = { token };

    try {
      // Бекенд возвращает пустой ответ с кодом 200 при успехе
      // или ошибку при невалидном токене
      await this.executeRequest<unknown>(
        endpoint,
        'POST',
        requestData,
        { requireAuth: false }
      );

      // Если запрос прошел без ошибок - токен валиден
      this.logger.auth('Token validation successful');
      return true;

    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'auth.validateToken');
      this.logger.error('Token validation failed', {
        error: handledError.message,
        code: handledError.code,
        status: handledError.status
      });
      return false;
    }
  }

  /**
   * Выход из системы
   */
  async logout(logoutCommand?: LogoutCommand): Promise<void> {
    const endpoint = `${this.config.basePath}/logout`;

    try {
      // Если передана команда logout, используем ее, иначе создаем пустую
      const command = logoutCommand || { userId: '', token: '' };

      await this.executeRequest(
        endpoint,
        'POST',
        command,
        { requireAuth: true } // logout требует авторизации
      );

      this.logger.auth('Logout completed', {
        userId: command.userId ? `${command.userId.substring(0, 8)}...` : 'unknown'
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'auth.logout');
      this.logger.error('Logout error', {
        error: handledError.message,
        code: handledError.code
      });
      // Не бросаем ошибку, так как выход должен завершиться в любом случае
      // Но логируем для отладки
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
    } catch (error: unknown) {
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
    data?: unknown,
    options: { requireAuth?: boolean; signal?: AbortSignal } = {}
  ): Promise<T> {
    const requestOptions = {
      requireAuth: options.requireAuth ?? true,
      timeout: this.config.timeout,
      retryAttempts: this.config.retryAttempts,
      signal: options.signal,
    };

    try {
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
    } catch (error: unknown) {
      // Перебрасываем ошибку для обработки в вызывающем коде
      throw error;
    }
  }

  /**
   * Методы для управления запросами
   */
  cancelRequest(key: string): void {
    if (this.abortControllers.has(key)) {
      this.abortControllers.get(key)?.abort();
      this.abortControllers.delete(key);
    }
    this.requestQueue.delete(key);
    this.activeRequests.delete(key);
  }

  cancelAllRequests(): void {
    // Отменяем все AbortController'ы
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();

    // Очищаем очереди
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
