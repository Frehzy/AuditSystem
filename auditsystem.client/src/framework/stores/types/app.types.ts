// framework/stores/types/app.types.ts

import type { UserDto } from '@/modules/auth/api/auth.types';
import type { Theme } from '@/core/types';
import type { AppError } from './error.types';

/**
 * Состояние аутентификации
 */
export interface AuthState {
  token: string | null;
  user: UserDto | null;
  loading: boolean;
  error: string | null;
}

/**
 * Состояние темы
 */
export interface ThemeState {
  current: Theme;
  preference: Theme;
  resolved: Theme;
}

/**
 * Общее состояние приложения
 */
export interface AppState {
  isOnline: boolean;
  isLoading: boolean;
  serverHealth: boolean;
  lastActivity: number;
}

/**
 * Снимок состояния всех сторов для отладки
 */
export interface StoreSnapshot {
  auth: {
    token: string | null;
    user: UserDto | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
  theme: {
    current: Theme;
    preference: Theme;
    resolved: Theme;
  };
  app: {
    isOnline: boolean;
    isLoading: boolean;
    serverHealth: boolean;
    lastActivity: number;
  };
  errors: {
    count: number;
    latest: AppError | undefined;
  };
}

/**
 * Метаданные для логирования действий стора
 */
export interface StoreActionMetadata {
  component?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
}

/**
 * Конфигурация для инициализации сторов
 */
export interface StoreConfig {
  persistence?: boolean;
  logging?: boolean;
  healthChecks?: boolean;
  autoCleanup?: boolean;
}
