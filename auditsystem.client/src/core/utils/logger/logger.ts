type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private readonly isDevelopment = import.meta.env.DEV;
  private readonly isDebugEnabled = true;
  private readonly context: string;

  constructor(context: string = 'App') {
    this.context = context;
  }

  /**
   * Создание дочернего логгера с контекстом
   */
  public create(context: string): Logger {
    return new Logger(context);
  }

  private shouldLog(level: LogLevel): boolean {
    if (level === 'debug' && !this.isDevelopment && !this.isDebugEnabled) {
      return false;
    }
    return true;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}`;
    const contextPrefix = this.context ? `[${this.context}]` : '';
    const emoji = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' };

    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp,
      context: this.context,
    };

    if (data) {
      console.groupCollapsed(`${prefix} ${contextPrefix} ${emoji[level]} ${message}`);
      console.log('Details:', data);
      console.log('Context:', this.context);
      console.groupEnd();
    } else {
      console.log(`${prefix} ${contextPrefix} ${emoji[level]} ${message}`);
    }

    // В development можно сохранять логи для отладки
    if (this.isDevelopment) {
      this.saveToStorage(logEntry);
    }
  }

  private saveToStorage(entry: LogEntry): void {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // Храним только последние 100 записей
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch {
      // Игнорируем ошибки записи в localStorage
    }
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  // Специализированные методы логирования
  api(message: string, data?: any): void {
    this.info(`🌐 ${message}`, data);
  }

  auth(message: string, data?: any): void {
    this.info(`🔐 ${message}`, data);
  }

  storage(message: string, data?: any): void {
    this.debug(`💾 ${message}`, data);
  }

  router(message: string, data?: any): void {
    this.info(`🛣️ ${message}`, data);
  }

  /**
   * Очистка логов из localStorage
   */
  static clearStorageLogs(): void {
    try {
      localStorage.removeItem('app_logs');
    } catch {
      // Игнорируем ошибки
    }
  }

  /**
   * Получение логов из localStorage
   */
  static getStorageLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }
}

export const logger = new Logger();
export type { LogLevel, LogEntry };
