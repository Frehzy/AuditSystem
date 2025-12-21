/**
 * Сервис логирования
 */

import { APP_CONFIG } from '@/core/config/app.config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogContext = string | Record<string, unknown>;

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  [key: string]: unknown;
}

export interface LoggerTransport {
  log(entry: LogEntry): void;
}

export class Logger {
  private name: string;
  private transports: LoggerTransport[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addTransport(transport: LoggerTransport): void {
    this.transports.push(transport);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  fatal(message: string, context?: LogContext): void {
    this.log('fatal', message, context);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Пропускаем debug логи в production если не включены
    if (level === 'debug' && !APP_CONFIG.FEATURES.DEBUG_LOGS && APP_CONFIG.APP.ENV === 'production') {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: `[${this.name}] ${message}`,
      ...(typeof context === 'string' ? { context } : context)
    };

    // Отправляем во все транспорты
    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (error) {
        // Не ломаем приложение если транспорт упал
        console.error('Logger transport error:', error);
      }
    });
  }

  // Метод для создания дочернего логгера
  create(name: string): Logger {
    return new Logger(`${this.name}:${name}`);
  }
}

// Транспорт для консоли
export class ConsoleTransport implements LoggerTransport {
  log(entry: LogEntry): void {
    const { timestamp, level, message, ...rest } = entry;
    const formattedTime = new Date(timestamp).toLocaleTimeString();

    const logArgs = [`[${formattedTime}] ${message}`, rest];

    switch (level) {
      case 'debug':
        console.debug(...logArgs);
        break;
      case 'info':
        console.info(...logArgs);
        break;
      case 'warn':
        console.warn(...logArgs);
        break;
      case 'error':
        console.error(...logArgs);
        break;
      case 'fatal':
        console.error(...logArgs); // Для fatal используем console.error
        break;
    }
  }
}

// Транспорт для отправки логов на сервер (заглушка)
export class ServerTransport implements LoggerTransport {
  log(entry: LogEntry): void {
    // В будущем можно добавить отправку на сервер
    // console.log('Server log:', entry);
  }
}

// Создаем главный логгер
const mainLogger = new Logger('App');

// Добавляем транспорты
if (APP_CONFIG.APP.ENV !== 'test') {
  mainLogger.addTransport(new ConsoleTransport());

  if (APP_CONFIG.APP.ENV === 'production') {
    mainLogger.addTransport(new ServerTransport());
  }
}

// Экспортируем функции для удобства
export const logger = mainLogger;
export const createLogger = (name: string) => mainLogger.create(name);
