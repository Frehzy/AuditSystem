// framework/stores/types/activity.types.ts

/**
 * Активность пользователя
 */
export interface UserActivity {
  lastActivity: number;
  sessionStart: number;
  totalActivityTime: number;
  events: ActivityEvent[];
}

/**
 * Событие активности
 */
export interface ActivityEvent {
  type: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

/**
 * Конфигурация таймеров неактивности
 */
export interface InactivityConfig {
  warningThreshold: number; // время до предупреждения (мс)
  logoutThreshold: number; // время до выхода (мс)
  checkInterval: number; // интервал проверки (мс)
}
