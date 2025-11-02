// src/core/config/app.config.ts
interface ApiConfig {
  BASE_URL: string;
  TIMEOUT: number;
  HEALTH_CHECK_INTERVAL: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
}

interface AuthConfig {
  TOKEN_KEY: string;
  USER_KEY: string;
  TOKEN_REFRESH_INTERVAL: number;
  SESSION_TIMEOUT: number;
}

interface FeaturesConfig {
  HEALTH_CHECKS: boolean;
  AUTO_RETRY: boolean;
  OFFLINE_MODE: boolean;
  DEBUG_LOGS: boolean;
}

interface AppConfig {
  APP: {
    NAME: string;
    VERSION: string;
    ENV: string;
  };
  API: ApiConfig;
  AUTH: AuthConfig;
  FEATURES: FeaturesConfig;
}

export const APP_CONFIG: AppConfig = {
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || 'AuditSystem Client',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ENV: import.meta.env.MODE || 'development',
  },
  API: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7282',
    TIMEOUT: 10000,
    HEALTH_CHECK_INTERVAL: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
  AUTH: {
    TOKEN_KEY: 'auditsystem_token',
    USER_KEY: 'auditsystem_user',
    TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000,
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
  },
  FEATURES: {
    HEALTH_CHECKS: true,
    AUTO_RETRY: true,
    OFFLINE_MODE: false,
    DEBUG_LOGS: import.meta.env.DEV
  },
} as const;

export type { AppConfig, ApiConfig, AuthConfig, FeaturesConfig };
