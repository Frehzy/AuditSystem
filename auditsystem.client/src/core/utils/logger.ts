// src/core/utils/logger.ts

// Unified types for enhanced logger
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'api' | 'auth' | 'storage' | 'router' | 'performance' | 'network' | 'ui' | 'business';

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context: string;
  sessionId?: string;
  userId?: string;
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
}

/**
 * Улучшенный логгер с поддержкой сессий, пользователей и расширенной фильтрацией
 */
class Logger {
  private config: LoggerConfig;
  private readonly context: string;
  private readonly storageKey = 'app_logs';
  private readonly configKey = 'logger_config';

  // Расширенный набор emoji для разных контекстов
  private readonly emojis: Record<string, string> = {
    // Уровни логирования
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',

    // Контексты
    api: '🌐',
    auth: '🔐',
    storage: '💾',
    router: '🛣️',
    performance: '⏱️',
    network: '📡',
    ui: '🎨',
    business: '💼'
  };

  // Цвета для консоли (только для development)
  private readonly colors: Record<LogLevel, string> = {
    debug: '#888',
    info: '#2277ff',
    warn: '#ffaa00',
    error: '#ff4444'
  };

  constructor(context: string = 'App', config?: Partial<LoggerConfig>) {
    this.context = context;
    this.config = this.initializeConfig(config);
    this.cleanupOldLogs();
  }

  /**
   * Инициализация конфигурации с значениями по умолчанию
   */
  private initializeConfig(customConfig?: Partial<LoggerConfig>): LoggerConfig {
    const defaultConfig: LoggerConfig = {
      enabled: true,
      level: import.meta.env.DEV ? 'debug' : 'info',
      maxStorageEntries: 200,
      showTimestamps: true,
      showEmojis: true,
      persistToStorage: import.meta.env.DEV,
      sessionId: this.generateSessionId(),
      userId: undefined
    };

    const savedConfig = this.loadSavedConfig();
    return { ...defaultConfig, ...savedConfig, ...customConfig };
  }

  /**
   * Генерация ID сессии для группировки логов
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Загрузка сохраненной конфигурации
   */
  private loadSavedConfig(): Partial<LoggerConfig> {
    try {
      const saved = localStorage.getItem(this.configKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  /**
   * Сохранение конфигурации
   */
  private saveConfig(): void {
    try {
      localStorage.setItem(this.configKey, JSON.stringify(this.config));
    } catch {
      // Игнорируем ошибки сохранения
    }
  }

  /**
   * Создание дочернего логгера с наследованием конфигурации
   */
  public create(context: string): Logger {
    return new Logger(`${this.context}:${context}`, this.config);
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
   * Основной метод логирования с улучшенным форматированием
   */
  private log(
    level: LogLevel,
    message: string,
    data?: unknown,
    context?: LogContext
  ): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const contextEmoji = context ? this.emojis[context] : this.emojis[level];
    const displayContext = context || level;

    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp,
      context: this.context,
      sessionId: this.config.sessionId,
      userId: this.config.userId
    };

    // Форматирование вывода в консоль
    this.logToConsole(level, displayContext, message, data, contextEmoji, timestamp);

    // Сохранение в localStorage для отладки
    if (this.config.persistToStorage) {
      this.saveToStorage(logEntry);
    }
  }

  /**
   * Улучшенный вывод в консоль с цветами и группировкой
   */
  private logToConsole(
    level: LogLevel,
    context: string,
    message: string,
    data: unknown,
    emoji: string,
    timestamp: string
  ): void {
    const parts: string[] = [];

    // Таймстамп
    if (this.config.showTimestamps) {
      parts.push(`%c[${new Date().toLocaleTimeString()}]`);
    }

    // Emoji и контекст
    const contextPart = `${this.config.showEmojis ? emoji : ''} ${this.context}:${context}`;
    parts.push(`%c${contextPart}`);

    // Сообщение
    parts.push(`%c${message}`);

    // Стили для разных частей
    const styles = [
      this.config.showTimestamps ? 'color: #666; font-size: 0.8em;' : '',
      `color: ${this.colors[level]}; font-weight: bold;`,
      'color: inherit;'
    ].filter(Boolean);

    if (data) {
      // Группировка для данных
      console.groupCollapsed(...parts, ...styles);
      console.log('Data:', data);
      console.log('Context:', this.context);
      console.log('Timestamp:', timestamp);
      console.log('Session:', this.config.sessionId);
      if (this.config.userId) {
        console.log('User:', this.config.userId);
      }
      console.groupEnd();
    } else {
      console.log(...parts, ...styles);
    }
  }

  /**
   * Сохранение в localStorage с автоматической очисткой старых записей
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
   * Очистка старых логов при инициализации
   */
  private cleanupOldLogs(): void {
    if (!this.config.persistToStorage) return;

    try {
      const logs = Logger.getStorageLogs();
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

      const recentLogs = logs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime > oneWeekAgo;
      });

      if (recentLogs.length < logs.length) {
        localStorage.setItem(this.storageKey, JSON.stringify(recentLogs));
        this.debug(`Cleaned up ${logs.length - recentLogs.length} old log entries`);
      }
    } catch {
      // Игнорируем ошибки очистки
    }
  }

  // ==================== BASIC LOGGING METHODS ====================

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

  // ==================== CONTEXT-SPECIFIC METHODS ====================

  api(message: string, data?: unknown): void {
    this.log('info', message, data, 'api');
  }

  auth(message: string, data?: unknown): void {
    this.log('info', message, data, 'auth');
  }

  storage(message: string, data?: unknown): void {
    this.log('debug', message, data, 'storage');
  }

  router(message: string, data?: unknown): void {
    this.log('info', message, data, 'router');
  }

  performance(message: string, data?: unknown): void {
    this.log('debug', message, data, 'performance');
  }

  network(message: string, data?: unknown): void {
    this.log('info', message, data, 'network');
  }

  ui(message: string, data?: unknown): void {
    this.log('info', message, data, 'ui');
  }

  business(message: string, data?: unknown): void {
    this.log('info', message, data, 'business');
  }

  // ==================== CONFIGURATION MANAGEMENT ====================

  setConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    this.debug('Logger config updated', { config: this.config });
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

  setUser(userId: string): void {
    this.config.userId = userId;
    this.saveConfig();
    this.debug('User ID set for logging', { userId });
  }

  clearUser(): void {
    this.config.userId = undefined;
    this.saveConfig();
    this.debug('User ID cleared from logging');
  }

  // ==================== PERFORMANCE LOGGING ====================

  /**
   * Логирование производительности операций
   */
  time<T>(operation: string, fn: () => T): T {
    const startTime = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      this.performance(`${operation} completed`, {
        operation,
        duration: `${duration.toFixed(2)}ms`
      });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.error(`${operation} failed`, {
        operation,
        duration: `${duration.toFixed(2)}ms`,
        error
      });
      throw error;
    }
  }

  /**
   * Асинхронное логирование производительности
   */
  async timeAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.performance(`${operation} completed`, {
        operation,
        duration: `${duration.toFixed(2)}ms`
      });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.error(`${operation} failed`, {
        operation,
        duration: `${duration.toFixed(2)}ms`,
        error
      });
      throw error;
    }
  }

  // ==================== STATIC METHODS ====================

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

  static exportLogs(format: 'json' | 'text' = 'json'): string {
    const logs = this.getStorageLogs();

    if (format === 'text') {
      return logs.map(log =>
        `[${log.timestamp}] ${log.context} ${log.level}: ${log.message} ${log.data ? JSON.stringify(log.data) : ''
        }`
      ).join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  static getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byContext: Record<string, number>;
  } {
    const logs = this.getStorageLogs();
    const byLevel = {} as Record<LogLevel, number>;
    const byContext: Record<string, number> = {};

    logs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;
      byContext[log.context] = (byContext[log.context] || 0) + 1;
    });

    return {
      total: logs.length,
      byLevel,
      byContext
    };
  }
}

// Создание глобального экземпляра логгера
export const logger = new Logger();

export default Logger;
