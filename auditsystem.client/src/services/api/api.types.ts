import type { AxiosResponse } from 'axios';
import type { ApiResponse, SuccessResponse, ErrorResponse } from '@/modules/auth/api/auth.types';

export type ApiAxiosResponse<T = any> = AxiosResponse<ApiResponse<T>>;
export type SuccessAxiosResponse<T> = AxiosResponse<SuccessResponse<T>>;
export type ErrorAxiosResponse = AxiosResponse<ErrorResponse>;

export interface ApiRequestConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  requireAuth?: boolean;
  skipErrorHandler?: boolean;
  headers?: Record<string, string>;
}

export interface RequestMetadata {
  url: string;
  method: string;
  timestamp: string;
  duration?: number;
  retryCount?: number;
}

export interface RequestContext {
  metadata: RequestMetadata;
  config: ApiRequestConfig;
}

export interface ApiErrorHandler {
  handleNetworkError: (error: unknown) => string;
  handleServerError: (status: number, data: any) => string;
  handleValidationError: (errors: string[]) => string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CacheConfig {
  enabled?: boolean;
  ttl?: number; // Time to live in milliseconds
  key?: string;
}

export interface ApiMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastRequestTime?: string;
}
