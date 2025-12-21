/**
 * Store транспорт для логгера (логи в UI)
 */

import type { LogLevel, LogEntry, LogTransport } from '../logger.types';
import { useErrorStore } from '@/framework/stores';

export class StoreTransport implements LogTransport {
  private maxEntries = 100;
  private levels: LogLevel[] = ['error', 'fatal', 'warn'];

  log(entry: LogEntry): void {
    // Сохраняем только важные логи в store для отображения в UI
    if (this.levels.includes(entry.level)) {
      const errorStore = useErrorStore();

      errorStore.addLogEntry({
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        level: entry.level,
        message: entry.message,
        context: entry.context || 'unknown',
        timestamp: entry.timestamp,
        meta: entry.meta
      });
    }
  }

  supportsLevel(level: LogLevel): boolean {
    return this.levels.includes(level);
  }
}
