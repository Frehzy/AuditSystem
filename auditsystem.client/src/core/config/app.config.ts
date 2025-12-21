/**
 * Конфигурация приложения
 */

interface AppConfig {
  APP: {
    NAME: string;
    VERSION: string;
    ENV: 'development' | 'production' | 'test';
    BASE_URL: string;
  };
  API: {
    BASE_URL: string;
    TIMEOUT: number;
    HEALTH_CHECK_INTERVAL: number;
    MAX_RETRIES: number;
    RETRY_DELAY: number;
  };
  AUTH: {
    TOKEN_KEY: string;
    USER_KEY: string;
    REFRESH_TOKEN_KEY: string;
    TOKEN_REFRESH_THRESHOLD: number; // 5 минут до истечения
    SESSION_TIMEOUT: number; // 24 часа
  };
  NOTIFICATION: {
    DEFAULT_DURATION: number;
    MAX_VISIBLE: number;
    POSITION: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
  FEATURES: {
    HEALTH_CHECKS: boolean;
    AUTO_RETRY: boolean;
    OFFLINE_MODE: boolean;
    DEBUG_LOGS: boolean;
  };
}

export const APP_CONFIG: AppConfig = {
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || 'AuditSystem Client',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ENV: (import.meta.env.MODE as 'development' | 'production' | 'test') || 'development',
    BASE_URL: import.meta.env.BASE_URL || '/'
  },
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7282/api',
    TIMEOUT: 10000,
    HEALTH_CHECK_INTERVAL: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000
  },
  AUTH: {
    TOKEN_KEY: 'auditsystem_token',
    USER_KEY: 'auditsystem_user',
    REFRESH_TOKEN_KEY: 'auditsystem_refresh_token',
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 минут
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 часа
  },
  NOTIFICATION: {
    DEFAULT_DURATION: 5000,
    MAX_VISIBLE: 5,
    POSITION: 'top-right'
  },
  FEATURES: {
    HEALTH_CHECKS: true,
    AUTO_RETRY: true,
    OFFLINE_MODE: false,
    DEBUG_LOGS: import.meta.env.DEV
  }
} as const;

// Экспортируем только тип, если нужен
export type { AppConfig };
