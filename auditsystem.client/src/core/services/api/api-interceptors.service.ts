// src/core/services/api/api-interceptors.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import type { ApiRequestOptions } from '@/core/types';

/**
 * Service for managing API request/response interceptors
 */
class ApiInterceptorsService {
  private readonly logger = logger.create('ApiInterceptors');
  private requestInterceptors: Array<(url: string, options: ApiRequestOptions) => void> = [];
  private responseInterceptors: Array<(response: unknown, url: string, options: ApiRequestOptions) => void> = [];
  private errorInterceptors: Array<(error: Error, url: string, options: ApiRequestOptions) => void> = [];

  constructor() {
    this.logger.debug('ApiInterceptorsService initialized');
  }

  addRequestInterceptor(interceptor: (url: string, options: ApiRequestOptions) => void): () => void {
    this.requestInterceptors.push(interceptor);

    this.logger.debug('Request interceptor added', {
      totalInterceptors: this.requestInterceptors.length
    });

    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
        this.logger.debug('Request interceptor removed');
      }
    };
  }

  addResponseInterceptor(interceptor: (response: unknown, url: string, options: ApiRequestOptions) => void): () => void {
    this.responseInterceptors.push(interceptor);

    this.logger.debug('Response interceptor added', {
      totalInterceptors: this.responseInterceptors.length
    });

    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
        this.logger.debug('Response interceptor removed');
      }
    };
  }

  addErrorInterceptor(interceptor: (error: Error, url: string, options: ApiRequestOptions) => void): () => void {
    this.errorInterceptors.push(interceptor);

    this.logger.debug('Error interceptor added', {
      totalInterceptors: this.errorInterceptors.length
    });

    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
        this.logger.debug('Error interceptor removed');
      }
    };
  }

  executeRequestInterceptors(url: string, options: ApiRequestOptions): void {
    if (this.requestInterceptors.length === 0) {
      return;
    }

    this.logger.debug('Executing request interceptors', {
      url,
      interceptorsCount: this.requestInterceptors.length
    });

    for (const interceptor of this.requestInterceptors) {
      try {
        interceptor(url, options);
      } catch (error) {
        this.logger.error('Request interceptor failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          url
        });
      }
    }
  }

  executeResponseInterceptors(response: unknown, url: string, options: ApiRequestOptions): void {
    if (this.responseInterceptors.length === 0) {
      return;
    }

    this.logger.debug('Executing response interceptors', {
      url,
      interceptorsCount: this.responseInterceptors.length
    });

    for (const interceptor of this.responseInterceptors) {
      try {
        interceptor(response, url, options);
      } catch (error) {
        this.logger.error('Response interceptor failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          url
        });
      }
    }
  }

  executeErrorInterceptors(error: Error, url: string, options: ApiRequestOptions): void {
    if (this.errorInterceptors.length === 0) {
      return;
    }

    this.logger.debug('Executing error interceptors', {
      url,
      error: error.message,
      interceptorsCount: this.errorInterceptors.length
    });

    for (const interceptor of this.errorInterceptors) {
      try {
        interceptor(error, url, options);
      } catch (interceptorError) {
        this.logger.error('Error interceptor failed', {
          originalError: error.message,
          interceptorError: interceptorError instanceof Error ? interceptorError.message : 'Unknown error',
          url
        });
      }
    }
  }

  clearAllInterceptors(): void {
    const requestCount = this.requestInterceptors.length;
    const responseCount = this.responseInterceptors.length;
    const errorCount = this.errorInterceptors.length;

    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];

    this.logger.debug('All interceptors cleared', {
      requestInterceptors: requestCount,
      responseInterceptors: responseCount,
      errorInterceptors: errorCount
    });
  }

  getInterceptorStats(): {
    request: number;
    response: number;
    error: number;
  } {
    return {
      request: this.requestInterceptors.length,
      response: this.responseInterceptors.length,
      error: this.errorInterceptors.length
    };
  }
}

// Export singleton instance
export const apiInterceptors = new ApiInterceptorsService();

// Export class for testing
export { ApiInterceptorsService };
