/**
 * Типы для theme store
 */

import type { Theme } from '@/core/types/common.types';

export interface ThemeState {
  current: Theme;
  preference: Theme;
  system: 'light' | 'dark';
}

export interface ThemeStore extends ThemeState {
  resolved: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
  isAuto: boolean;
  initialize: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => 'light' | 'dark';
  reset: () => void;
}
