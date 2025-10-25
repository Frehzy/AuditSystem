import { logger } from '@/core/utils/logger';
import { storageService } from '../auth/storage.service';
import type { Theme, ThemeService } from '@/core/types';

class ThemeServiceImpl implements ThemeService {
  private readonly logger = logger.create('ThemeService');
  private currentTheme: Theme = 'auto';
  private listeners: Array<(theme: Theme) => void> = [];
  private mediaQuery: MediaQueryList | null = null;

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  getResolvedTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyTheme();
    storageService.setTheme(theme);
    this.notifyListeners();
    this.logger.info('Theme set to:', theme);
  }

  toggleTheme(): Theme {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }

  initialize(): void {
    // Загрузка темы из хранилища
    const storedTheme = storageService.getTheme();
    if (storedTheme) {
      this.currentTheme = storedTheme;
    }

    this.applyTheme();
    this.setupSystemPreferenceListener();
    this.logger.info('Theme service initialized', { theme: this.currentTheme });
  }

  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
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

  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    }
    this.listeners = [];
    this.logger.info('Theme service destroyed');
  }

  private applyTheme(): void {
    const resolvedTheme = this.getResolvedTheme();
    document.documentElement.className = `theme-${resolvedTheme}`;
    this.logger.debug('Theme applied:', resolvedTheme);
  }

  private setupSystemPreferenceListener(): void {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
  }

  private handleSystemThemeChange = (): void => {
    if (this.currentTheme === 'auto') {
      this.applyTheme();
      this.notifyListeners();
      this.logger.debug('System theme changed, applied auto theme');
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentTheme);
      } catch (error) {
        this.logger.error('Error in theme listener', { error });
      }
    });
  }
}

export const themeService: ThemeService = new ThemeServiceImpl();
