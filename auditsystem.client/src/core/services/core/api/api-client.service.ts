// src/core/services/core/api/api-client.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import { httpService } from './http.service';
import type { ApiClient, ApiRequestOptions } from '@/core/types';

class ApiClientImpl implements ApiClient {
  private readonly logger = logger.create('ApiClient');
  private baseUrl: string = '';
  private authToken: string | null = null;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.setBaseUrl(baseUrl);
    }
  }

  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, null, options);
  }

  async post<T>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, null, options);
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await httpService.get(`${this.baseUrl}/health`, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
        },
      });

      return response.status >= 200 && response.status < 300;
    } catch (error) {
      this.logger.warn('Health check failed', { error });
      return false;
    }
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
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const config = this.buildRequestConfig(method, data, options);

    try {
      const response = await httpService.request<unknown>(method, url, data, config);

      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data;

        this.logger.api('API request successful', {
          method,
          endpoint,
          status: response.status,
          url
        });

        // Handle standardized API responses
        if (responseData && typeof responseData === 'object') {
          if ('data' in responseData) {
            return responseData.data as T;
          }
          if ('success' in responseData && responseData.success === true && 'data' in responseData) {
            return responseData.data as T;
          }
        }

        return responseData as T;
      } else {
        throw this.createApiError(response, method, url);
      }
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, `API:${method}:${endpoint}`);

      if (!options.skipErrorHandler) {
        this.handleApiError(handledError, method, endpoint);
      }

      throw handledError;
    }
  }

  private createApiError(response: unknown, method: string, url: string): Error {
    const responseObj = response as { status: number; statusText: string; data?: unknown };
    const status = responseObj.status;
    const statusText = responseObj.statusText;
    let errorMessage = `HTTP ${status}: ${statusText}`;
    const errorDetails: Record<string, unknown> = { url, method, status };

    // Extract error message from response
    if (responseObj.data) {
      if (typeof responseObj.data === 'string') {
        errorMessage = responseObj.data;
      } else if (typeof responseObj.data === 'object' && responseObj.data !== null) {
        const dataObj = responseObj.data as Record<string, unknown>;
        if (dataObj.message) {
          errorMessage = String(dataObj.message);
        } else if (dataObj.error) {
          errorMessage = String(dataObj.error);
        } else if (Array.isArray(dataObj.errors)) {
          errorMessage = dataObj.errors.join(', ');
          errorDetails.errors = dataObj.errors;
        }
        errorDetails.responseData = responseObj.data;
      }
    }

    const error = new Error(errorMessage);
    (error as { status?: number }).status = status;
    (error as { details?: unknown }).details = errorDetails;
    (error as { code?: string }).code = this.getErrorCode(status);

    return error;
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'RATE_LIMITED',
      500: 'SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT'
    };

    return errorCodes[status] || 'HTTP_ERROR';
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

  private buildRequestConfig(_method: string, _data: unknown, options: ApiRequestOptions): Record<string, unknown> {
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
    };
  }

  private handleApiError(error: unknown, method: string, endpoint: string): void {
    const errorObj = error as { message?: string; code?: string; status?: number };

    this.logger.error('API request failed', {
      method,
      endpoint,
      error: errorObj.message,
      code: errorObj.code,
      status: errorObj.status,
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

// Создаем экземпляр для экспорта
const apiClient = new ApiClientImpl();

// Экспортируем как named export
export { apiClient };

// И как default export для совместимости
export default apiClient;
