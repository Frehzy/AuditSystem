// src/core/services/api/http.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import type {
  HttpService,
  HttpRequestConfig,
  HttpResponse
} from '@/core/types';

/**
 * Production-ready HTTP service with enhanced error handling, retry logic, and caching
 */
class HttpServiceImpl implements HttpService {
  private readonly logger = logger.create('HttpService');
  private readonly DEFAULT_TIMEOUT = 30000;
  private readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000;

  // Request cache
  private readonly requestCache = new Map<string, {
    response: HttpResponse;
    timestamp: number;
    ttl: number;
    expiresAt: number;
  }>();

  // Pending requests for cancellation
  private readonly pendingRequests = new Map<string, AbortController>();
  private readonly MAX_CACHE_SIZE = 50;

  constructor() {
    this.logger.debug('HttpService initialized', {
      defaultTimeout: this.DEFAULT_TIMEOUT,
      defaultRetryAttempts: this.DEFAULT_RETRY_ATTEMPTS,
      maxCacheSize: this.MAX_CACHE_SIZE
    });

    this.startCacheCleanup();
  }

  async get<T>(url: string, config: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: unknown, config: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: unknown, config: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T>(url: string, config: HttpRequestConfig = {}): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config: HttpRequestConfig = {}
  ): Promise<HttpResponse<T>> {
    const requestKey = this.getRequestKey(method, url, data);
    const cacheKey = this.getCacheKey(method, url, data);

    // Check cache for GET requests
    const configWithCache = config as any;
    if (method === 'GET' && configWithCache.useCache) {
      const cached = this.getCachedResponse<T>(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached HTTP response', {
          url,
          method,
          cacheKey: cacheKey.substring(0, 32) + '...'
        });
        return cached;
      }
    }

    const controller = new AbortController();
    this.pendingRequests.set(requestKey, controller);

    try {
      const response = await this.executeRequestWithRetry<T>(
        method,
        url,
        data,
        { ...config, signal: controller.signal },
        requestKey
      );

      // Cache successful GET responses
      if (method === 'GET' && configWithCache.useCache && response.status >= 200 && response.status < 300) {
        const ttl = configWithCache.cacheTtl || 60000;
        this.cacheResponse(cacheKey, response, ttl);
      }

      return response;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  clearCache(): void {
    const previousSize = this.requestCache.size;
    this.requestCache.clear();
    this.logger.debug('HTTP cache cleared', {
      previousSize,
      currentSize: this.requestCache.size
    });
  }

  cancelAllPendingRequests(): void {
    let cancelledCount = 0;
    for (const [key, controller] of this.pendingRequests.entries()) {
      controller.abort();
      this.pendingRequests.delete(key);
      cancelledCount++;
    }

    if (cancelledCount > 0) {
      this.logger.debug('Cancelled all pending HTTP requests', {
        cancelledCount
      });
    }
  }

  getStats(): {
    pendingRequests: number;
    cacheSize: number;
    cacheKeys: string[];
  } {
    return {
      pendingRequests: this.pendingRequests.size,
      cacheSize: this.requestCache.size,
      cacheKeys: Array.from(this.requestCache.keys()).map(key => key.substring(0, 50) + '...')
    };
  }

  private async executeRequestWithRetry<T>(
    method: string,
    url: string,
    data: unknown,
    config: HttpRequestConfig,
    requestKey: string,
    attempt: number = 1
  ): Promise<HttpResponse<T>> {
    const maxAttempts = config.retryAttempts ?? this.DEFAULT_RETRY_ATTEMPTS;
    const timeout = config.timeout ?? this.DEFAULT_TIMEOUT;

    try {
      return await this.executeSingleRequest<T>(method, url, data, config, timeout);
    } catch (error) {
      const isRetryable = this.isRetryableError(error) && attempt < maxAttempts;
      const isAborted = error instanceof DOMException && error.name === 'AbortError';

      if (isAborted) {
        throw errorHandler.create('Request was aborted', 'REQUEST_ABORTED', {
          method,
          url,
          attempt
        });
      }

      if (!isRetryable) {
        throw error;
      }

      const retryDelay = config.retryDelay ?? this.DEFAULT_RETRY_DELAY;
      const nextAttempt = attempt + 1;

      this.logger.warn(`Retrying HTTP request (attempt ${nextAttempt}/${maxAttempts})`, {
        method,
        url,
        attempt: nextAttempt,
        maxAttempts,
        retryDelay,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.delay(retryDelay * attempt);

      return this.executeRequestWithRetry<T>(method, url, data, config, requestKey, nextAttempt);
    }
  }

  private async executeSingleRequest<T>(
    method: string,
    url: string,
    data: unknown,
    config: HttpRequestConfig,
    timeout: number
  ): Promise<HttpResponse<T>> {
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    if (config.signal) {
      config.signal.addEventListener('abort', () => controller.abort());
    }

    const headers = this.buildHeaders(config.headers);

    const requestInit: RequestInit = {
      method: method.toUpperCase(),
      headers,
      signal: controller.signal,
      credentials: 'include'
    };

    if (data !== undefined && method !== 'GET' && method !== 'HEAD') {
      requestInit.body = this.prepareRequestBody(data, headers);
    }

    try {
      this.logger.debug('Executing HTTP request', {
        method,
        url,
        hasData: data !== undefined,
        timeout,
        headers: Object.keys(headers)
      });

      const response = await fetch(url, requestInit);
      const responseTime = Math.round(performance.now() - startTime);

      clearTimeout(timeoutId);

      const responseHeaders = this.extractResponseHeaders(response);
      const responseData = await this.parseResponse<T>(response);

      const httpResponse: HttpResponse<T> = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        responseTime
      };

      if (!response.ok) {
        throw this.createHttpError(response, httpResponse, method, url);
      }

      this.logger.debug('HTTP request successful', {
        method,
        url,
        status: response.status,
        responseTime: `${responseTime}ms`
      });

      return httpResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private buildHeaders(customHeaders?: Record<string, string>): Headers {
    const headers = new Headers();

    // Default headers
    headers.set('Accept', 'application/json');
    headers.set('Content-Type', 'application/json');

    // Add custom headers
    if (customHeaders) {
      Object.entries(customHeaders).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          headers.set(key, String(value));
        }
      });
    }

    return headers;
  }

  private prepareRequestBody(data: unknown, headers: Headers): BodyInit {
    const contentType = headers.get('Content-Type');

    if (data instanceof FormData) {
      headers.set('Content-Type', 'multipart/form-data');
      return data;
    }

    if (data instanceof URLSearchParams) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
      return data;
    }

    if (typeof data === 'string') {
      headers.set('Content-Type', 'text/plain');
      return data;
    }

    if (data instanceof Blob) {
      if (!contentType && data.type) {
        headers.set('Content-Type', data.type);
      }
      return data;
    }

    // Default to JSON
    try {
      return JSON.stringify(data);
    } catch (error) {
      throw errorHandler.create(
        'Failed to stringify request data',
        'INVALID_REQUEST_DATA',
        { data, error }
      );
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') || '';

    if (response.status === 204 || response.status === 205) {
      return undefined as T;
    }

    if (contentType.includes('application/json')) {
      try {
        return await response.json() as T;
      } catch (error) {
        throw errorHandler.create(
          'Failed to parse JSON response',
          'INVALID_JSON_RESPONSE',
          { status: response.status, contentType }
        );
      }
    }

    if (contentType.includes('text/')) {
      return await response.text() as T;
    }

    if (contentType.startsWith('image/') || contentType.startsWith('audio/') || contentType.startsWith('video/')) {
      return await response.blob() as T;
    }

    // Fallback to text for unknown content types
    return await response.text() as T;
  }

  private extractResponseHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  private createHttpError(
    response: Response,
    httpResponse: HttpResponse,
    method: string,
    url: string
  ): Error {
    const errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).response = httpResponse;
    (error as any).url = url;
    (error as any).method = method;
    (error as any).code = this.getHttpErrorCode(response.status);

    return error;
  }

  private getHttpErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT'
    };

    return errorCodes[status] || 'HTTP_ERROR';
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return true; // Network error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return false; // Timeout or manual abort - don't retry
    }

    if (error instanceof Error && 'status' in error) {
      const status = (error as any).status;
      // Retry on server errors and 429 (rate limiting)
      return status >= 500 || status === 429;
    }

    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRequestKey(method: string, url: string, data: unknown): string {
    const dataString = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${dataString}`;
  }

  private getCacheKey(method: string, url: string, data: unknown): string {
    const dataString = data ? JSON.stringify(data) : '';
    return `http:${method}:${url}:${dataString}`;
  }

  private getCachedResponse<T>(cacheKey: string): HttpResponse<T> | null {
    const cached = this.requestCache.get(cacheKey);

    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now > cached.expiresAt) {
      this.requestCache.delete(cacheKey);
      return null;
    }

    return cached.response as HttpResponse<T>;
  }

  private cacheResponse(cacheKey: string, response: HttpResponse, ttl: number): void {
    if (this.requestCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.requestCache.keys().next().value;
      if (firstKey) {
        this.requestCache.delete(firstKey);
      }
    }

    this.requestCache.set(cacheKey, {
      response,
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
        if (now > value.expiresAt) {
          this.requestCache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        this.logger.debug('HTTP cache cleanup completed', {
          cleanedCount,
          remainingSize: this.requestCache.size
        });
      }
    }, 30000); // Cleanup every 30 seconds
  }
}

// Создание и экспорт синглтона
export const httpService: HttpService = new HttpServiceImpl();
