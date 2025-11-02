// src/core/utils/types.ts

/**
 * Общие типы для утилит
 */

export type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type CaseType = 'camel' | 'kebab' | 'snake' | 'pascal' | 'title' | 'sentence';

// Расширенные типы для валидации
export interface ValidationConfig {
  fieldName?: string;
  abortEarly?: boolean;
  customMessages?: Record<string, string>;
  stopOnFirstError?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  debounceTime?: number;
  locale?: string;
  required?: boolean;
}

export interface ValidationRule {
  test: (value: unknown, context?: Record<string, unknown>) => boolean;
  message: string;
  key?: string;
  severity?: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  fieldName?: string;
  timestamp?: Date;
  value?: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: string;
  sessionId?: string;
  userId?: string;
  stack?: string;
}

export interface DateFormatOptions {
  day?: '2-digit' | 'numeric';
  month?: '2-digit' | 'numeric' | 'long' | 'short' | 'narrow';
  year?: '2-digit' | 'numeric';
  hour?: '2-digit' | 'numeric';
  minute?: '2-digit' | 'numeric';
  second?: '2-digit' | 'numeric';
  weekday?: 'long' | 'short' | 'narrow';
  timeZone?: string;
  hour12?: boolean;
  locale?: string;
}

export interface UrlParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number;
  strategy?: 'memory' | 'localStorage' | 'sessionStorage';
}

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

// Улучшенные типы для DOM утилит
export type ElementSelector<T extends HTMLElement = HTMLElement> = string | T | DocumentFragment;
export type AnimationOptions = KeyframeAnimationOptions & {
  onFinish?: () => void;
  onCancel?: () => void;
  onReady?: () => void;
};

export interface CreateElementOptions<T extends keyof HTMLElementTagNameMap> {
  attributes?: Record<string, string | number | boolean>;
  styles?: Partial<CSSStyleDeclaration>;
  classes?: string[];
  children?: (HTMLElement | Text | DocumentFragment | string)[];
  events?: Record<string, EventListenerOrEventListenerObject>;
  dataset?: Record<string, string | number | boolean>;
  innerHTML?: string;
  textContent?: string;
  shadowRoot?: boolean;
  namespace?: string;
}

// Типы для текстовых утилит
export interface TextAnalysisResult {
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
}

export interface TextGenerationOptions {
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  excludeSimilar?: boolean; // Exclude similar characters like 0/O, 1/l/I
  excludeAmbiguous?: boolean; // Exclude ambiguous characters
}

export interface TextCleanOptions {
  normalizeSpaces?: boolean;
  removeExtraSpaces?: boolean;
  trim?: boolean;
  removeLineBreaks?: boolean;
  removeDuplicateSpaces?: boolean;
  normalizeUnicode?: boolean;
}

// Расширенные типы для логгера
export type LogContext =
  | 'api'
  | 'auth'
  | 'storage'
  | 'router'
  | 'performance'
  | 'network'
  | 'ui'
  | 'business'
  | 'security'
  | 'analytics'
  | 'payment'
  | 'notification';

export interface RemoteLoggingConfig {
  enabled: boolean;
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
  headers?: Record<string, string>;
}

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  maxStorageEntries: number;
  showTimestamps: boolean;
  showEmojis: boolean;
  persistToStorage: boolean;
  sessionId: string;
  userId?: string;
  appVersion?: string;
  environment?: 'development' | 'staging' | 'production';
  remoteLogging?: RemoteLoggingConfig;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Утилитарные типы
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null | undefined;

// Типы для работы с коллекциями
export interface GroupedItems<T> {
  [key: string]: T[];
}

export interface IndexedItems<T> {
  [key: string]: T;
}
