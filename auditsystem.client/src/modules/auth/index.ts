/**
 * Public API модуля авторизации
 */

// Экспорт компонентов
export { default as AuthForm } from './components/auth-form/AuthForm.vue';
export { default as AuthFormField } from './components/auth-form/AuthFormField.vue';
export { default as AuthFormLoading } from './components/auth-form/AuthFormLoading.vue';
export { default as ServerStatus } from './components/server-status/ServerStatus.vue';
export { default as StatusIndicator } from './components/server-status/StatusIndicator.vue';

// Экспорт composables
export { useAuth } from './composables/use-auth';
export { useAuthValidation } from './composables/use-auth-validation';
export { useServerHealth } from './composables/use-server-health';

// Экспорт сервисов
export { authService } from './services/auth.service';
export { healthService } from './services/health.service';
export { tokenService } from './services/token.service';

// Экспорт API
export * from './api';

// Экспорт представлений
export { default as AuthView } from './views/AuthView.vue';
