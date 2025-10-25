// src/core/services/core/state/state-manager.service.ts
import { logger } from '@/core/utils/logger';
import type { StateManager, StateUpdate } from '@/core/types';

interface StateMetadata {
  lastUpdated: number;
  version: number;
  source?: string;
  ttl?: number;
}

interface StateManagerConfig {
  maxStates: number;
  enablePersistence: boolean;
  persistenceKey: string;
  enableGC: boolean;
  gcInterval: number;
}

class StateManagerImpl implements StateManager {
  private readonly logger = logger.create('StateManager');
  private state = new Map<string, unknown>();
  private metadata = new Map<string, StateMetadata>();
  private watchers = new Map<string, Array<(update: StateUpdate<unknown>) => void>>();
  private gcIntervalId?: number;

  private config: StateManagerConfig = {
    maxStates: 100,
    enablePersistence: true,
    persistenceKey: 'app-state-manager',
    enableGC: true,
    gcInterval: 30000, // 30 seconds
  };

  constructor(config?: Partial<StateManagerConfig>) {
    this.config = { ...this.config, ...config };

    if (this.config.enablePersistence) {
      this.loadFromStorage();
    }

    if (this.config.enableGC) {
      this.startGarbageCollection();
    }
  }

  set<T>(key: string, value: T, options: { ttl?: number; source?: string } = {}): void {
    const prevValue = this.state.get(key);

    // Deep comparison to avoid unnecessary updates
    if (this.isEqual(prevValue, value)) {
      return;
    }

    this.state.set(key, value);

    // Update metadata
    this.metadata.set(key, {
      lastUpdated: Date.now(),
      version: (this.metadata.get(key)?.version || 0) + 1,
      source: options.source,
      ttl: options.ttl,
    });

    const update: StateUpdate<T> = {
      key,
      prevValue: prevValue as T,
      nextValue: value,
      timestamp: Date.now(),
    };

    this.notifyWatchers(key, update);

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    this.logger.debug('State updated', {
      key,
      hasPrevValue: prevValue !== undefined,
      source: options.source,
      version: this.metadata.get(key)?.version
    });
  }

  get<T>(key: string): T | null {
    const value = this.state.get(key);

    // Check TTL
    const meta = this.metadata.get(key);
    if (meta?.ttl && Date.now() - meta.lastUpdated > meta.ttl) {
      this.logger.debug('State expired by TTL', { key, ttl: meta.ttl });
      this.remove(key);
      return null;
    }

    return value as T ?? null;
  }

  watch<T>(key: string, callback: (update: StateUpdate<T>) => void, options: { immediate?: boolean } = {}): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, []);
    }

    const watchers = this.watchers.get(key)!;
    watchers.push(callback as (update: StateUpdate<unknown>) => void);

    // Immediately call with current state if requested
    if (options.immediate) {
      const currentValue = this.get<T>(key);
      if (currentValue !== null) {
        const initialUpdate: StateUpdate<T> = {
          key,
          prevValue: currentValue,
          nextValue: currentValue,
          timestamp: Date.now(),
        };
        setTimeout(() => callback(initialUpdate), 0);
      }
    }

    return () => {
      const watchers = this.watchers.get(key);
      if (watchers) {
        const index = watchers.indexOf(callback as (update: StateUpdate<unknown>) => void);
        if (index > -1) {
          watchers.splice(index, 1);
        }
      }
    };
  }

  remove(key: string): void {
    const prevValue = this.state.get(key);
    this.state.delete(key);
    this.metadata.delete(key);

    if (this.watchers.has(key)) {
      const update: StateUpdate<unknown> = {
        key,
        prevValue,
        nextValue: null,
        timestamp: Date.now(),
      };
      this.notifyWatchers(key, update);
    }

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    this.logger.debug('State removed', { key });
  }

  clear(): void {
    const keys = Array.from(this.state.keys());
    this.state.clear();
    this.metadata.clear();

    keys.forEach(key => {
      if (this.watchers.has(key)) {
        const update: StateUpdate<unknown> = {
          key,
          prevValue: null,
          nextValue: null,
          timestamp: Date.now(),
        };
        this.notifyWatchers(key, update);
      }
    });

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    this.logger.debug('State cleared');
  }

  has(key: string): boolean {
    return this.state.has(key);
  }

  keys(): string[] {
    return Array.from(this.state.keys());
  }

  size(): number {
    return this.state.size;
  }

  private notifyWatchers<T>(key: string, update: StateUpdate<T>): void {
    const watchers = this.watchers.get(key);
    if (watchers) {
      watchers.forEach(callback => {
        try {
          callback(update as StateUpdate<unknown>);
        } catch (error) {
          this.logger.error('Error in state watcher:', error);
        }
      });
    }
  }

  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;

    if (a && b && typeof a === 'object' && typeof b === 'object') {
      if (a.constructor !== b.constructor) return false;

      if (Array.isArray(a)) {
        if (a.length !== (b as unknown[]).length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!this.isEqual(a[i], (b as unknown[])[i])) return false;
        }
        return true;
      }

      const aObj = a as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;
      const keys = Object.keys(aObj);
      if (keys.length !== Object.keys(bObj).length) return false;

      for (const key of keys) {
        if (!this.isEqual(aObj[key], bObj[key])) return false;
      }
      return true;
    }

    return false;
  }

  private saveToStorage(): void {
    try {
      const data = {
        state: Array.from(this.state.entries()),
        metadata: Array.from(this.metadata.entries()),
      };
      localStorage.setItem(this.config.persistenceKey, JSON.stringify(data));
    } catch (error) {
      this.logger.error('Failed to save state to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.config.persistenceKey);
      if (data) {
        const parsed = JSON.parse(data) as {
          state: [string, unknown][];
          metadata: [string, StateMetadata][];
        };
        this.state = new Map(parsed.state);
        this.metadata = new Map(parsed.metadata);
        this.logger.info('State loaded from storage', { states: this.state.size });
      }
    } catch (error) {
      this.logger.error('Failed to load state from storage:', error);
    }
  }

  private startGarbageCollection(): void {
    this.gcIntervalId = window.setInterval(() => {
      this.collectGarbage();
    }, this.config.gcInterval);
  }

  private collectGarbage(): void {
    const now = Date.now();
    let collected = 0;

    // Remove expired TTL states
    for (const [key, meta] of this.metadata.entries()) {
      if (meta.ttl && now - meta.lastUpdated > meta.ttl) {
        this.remove(key);
        collected++;
      }
    }

    // Remove oldest states if over limit
    if (this.state.size > this.config.maxStates) {
      const entries = Array.from(this.metadata.entries())
        .sort(([, a], [, b]) => a.lastUpdated - b.lastUpdated);

      const toRemove = entries.slice(0, this.state.size - this.config.maxStates);
      toRemove.forEach(([key]) => {
        this.remove(key);
        collected++;
      });
    }

    if (collected > 0) {
      this.logger.debug('Garbage collection completed', { collected });
    }
  }

  destroy(): void {
    if (this.gcIntervalId) {
      clearInterval(this.gcIntervalId);
    }
    this.clear();
    this.logger.info('State manager destroyed');
  }
}

export const stateManager: StateManager = new StateManagerImpl();
