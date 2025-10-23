import { logger } from '@/core/utils/logger/logger';
import { errorHandler } from '../error/error-handler.service';
import { httpService } from '../http/http.service';
import type { ApiClient, ApiRequestOptions, ApiResponse } from '../types';

class ApiClientImpl implements ApiClient {
  private readonly logger = logger.create('ApiClient');
  private baseUrl: string = '';
  private authToken: string | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }
  }

  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, null, options);
  }

  async post<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, null, options);
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.logger.debug('Base URL set', { baseUrl: this.baseUrl });
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    this.logger.debug('Auth token set');
  }

  clearAuthToken(): void {
    this.authToken = null;
    this.logger.debug('Auth token cleared');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const config = this.buildRequestConfig(method, data, options);

    try {
      const response = await httpService.request<any>(method, url, data, config);

      // Упрощенная обработка ответа - принимаем любой успешный ответ
      // Бекенд может возвращать данные в разных форматах
      if (response.status >= 200 && response.status < 300) {
        // Если ответ содержит поле data - используем его, иначе весь ответ
        const responseData = response.data;

        this.logger.api('API request successful', {
          method,
          endpoint,
          status: response.status,
          url
        });

        // Проверяем структуру ответа для стандартизированных API ответов
        if (responseData && typeof responseData === 'object') {
          // Если это стандартный API response с полем data
          if ('data' in responseData) {
            return responseData.data as T;
          }
          // Если это стандартный API response с полем success
          if ('success' in responseData && responseData.success === true && 'data' in responseData) {
            return responseData.data as T;
          }
        }

        // Возвращаем данные как есть (прямой ответ от бекенда)
        return responseData as T;

      } else {
        // Обработка HTTP ошибок
        throw this.createApiError(response, method, url);
      }

    } catch (error: any) {
      const handledError = errorHandler.handle(error, `API:${method}:${endpoint}`);

      if (!options.skipErrorHandler) {
        this.handleApiError(handledError, method, endpoint);
      }

      throw handledError;
    }
  }

  private createApiError(response: any, method: string, url: string): Error {
    const status = response.status;
    const statusText = response.statusText;
    let errorMessage = `HTTP ${status}: ${statusText}`;
    let errorDetails: any = { url, method, status };

    // Извлекаем сообщение об ошибке из ответа
    if (response.data) {
      if (typeof response.data === 'string') {
        errorMessage = response.data;
      } else if (typeof response.data === 'object') {
        if (response.data.message) {
          errorMessage = response.data.message;
        } else if (response.data.error) {
          errorMessage = response.data.error;
        } else if (Array.isArray(response.data.errors)) {
          errorMessage = response.data.errors.join(', ');
          errorDetails.errors = response.data.errors;
        }
        errorDetails.responseData = response.data;
      }
    }

    const error = new Error(errorMessage);
    (error as any).status = status;
    (error as any).details = errorDetails;
    (error as any).code = this.getErrorCode(status);

    return error;
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400: return 'VALIDATION_ERROR';
      case 401: return 'UNAUTHORIZED';
      case 403: return 'FORBIDDEN';
      case 404: return 'NOT_FOUND';
      case 409: return 'CONFLICT';
      case 422: return 'UNPROCESSABLE_ENTITY';
      case 429: return 'RATE_LIMITED';
      case 500: return 'SERVER_ERROR';
      case 502: return 'BAD_GATEWAY';
      case 503: return 'SERVICE_UNAVAILABLE';
      case 504: return 'GATEWAY_TIMEOUT';
      default: return 'HTTP_ERROR';
    }
  }

  private buildUrl(endpoint: string): string {
    if (!endpoint) {
      throw errorHandler.create('Endpoint cannot be empty', 'INVALID_ENDPOINT');
    }

    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    if (!this.baseUrl) {
      throw errorHandler.create('Base URL is not set', 'BASE_URL_NOT_SET');
    }

    const normalizedEndpoint = endpoint.replace(/^\//, '');
    return `${this.baseUrl}/${normalizedEndpoint}`;
  }

  private buildRequestConfig(method: string, data: any, options: ApiRequestOptions): any {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (options.requireAuth !== false && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return {
      timeout: options.timeout,
      headers,
      retryAttempts: options.retryOnNetworkError !== false ? options.retryAttempts : 0,
      retryDelay: options.retryDelay,
      body: data && ['POST', 'PUT', 'PATCH'].includes(method) ? JSON.stringify(data) : undefined,
    };
  }

  private handleApiError(error: any, method: string, endpoint: string): void {
    this.logger.error('API request failed', {
      method,
      endpoint,
      error: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });

    if (errorHandler.isAuthError(error)) {
      this.handleAuthError();
    }
  }

  private handleAuthError(): void {
    this.clearAuthToken();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:auth-error'));
    }

    this.logger.warn('Authentication error handled - token cleared');
  }
}

export const apiClient: ApiClient = new ApiClientImpl();
