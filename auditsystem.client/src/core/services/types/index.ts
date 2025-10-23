// Объединяем все типы сервисов в одном месте для лучшего управления

// API Types
export interface ApiRequestOptions {
  requireAuth?: boolean;
  skipErrorHandler?: boolean;
  retryOnNetworkError?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

export type ApiResponse<T = any> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; errors?: string[]; statusCode?: number };

export interface ApiClient {
  get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T>;
  post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T>;
  put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T>;
  patch<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T>;
  delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T>;
  setBaseUrl(baseUrl: string): void;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  getBaseUrl(): string;
}

// Error Handling Types
export interface AppError extends Error {
  code: string;
  details?: any;
  status?: number;
  timestamp: number;
  context?: string;
}

export interface ErrorHandler {
  handle(error: unknown, context?: string): AppError;
  create(message: string, code?: string, details?: any, status?: number): AppError;
  isNetworkError(error: unknown): boolean;
  isAuthError(error: unknown): boolean;
  isServerError(error: unknown): boolean;
  isClientError(error: unknown): boolean;
  getUserMessage(error: unknown): string;
  wrap(error: unknown, message: string, code?: string): AppError;
}

// Form Types
export interface ValidationRule {
  test: (value: any, formData?: Record<string, any>) => boolean;
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
  custom: (validator: (value: any, formData?: Record<string, any>) => boolean, message: string) => ValidationRule;
}

export interface FormService {
  validateField(value: any, rules: ValidationRule[], formData?: Record<string, any>): FieldValidation;
  validateForm(data: Record<string, any>, rules: Record<string, ValidationRule[]>, touchedFields?: string[]): FormValidation;
  createRule(test: (value: any, formData?: Record<string, any>) => boolean, message: string): ValidationRule;
  readonly rules: FormValidationRules;
}

// Navigation Types
export interface NavigationTarget {
  path: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
  hash?: string;
  replace?: boolean;
  state?: any;
}

export interface NavigationGuard {
  (to: NavigationTarget, from?: NavigationTarget): boolean | string | Promise<boolean | string>;
}

export interface NavigationResult {
  success: boolean;
  redirected?: boolean;
  error?: string;
  from?: NavigationTarget;
  to?: NavigationTarget;
}

export interface NavigationService {
  navigate(target: NavigationTarget): Promise<NavigationResult>;
  back(): void;
  forward(): void;
  replace(path: string, query?: Record<string, string>, state?: any): Promise<NavigationResult>;
  addGuard(guard: NavigationGuard): () => void;
  removeGuard(guard: NavigationGuard): void;
  getCurrentPath(): string;
  getCurrentQuery(): Record<string, string>;
  getCurrentState(): any;
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
  clearAll(): void;
  subscribe(listener: (notifications: Notification[]) => void): () => void;
  getNotifications(): Notification[];
}

// Theme Types
export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeService {
  getCurrentTheme(): Theme;
  getResolvedTheme(): 'light' | 'dark';
  setTheme(theme: Theme): void;
  toggleTheme(): void;
  initialize(): void;
  subscribe(listener: (theme: Theme) => void): () => void;
  isDark(): boolean;
  isLight(): boolean;
  setupSystemPreferenceListener(): () => void;
}

// State Management Types
export interface StateUpdate<T> {
  key: string;
  prevValue: T;
  nextValue: T;
  timestamp: number;
}

export interface StateManager {
  set<T>(key: string, value: T): void;
  get<T>(key: string): T | null;
  watch<T>(key: string, callback: (update: StateUpdate<T>) => void): () => void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
}

// Storage Types
export interface StorageInfo {
  totalKeys: number;
  totalSize: number;
  authDataSize: number;
  appStateSize: number;
}

export interface StorageService {
  setToken(token: string): void;
  getToken(): string | null;
  setUser(user: UserDto): void;
  getUser(): UserDto | null;
  clearAuthData(): void;
  isValidToken(): boolean;
  setAppState<T>(key: string, value: T): void;
  getAppState<T>(key?: string): T | null;
  clearAppState(): void;
  clearAll(): void;
  getStorageInfo(): StorageInfo;
}

export type StorageType = 'local' | 'session';

export interface StorageOptions {
  type?: StorageType;
  ttl?: number;
  encrypt?: boolean;
}

export interface StorageItem<T = any> {
  value: T;
  expiresAt?: number;
  createdAt: number;
  version?: string;
}

// Token Types
export interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  username: string;
  email: string;
  role: string;
  [key: string]: any;
}

export interface TokenService {
  parseToken(token: string): TokenPayload | null;
  isTokenExpired(token: string): boolean;
  getTokenExpiration(token: string): number | null;
  isValidFormat(token: string): boolean;
  getTokenRemainingTime(token: string): number;
  shouldRefreshToken(token: string, refreshThreshold?: number): boolean;
  getTokenPayload<T = TokenPayload>(token: string): T | null;
}

// HTTP Types
export interface HttpRequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  body?: any;
  signal?: AbortSignal;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpService {
  get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  request<T>(method: string, url: string, data?: any, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
}

// User DTO (из auth.types)
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
