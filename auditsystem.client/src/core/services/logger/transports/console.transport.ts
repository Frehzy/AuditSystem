/**
 * Консольный транспорт для логгера
 */

import type { LogLevel, LogEntry, LogTransport } from '../logger.types';

export class ConsoleTransport implements LogTransport {
  private colors: Record<LogLevel, string> = {
    debug: '#6B7280',
    info: '#3B82F6',
    warn: '#F59E0B',
    error: '#EF4444',
    fatal: '#DC2626'
  };

  private symbols: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    fatal: '💀'
  };

  log(entry: LogEntry): void {
    const { level, message, context, timestamp, meta } = entry;

    const style = `color: ${this.colors[level]}; font-weight: bold;`;
    const symbol = this.symbols[level];
    const time = timestamp.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const contextStr = context ? `[${context}]` : '';
    const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';

    // Форматированный вывод в консоль
    console.groupCollapsed(
      `%c${symbol} ${time} ${level.toUpperCase()} ${contextStr} ${message}`,
      style
    );

    if (meta) {
      console.log('Meta:', meta);
    }

    console.groupEnd();
  }

  supportsLevel(level: LogLevel): boolean {
    // В development показываем все уровни, в production только warn и выше
    if (import.meta.env.PROD) {
      return ['warn', 'error', 'fatal'].includes(level);
    }
    return true;
  }
}
