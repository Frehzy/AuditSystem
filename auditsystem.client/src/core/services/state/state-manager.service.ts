// src/core/services/state/state-manager.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import type {
  StateManager,
  StateUpdate
} from '@/core/types';

/**
 * Production-ready state manager with subscriptions and persistence
 */
class StateManagerImpl implements StateManager {
  private readonly logger = logger.create('StateManager');
  private state = new Map<string, unknown>();
  private subscribers = new Map<string, Set<(update: StateUpdate<unknown>) => void>>();
  private history: StateUpdate<unknown>[] = [];
  private timers = new Map<string, NodeJS.Timeout>();
  private readonly MAX_HISTORY_SIZE = 1000;

  constructor() {
    this.logger.debug('StateManager initialized', {
      maxHistorySize: this.MAX_HISTORY_SIZE
    });
  }

  set<T>(key: string, value: T, options: { ttl?: number; source?: string } = {}): void {
    try {
      if (!key || typeof key !== 'string') {
        throw errorHandler.create('State key must be a non-empty string', 'INVALID_STATE_KEY');
      }

      const prevValue = this.state.get(key);
      const timestamp = Date.now();

      this.state.set(key, value);

      const update: StateUpdate<T> = {
        key,
        prevValue: prevValue as T,
        nextValue: value,
        timestamp
      };

      // Добавляем source как дополнительное свойство
      if (options.source) {
        (update as any).source = options.source;
      }

      this.addToHistory(update);
      this.notifySubscribers(key, update);

      if (options.ttl && options.ttl > 0) {
        this.setTTL(key, options.ttl);
      }

      this.logger.debug('State updated', {
        key,
        hasPrevValue: prevValue !== undefined,
        hasNextValue: value !== undefined,
        source: options.source,
        ttl: options.ttl
      });
    } catch (error) {
      const handledError = errorHandler.handle(error, `State:set:${key}`);
      this.logger.error('Failed to set state', {
        key,
        error: handledError.message
      });
      throw handledError;
    }
  }

  get<T>(key: string): T | null {
    try {
      if (!key || typeof key !== 'string') {
        throw errorHandler.create('State key must be a non-empty string', 'INVALID_STATE_KEY');
      }

      const value = this.state.get(key);
      return value !== undefined ? (value as T) : null;
    } catch (error) {
      const handledError = errorHandler.handle(error, `State:get:${key}`);
      this.logger.error('Failed to get state', {
        key,
        error: handledError.message
      });
      return null;
    }
  }

  watch<T>(
    key: string,
    callback: (update: StateUpdate<T>) => void,
    options: { immediate?: boolean } = {}
  ): () => void {
    try {
      if (!key || typeof key !== 'string') {
        throw errorHandler.create('State key must be a non-empty string', 'INVALID_STATE_KEY');
      }

      if (typeof callback !== 'function') {
        throw errorHandler.create('Callback must be a function', 'INVALID_CALLBACK');
      }

      if (!this.subscribers.has(key)) {
        this.subscribers.set(key, new Set());
      }

      const keySubscribers = this.subscribers.get(key)!;
      keySubscribers.add(callback as (update: StateUpdate<unknown>) => void);

      if (options.immediate) {
        const currentValue = this.get<T>(key);
        const update: StateUpdate<T> = {
          key,
          prevValue: undefined as T,
          nextValue: currentValue as T,
          timestamp: Date.now()
        };

        // Добавляем source для immediate вызовов
        (update as any).source = 'immediate_watch';

        callback(update);
      }

      this.logger.debug('State watch added', { key, immediate: options.immediate });

      return () => {
        const subscribers = this.subscribers.get(key);
        if (subscribers) {
          subscribers.delete(callback as (update: StateUpdate<unknown>) => void);
          if (subscribers.size === 0) {
            this.subscribers.delete(key);
          }
        }
      };
    } catch (error) {
      const handledError = errorHandler.handle(error, `State:watch:${key}`);
      this.logger.error('Failed to watch state', {
        key,
        error: handledError.message
      });
      throw handledError;
    }
  }

  remove(key: string): void {
    try {
      if (!key || typeof key !== 'string') {
        throw errorHandler.create('State key must be a non-empty string', 'INVALID_STATE_KEY');
      }

      const prevValue = this.state.get(key);
      const timestamp = Date.now();

      this.state.delete(key);
      this.clearTTL(key);

      const update: StateUpdate<unknown> = {
        key,
        prevValue,
        nextValue: undefined,
        timestamp
      };

      // Добавляем source для remove операций
      (update as any).source = 'remove';

      this.addToHistory(update);
      this.notifySubscribers(key, update);

      this.logger.debug('State removed', { key });
    } catch (error) {
      const handledError = errorHandler.handle(error, `State:remove:${key}`);
      this.logger.error('Failed to remove state', {
        key,
        error: handledError.message
      });
      throw handledError;
    }
  }

  clear(): void {
    try {
      const keys = Array.from(this.state.keys());
      const timestamp = Date.now();

      keys.forEach(key => {
        const prevValue = this.state.get(key);

        const update: StateUpdate<unknown> = {
          key,
          prevValue,
          nextValue: undefined,
          timestamp
        };

        // Добавляем source для clear операций
        (update as any).source = 'clear';

        this.addToHistory(update);
        this.notifySubscribers(key, update);
      });

      this.state.clear();
      this.timers.forEach(timer => clearTimeout(timer));
      this.timers.clear();

      this.logger.debug('State cleared', { clearedItems: keys.length });
    } catch (error) {
      const handledError = errorHandler.handle(error, 'State:clear');
      this.logger.error('Failed to clear state', {
        error: handledError.message
      });
      throw handledError;
    }
  }

  has(key: string): boolean {
    try {
      if (!key || typeof key !== 'string') {
        throw errorHandler.create('State key must be a non-empty string', 'INVALID_STATE_KEY');
      }

      return this.state.has(key);
    } catch (error) {
      const handledError = errorHandler.handle(error, `State:has:${key}`);
      this.logger.error('Failed to check state', {
        key,
        error: handledError.message
      });
      return false;
    }
  }

  keys(): string[] {
    return Array.from(this.state.keys());
  }

  size(): number {
    return this.state.size;
  }

  destroy(): void {
    this.clear();
    this.subscribers.clear();
    this.history = [];

    this.logger.debug('StateManager destroyed');
  }

  getHistory(): StateUpdate<unknown>[] {
    return [...this.history];
  }

  getStats(): {
    totalKeys: number;
    totalSubscribers: number;
    historySize: number;
    activeTimers: number;
  } {
    let totalSubscribers = 0;
    this.subscribers.forEach(subscribers => {
      totalSubscribers += subscribers.size;
    });

    return {
      totalKeys: this.state.size,
      totalSubscribers,
      historySize: this.history.length,
      activeTimers: this.timers.size
    };
  }

  serialize(): Record<string, unknown> {
    const serialized: Record<string, unknown> = {};

    for (const [key, value] of this.state.entries()) {
      try {
        serialized[key] = value;
      } catch (error) {
        this.logger.warn('Failed to serialize state value', {
          key,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return serialized;
  }

  private addToHistory(update: StateUpdate<unknown>): void {
    this.history.unshift(update);

    if (this.history.length > this.MAX_HISTORY_SIZE) {
      this.history = this.history.slice(0, this.MAX_HISTORY_SIZE);
    }
  }

  private notifySubscribers(key: string, update: StateUpdate<unknown>): void {
    const subscribers = this.subscribers.get(key);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          this.logger.error('State subscriber callback failed', {
            key,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
    }
  }

  private setTTL(key: string, ttl: number): void {
    this.clearTTL(key);

    const timer = setTimeout(() => {
      this.logger.debug('State TTL expired', { key, ttl });
      this.remove(key);
    }, ttl);

    this.timers.set(key, timer);
  }

  private clearTTL(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }
}

// Создание и экспорт синглтона
export const stateManager: StateManager = new StateManagerImpl();
