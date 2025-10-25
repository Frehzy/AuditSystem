// src/core/services/core/ui/navigation.service.ts
import { logger } from '@/core/utils/logger';
import type { NavigationService, NavigationTarget, NavigationGuard, NavigationResult } from '@/core/types';

interface NavigationHistoryItem {
  target: NavigationTarget;
  timestamp: number;
  scrollPosition: number;
}

interface NavigationConfig {
  enableHistory: boolean;
  maxHistoryLength: number;
  scrollRestoration: boolean;
}

class NavigationServiceImpl implements NavigationService {
  private readonly logger = logger.create('NavigationService');
  private guards: NavigationGuard[] = [];
  private history: NavigationHistoryItem[] = [];
  private currentIndex = 0;
  private isNavigating = false;

  private config: NavigationConfig = {
    enableHistory: true,
    maxHistoryLength: 50,
    scrollRestoration: true,
  };

  constructor(config?: Partial<NavigationConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeHistory();
    this.setupGlobalHandlers();
  }

  async navigate(target: NavigationTarget): Promise<NavigationResult> {
    // Wait if navigation is already in progress
    while (this.isNavigating) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.isNavigating = true;

    try {
      const from = this.getCurrentNavigationTarget();
      const to = this.normalizeNavigationTarget(target);

      // Execute guards sequentially
      for (const guard of this.guards) {
        try {
          const result = await guard(to, from);
          if (result !== true) {
            this.logger.debug('Navigation blocked by guard', {
              from: from.path,
              to: to.path,
              result: typeof result === 'string' ? result : 'blocked'
            });

            return {
              success: false,
              redirected: typeof result === 'string',
              error: typeof result === 'string' ? `Redirected to: ${result}` : 'Blocked by guard'
            };
          }
        } catch (error) {
          this.logger.error('Navigation guard error', {
            from: from.path,
            to: to.path,
            error: error instanceof Error ? error.message : 'Unknown error'
          });

          return {
            success: false,
            error: 'Guard execution failed'
          };
        }
      }

      const url = this.buildUrl(to);

      if (target.replace) {
        window.history.replaceState(to.state, '', url);
        this.updateCurrentHistoryItem(to);
      } else {
        window.history.pushState(to.state, '', url);
        this.addToHistory(to);
      }

      this.updatePageMetadata(to);

      if (this.config.scrollRestoration) {
        this.restoreScrollPosition();
      }

      this.logger.router('Navigation completed', {
        from: from.path,
        to: to.path,
        method: target.replace ? 'replace' : 'push',
        hasState: !!to.state,
        queryParams: Object.keys(to.query || {}).length
      });

      this.triggerNavigationEvent(to, from);
      return { success: true };

    } catch (error) {
      this.logger.error('Navigation failed', {
        target: target.path,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: 'Navigation failed'
      };
    } finally {
      this.isNavigating = false;
    }
  }

  back(): void {
    if (this.canGoBack()) {
      window.history.back();
      this.logger.router('Navigation back');
    } else {
      this.logger.warn('Cannot navigate back - already at start of history');
    }
  }

  forward(): void {
    if (this.canGoForward()) {
      window.history.forward();
      this.logger.router('Navigation forward');
    } else {
      this.logger.warn('Cannot navigate forward - already at end of history');
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
    this.guards.push(guard);
    this.logger.debug('Navigation guard added', { totalGuards: this.guards.length });

    return () => {
      this.removeGuard(guard);
    };
  }

  removeGuard(guard: NavigationGuard): void {
    const index = this.guards.indexOf(guard);
    if (index > -1) {
      this.guards.splice(index, 1);
      this.logger.debug('Navigation guard removed', { totalGuards: this.guards.length });
    }
  }

  getCurrentPath(): string {
    return window.location.pathname;
  }

  getCurrentQuery(): Record<string, string> {
    return this.parseQueryString(window.location.search);
  }

  getCurrentState(): unknown {
    return window.history.state;
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  private initializeHistory(): void {
    if (this.config.enableHistory) {
      const initialTarget = this.getCurrentNavigationTarget();
      this.history = [{
        target: initialTarget,
        timestamp: Date.now(),
        scrollPosition: 0,
      }];
      this.currentIndex = 0;
    }
  }

  private setupGlobalHandlers(): void {
    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
      const target = this.getCurrentNavigationTarget();
      this.handlePopState(target, event.state);
    });

    // Save scroll position before navigation
    window.addEventListener('beforeunload', () => {
      this.saveScrollPosition();
    });
  }

  private handlePopState(target: NavigationTarget, state: unknown): void {
    const from = this.history[this.currentIndex]?.target;

    // Update current index based on history
    this.currentIndex = this.history.findIndex(item =>
      this.isSameTarget(item.target, target)
    );

    if (this.currentIndex === -1) {
      this.addToHistory(target);
    }

    this.updatePageMetadata(target);

    if (this.config.scrollRestoration) {
      this.restoreScrollPosition();
    }

    this.logger.router('PopState navigation', {
      from: from?.path,
      to: target.path,
      state
    });

    this.triggerNavigationEvent(target, from);
  }

  private getCurrentNavigationTarget(): NavigationTarget {
    return {
      path: window.location.pathname,
      query: this.parseQueryString(window.location.search),
      hash: window.location.hash.slice(1),
      state: window.history.state
    };
  }

  private normalizeNavigationTarget(target: NavigationTarget): NavigationTarget {
    return {
      path: target.path || '/',
      query: target.query || {},
      hash: target.hash || '',
      state: target.state,
      replace: target.replace
    };
  }

  private buildUrl(target: NavigationTarget): string {
    let url = target.path;

    if (target.query && Object.keys(target.query).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(target.query).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
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

  private parseQueryString(search: string): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(search);

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  private addToHistory(target: NavigationTarget): void {
    if (this.config.enableHistory) {
      this.history = this.history.slice(0, this.currentIndex + 1);

      this.history.push({
        target,
        timestamp: Date.now(),
        scrollPosition: 0,
      });

      this.currentIndex = this.history.length - 1;

      // Trim history if too long
      if (this.history.length > this.config.maxHistoryLength) {
        this.history = this.history.slice(-this.config.maxHistoryLength);
        this.currentIndex = this.history.length - 1;
      }
    }
  }

  private updateCurrentHistoryItem(target: NavigationTarget): void {
    if (this.config.enableHistory && this.history[this.currentIndex]) {
      this.history[this.currentIndex] = {
        ...this.history[this.currentIndex],
        target,
        timestamp: Date.now(),
      };
    }
  }

  private saveScrollPosition(): void {
    if (this.config.enableHistory && this.history[this.currentIndex]) {
      this.history[this.currentIndex].scrollPosition = window.pageYOffset;
    }
  }

  private restoreScrollPosition(): void {
    if (this.config.scrollRestoration && this.history[this.currentIndex]) {
      const position = this.history[this.currentIndex].scrollPosition;
      window.scrollTo(0, position);
    }
  }

  private updatePageMetadata(target: NavigationTarget): void {
    const state = target.state as { title?: string } | undefined;
    if (state?.title) {
      document.title = state.title;
    }
  }

  private triggerNavigationEvent(to: NavigationTarget, from?: NavigationTarget): void {
    try {
      const event = new CustomEvent('app:navigation', {
        detail: {
          to,
          from,
          timestamp: Date.now(),
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      this.logger.error('Failed to dispatch navigation event', { error });
    }
  }

  private isSameTarget(a: NavigationTarget, b: NavigationTarget): boolean {
    return a.path === b.path &&
      JSON.stringify(a.query) === JSON.stringify(b.query) &&
      a.hash === b.hash;
  }
}

export const navigationService: NavigationService = new NavigationServiceImpl();
