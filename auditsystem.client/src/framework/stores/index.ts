/**
 * Экспорт всех stores
 */

// Core stores
export { useAppStore } from './core/app/app.store';
export { useThemeStore } from './core/theme/theme.store';
export { useErrorStore } from './core/error/error.store';
export { useActivityStore } from './core/activity/activity.store';
export { useAuthStore } from './core/auth/auth.store';

// Module stores
export { useAuditStore } from './modules/audit/audit.store';
export { useMonitoringStore } from './modules/monitoring/monitoring.store';

// Plugins
export { persistencePlugin } from './plugins/persistence.plugin';
export { loggingPlugin } from './plugins/logging.plugin';
export { healthPlugin } from './plugins/health.plugin';

// Utils
export { storeHealthMonitor } from './utils/store.health';
export { storePersistence } from './utils/store.persistence';
export { storeMiddleware } from './utils/store.middleware';

// Helper для получения всех stores
import { useAppStore } from './core/app/app.store';
import { useThemeStore } from './core/theme/theme.store';
import { useErrorStore } from './core/error/error.store';
import { useActivityStore } from './core/activity/activity.store';
import { useAuthStore } from './core/auth/auth.store';
import { useAuditStore } from './modules/audit/audit.store';
import { useMonitoringStore } from './modules/monitoring/monitoring.store';

export const useStores = () => ({
  app: useAppStore(),
  theme: useThemeStore(),
  error: useErrorStore(),
  activity: useActivityStore(),
  auth: useAuthStore(),
  audit: useAuditStore(),
  monitoring: useMonitoringStore()
});

export type Stores = ReturnType<typeof useStores>;
