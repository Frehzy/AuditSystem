/**
 * Типы для activity store
 */

export interface ActivityEvent {
  type: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface InactivityConfig {
  warningThreshold: number;    // мс до предупреждения
  logoutThreshold: number;     // мс до выхода
  checkInterval: number;       // интервал проверки в мс
}

export interface ActivityStats {
  totalEvents: number;
  eventTypes: Record<string, number>;
  lastEvent?: ActivityEvent;
  sessionStart: Date;
  sessionDuration: number;
}
