// Core services re-export
export { apiClient } from './api/api-client.service';
export { errorHandler } from './error/error-handler.service';
export { formService } from './form/form.service';
export { navigationService } from './navigation/navigation.service';
export { notificationService } from './notification/notification.service';
export { stateManager } from './state/state-manager.service';
export { themeService } from './theme/theme.service';

// Storage services
export { storage } from './storage/storage.service';
export { browserStorage } from './storage/browser-storage.service';

// Auth services
export { tokenService } from './auth/token.service';

// HTTP service
export { httpService } from './http/http.service';

// Types
export type {
  // API
  ApiClient,
  ApiRequestOptions,
  ApiResponse,

  // Error Handling
  ErrorHandler,
  AppError,

  // Form
  FormService,
  ValidationRule,
  FieldValidation,
  FormValidation,

  // Navigation
  NavigationService,
  NavigationTarget,
  NavigationGuard,

  // Notifications
  NotificationService,
  Notification,
  NotificationType,

  // Theme
  ThemeService,
  Theme,

  // State
  StateManager,
  StateUpdate,

  // Storage
  StorageService,
  StorageType,
  StorageOptions,

  // Token
  TokenService,
  TokenPayload,

  // HTTP
  HttpService,
  HttpRequestConfig,
  HttpResponse
} from './types';
