/**
 * Composable для работы с авторизацией
 */

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/framework/stores';
import { notificationService } from '@/core/services/notification/notification.service';
import { authService } from '../services';
import { logger } from '@/core/services/logger/logger.service';
import type { LoginRequest } from '../api/types';

export const useAuth = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const loggerContext = logger.create('useAuth');

  // Локальное состояние
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Вычисляемые свойства
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const userRole = computed(() => authStore.user?.role);
  const userName = computed(() => authStore.user?.username || authStore.user?.fullName);

  // Методы
  const login = async (credentials: LoginRequest) => {
    if (isLoading.value) {
      loggerContext.warn('Вход уже выполняется');
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await authStore.login(credentials);

      if (result) {
        notificationService.success('Вход выполнен успешно');
        return true;
      } else {
        error.value = authStore.error;
        return false;
      }
    } catch (err: any) {
      error.value = err.message || 'Ошибка при входе в систему';
      loggerContext.error('Ошибка входа', { error: err.message });
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    loggerContext.info('Инициирован выход из системы');

    try {
      await authStore.logout();
      notificationService.info('Вы вышли из системы');

      // Перенаправляем на страницу входа
      await router.push('/login');
    } catch (err) {
      loggerContext.error('Ошибка выхода', { error: err });
      notificationService.error('Ошибка при выходе из системы');
    }
  };

  const validateToken = async (): Promise<boolean> => {
    const token = authStore.token;
    if (!token) return false;

    const isValid = await authService.validateToken(token);

    if (!isValid) {
      loggerContext.warn('Токен недействителен, очистка данных аутентификации');
      authStore.clearAuthData();
      notificationService.warning('Сессия истекла. Пожалуйста, войдите снова.');
    }

    return isValid;
  };

  const clearError = () => {
    error.value = null;
    authStore.setError(null);
  };

  // Прокси методов из store
  const hasRole = (role: string) => authStore.hasRole(role);
  const hasAnyRole = (roles: string[]) => authStore.hasAnyRole(roles);
  const hasPermission = (permission: string) => authStore.hasPermission(permission);

  return {
    // Состояние
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    user,
    isAuthenticated,
    userRole,
    userName,

    // Методы
    login,
    logout,
    validateToken,
    clearError,
    hasRole,
    hasAnyRole,
    hasPermission
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;
