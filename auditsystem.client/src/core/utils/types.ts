// src/core/utils/types.ts
/**
 * Общие типы для утилит
 */

export type TimeUnit = 'ms' | 's' | 'm' | 'h' | 'd';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type CaseType = 'camel' | 'kebab' | 'snake' | 'pascal';

export interface ValidationRule {
  test: (value: unknown) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: string;
}

export interface DateFormatOptions {
  day?: '2-digit' | 'numeric';
  month?: '2-digit' | 'numeric' | 'long' | 'short';
  year?: '2-digit' | 'numeric';
  hour?: '2-digit' | 'numeric';
  minute?: '2-digit' | 'numeric';
  second?: '2-digit' | 'numeric';
}

export interface UrlParams {
  [key: string]: string;
}
