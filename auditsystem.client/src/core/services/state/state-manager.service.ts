import { logger } from '@/core/utils/logger/logger';
import type { StateManager, StateUpdate } from '../types';

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
  private state = new Map<string, any>();
  private metadata = new Map<string, StateMetadata>();
  private watchers = new Map<string, Array<(update: StateUpdate<any>) => void>>();
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
      prevValue,
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

    return value ?? null;
  }

  getWithMetadata<T>(key: string): { value: T; metadata: StateMetadata } | null {
    const value = this.get<T>(key);
    const metadata = this.metadata.get(key);

    if (value === null || !metadata) {
      return null;
    }

    return { value, metadata };
  }

  watch<T>(key: string, callback: (update: StateUpdate<T>) => void, options: { immediate?: boolean } = {}): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, []);
    }

    const watchers = this.watchers.get(key)!;
    watchers.push(callback as any);

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
        const index = watchers.indexOf(callback as any);
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
      const update: StateUpdate<any> = {
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
        const update: StateUpdate<any> = {
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

  values<T>(): T[] {
    return Array.from(this.state.values());
  }

  entries<T>(): [string, T][] {
    return Array.from(this.state.entries());
  }

  size(): number {
    return this.state.size;
  }

  getMetadata(key: string): StateMetadata | null {
    return this.metadata.get(key) || null;
  }

  getAllMetadata(): Map<string, StateMetadata> {
    return new Map(this.metadata);
  }

  snapshot(): { state: Map<string, any>; metadata: Map<string, StateMetadata> } {
    return {
      state: new Map(this.state),
      metadata: new Map(this.metadata),
    };
  }

  restore(snapshot: { state: Map<string, any>; metadata: Map<string, StateMetadata> }): void {
    this.state = new Map(snapshot.state);
    this.metadata = new Map(snapshot.metadata);

    // Notify all watchers of restored state
    this.state.forEach((value, key) => {
      if (this.watchers.has(key)) {
        const update: StateUpdate<any> = {
          key,
          prevValue: null,
          nextValue: value,
          timestamp: Date.now(),
        };
        this.notifyWatchers(key, update);
      }
    });

    if (this.config.enablePersistence) {
      this.saveToStorage();
    }

    this.logger.info('State restored from snapshot', {
      states: this.state.size,
      keys: Array.from(this.state.keys())
    });
  }

  private notifyWatchers<T>(key: string, update: StateUpdate<T>): void {
    const watchers = this.watchers.get(key);
    if (watchers) {
      watchers.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          this.logger.error('Error in state watcher:', error);
        }
      });
    }
  }

  private isEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (a && b && typeof a === 'object' && typeof b === 'object') {
      if (a.constructor !== b.constructor) return false;

      if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
          if (!this.isEqual(a[i], b[i])) return false;
        }
        return true;
      }

      const keys = Object.keys(a);
      if (keys.length !== Object.keys(b).length) return false;

      for (const key of keys) {
        if (!this.isEqual(a[key], b[key])) return false;
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
        const parsed = JSON.parse(data);
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

    for (const [key, meta] of this.metadata.entries()) {
      // Remove expired TTL states
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
