import { logger } from '@/core/utils/logger/logger';
import { browserStorage } from '../storage/browser-storage.service';
import type { ThemeService, Theme } from '../types';

interface ThemeConfig {
  enableTransition: boolean;
  storageKey: string;
  defaultTheme: Theme;
  respectSystemPreference: boolean;
}

class ThemeServiceImpl implements ThemeService {
  private readonly logger = logger.create('ThemeService');
  private readonly mediaQuery: MediaQueryList;
  private currentTheme: Theme = 'auto';
  private listeners: ((theme: Theme) => void)[] = [];
  private systemPreferenceCleanup: (() => void) | null = null;
  private transitionCleanup: (() => void) | null = null;

  private config: ThemeConfig = {
    enableTransition: true,
    storageKey: 'app-theme',
    defaultTheme: 'auto',
    respectSystemPreference: true,
  };

  constructor(config?: Partial<ThemeConfig>) {
    this.config = { ...this.config, ...config };
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    this.initialize();
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getResolvedTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'auto') {
      return this.mediaQuery.matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    if (!this.isValidTheme(theme)) {
      this.logger.warn('Attempted to set invalid theme', { theme });
      return;
    }

    if (this.currentTheme === theme) {
      return;
    }

    const previousTheme = this.currentTheme;
    this.currentTheme = theme;

    this.applyTheme(theme, previousTheme);
    this.saveThemePreference(theme);
    this.notifyListeners();

    this.logger.info('Theme changed', {
      from: previousTheme,
      to: theme,
      resolved: this.getResolvedTheme()
    });
  }

  toggleTheme(): void {
    const resolved = this.getResolvedTheme();
    const newTheme = resolved === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  initialize(): void {
    const savedTheme = browserStorage.get<Theme>(this.config.storageKey);

    if (savedTheme && this.isValidTheme(savedTheme)) {
      this.setTheme(savedTheme);
      this.logger.info('Theme loaded from storage', { theme: savedTheme });
    } else {
      this.setTheme(this.config.defaultTheme);
      this.logger.info('Theme set to default', {
        theme: this.config.defaultTheme,
        systemPreference: this.mediaQuery.matches ? 'dark' : 'light'
      });
    }

    this.setupSystemPreferenceListener();
    this.setupTransitionHandler();
  }

  setupSystemPreferenceListener(): () => void {
    if (this.systemPreferenceCleanup) {
      this.systemPreferenceCleanup();
    }

    const handleSystemPreferenceChange = (e: MediaQueryListEvent) => {
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
        this.notifyListeners();
        this.logger.debug('Theme updated from system preference', {
          systemTheme: e.matches ? 'dark' : 'light',
          resolved: this.getResolvedTheme()
        });
      }
    };

    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', handleSystemPreferenceChange);
    } else {
      this.mediaQuery.addListener(handleSystemPreferenceChange);
    }

    this.systemPreferenceCleanup = () => {
      if (this.mediaQuery.removeEventListener) {
        this.mediaQuery.removeEventListener('change', handleSystemPreferenceChange);
      } else {
        this.mediaQuery.removeListener(handleSystemPreferenceChange);
      }
      this.systemPreferenceCleanup = null;
    };

    return this.systemPreferenceCleanup;
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);

    listener(this.currentTheme);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  isDark(): boolean {
    return this.getResolvedTheme() === 'dark';
  }

  isLight(): boolean {
    return this.getResolvedTheme() === 'light';
  }

  getThemeConfig(): ThemeConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.enableTransition !== undefined) {
      this.setupTransitionHandler();
    }

    this.logger.debug('Theme config updated', { config: this.config });
  }

  private isValidTheme(theme: string): theme is Theme {
    return theme === 'light' || theme === 'dark' || theme === 'auto';
  }

  private applyTheme(theme: Theme, previousTheme?: Theme): void {
    const html = document.documentElement;
    const resolvedTheme = this.getResolvedTheme();

    // Enable transitions for theme change
    if (this.config.enableTransition && previousTheme) {
      this.enableTransitions();
    }

    // Remove all theme classes
    html.classList.remove('theme-light', 'theme-dark', 'theme-auto');

    // Add current theme class
    html.classList.add(`theme-${theme}`);

    // Set data attributes for CSS
    html.setAttribute('data-theme', theme);
    html.setAttribute('data-resolved-theme', resolvedTheme);

    // Update CSS custom properties
    this.updateCSSVariables(resolvedTheme);

    // Update meta theme-color for mobile browsers
    this.updateThemeColor(resolvedTheme);
  }

  private updateCSSVariables(theme: 'light' | 'dark'): void {
    const root = document.documentElement;

    // Можно добавить динамическое обновление CSS переменных здесь
    // Например, на основе конфигурации темы
    root.style.setProperty('--theme-resolved', theme);
  }

  private updateThemeColor(theme: 'light' | 'dark'): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Можно настроить цвета для разных тем
      const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }

  private setupTransitionHandler(): void {
    if (this.transitionCleanup) {
      this.transitionCleanup();
    }

    if (!this.config.enableTransition) {
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      * {
        transition: none !important;
      }
      
      .theme-transition * {
        transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
      }
    `;
    document.head.appendChild(style);

    this.transitionCleanup = () => {
      style.remove();
    };
  }

  private enableTransitions(): void {
    const html = document.documentElement;
    html.classList.add('theme-transition');

    setTimeout(() => {
      html.classList.remove('theme-transition');
    }, 300);
  }

  private saveThemePreference(theme: Theme): void {
    if (theme !== 'auto' || !this.config.respectSystemPreference) {
      browserStorage.set(this.config.storageKey, theme);
    } else {
      browserStorage.remove(this.config.storageKey);
    }
  }

  private notifyListeners(): void {
    const currentTheme = this.currentTheme;
    this.listeners.forEach(listener => {
      try {
        listener(currentTheme);
      } catch (error) {
        this.logger.error('Error in theme listener:', error);
      }
    });
  }

  destroy(): void {
    if (this.systemPreferenceCleanup) {
      this.systemPreferenceCleanup();
    }
    if (this.transitionCleanup) {
      this.transitionCleanup();
    }
    this.listeners = [];
    this.logger.info('Theme service destroyed');
  }
}

export const themeService: ThemeService = new ThemeServiceImpl();
