/**
 * Типы для системы логирования
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: Date;
  meta?: Record<string, any>;
}

export interface LogTransport {
  log(entry: LogEntry): void;
  supportsLevel(level: LogLevel): boolean;
}

export interface LoggerConfig {
  level: LogLevel;
  transports: LogTransport[];
  enableContext: boolean;
  maxContextLength: number;
  format?: (entry: LogEntry) => string;
}

export interface Logger {
  debug(message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  fatal(message: string, meta?: Record<string, any>): void;
  create(context: string): Logger;
  setLevel(level: LogLevel): void;
  addTransport(transport: LogTransport): void;
}
