/**
 * Типы для error store
 */

export type ErrorType = 'critical' | 'error' | 'warning' | 'info';
export type ErrorSeverity = 'high' | 'medium' | 'low';
export type ErrorResolution = 'manual' | 'auto-resolved' | 'retry-success' | 'user-action';

export interface AppError {
  id: string;
  message: string;
  timestamp: Date;
  type: ErrorType;
  context?: string;
  details?: unknown;
  metadata?: {
    autoResolve?: boolean;
    timeout?: number;
    category?: string;
    retryable?: boolean;
    userActionRequired?: boolean;
    source?: string;
  };
}

export interface ErrorFilter {
  context?: string;
  type?: ErrorType;
  startDate?: Date;
  endDate?: Date;
  resolved?: boolean;
  category?: string;
  severity?: ErrorSeverity;
}

export interface ErrorStats {
  total: number;
  unresolved: number;
  byType: Record<ErrorType, number>;
  byContext: Record<string, number>;
  bySeverity: Record<ErrorSeverity, number>;
}

export interface ErrorInsights {
  mostCommonContext: string;
  errorRate: number;
  resolutionRate: number;
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}
