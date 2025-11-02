// src/core/services/ui/theme.service.ts
import { logger } from '@/core/utils/logger';
import { storageService } from '../auth/storage.service';
import type {
  ThemeService,
  Theme
} from '@/core/types';

/**
 * Production-ready theme service with system preference detection and persistence
 */
class ThemeServiceImpl implements ThemeService {
  private readonly logger = logger.create('ThemeService');
  private currentTheme: Theme = 'auto';
  private subscribers: Set<(theme: Theme) => void> = new Set();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.logger.debug('ThemeService initialized');
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getResolvedTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'auto') {
      return this.getSystemTheme();
    }
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    try {
      this.validateTheme(theme);

      const previousTheme = this.currentTheme;
      this.currentTheme = theme;

      storageService.setTheme(theme);
      this.applyThemeToDOM();
      this.notifySubscribers();

      this.logger.debug('Theme changed', {
        from: previousTheme,
        to: theme,
        resolved: this.getResolvedTheme()
      });
    } catch (error) {
      this.logger.error('Failed to set theme', {
        theme,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  toggleTheme(): Theme {
    const newTheme = this.getNextTheme();
    this.setTheme(newTheme);
    return newTheme;
  }

  initialize(): void {
    try {
      const storedTheme = storageService.getTheme();

      if (storedTheme && this.isValidTheme(storedTheme)) {
        this.currentTheme = storedTheme;
      } else {
        this.currentTheme = 'auto';
      }

      this.setupMediaQueryListener();
      this.applyThemeToDOM();

      this.logger.debug('ThemeService initialized successfully', {
        theme: this.currentTheme,
        resolved: this.getResolvedTheme()
      });
    } catch (error) {
      this.logger.error('Failed to initialize ThemeService', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      this.currentTheme = 'auto';
      this.applyThemeToDOM();
    }
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    try {
      this.subscribers.add(listener);

      this.logger.debug('Theme subscriber added', {
        totalSubscribers: this.subscribers.size
      });

      return () => {
        this.subscribers.delete(listener);
        this.logger.debug('Theme subscriber removed');
      };
    } catch (error) {
      this.logger.error('Failed to subscribe to theme changes', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return () => { };
    }
  }

  isDark(): boolean {
    return this.getResolvedTheme() === 'dark';
  }

  isLight(): boolean {
    return this.getResolvedTheme() === 'light';
  }

  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }

    this.subscribers.clear();
    this.logger.debug('ThemeService destroyed');
  }

  getThemeInfo(): {
    current: Theme;
    resolved: 'light' | 'dark';
    system: 'light' | 'dark';
    isAuto: boolean;
  } {
    return {
      current: this.currentTheme,
      resolved: this.getResolvedTheme(),
      system: this.getSystemTheme(),
      isAuto: this.currentTheme === 'auto'
    };
  }

  private getNextTheme(): Theme {
    const themes: Theme[] = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    return themes[nextIndex];
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyThemeToDOM(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const resolvedTheme = this.getResolvedTheme();
    const html = document.documentElement;

    html.classList.remove('theme-light', 'theme-dark');
    html.classList.add(`theme-${resolvedTheme}`);

    html.setAttribute('data-theme', resolvedTheme);
    html.style.colorScheme = resolvedTheme;

    this.logger.debug('Theme applied to DOM', {
      theme: resolvedTheme,
      className: `theme-${resolvedTheme}`
    });
  }

  private setupMediaQueryListener(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);

    this.logger.debug('System theme media query listener setup');
  }

  private handleSystemThemeChange = (event: MediaQueryListEvent): void => {
    if (this.currentTheme === 'auto') {
      this.logger.debug('System theme changed', {
        isDark: event.matches,
        resolvedTheme: this.getResolvedTheme()
      });

      this.applyThemeToDOM();
      this.notifySubscribers();
    }
  };

  private notifySubscribers(): void {
    this.subscribers.forEach(listener => {
      try {
        listener(this.currentTheme);
      } catch (error) {
        this.logger.error('Theme subscriber callback failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });
  }

  private validateTheme(theme: unknown): theme is Theme {
    if (!this.isValidTheme(theme)) {
      throw new Error(`Invalid theme: ${theme}. Must be one of: light, dark, auto`);
    }
    return true;
  }

  private isValidTheme(theme: unknown): theme is Theme {
    return typeof theme === 'string' && ['light', 'dark', 'auto'].includes(theme);
  }
}

// Export singleton instance
export const themeService: ThemeService = new ThemeServiceImpl();

// Export class for testing
export { ThemeServiceImpl };
