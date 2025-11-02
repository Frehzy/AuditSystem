// Unified types for all services

// Log Types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'auth' | 'network' | 'api' | 'router' | 'storage' | 'notification' | 'analytics' | 'http';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context: string;
}

// API Types
export interface ApiRequestOptions {
  requireAuth?: boolean;
  skipErrorHandler?: boolean;
  retryOnNetworkError?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  useCache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  forceRefresh?: boolean;
}

export interface ApiRequestConfig {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  requireAuth?: boolean;
  skipErrorHandler?: boolean;
  headers?: Record<string, string>;
  useCache?: boolean;
  cacheTtl?: number;
}

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
  checkHealth(): Promise<{
    isHealthy: boolean;
    responseTime: number;
    details?: string;
    endpoint?: string;
  }>;
  clearCache(pattern?: RegExp): void;
  getCacheStats(): {
    size: number;
    keys: string[];
    totalSize: number;
    hitRate?: number;
  };
}

export interface ApiHelper {
  makeRequest<T>(request: () => Promise<T>, context: RequestContext): Promise<ApiResult<T>>;
  checkServerHealth(timeout?: number): Promise<boolean>;
  getBaseURL(): string;
  createRequestContext(url: string, method: string, config?: ApiRequestConfig): RequestContext;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  getRequestHistory(): RequestContext[];
  clearRequestHistory(): void;
  getRequestStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
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
  wrapped?: boolean;
  originalMessage?: string;
  originalStack?: string;
  stack?: string;
}

export interface ErrorDetails {
  message: string;
  timestamp: number;
  context?: string;
  code?: string;
  status?: number;
  originalError?: unknown;
  backendErrors?: string[] | Record<string, unknown>;
  backendMessage?: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  isUnhandledRejection?: boolean;
  isUncaughtError?: boolean;
  promise?: unknown;
  responseData?: unknown;
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
  initializeGlobalHandlers(): void;
  cleanupGlobalHandlers(): void;
  getErrorStats(): {
    totalHandled: number;
    categories: Record<string, number>;
    recentErrors: AppError[];
  };
}

// Form Types
export interface ValidationRule {
  test: (value: unknown, formData?: Record<string, unknown>) => boolean | Promise<boolean>;
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
  phone: (message?: string) => ValidationRule;
  url: (message?: string) => ValidationRule;
  strongPassword: (message?: string) => ValidationRule;
  dateAfter: (date: Date, message?: string) => ValidationRule;
  dateBefore: (date: Date, message?: string) => ValidationRule;
  oneOf: (allowedValues: unknown[], message?: string) => ValidationRule;
  range: (min: number, max: number, message?: string) => ValidationRule;
}

export interface FormService {
  validateField(value: unknown, rules: ValidationRule[], formData?: Record<string, unknown>): FieldValidation;
  validateForm(data: Record<string, unknown>, rules: Record<string, ValidationRule[]>, touchedFields?: string[]): FormValidation;
  validateFieldAsync(value: unknown, rules: ValidationRule[], formData?: Record<string, unknown>): Promise<FieldValidation>;
  validateArray(values: unknown[], rules: ValidationRule[], formData?: Record<string, unknown>): { isValid: boolean; errors: string[][]; };
  validateNested(data: Record<string, unknown>, rules: Record<string, ValidationRule[]>, formData?: Record<string, unknown>): FormValidation;
  cleanFormData<T extends Record<string, unknown>>(data: T): Partial<T>;
  getFormChanges<T extends Record<string, unknown>>(original: T, current: T): Partial<T>;
  createRule(test: (value: unknown, formData?: Record<string, unknown>) => boolean, message: string): ValidationRule;
  createValidationSet(...rules: ValidationRule[]): ValidationRule[];
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

export interface NavigationHistoryItem {
  target: NavigationTarget;
  timestamp: number;
  scrollPosition: number;
  title?: string;
  data?: unknown;
}

export interface NavigationConfig {
  enableHistory: boolean;
  maxHistoryLength: number;
  scrollRestoration: boolean;
  enableAnalytics: boolean;
  defaultRoute: string;
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
  getHistory(): NavigationHistoryItem[];
  clearHistory(): void;
  setRouter(router: any): void;
  updateConfig(newConfig: Partial<NavigationConfig>): void;
}

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationOptions {
  title?: string;
  dismissible?: boolean;
  duration?: number;
  pauseOnHover?: boolean;
  action?: NotificationAction;
  priority?: 'low' | 'normal' | 'high';
  group?: string;
  icon?: string;
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
  priority?: 'low' | 'normal' | 'high';
  group?: string;
  icon?: string;
  action?: NotificationAction;
  read?: boolean;
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
  getHistory(): Notification[];
  clearHistory(): void;
  pauseAutoDismiss(id: string): void;
  resumeAutoDismiss(id: string): void;
  markAsRead(id: string): void;
  markAllAsRead(): void;
  getConfig(): { maxVisible: number; maxHistory: number; defaultDuration: number };
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
  getThemeInfo(): {
    current: Theme;
    resolved: 'light' | 'dark';
    system: 'light' | 'dark';
    isAuto: boolean;
  };
}

// State Management Types
export interface StateUpdate<T> {
  key: string;
  prevValue: T;
  nextValue: T;
  timestamp: number;
  source?: string;
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
  getHistory(): StateUpdate<unknown>[];
  getStats(): {
    totalKeys: number;
    totalSubscribers: number;
    historySize: number;
    activeTimers: number;
  };
  serialize(): Record<string, unknown>;
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
  clearAuthData(): void;

  // Theme methods
  setTheme(theme: Theme): void;
  getTheme(): Theme | null;

  getStorageStats(): {
    local: { items: number; size: number };
    session: { items: number; size: number };
    subscribers: number;
  };
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

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload: TokenPayload | null;
  errors: string[];
  timestamp: number;
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
  getTokenInfo(token: string): {
    isValid: boolean;
    isExpired: boolean;
    issuedAt?: string;
    expiresAt?: string;
    subject?: string;
    remainingTime: number;
  };
}

// HTTP Types
export interface HttpRequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  signal?: AbortSignal;
  useCache?: boolean;
  cacheTtl?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  responseTime?: number;
}

export interface HttpService {
  get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  request<T>(method: string, url: string, data?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  clearCache(): void;
  cancelAllPendingRequests(): void;
  getStats(): {
    pendingRequests: number;
    cacheSize: number;
    cacheKeys: string[];
  };
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

// Backend Result
export interface BackendResult<T> {
  succeeded: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
