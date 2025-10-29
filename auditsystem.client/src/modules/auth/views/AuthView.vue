<!-- src/modules/auth/views/AuthView.vue -->
<template>
  <div class="auth-view" :class="themeClass">
    <!-- Анимированный фон -->
    <div class="auth-view__background">
      <div class="auth-view__gradient"></div>
      <div class="auth-view__particles">
        <div v-for="i in 15" :key="i" class="auth-view__particle" :style="particleStyle()"></div>
      </div>
    </div>

    <div class="auth-view__container">
      <div class="auth-view__card">
        <!-- Заголовок и переключатель темы -->
        <header class="auth-view__header">
          <div class="auth-view__logo">
            <div class="auth-view__logo-icon">
              <RobotIcon />
            </div>
            <div class="auth-view__logo-text">
              <h1 class="auth-view__title">AuditSystem Client</h1>
              <p class="auth-view__subtitle">Войдите в свою учетную запись</p>
            </div>
          </div>
          <button @click="toggleTheme" class="auth-view__theme-toggle" :title="themeButtonTitle">
            <span v-if="isDarkTheme" class="auth-view__theme-icon">
              <MoonIcon />
            </span>
            <span v-else class="auth-view__theme-icon">
              <SunIcon />
            </span>
          </button>
        </header>

        <!-- Статус сервера -->
        <ServerStatus :server-url="serverUrl"
                      :status="serverHealth.status.value"
                      :last-check="serverHealth.lastCheck.value || undefined"
                      :response-time="serverHealth.responseTime.value || undefined"
                      :show-retry="true"
                      @retry="handleRetry"
                      class="auth-view__status" />

        <!-- Форма авторизации -->
        <AuthForm :is-loading="auth.isLoading.value"
                  :general-error="auth.error.value"
                  :server-available="isServerAvailable"
                  @submit="handleLogin"
                  @forgot-password="handleForgotPassword"
                  class="auth-view__form" />

        <!-- Дополнительная информация -->
        <footer class="auth-view__footer">
          <div class="auth-view__version">
            v{{ appVersion }}
          </div>
          <div class="auth-view__environment" v-if="isDevelopment">
            {{ environment }}
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuth } from '../composables/useAuth';
  import { useServerHealth } from '../composables/useServerHealth';
  import { useAppStore } from '@/framework/stores/app.store';
  import { useToast } from '@/framework/ui/composables/useToast';
  import AuthForm from '../components/AuthForm.vue';
  import ServerStatus from '../components/ServerStatus.vue';
  import { RobotIcon, MoonIcon, SunIcon } from '@/assets/icons';
  import { APP_CONFIG } from '@/core/config/app.config';
  import { logger } from '@/core/utils/logger';

  const router = useRouter();
  const auth = useAuth();
  const toast = useToast();
  const appStore = useAppStore();
  const serverHealth = useServerHealth({
    checkInterval: APP_CONFIG.API.HEALTH_CHECK_INTERVAL,
    notifyOnStatusChange: true
  });

  const loggerContext = logger.create('AuthView');
  const serverUrl = ref(APP_CONFIG.API.BASE_URL);
  const isDevelopment = import.meta.env.DEV;

  /**
   * Текущая тема
   */
  const themeClass = computed(() => `theme-${appStore.resolvedTheme}`);
  const isDarkTheme = computed(() => appStore.isDark);

  /**
   * Заголовок кнопки переключения темы
   */
  const themeButtonTitle = computed(() =>
    isDarkTheme.value ? 'Переключить на светлую тему' : 'Переключить на темную тему'
  );

  /**
   * Переключение темы
   */
  const toggleTheme = (): void => {
    appStore.toggleTheme();
    loggerContext.info('Theme toggled', { theme: appStore.currentTheme });
  };

  /**
   * Доступность сервера
   */
  const isServerAvailable = computed(() => {
    return serverHealth.isOnline.value && serverHealth.isInitialized.value;
  });

  /**
   * Версия приложения
   */
  const appVersion = computed(() => {
    return APP_CONFIG.APP.VERSION;
  });

  /**
   * Окружение
   */
  const environment = computed(() => {
    return import.meta.env.MODE || 'development';
  });

  /**
   * Стили для частиц фона
   */
  const particleStyle = () => {
    const size = Math.random() * 3 + 1;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 5;

    return {
      width: `${size}px`,
      height: `${size}px`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    };
  };

  /**
   * Обработка авторизации
   */
  const handleLogin = async (credentials: { username: string; password: string }): Promise<void> => {
    if (auth.isLoading.value || !isServerAvailable.value) return;

    loggerContext.info('Login attempt', { username: credentials.username });

    const success = await auth.login(credentials);

    if (success) {
      // Показываем уведомление об успешном входе через toast
      toast.success('Вход выполнен успешно!');

      loggerContext.info('Login successful, redirecting to audit');

      // Даем время для обновления состояния стора и computed свойств
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100)); // Небольшая задержка

      // Явная проверка статуса аутентификации перед переходом
      if (auth.isAuthenticated.value) {
        loggerContext.info('Authentication confirmed, redirecting to audit');
        // Используем replace чтобы избежать навигации назад к login
        await router.replace('/audit');
      } else {
        loggerContext.error('Authentication state not updated after login', {
          token: !!auth.token.value,
          user: !!auth.user.value,
          isAuthenticated: auth.isAuthenticated.value
        });
        toast.error('Ошибка аутентификации');
      }
    } else {
      loggerContext.error('Login failed', { error: auth.error.value });
    }
  };
  /**
   * Ручная проверка сервера
   */
  const handleRetry = async (): Promise<void> => {
    await serverHealth.manualCheck();
  };

  /**
   * Обработка "Забыли пароль"
   */
  const handleForgotPassword = (): void => {
    toast.info('Функция восстановления пароля в разработке');
    loggerContext.info('Forgot password flow requested');
  };

  /**
   * Инициализация
   */
  onMounted(async () => {
    loggerContext.info('AuthView mounted');

    // Перенаправление если уже авторизован
    if (auth.isAuthenticated.value) {
      loggerContext.info('User already authenticated, redirecting to audit');

      // Начальная проверка сервера и запуск периодических проверок
      try {
        await serverHealth.checkServerConnection();
        serverHealth.startPeriodicChecks();
        loggerContext.info('Server health checks started');
      } catch (error) {
        loggerContext.error('Failed to initialize server health checks', { error });
      }

      // Небольшая задержка для лучшего UX
      await nextTick();
      await router.replace('/audit');
      return;
    }

    // Начальная проверка сервера и запуск периодических проверок
    try {
      await serverHealth.checkServerConnection();
      serverHealth.startPeriodicChecks();
      loggerContext.info('Server health checks started');
    } catch (error) {
      loggerContext.error('Failed to initialize server health checks', { error });
    }
  });

  /**
   * Очистка
   */
  onUnmounted(() => {
    serverHealth.stopPeriodicChecks();
    loggerContext.info('AuthView unmounted');
  });
</script>

<style scoped>
  /* Стили остаются без изменений */
  .auth-view {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    position: relative;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    overflow: hidden;
    box-sizing: border-box;
    transition: background-color var(--transition-normal);
    background-color: var(--color-background);
    color: var(--color-text-primary);
  }

  .auth-view__background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }

  .auth-view__gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient-primary);
    background-size: 400% 400%;
    animation: gradientShift 15s ease infinite;
    opacity: 0.03;
  }

  .theme-dark .auth-view__gradient {
    opacity: 0.05;
  }

  .auth-view__particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .auth-view__particle {
    position: absolute;
    border-radius: 50%;
    animation: float linear infinite;
    pointer-events: none;
  }

  .theme-light .auth-view__particle {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  .theme-dark .auth-view__particle {
    background: color-mix(in srgb, var(--color-primary-light) 15%, transparent);
  }

  .auth-view__container {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: min(420px, 95vw);
    margin: 0 auto;
  }

  .auth-view__card {
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--color-border-card);
    width: 100%;
    position: relative;
    overflow: hidden;
    transition: all var(--transition-normal);
    background: var(--color-surface);
  }

    .auth-view__card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--gradient-primary);
      background-size: 200% 100%;
      animation: shimmer 3s linear infinite;
    }

  .auth-view__header {
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .auth-view__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .auth-view__logo-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary);
    border-radius: 12px;
    flex-shrink: 0;
    color: white;
    box-shadow: var(--shadow-primary);
  }

    .auth-view__logo-icon svg {
      width: 24px;
      height: 24px;
      color: currentColor;
    }

  .auth-view__logo-text {
    flex: 1;
  }

  .auth-view__title {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 2px 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .auth-view__subtitle {
    font-size: 13px;
    margin: 0;
    opacity: 0.8;
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .auth-view__theme-toggle {
    padding: 8px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--transition-normal);
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-primary);
    box-shadow: var(--shadow-sm);
  }

    .auth-view__theme-toggle:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-primary-light);
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }

  .auth-view__theme-icon svg {
    width: 16px;
    height: 16px;
    color: currentColor;
  }

  .auth-view__status {
    margin-bottom: 20px;
  }

  .auth-view__form {
    margin-bottom: 16px;
  }

  .auth-view__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .auth-view__version {
    font-size: 11px;
    opacity: 0.7;
    font-weight: 500;
    color: var(--color-text-muted);
  }

  .auth-view__environment {
    font-size: 11px;
    opacity: 0.7;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-text-muted);
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes float {
    0% {
      transform: translateY(100vh) translateX(0) rotate(0deg);
      opacity: 0;
    }

    10% {
      opacity: 1;
    }

    90% {
      opacity: 1;
    }

    100% {
      transform: translateY(-100px) translateX(100px) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }

    100% {
      background-position: 200% 0;
    }
  }
</style>
