// src/core/services/core/api/http.service.ts
import { logger } from '@/core/utils/logger';
import type { HttpService, HttpRequestConfig, HttpResponse } from '@/core/types';

class HttpServiceImpl implements HttpService {
  private readonly logger = logger.create('HttpService');
  private readonly defaultConfig: HttpRequestConfig = {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  private readonly requestQueue = new Map<string, Promise<HttpResponse<unknown>>>();
  private activeRequests = 0;
  private readonly maxConcurrentRequests = 6;

  async get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, null, config);
  }

  async post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, null, config);
  }

  async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const requestKey = this.getRequestKey(method, url, data);

    // Request deduplication
    if (this.requestQueue.has(requestKey)) {
      this.logger.debug('Returning cached request', { method, url });
      return this.requestQueue.get(requestKey)! as Promise<HttpResponse<T>>;
    }

    // Concurrent requests limiting
    if (this.activeRequests >= this.maxConcurrentRequests) {
      await this.waitForSlot();
    }

    const mergedConfig = { ...this.defaultConfig, ...config };
    const requestPromise = this.executeRequest<T>(method, url, data, mergedConfig);

    this.requestQueue.set(requestKey, requestPromise as Promise<HttpResponse<unknown>>);
    this.activeRequests++;

    try {
      return await requestPromise;
    } finally {
      this.requestQueue.delete(requestKey);
      this.activeRequests--;
    }
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    data: unknown,
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), config.timeout);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= (config.retryAttempts || 0); attempt++) {
      try {
        const response = await this.makeRequest<T>(method, url, data, {
          ...config,
          signal: abortController.signal
        });

        clearTimeout(timeoutId);
        return response;

      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        if (attempt === (config.retryAttempts || 0) || !this.shouldRetry(error, method)) {
          break;
        }

        this.logger.debug(`Retrying request (attempt ${attempt + 1}/${config.retryAttempts})`, {
          url,
          method,
          error: (error as Error).message
        });

        await this.delay((config.retryDelay || 1000) * Math.pow(2, attempt));
      }
    }

    throw lastError || new Error('Request failed after all retry attempts');
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data: unknown,
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...config.headers,
    };

    const requestConfig: RequestInit = {
      method,
      headers,
      signal: config.signal,
      credentials: 'include',
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestConfig.body = JSON.stringify(data);
    }

    const startTime = performance.now();
    let response: Response;

    try {
      response = await fetch(url, requestConfig);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${config.timeout}ms`);
      }
      throw error;
    }

    const duration = Math.round(performance.now() - startTime);
    this.logRequest(method, url, response.status, duration);

    if (!response.ok) {
      const errorText = await response.text();
      throw this.createHttpError(response, errorText, method, url);
    }

    const responseData = await this.parseResponse(response);
    const responseHeaders = this.extractHeaders(response);

    return {
      data: responseData as T,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    };
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type');

    try {
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else if (contentType?.includes('text/')) {
        return await response.text();
      } else {
        return await response.blob();
      }
    } catch (parseError) {
      throw new Error(`Failed to parse response: ${parseError}`);
    }
  }

  private createHttpError(response: Response, errorText: string, method: string, url: string): Error {
    let errorMessage: string;

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = (errorData as { message?: string; error?: string }).message ||
        (errorData as { message?: string; error?: string }).error ||
        response.statusText;
    } catch {
      errorMessage = errorText || response.statusText;
    }

    const error = new Error(`HTTP ${response.status}: ${errorMessage}`);
    (error as { status?: number }).status = response.status;
    (error as { statusText?: string }).statusText = response.statusText;
    (error as { method?: string }).method = method;
    (error as { url?: string }).url = url;

    return error;
  }

  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  private shouldRetry(error: unknown, method: string): boolean {
    if (!(error instanceof Error)) return false;

    // Don't retry non-idempotent methods except POST
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
      return false;
    }

    // Retry on network errors
    if (error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('timeout')) {
      return true;
    }

    // Retry on 5xx server errors and 429
    const status = (error as { status?: number }).status;
    if (status && (status >= 500 || status === 429)) {
      return true;
    }

    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async waitForSlot(): Promise<void> {
    while (this.activeRequests >= this.maxConcurrentRequests) {
      await this.delay(100);
    }
  }

  private getRequestKey(method: string, url: string, data: unknown): string {
    const dataString = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${dataString}`;
  }

  private logRequest(method: string, url: string, status: number, duration: number): void {
    const logLevel = status >= 400 ? 'warn' : 'debug';
    const message = `HTTP ${method} ${url} - ${status} (${duration}ms)`;

    this.logger[logLevel](message, {
      method,
      url,
      status,
      duration: `${duration}ms`
    });
  }

  // Public methods for request management
  cancelRequest(method: string, url: string, data?: unknown): void {
    const requestKey = this.getRequestKey(method, url, data);
    this.requestQueue.delete(requestKey);
  }

  cancelAllRequests(): void {
    this.requestQueue.clear();
  }

  getActiveRequestsCount(): number {
    return this.activeRequests;
  }

  getQueuedRequestsCount(): number {
    return this.requestQueue.size;
  }
}

export const httpService: HttpService = new HttpServiceImpl();
