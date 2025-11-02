// src/core/services/api/api-helper.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import { httpService } from './http.service';
import { APP_CONFIG } from '@/core/config/app.config';
import type {
  ApiHelper,
  ApiRequestConfig,
  ApiResult,
  RequestContext
} from '@/core/types';

/**
 * Production-ready API helper service with enhanced error handling and monitoring
 */
class ApiHelperImpl implements ApiHelper {
  private readonly logger = logger.create('ApiHelper');
  private baseUrl: string = APP_CONFIG.API.BASE_URL;
  private authToken: string | null = null;
  private requestHistory: RequestContext[] = [];
  private readonly MAX_HISTORY_SIZE = 100;

  // Request statistics
  private requestStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0
  };

  constructor() {
    this.logger.debug('ApiHelper initialized', {
      baseUrl: this.baseUrl,
      maxHistorySize: this.MAX_HISTORY_SIZE
    });
  }

  async makeRequest<T>(
    request: () => Promise<T>,
    context: RequestContext
  ): Promise<ApiResult<T>> {
    const startTime = performance.now();
    this.requestStats.totalRequests++;

    try {
      this.logRequestStart(context);

      const data = await request();
      const responseTime = Math.round(performance.now() - startTime);

      this.requestStats.successfulRequests++;
      this.requestStats.totalResponseTime += responseTime;

      this.logRequestSuccess(context, responseTime);
      this.addToHistory({ ...context, metadata: { ...context.metadata, duration: responseTime } });

      return {
        success: true,
        data,
        status: 200
      };
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      this.requestStats.failedRequests++;

      const handledError = errorHandler.handle(error, `API:${context.metadata.method}:${context.metadata.url}`);
      this.logRequestError(context, handledError, responseTime);

      this.addToHistory({
        ...context,
        metadata: {
          ...context.metadata,
          duration: responseTime
        }
      });

      return {
        success: false,
        error: handledError.message,
        status: (handledError as any).status || 500
      };
    }
  }

  async checkServerHealth(timeout: number = 5000): Promise<boolean> {
    const healthEndpoints = [
      '/api/health',
      '/health',
      '/api/health/db',
      '/api/status'
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      for (const endpoint of healthEndpoints) {
        try {
          const response = await httpService.get(`${this.baseUrl}${endpoint}`, {
            timeout: Math.min(timeout, 3000),
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });

          if (response.status >= 200 && response.status < 300) {
            this.logger.debug('Server health check passed', {
              endpoint,
              status: response.status
            });
            clearTimeout(timeoutId);
            return true;
          }
        } catch (error) {
          this.logger.debug(`Health check failed for ${endpoint}`, {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          continue;
        }
      }

      try {
        const response = await httpService.get(`${this.baseUrl}/`, {
          timeout: Math.min(timeout, 3000),
          signal: controller.signal
        });

        const isHealthy = response.status >= 200 && response.status < 300;
        this.logger.debug('Base URL health check completed', {
          isHealthy,
          status: response.status
        });

        clearTimeout(timeoutId);
        return isHealthy;
      } catch (finalError) {
        this.logger.warn('All health checks failed', {
          error: finalError instanceof Error ? finalError.message : 'Unknown error',
          baseUrl: this.baseUrl
        });

        clearTimeout(timeoutId);
        return false;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      this.logger.error('Health check timeout or error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timeout
      });
      return false;
    }
  }

  getBaseURL(): string {
    return this.baseUrl;
  }

  createRequestContext(
    url: string,
    method: string,
    config: ApiRequestConfig = {}
  ): RequestContext {
    const metadata = {
      url,
      method: method.toUpperCase(),
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    // Create safe config with all properties
    const safeConfig: ApiRequestConfig = {
      timeout: config.timeout || APP_CONFIG.API.TIMEOUT,
      retryAttempts: config.retryAttempts || 0,
      retryDelay: config.retryDelay || 1000,
      requireAuth: config.requireAuth !== false,
      skipErrorHandler: config.skipErrorHandler || false,
      headers: config.headers || {}
    };

    return {
      metadata,
      config: safeConfig
    };
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
  }

  getRequestHistory(): RequestContext[] {
    return [...this.requestHistory];
  }

  clearRequestHistory(): void {
    const previousSize = this.requestHistory.length;
    this.requestHistory = [];
    this.logger.debug('Request history cleared', {
      previousSize,
      currentSize: this.requestHistory.length
    });
  }

  getRequestStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  } {
    const averageResponseTime = this.requestStats.totalRequests > 0
      ? Math.round(this.requestStats.totalResponseTime / this.requestStats.successfulRequests)
      : 0;

    return {
      totalRequests: this.requestStats.totalRequests,
      successfulRequests: this.requestStats.successfulRequests,
      failedRequests: this.requestStats.failedRequests,
      averageResponseTime
    };
  }

  private logRequestStart(context: RequestContext): void {
    this.logger.debug('Starting API request', {
      method: context.metadata.method,
      url: context.metadata.url,
      timestamp: context.metadata.timestamp,
      requireAuth: context.config.requireAuth,
      timeout: context.config.timeout
    });
  }

  private logRequestSuccess(context: RequestContext, responseTime: number): void {
    this.logger.debug('API request completed successfully', {
      method: context.metadata.method,
      url: context.metadata.url,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  }

  private logRequestError(context: RequestContext, error: Error, responseTime: number): void {
    const logData = {
      method: context.metadata.method,
      url: context.metadata.url,
      responseTime: `${responseTime}ms`,
      error: error.message,
      code: (error as any).code,
      status: (error as any).status,
      timestamp: new Date().toISOString()
    };

    if ((error as any).status >= 500) {
      this.logger.error('API request failed with server error', logData);
    } else if ((error as any).status >= 400) {
      this.logger.warn('API request failed with client error', logData);
    } else {
      this.logger.error('API request failed', logData);
    }
  }

  private addToHistory(context: RequestContext): void {
    this.requestHistory.unshift(context);

    if (this.requestHistory.length > this.MAX_HISTORY_SIZE) {
      this.requestHistory = this.requestHistory.slice(0, this.MAX_HISTORY_SIZE);
    }
  }
}

// Создание и экспорт синглтона
export const apiHelper: ApiHelper = new ApiHelperImpl();
