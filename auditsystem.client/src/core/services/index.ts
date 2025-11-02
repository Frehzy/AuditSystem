// src/core/services/index.ts
// Export all services for easy importing

// API Services
export { apiClient } from './api/api-client.service';
export { apiHelper } from './api/api-helper.service';
export { apiInterceptors } from './api/api-interceptors.service';
export { httpService } from './api/http.service';

// Auth Services
export { storageService } from './auth/storage.service';
export { tokenService } from './auth/token.service';

// State Services
export { stateManager } from './state/state-manager.service';

// UI Services
export { navigationService } from './ui/navigation.service';
export { notificationService } from './ui/notification.service';
export { themeService } from './ui/theme.service';

// Utility Services
export { errorHandler } from './utils/error-handler.service';
export { formService } from './utils/form.service';

// Export types
export type * from './types';
