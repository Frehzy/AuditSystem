// src/core/services/api/api-client.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import { httpService } from './http.service';
import { APP_CONFIG } from '@/core/config/app.config';
import type { ApiClient, ApiRequestOptions, BackendResult } from '@/core/types';

/**
 * Улучшенный API клиент с поддержкой кэширования, дедупликации и улучшенной обработкой ошибок
 */
class ApiClientImpl implements ApiClient {
  private readonly logger = logger.create('ApiClient');
  private baseUrl: string = APP_CONFIG.API.BASE_URL;
  private authToken: string | null = null;

  // Система кэширования запросов
  private readonly requestCache = new Map<string, {
    data: unknown;
    timestamp: number;
    ttl: number;
    etag?: string;
    expiresAt?: number;
  }>();

  // Дедупликация запросов
  private readonly pendingRequests = new Map<string, Promise<unknown>>();
  private readonly DEFAULT_CACHE_TTL = 60000;
  private readonly MAX_CACHE_SIZE = 100;

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.setBaseUrl(baseUrl);
    }

    this.logger.debug('ApiClient initialized', {
      baseUrl: this.baseUrl,
      defaultCacheTtl: this.DEFAULT_CACHE_TTL,
      maxCacheSize: this.MAX_CACHE_SIZE
    });

    this.startCacheCleanup();
  }

  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const cacheKey = options.cacheKey || this.getCacheKey('GET', endpoint, null);

    if (options.useCache && !options.forceRefresh) {
      const cached = this.getCachedResponse<T>(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached response', {
          endpoint,
          cacheKey: cacheKey.substring(0, 32) + '...'
        });
        return cached;
      }
    }

    return this.request<T>('GET', endpoint, null, { ...options, cacheKey });
  }

  async post<T>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    this.validateDataBeforeSend(data, 'POST', endpoint);
    return this.request<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    this.validateDataBeforeSend(data, 'PUT', endpoint);
    return this.request<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    this.validateDataBeforeSend(data, 'PATCH', endpoint);
    return this.request<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    this.logger.warn('DELETE request initiated', { endpoint });
    return this.request<T>('DELETE', endpoint, null, options);
  }

  async checkHealth(): Promise<{
    isHealthy: boolean;
    responseTime: number;
    details?: string;
    endpoint?: string;
  }> {
    const healthEndpoints = [
      '/api/health',
      '/health',
      '/api/health/db',
      '/api/status'
    ];

    const startTime = performance.now();

    for (const endpoint of healthEndpoints) {
      try {
        this.logger.debug('Trying health check endpoint', { endpoint });

        const response = await httpService.get(`${this.baseUrl}${endpoint}`, {
          timeout: 3000,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
        });

        if (response.status >= 200 && response.status < 300) {
          const responseTime = Math.round(performance.now() - startTime);
          this.logger.debug('Health check passed', {
            endpoint,
            responseTime,
            status: response.status
          });
          return {
            isHealthy: true,
            responseTime,
            endpoint
          };
        } else {
          this.logger.warn('Health check returned non-200 status', {
            endpoint,
            status: response.status
          });
        }
      } catch (error) {
        this.logger.debug(`Health check failed for ${endpoint}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint
        });
        continue;
      }
    }

    try {
      this.logger.debug('Trying base URL health check');
      const response = await httpService.get(`${this.baseUrl}/`, {
        timeout: 3000
      });

      const responseTime = Math.round(performance.now() - startTime);
      const isHealthy = response.status >= 200 && response.status < 300;

      this.logger.debug('Base URL health check completed', {
        isHealthy,
        status: response.status,
        responseTime
      });

      return {
        isHealthy,
        responseTime,
        details: response.status >= 400 ? `HTTP ${response.status}` : undefined,
        endpoint: 'base'
      };
    } catch (finalError) {
      const responseTime = Math.round(performance.now() - startTime);
      this.logger.warn('All health checks failed', {
        error: finalError instanceof Error ? finalError.message : 'Unknown error',
        baseUrl: this.baseUrl,
        responseTime,
        testedEndpoints: healthEndpoints
      });

      return {
        isHealthy: false,
        responseTime,
        details: 'All endpoints unavailable',
        endpoint: 'none'
      };
    }
  }

  setBaseUrl(baseUrl: string): void {
    if (!baseUrl || typeof baseUrl !== 'string') {
      throw errorHandler.create('Base URL must be a non-empty string', 'INVALID_BASE_URL');
    }

    const normalizedUrl = baseUrl.replace(/\/$/, '');

    try {
      new URL(normalizedUrl);
    } catch {
      throw errorHandler.create('Invalid base URL format', 'INVALID_URL_FORMAT');
    }

    this.baseUrl = normalizedUrl;
    this.logger.debug('Base URL set', { baseUrl: this.baseUrl });
    this.clearCache();
  }

  setAuthToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw errorHandler.create('Auth token must be a non-empty string', 'INVALID_AUTH_TOKEN');
    }

    this.authToken = token;
    this.logger.debug('Auth token set', {
      tokenPreview: `${token.substring(0, 10)}...`
    });
  }

  clearAuthToken(): void {
    this.authToken = null;
    this.logger.debug('Auth token cleared');
    this.clearCache();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  clearCache(pattern?: RegExp): void {
    if (pattern) {
      let clearedCount = 0;
      for (const key of this.requestCache.keys()) {
        if (pattern.test(key)) {
          this.requestCache.delete(key);
          clearedCount++;
        }
      }
      this.logger.debug('Selective cache clearance completed', {
        clearedCount,
        pattern: pattern.toString()
      });
    } else {
      const previousSize = this.requestCache.size;
      this.requestCache.clear();
      this.logger.debug('Request cache cleared', {
        previousSize,
        currentSize: this.requestCache.size
      });
    }
  }

  getCacheStats(): {
    size: number;
    keys: string[];
    totalSize: number;
    hitRate?: number;
  } {
    const keys = Array.from(this.requestCache.keys());

    let totalSize = 0;
    this.requestCache.forEach((value) => {
      totalSize += JSON.stringify(value.data).length;
    });

    return {
      size: this.requestCache.size,
      keys: keys.map(key => key.substring(0, 50) + '...'),
      totalSize
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const requestKey = this.getRequestKey(method, url, data);

    if (this.pendingRequests.has(requestKey)) {
      this.logger.debug('Returning pending request', {
        method,
        endpoint,
        requestKey: requestKey.substring(0, 32) + '...'
      });
      return this.pendingRequests.get(requestKey) as Promise<T>;
    }

    const config = this.buildRequestConfig(method, data, options);
    const requestPromise = this.executeRequest<T>(method, url, data, config, options);

    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;

      if (method === 'GET' && options.useCache && options.cacheKey) {
        const ttl = options.cacheTtl || this.DEFAULT_CACHE_TTL;
        this.cacheResponse(options.cacheKey, result, ttl);
      }

      return result;
    } catch (error) {
      if (options.cacheKey) {
        this.requestCache.delete(options.cacheKey);
      }
      throw error;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    data: unknown,
    config: Record<string, unknown>,
    options: ApiRequestOptions
  ): Promise<T> {
    const startTime = performance.now();

    try {
      this.logger.debug(`Initiating ${method} request`, {
        url,
        method,
        hasData: data !== undefined && data !== null
      });

      const response = await httpService.request<unknown>(method, url, data, config);
      const responseTime = Math.round(performance.now() - startTime);

      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data;

        this.logger.debug('API request successful', {
          method,
          endpoint: url,
          status: response.status,
          responseTime: `${responseTime}ms`,
          dataSize: JSON.stringify(responseData).length
        });

        return this.normalizeResponse<T>(responseData, response.status, method, url);
      } else {
        throw this.createApiError(response, method, url);
      }
    } catch (error: unknown) {
      const responseTime = Math.round(performance.now() - startTime);
      const handledError = errorHandler.handle(error, `API:${method}:${url}`);

      this.logger.error('API request failed', {
        method,
        endpoint: url,
        responseTime: `${responseTime}ms`,
        error: handledError.message,
        code: handledError.code
      });

      if (!options.skipErrorHandler) {
        this.handleApiError(handledError, method, url);
      }

      throw handledError;
    }
  }

  private normalizeResponse<T>(
    responseData: unknown,
    status: number,
    method: string,
    url: string
  ): T {
    if (this.isBackendResult(responseData)) {
      const result = responseData as BackendResult<T>;

      if (result.succeeded && result.data !== undefined) {
        return result.data;
      } else if (!result.succeeded) {
        const errorMessage = result.errors?.join(', ') || result.message || 'Request failed';
        const error = new Error(errorMessage);
        this.enhanceError(error, status, {
          backendErrors: result.errors,
          backendMessage: result.message,
          url,
          method,
          responseData
        });
        throw error;
      }
    }

    if (responseData && typeof responseData === 'object') {
      if ('data' in responseData) {
        return (responseData as { data: T }).data;
      }

      if ('success' in responseData && (responseData as { success: boolean }).success === true && 'data' in responseData) {
        return (responseData as { data: T }).data;
      }

      if ('result' in responseData) {
        return (responseData as { result: T }).result;
      }
    }

    return responseData as T;
  }

  private isBackendResult(data: unknown): data is BackendResult<unknown> {
    return !!data &&
      typeof data === 'object' &&
      'succeeded' in data &&
      typeof (data as BackendResult<unknown>).succeeded === 'boolean';
  }

  private createApiError(response: unknown, method: string, url: string): Error {
    const responseObj = response as {
      status: number;
      statusText: string;
      data?: unknown;
      headers?: Record<string, string>;
    };

    const status = responseObj.status;
    const statusText = responseObj.statusText;

    let errorMessage = `HTTP ${status}: ${statusText}`;
    const errorDetails: Record<string, unknown> = {
      url,
      method,
      status,
      headers: responseObj.headers
    };

    if (responseObj.data) {
      const extractedMessage = this.extractErrorMessage(responseObj.data);
      if (extractedMessage) {
        errorMessage = extractedMessage;
      }
      errorDetails.responseData = responseObj.data;
    }

    const error = new Error(errorMessage);
    this.enhanceError(error, status, errorDetails);

    return error;
  }

  private extractErrorMessage(data: unknown): string | null {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return this.extractErrorMessage(parsed);
      } catch {
        return data;
      }
    }

    if (typeof data === 'object' && data !== null) {
      const dataObj = data as Record<string, unknown>;

      if ('succeeded' in dataObj && dataObj.succeeded === false) {
        const result = dataObj as { errors?: string[]; message?: string };
        if (result.errors && result.errors.length > 0) {
          return result.errors.join(', ');
        } else if (result.message) {
          return result.message;
        }
      }

      if (dataObj.message) return String(dataObj.message);
      if (dataObj.error) return String(dataObj.error);
      if (dataObj.detail) return String(dataObj.detail);
      if (Array.isArray(dataObj.errors)) return dataObj.errors.join(', ');

      if (dataObj.title && dataObj.status) {
        return `${dataObj.title} (HTTP ${dataObj.status})`;
      }
    }

    return null;
  }

  private enhanceError(error: Error, status: number, details: Record<string, unknown>): void {
    (error as any).status = status;
    (error as any).details = details;
    (error as any).code = this.getErrorCode(status);
    (error as any).timestamp = Date.now();
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
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
    if (!endpoint || typeof endpoint !== 'string') {
      throw errorHandler.create('Endpoint cannot be empty', 'INVALID_ENDPOINT');
    }

    if (endpoint.startsWith('http')) {
      try {
        new URL(endpoint);
        return endpoint;
      } catch {
        throw errorHandler.create('Invalid absolute URL in endpoint', 'INVALID_ABSOLUTE_URL');
      }
    }

    if (!this.baseUrl) {
      throw errorHandler.create('Base URL is not set', 'BASE_URL_NOT_SET');
    }

    const normalizedEndpoint = endpoint.replace(/^\/+/, '');
    const url = `${this.baseUrl}/${normalizedEndpoint}`;

    try {
      new URL(url);
      return url;
    } catch {
      throw errorHandler.create(`Invalid URL constructed: ${url}`, 'INVALID_URL_CONSTRUCTED');
    }
  }

  private buildRequestConfig(method: string, data: unknown, options: ApiRequestOptions): Record<string, unknown> {
    const config: Record<string, unknown> = {
      timeout: options.timeout || APP_CONFIG.API.TIMEOUT,
      retryAttempts: options.retryOnNetworkError ? (options.retryAttempts || 3) : 0,
      retryDelay: options.retryDelay || 1000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    if (options.requireAuth !== false && this.authToken) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Добавляем свойства кэширования в конфиг для httpService
    if (options.useCache !== undefined) {
      (config as any).useCache = options.useCache;
    }
    if (options.cacheTtl !== undefined) {
      (config as any).cacheTtl = options.cacheTtl;
    }

    if (method !== 'GET' && data !== undefined && data !== null) {
      config.data = data;
    }

    return config;
  }

  private handleApiError(error: Error, method: string, url: string): void {
    const status = (error as any).status;

    if (status === 401 || status === 403) {
      this.logger.warn('Authentication error occurred', {
        method,
        url,
        status
      });

      this.clearAuthToken();
    }

    if (status >= 500) {
      this.logger.error('Server error occurred', {
        method,
        url,
        status,
        error: error.message
      });
    }
  }

  private getCacheKey(method: string, endpoint: string, data: unknown): string {
    const dataString = data ? JSON.stringify(data) : '';
    return `api:${method}:${endpoint}:${dataString}`;
  }

  private getRequestKey(method: string, url: string, data: unknown): string {
    const dataString = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${dataString}`;
  }

  private getCachedResponse<T>(cacheKey: string): T | null {
    const cached = this.requestCache.get(cacheKey);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (cached.expiresAt && now > cached.expiresAt) {
      this.requestCache.delete(cacheKey);
      return null;
    }

    if (now > cached.timestamp + cached.ttl) {
      this.requestCache.delete(cacheKey);
      return null;
    }

    return cached.data as T;
  }

  private cacheResponse(cacheKey: string, data: unknown, ttl: number): void {
    if (this.requestCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.requestCache.keys().next().value;
      if (firstKey) {
        this.requestCache.delete(firstKey);
      }
    }

    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl,
      expiresAt: Date.now() + ttl
    });
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, value] of this.requestCache.entries()) {
        const isExpired = (value.expiresAt && now > value.expiresAt) ||
          now > value.timestamp + value.ttl;

        if (isExpired) {
          this.requestCache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.debug('Cache cleanup completed', {
          cleanedCount,
          remainingSize: this.requestCache.size
        });
      }
    }, 60000);
  }

  private validateDataBeforeSend(data: unknown, method: string, endpoint: string): void {
    if (data === undefined || data === null) {
      return;
    }

    try {
      JSON.stringify(data);
    } catch (error) {
      throw errorHandler.create(
        'Data contains circular references or is not serializable',
        'INVALID_DATA',
        { method, endpoint }
      );
    }

    if (typeof data === 'object' && Object.keys(data as object).length === 0) {
      this.logger.warn('Sending empty object as data', { method, endpoint });
    }
  }
}

// Создание и экспорт синглтона
export const apiClient: ApiClient = new ApiClientImpl();
