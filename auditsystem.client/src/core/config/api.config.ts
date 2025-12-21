/**
 * Конфигурация API endpoints
 */

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/Auth/login',
    LOGOUT: '/Auth/logout',
    VALIDATE: '/Auth/validate',
    REFRESH: '/Auth/refresh'
  },
  HEALTH: {
    BASE: '/health',
    DATABASE: '/health/db',
    QUICK: '/health/quick'
  }
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
