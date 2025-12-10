// framework/stores/types/error.types.ts

/**
 * Ошибка приложения
 */
export interface AppError {
  id: string;
  message: string;
  timestamp: Date;
  type: 'critical' | 'error' | 'warning' | 'info';
  context?: string;
  details?: unknown;
  metadata?: {
    autoResolve?: boolean;
    timeout?: number;
    category?: string;
    retryable?: boolean;
    userActionRequired?: boolean;
  };
}

/**
 * Способ разрешения ошибки
 */
export type ErrorResolution =
  | 'manual'
  | 'auto-resolved'
  | 'retry-success'
  | 'user-action';

/**
 * Фильтр для поиска ошибок
 */
export interface ErrorFilter {
  context?: string;
  type?: AppError['type'];
  startDate?: Date;
  endDate?: Date;
  resolved?: boolean;
  category?: string;
  severity?: 'high' | 'medium' | 'low';
}

/**
 * Аналитические данные об ошибках
 */
export interface ErrorInsights {
  mostCommonContext: string;
  errorRate: number;
  resolutionRate: number;
  timeToResolution?: number;
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

/**
 * Статистика по ошибкам
 */
export interface ErrorStats {
  total: number;
  unresolved: number;
  byType: Record<AppError['type'], number>;
  byContext: Record<string, number>;
  bySeverity: {
    high: number;
    medium: number;
    low: number;
  };
}
