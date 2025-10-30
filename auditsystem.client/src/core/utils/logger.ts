// src/core/utils/logger.ts
// Unified types for logger
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context: string;
}

/**
 * Улучшенный логгер с поддержкой разных уровней и контекстов
 */
interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  maxStorageEntries: number;
  showTimestamps: boolean;
  showEmojis: boolean;
}

class Logger {
  private config: LoggerConfig = {
    enabled: true,
    level: 'info',
    maxStorageEntries: 100,
    showTimestamps: true,
    showEmojis: true
  };

  private readonly context: string;
  private readonly storageKey = 'app_logs';
  private readonly emojis: Record<string, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    api: '🌐',
    auth: '🔐',
    storage: '💾',
    router: '🛣️',
    performance: '⏱️',
    network: '📡'
  };

  constructor(context: string = 'App') {
    this.context = context;
    this.loadConfig();
  }

  /**
   * Загрузка конфигурации из localStorage
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('logger_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch {
      // Игнорируем ошибки загрузки конфигурации
    }
  }

  /**
   * Сохранение конфигурации
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('logger_config', JSON.stringify(this.config));
    } catch {
      // Игнорируем ошибки сохранения конфигурации
    }
  }

  /**
   * Создание дочернего логгера
   */
  public create(context: string): Logger {
    return new Logger(`${this.context}:${context}`);
  }

  /**
   * Проверка возможности логирования
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const targetLevelIndex = levels.indexOf(level);

    return targetLevelIndex >= currentLevelIndex;
  }

  /**
   * Основной метод логирования
   */
  private log(level: LogLevel, message: string, data?: unknown, customEmoji?: string): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const emoji = customEmoji || this.emojis[level] || '📝';

    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp,
      context: this.context,
    };

    // Форматирование вывода в консоль
    const parts = [];

    if (this.config.showTimestamps) {
      parts.push(`[${new Date().toLocaleTimeString()}]`);
    }

    parts.push(`${this.config.showEmojis ? emoji : ''} ${this.context}:`);
    parts.push(message);

    if (data) {
      console.groupCollapsed(...parts);
      console.log('Data:', data);
      console.log('Context:', this.context);
      console.log('Timestamp:', timestamp);
      console.groupEnd();
    } else {
      console.log(...parts);
    }

    // Сохранение в localStorage для отладки
    this.saveToStorage(logEntry);
  }

  /**
   * Сохранение в localStorage
   */
  private saveToStorage(entry: LogEntry): void {
    try {
      const logs = Logger.getStorageLogs();
      logs.push(entry);

      // Ограничение количества записей
      if (logs.length > this.config.maxStorageEntries) {
        logs.splice(0, logs.length - this.config.maxStorageEntries);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(logs));
    } catch {
      // Игнорируем ошибки записи
    }
  }

  /**
   * Базовые методы логирования
   */
  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  /**
   * Специализированные методы
   */
  api(message: string, data?: unknown): void {
    this.log('info', message, data, this.emojis.api);
  }

  auth(message: string, data?: unknown): void {
    this.log('info', message, data, this.emojis.auth);
  }

  storage(message: string, data?: unknown): void {
    this.log('debug', message, data, this.emojis.storage);
  }

  router(message: string, data?: unknown): void {
    this.log('info', message, data, this.emojis.router);
  }

  performance(message: string, data?: unknown): void {
    this.log('debug', message, data, this.emojis.performance);
  }

  network(message: string, data?: unknown): void {
    this.log('info', message, data, this.emojis.network);
  }

  /**
   * Управление конфигурацией
   */
  setConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  enable(): void {
    this.config.enabled = true;
    this.saveConfig();
  }

  disable(): void {
    this.config.enabled = false;
    this.saveConfig();
  }

  /**
   * Статические методы для управления логами
   */
  static clearStorage(): void {
    try {
      localStorage.removeItem('app_logs');
      localStorage.removeItem('logger_config');
    } catch {
      // Игнорируем ошибки
    }
  }

  static getStorageLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  static exportLogs(): string {
    return JSON.stringify(this.getStorageLogs(), null, 2);
  }
}

// Создание глобального экземпляра логгера
export const logger = new Logger();

export default Logger;
