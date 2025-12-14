// src/modules/auth/composables/use-auth.ts
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '@/framework/ui/composables/useToast';
import { authService } from '../services';
import { tokenService } from '../services';
import { logger } from '@/core/utils/logger';
import type { LoginRequest, UserDto } from '../types';

export const useAuth = () => {
  const router = useRouter();
  const toast = useToast();
  const loggerContext = logger.create('useAuth');

  // Реактивное состояние
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const user = ref<UserDto | null>(tokenService.getUser());
  const token = ref<string | null>(tokenService.getToken());

  // Вычисляемые свойства
  const isAuthenticated = computed(() => {
    const hasToken = !!token.value;
    const hasUser = !!user.value;

    if (!hasToken || !hasUser) return false;

    // В режиме разработки не проверяем срок действия токена
    if (import.meta.env.DEV) return true;

    try {
      return !tokenService.isTokenExpired(token.value!);
    } catch {
      return false;
    }
  });

  const userRole = computed(() => user.value?.role);
  const userName = computed(() => user.value?.username || user.value?.fullName);

  // Методы
  const login = async (credentials: LoginRequest) => {
    if (isLoading.value) {
      loggerContext.warn('Login already in progress');
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.login(credentials);

      // Сохраняем данные
      tokenService.setToken(response.token);
      if (response.refreshToken) {
        tokenService.setRefreshToken(response.refreshToken);
      }
      tokenService.setUser(response.user);

      // Обновляем реактивное состояние
      token.value = response.token;
      user.value = response.user;

      loggerContext.info('Login successful', { userId: response.user.id });

      return true;
    } catch (err: any) {
      error.value = err.message || 'Ошибка при входе в систему';
      loggerContext.error('Login failed', { error: err.message });
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    loggerContext.info('Logout initiated');

    try {
      if (user.value && token.value) {
        await authService.logout(user.value.id, token.value);
      }
    } catch (err) {
      loggerContext.warn('Logout API call failed', { error: err });
    } finally {
      // Всегда очищаем данные
      clearAuth();

      // Перенаправляем на страницу входа
      await router.push('/login');

      toast.info('Вы вышли из системы');
    }
  };

  const clearAuth = () => {
    tokenService.clear();
    token.value = null;
    user.value = null;
    error.value = null;
    loggerContext.info('Auth data cleared');
  };

  const validateToken = async (): Promise<boolean> => {
    if (!token.value) return false;

    const isValid = await authService.validateToken(token.value);

    if (!isValid) {
      loggerContext.warn('Token is invalid, clearing auth data');
      clearAuth();
    }

    return isValid;
  };

  const updateUserProfile = (userData: Partial<UserDto>) => {
    if (user.value) {
      user.value = { ...user.value, ...userData };
      tokenService.setUser(user.value);
      loggerContext.info('User profile updated', { userId: user.value.id });
    }
  };

  const clearError = () => {
    error.value = null;
  };

  // Проверки ролей и разрешений
  const hasRole = (role: string) => {
    return user.value ? authService.hasRole(user.value, role) : false;
  };

  const hasAnyRole = (roles: string[]) => {
    return user.value ? authService.hasAnyRole(user.value, roles) : false;
  };

  const hasPermission = (permission: string) => {
    return user.value ? authService.hasPermission(user.value, permission) : false;
  };

  // Информация о токене
  const getTokenRemainingTime = () => {
    if (!token.value) return 0;
    return tokenService.getTokenRemainingTime(token.value);
  };

  const shouldRefreshToken = computed(() => {
    if (!token.value) return false;
    return tokenService.shouldRefresh(token.value);
  });

  return {
    // Состояние
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    user,
    token,
    isAuthenticated,
    userRole,
    userName,

    // Методы
    login,
    logout,
    validateToken,
    clearAuth,
    updateUserProfile,
    clearError,
    hasRole,
    hasAnyRole,
    hasPermission,
    getTokenRemainingTime,
    shouldRefreshToken,
  };
};

export type UseAuthReturn = ReturnType<typeof useAuth>;
