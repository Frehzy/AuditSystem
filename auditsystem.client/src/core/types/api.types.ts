/**
 * Типы для API модуля
 */

import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
}

export interface ApiError extends Error {
  config: AxiosRequestConfig;
  code?: string;
  status?: number;
  response?: AxiosResponse;
  isAxiosError: boolean;
}

export interface HttpError {
  status: number;
  message: string;
  code?: string;
  config?: AxiosRequestConfig;
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
    status: number;
    statusText: string;
    headers?: Record<string, string>;
    config?: AxiosRequestConfig;
  };
  isAxiosError?: boolean;
}

export interface ApiRequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean;
  retry?: boolean;
  timeout?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
