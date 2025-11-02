// src/core/types/services.ts
// Unified types for all services

// Cache Types
export interface CacheOptions {
  useCache?: boolean;
  forceRefresh?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
}

// Extended API Request Options
export interface ApiRequestOptions extends CacheOptions {
  requireAuth?: boolean;
  skipErrorHandler?: boolean;
  retryOnNetworkError?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

// Extended HttpResponse
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  responseTime?: number;
}

// Backend Result Types
export interface BackendResult<T = unknown> {
  succeeded: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// Token Validation Types
export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload: TokenPayload | null;
  errors: string[];
  timestamp?: number; // Добавлено для совместимости
}

// Error Details Types - ИСПРАВЛЕННЫЙ ИНТЕРФЕЙС
export interface ErrorDetails {
  message: string; // Обязательное поле
  code?: string;
  status?: number;
  context?: string;
  stack?: string;
  filename?: string;
  lineNumber?: number;
  columnNumber?: number;
  url?: string;
  method?: string;
  backendErrors?: string[];
  backendMessage?: string;
  originalError?: unknown;
  timestamp?: number;
}

// Log Types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context: string;
}

// API Types
export interface ApiClient {
  get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  put<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  patch<T>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T>;
  setBaseUrl(baseUrl: string): void;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  getBaseUrl(): string;
}

export interface ApiHelper {
  makeRequest<T>(request: () => Promise<T>, context: RequestContext): Promise<ApiResult<T>>;
  checkServerHealth(timeout?: number): Promise<boolean>;
  getBaseURL(): string;
  createRequestContext(url: string, method: string, config?: ApiRequestConfig): RequestContext;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
}

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

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

// Error Handling Types
export interface AppError extends Error {
  code: string;
  details?: unknown;
  status?: number;
  timestamp: number;
  context?: string;
}

export interface ErrorHandler {
  handle(error: unknown, context?: string): AppError;
  create(message: string, code?: string, details?: unknown, status?: number): AppError;
  wrap(error: unknown, message: string, code?: string): AppError;
  isNetworkError(error: unknown): boolean;
  isAuthError(error: unknown): boolean;
  isServerError(error: unknown): boolean;
  isClientError(error: unknown): boolean;
  isValidationError(error: unknown): boolean;
  getUserMessage(error: unknown): string;
}

// Form Types
export interface ValidationRule {
  test: (value: unknown, formData?: Record<string, unknown>) => boolean;
  message: string;
  key?: string;
}

export interface FieldValidation {
  isValid: boolean;
  errors: string[];
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
}

export interface FormValidationRules {
  required: (message?: string) => ValidationRule;
  minLength: (min: number, message?: string) => ValidationRule;
  maxLength: (max: number, message?: string) => ValidationRule;
  email: (message?: string) => ValidationRule;
  pattern: (regex: RegExp, message: string) => ValidationRule;
  equals: (field: string, message: string) => ValidationRule;
  min: (min: number, message?: string) => ValidationRule;
  max: (max: number, message?: string) => ValidationRule;
  custom: (validator: (value: unknown, formData?: Record<string, unknown>) => boolean, message: string) => ValidationRule;
}

export interface FormService {
  validateField(value: unknown, rules: ValidationRule[], formData?: Record<string, unknown>): FieldValidation;
  validateForm(data: Record<string, unknown>, rules: Record<string, ValidationRule[]>, touchedFields?: string[]): FormValidation;
  createRule(test: (value: unknown, formData?: Record<string, unknown>) => boolean, message: string): ValidationRule;
  readonly rules: FormValidationRules;
}

// Navigation Types
export interface NavigationTarget {
  path: string;
  query?: Record<string, string>;
  hash?: string;
  replace?: boolean;
  state?: unknown;
}

export interface NavigationGuard {
  (to: NavigationTarget, from?: NavigationTarget): boolean | string | Promise<boolean | string>;
}

export interface NavigationResult {
  success: boolean;
  redirected?: boolean;
  error?: string;
}

export interface NavigationService {
  navigate(target: NavigationTarget): Promise<NavigationResult>;
  back(): void;
  forward(): void;
  replace(path: string, query?: Record<string, string>, state?: unknown): Promise<NavigationResult>;
  addGuard(guard: NavigationGuard): () => void;
  removeGuard(guard: NavigationGuard): void;
  getCurrentPath(): string;
  getCurrentQuery(): Record<string, string>;
  getCurrentState(): unknown;
  canGoBack(): boolean;
  canGoForward(): boolean;
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title?: string;
  dismissible?: boolean;
  duration?: number;
  pauseOnHover?: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  dismissible: boolean;
  duration?: number;
  createdAt: number;
  pauseOnHover: boolean;
}

export interface NotificationService {
  show(type: NotificationType, message: string, options?: NotificationOptions): string;
  success(message: string, options?: NotificationOptions): string;
  error(message: string, options?: NotificationOptions): string;
  warning(message: string, options?: NotificationOptions): string;
  info(message: string, options?: NotificationOptions): string;
  dismiss(id: string): void;
  dismissByType(type: NotificationType): void;
  clearAll(): void;
  subscribe(listener: (notifications: Notification[]) => void): () => void;
  getNotifications(): Notification[];
  getStats(): { active: number; queued: number; types: Record<string, number> };
}

// Theme Types
export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeService {
  getCurrentTheme(): Theme;
  getResolvedTheme(): 'light' | 'dark';
  setTheme(theme: Theme): void;
  toggleTheme(): Theme;
  initialize(): void;
  subscribe(listener: (theme: Theme) => void): () => void;
  isDark(): boolean;
  isLight(): boolean;
  destroy(): void;
}

// State Management Types
export interface StateUpdate<T> {
  key: string;
  prevValue: T;
  nextValue: T;
  timestamp: number;
}

export interface StateManager {
  set<T>(key: string, value: T, options?: { ttl?: number; source?: string }): void;
  get<T>(key: string): T | null;
  watch<T>(key: string, callback: (update: StateUpdate<T>) => void, options?: { immediate?: boolean }): () => void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
  size(): number;
  destroy(): void;
}

// Storage Types
export type StorageType = 'local' | 'session';

export interface StorageOptions {
  type?: StorageType;
  ttl?: number;
  encrypt?: boolean;
}

export interface StorageItem<T = unknown> {
  value: T;
  expiresAt?: number;
  createdAt: number;
  version?: string;
}

export interface StorageService {
  set<T>(key: string, value: T, options?: StorageOptions): boolean;
  get<T>(key: string, type?: StorageType): T | null;
  remove(key: string, type?: StorageType): boolean;
  clear(type?: StorageType): boolean;
  keys(type?: StorageType): string[];
  has(key: string, type?: StorageType): boolean;
  getSize(type?: StorageType): number;
  subscribe(key: string, callback: (newValue: unknown, oldValue: unknown) => void): () => void;
  cleanupExpired(): string[];

  // Auth-specific methods
  setToken(token: string): void;
  getToken(): string | null;
  setUser(user: UserDto): void;
  getUser(): UserDto | null;
  clearAuth(): void;

  // Theme methods
  setTheme(theme: Theme): void;
  getTheme(): Theme | null;
}

// Token Types
export interface TokenPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  username?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface TokenService {
  parseToken(token: string): TokenPayload | null;
  isTokenExpired(token: string): boolean;
  getTokenExpiration(token: string): number | null;
  isValidFormat(token: string): boolean;
  getTokenRemainingTime(token: string): number;
  shouldRefreshToken(token: string, refreshThreshold?: number): boolean;
  getTokenPayload<T = TokenPayload>(token: string): T | null;
  validateToken(token: string): TokenValidationResult;
}

// HTTP Types
export interface HttpRequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

export interface HttpService {
  get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  request<T>(method: string, url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
}

// User DTO
export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  isActive?: boolean;
}
