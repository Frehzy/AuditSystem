// framework/stores/types/health.types.ts

/**
 * Результат проверки здоровья стора
 */
export interface StoreHealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
  lastChecked: number;
  metrics?: Record<string, unknown>;
  dependencies?: string[];
}

/**
 * Метрики производительности
 */
export interface HealthMetrics {
  memoryUsage: number;
  storeSize: number;
  updateFrequency: number;
  responseTime: number;
  errorRate: number;
}

/**
 * Отчет о здоровье системы
 */
export interface HealthReport {
  timestamp: number;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  checks: StoreHealthCheck[];
  recommendations?: string[];
  uptime: number;
}
