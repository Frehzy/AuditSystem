// framework/stores/types/middleware.types.ts

/**
 * Настройки для конкретного стора
 */
export interface StoreSpecificConfig {
  logging?: boolean;
  performanceTracking?: boolean;
}

/**
 * Запись в логе действий
 */
export interface StoreActionLog {
  store: string;
  action: string;
  args: unknown[];
  timestamp: number;
  duration?: number;
  success?: boolean;
  error?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Метрики производительности
 */
export interface PerformanceMetrics {
  totalActions: number;
  successRate: number;
  averageDuration: number;
  slowestActions: StoreActionLog[];
  errorRate: number;
  byStore: Record<string, {
    count: number;
    avgDuration: number;
    errorCount: number;
  }>;
}

/**
 * Конфигурация middleware
 */
export interface MiddlewareConfig {
  maxLogs: number;
  logErrors: boolean;
  logSuccess: boolean;
  performanceTracking: boolean;
  storeSpecific: Record<string, StoreSpecificConfig | boolean>;
}
