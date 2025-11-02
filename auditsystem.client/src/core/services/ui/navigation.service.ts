// src/core/services/ui/navigation.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from '../utils/error-handler.service';
import type {
  NavigationService,
  NavigationTarget,
  NavigationGuard,
  NavigationResult
} from '@/core/types';

interface NavigationHistoryItem {
  target: NavigationTarget;
  timestamp: number;
  scrollPosition: number;
  title?: string;
  data?: unknown;
}

interface NavigationConfig {
  enableHistory: boolean;
  maxHistoryLength: number;
  scrollRestoration: boolean;
  enableAnalytics: boolean;
  defaultRoute: string;
}

/**
 * Production-ready navigation service with history management and guards
 */
class NavigationServiceImpl implements NavigationService {
  private readonly logger = logger.create('NavigationService');
  private history: NavigationHistoryItem[] = [];
  private currentIndex = -1;
  private guards: Set<NavigationGuard> = new Set();
  private router: any = null;
  private config: NavigationConfig = {
    enableHistory: true,
    maxHistoryLength: 50,
    scrollRestoration: true,
    enableAnalytics: false,
    defaultRoute: '/'
  };

  constructor() {
    this.logger.debug('NavigationService initialized', {
      config: this.config
    });

    this.setupGlobalHandlers();
  }

  async navigate(target: NavigationTarget): Promise<NavigationResult> {
    try {
      this.validateNavigationTarget(target);

      const from = this.getCurrentNavigationTarget();
      const guardResult = await this.executeGuards(target, from);

      if (guardResult !== true) {
        const redirectPath = typeof guardResult === 'string' ? guardResult : undefined;
        this.logger.warn('Navigation blocked by guard', {
          to: target.path,
          from: from?.path,
          redirectPath
        });

        if (redirectPath) {
          return this.navigate({ path: redirectPath, replace: true });
        }

        return {
          success: false,
          error: 'Navigation blocked by guard'
        };
      }

      const result = await this.performNavigation(target);
      if (result.success && this.config.enableHistory) {
        this.addToHistory(target);
      }

      this.logger.debug('Navigation completed', {
        to: target.path,
        success: result.success,
        redirected: result.redirected
      });

      return result;
    } catch (error) {
      const handledError = errorHandler.handle(error, `Navigation:${target.path}`);
      this.logger.error('Navigation failed', {
        target: target.path,
        error: handledError.message
      });

      return {
        success: false,
        error: handledError.message
      };
    }
  }

  back(): void {
    if (!this.canGoBack()) {
      this.logger.warn('Cannot go back - no history available');
      return;
    }

    this.currentIndex--;
    const previous = this.history[this.currentIndex];

    if (previous) {
      this.logger.debug('Navigating back', {
        to: previous.target.path,
        historyIndex: this.currentIndex
      });

      this.performNavigation(previous.target, 'back');
    }
  }

  forward(): void {
    if (!this.canGoForward()) {
      this.logger.warn('Cannot go forward - no history available');
      return;
    }

    this.currentIndex++;
    const next = this.history[this.currentIndex];

    if (next) {
      this.logger.debug('Navigating forward', {
        to: next.target.path,
        historyIndex: this.currentIndex
      });

      this.performNavigation(next.target, 'forward');
    }
  }

  async replace(path: string, query?: Record<string, string>, state?: unknown): Promise<NavigationResult> {
    return this.navigate({
      path,
      query,
      state,
      replace: true
    });
  }

  addGuard(guard: NavigationGuard): () => void {
    this.guards.add(guard);

    this.logger.debug('Navigation guard added', {
      totalGuards: this.guards.size
    });

    return () => {
      this.removeGuard(guard);
    };
  }

  removeGuard(guard: NavigationGuard): void {
    this.guards.delete(guard);

    this.logger.debug('Navigation guard removed', {
      totalGuards: this.guards.size
    });
  }

  getCurrentPath(): string {
    if (this.router) {
      return this.router.currentRoute?.path || window.location.pathname;
    }

    return window.location.pathname;
  }

  getCurrentQuery(): Record<string, string> {
    if (this.router) {
      return this.router.currentRoute?.query || {};
    }

    const searchParams = new URLSearchParams(window.location.search);
    const query: Record<string, string> = {};

    for (const [key, value] of searchParams.entries()) {
      query[key] = value;
    }

    return query;
  }

  getCurrentState(): unknown {
    if (this.router) {
      return this.router.currentRoute?.state;
    }

    return window.history.state;
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getHistory(): NavigationHistoryItem[] {
    return [...this.history];
  }

  clearHistory(): void {
    const previousSize = this.history.length;
    this.history = [];
    this.currentIndex = -1;

    this.logger.debug('Navigation history cleared', {
      previousSize,
      currentSize: this.history.length
    });
  }

  setRouter(router: any): void {
    this.router = router;
    this.logger.debug('Router instance set');
  }

  updateConfig(newConfig: Partial<NavigationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    this.logger.debug('Navigation config updated', {
      newConfig: this.config
    });
  }

  private async performNavigation(
    target: NavigationTarget,
    source: 'navigate' | 'back' | 'forward' | 'popstate' = 'navigate'
  ): Promise<NavigationResult> {
    try {
      if (this.router) {
        const routerTarget: any = {
          path: target.path,
          query: target.query
        };

        if (target.replace) {
          await this.router.replace(routerTarget);
        } else {
          await this.router.push(routerTarget);
        }
      } else {
        const url = this.buildUrl(target);

        if (target.replace) {
          window.history.replaceState(target.state, '', url);
        } else {
          window.history.pushState(target.state, '', url);
        }

        this.dispatchNavigationEvent(target, source);
      }

      if (this.config.scrollRestoration) {
        this.restoreScrollPosition(target);
      }

      return {
        success: true,
        redirected: false
      };
    } catch (error) {
      const handledError = errorHandler.handle(error, `Navigation:perform:${target.path}`);
      this.logger.error('Failed to perform navigation', {
        target: target.path,
        error: handledError.message
      });

      return {
        success: false,
        error: handledError.message
      };
    }
  }

  private async executeGuards(to: NavigationTarget, from?: NavigationTarget): Promise<boolean | string> {
    if (this.guards.size === 0) {
      return true;
    }

    for (const guard of this.guards) {
      try {
        const result = await guard(to, from);

        if (result !== true) {
          return result;
        }
      } catch (error) {
        const handledError = errorHandler.handle(error, 'Navigation:guard');
        this.logger.error('Navigation guard failed', {
          to: to.path,
          from: from?.path,
          error: handledError.message
        });

        return false;
      }
    }

    return true;
  }

  private addToHistory(target: NavigationTarget): void {
    const historyItem: NavigationHistoryItem = {
      target,
      timestamp: Date.now(),
      scrollPosition: this.getScrollPosition(),
      title: document.title,
      data: target.state
    };

    if (target.replace && this.history.length > 0) {
      this.history[this.currentIndex] = historyItem;
    } else {
      this.history = this.history.slice(0, this.currentIndex + 1);
      this.history.push(historyItem);
      this.currentIndex = this.history.length - 1;
    }

    if (this.history.length > this.config.maxHistoryLength) {
      this.history = this.history.slice(-this.config.maxHistoryLength);
      this.currentIndex = this.history.length - 1;
    }

    this.logger.debug('Navigation added to history', {
      path: target.path,
      historySize: this.history.length,
      currentIndex: this.currentIndex
    });
  }

  private buildUrl(target: NavigationTarget): string {
    let url = target.path;

    if (target.query && Object.keys(target.query).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(target.query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    if (target.hash) {
      url += `#${target.hash}`;
    }

    return url;
  }

  private getCurrentNavigationTarget(): NavigationTarget | undefined {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex].target;
    }

    return undefined;
  }

  private getScrollPosition(): number {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  private restoreScrollPosition(target: NavigationTarget): void {
    const historyItem = this.history.find(item => item.target.path === target.path);

    if (historyItem) {
      window.scrollTo(0, historyItem.scrollPosition);
    } else {
      window.scrollTo(0, 0);
    }
  }

  private dispatchNavigationEvent(target: NavigationTarget, source: string): void {
    const event = new CustomEvent('navigation', {
      detail: {
        target,
        source,
        timestamp: Date.now()
      }
    });

    window.dispatchEvent(event);
  }

  private validateNavigationTarget(target: NavigationTarget): void {
    if (!target || typeof target !== 'object') {
      throw errorHandler.create('Navigation target must be an object', 'INVALID_NAVIGATION_TARGET');
    }

    if (!target.path || typeof target.path !== 'string') {
      throw errorHandler.create('Navigation path must be a non-empty string', 'INVALID_NAVIGATION_PATH');
    }

    if (target.query && typeof target.query !== 'object') {
      throw errorHandler.create('Navigation query must be an object', 'INVALID_NAVIGATION_QUERY');
    }

    if (target.hash && typeof target.hash !== 'string') {
      throw errorHandler.create('Navigation hash must be a string', 'INVALID_NAVIGATION_HASH');
    }
  }

  private setupGlobalHandlers(): void {
    window.addEventListener('popstate', (event) => {
      this.logger.debug('Popstate event detected', {
        state: event.state,
        path: window.location.pathname
      });

      const target: NavigationTarget = {
        path: window.location.pathname,
        query: this.getCurrentQuery(),
        hash: window.location.hash.slice(1),
        state: event.state
      };

      this.performNavigation(target, 'popstate');
    });

    this.logger.debug('Global navigation handlers setup completed');
  }
}

// Создание и экспорт синглтона
export const navigationService: NavigationService = new NavigationServiceImpl();
