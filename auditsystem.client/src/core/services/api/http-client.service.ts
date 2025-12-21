/**
 * Единый HTTP клиент для всего приложения
 */

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { APP_CONFIG } from '@/core/config/app.config';
import { logger } from '@/core/services/logger/logger.service';
import type { ApiRequestConfig } from '@/core/types/api.types';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loggingInterceptor } from './interceptors/logging.interceptor';

export class HttpClientService {
  private instance: AxiosInstance;
  private readonly logger = logger.create('HttpClient');

  constructor() {
    this.instance = axios.create({
      baseURL: APP_CONFIG.API.BASE_URL,
      timeout: APP_CONFIG.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });

    this.setupInterceptors();
    this.logger.info('HTTP client initialized', { baseURL: APP_CONFIG.API.BASE_URL });
  }

  private setupInterceptors(): void {
    // Request interceptors
    this.instance.interceptors.request.use(
      (config) => authInterceptor.onRequest(config),
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.request.use(
      (config) => loggingInterceptor.onRequest(config),
      (error) => Promise.reject(error)
    );

    // Response interceptors
    this.instance.interceptors.response.use(
      (response) => loggingInterceptor.onResponse(response),
      (error) => errorInterceptor.onError(error)
    );

    this.instance.interceptors.response.use(
      (response) => authInterceptor.onResponse(response),
      (error) => authInterceptor.onError(error)
    );
  }

  // Основные методы HTTP
  async get<T = any>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  async head(url: string, config?: ApiRequestConfig): Promise<AxiosResponse> {
    return this.instance.head(url, config);
  }

  // Вспомогательные методы
  setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
    this.logger.info('Base URL updated', { baseURL });
  }

  setToken(token: string): void {
    this.instance.defaults.headers.Authorization = `Bearer ${token}`;
    this.logger.debug('Auth token set');
  }

  clearToken(): void {
    delete this.instance.defaults.headers.Authorization;
    this.logger.debug('Auth token cleared');
  }

  setTimeout(timeout: number): void {
    this.instance.defaults.timeout = timeout;
    this.logger.debug('Request timeout updated', { timeout });
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }
}

// Экспортируем синглтон
export const httpClient = new HttpClientService();
