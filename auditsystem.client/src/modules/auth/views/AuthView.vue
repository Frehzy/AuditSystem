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
          <div class="auth-view__info-grid">
            <div class="info-item">
              <div class="info-icon version">
                <CodeIcon />
              </div>
              <div class="info-content">
                <div class="info-label">Версия</div>
                <div class="info-value">v{{ appVersion }}</div>
              </div>
            </div>
            <div v-if="isDevelopment" class="info-item">
              <div class="info-icon environment">
                <ServerIcon />
              </div>
              <div class="info-content">
                <div class="info-label">Окружение</div>
                <div class="info-value">{{ environment }}</div>
              </div>
            </div>
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
  import { RobotIcon, MoonIcon, SunIcon, CodeIcon, ServerIcon } from '@/assets/icons';
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
  .auth-view {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md, 1rem);
    position: relative;
    font-family: var(--font-family-sans, 'Segoe UI', system-ui, -apple-system, sans-serif);
    overflow: hidden;
    box-sizing: border-box;
    transition: background-color var(--transition-normal, 0.3s ease);
    background-color: var(--color-background, #f8fafc);
    color: var(--color-text-primary, #1e293b);
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
    background: var(--gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%));
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
    border-radius: var(--radius-full, 9999px);
    animation: float linear infinite;
    pointer-events: none;
  }

  .theme-light .auth-view__particle {
    background: color-mix(in srgb, var(--color-primary, #0ea5e9) 10%, transparent);
  }

  .theme-dark .auth-view__particle {
    background: color-mix(in srgb, var(--color-primary-light, #7dd3fc) 15%, transparent);
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
    border-radius: var(--radius-xl, 0.75rem);
    padding: var(--spacing-xl, 2rem);
    box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04));
    border: 1px solid var(--color-border-card, #f1f5f9);
    width: 100%;
    position: relative;
    overflow: hidden;
    transition: all var(--transition-normal, 0.3s ease);
    background: var(--color-surface, #ffffff);
  }

    .auth-view__card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%));
      background-size: 200% 100%;
      animation: shimmer 3s linear infinite;
    }

  .auth-view__header {
    margin-bottom: var(--spacing-lg, 1.5rem);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md, 1rem);
  }

  .auth-view__logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 1rem);
    flex: 1;
  }

  .auth-view__logo-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%));
    border-radius: var(--radius-lg, 0.5rem);
    flex-shrink: 0;
    color: white;
    box-shadow: var(--shadow-primary, 0 4px 12px rgba(14, 165, 233, 0.25));
  }

    .auth-view__logo-icon svg {
      width: 1.5rem;
      height: 1.5rem;
      color: currentColor;
    }

  .auth-view__logo-text {
    flex: 1;
  }

  .auth-view__title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold, 700);
    margin: 0 0 var(--spacing-xs, 0.25rem) 0;
    background: var(--gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }

  .auth-view__subtitle {
    font-size: 0.875rem;
    margin: 0;
    opacity: 0.8;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-secondary, #475569);
    line-height: 1.4;
  }

  .auth-view__theme-toggle {
    padding: var(--spacing-sm, 0.5rem);
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-md, 0.375rem);
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s ease);
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-primary, #1e293b);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

    .auth-view__theme-toggle:hover {
      background: var(--color-surface-hover, #f1f5f9);
      border-color: var(--color-primary-light, #7dd3fc);
      transform: scale(1.05);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

    .auth-view__theme-toggle:focus-visible {
      outline: 2px solid var(--color-primary, #0ea5e9);
      outline-offset: 2px;
    }

  .auth-view__theme-icon svg {
    width: 1.25rem;
    height: 1.25rem;
    color: currentColor;
  }

  .auth-view__status {
    margin-bottom: var(--spacing-lg, 1.5rem);
  }

  .auth-view__form {
    margin-bottom: var(--spacing-lg, 1.5rem);
  }

  .auth-view__footer {
    padding-top: var(--spacing-lg, 1.5rem);
    border-top: 1px solid var(--color-border, #e2e8f0);
  }

  .auth-view__info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md, 1rem);
  }

  @media (min-width: 480px) {
    .auth-view__info-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 0.5rem);
    padding: var(--spacing-sm, 0.5rem);
    border-radius: var(--radius-md, 0.375rem);
    transition: background-color var(--transition-fast, 0.15s ease);
  }

    .info-item:hover {
      background: var(--color-surface-hover, #f1f5f9);
    }

  .info-icon {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md, 0.375rem);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
  }

    .info-icon.version {
      background: var(--color-info, #3b82f6);
    }

    .info-icon.environment {
      background: var(--color-success, #10b981);
    }

    .info-icon svg {
      width: 1rem;
      height: 1rem;
    }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 0.25rem);
  }

  .info-label {
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-muted, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
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

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .auth-view__card {
      padding: var(--spacing-lg, 1.5rem);
    }

    .auth-view__header {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: var(--spacing-md, 1rem);
    }

    .auth-view__logo {
      flex-direction: column;
      text-align: center;
    }

    .auth-view__theme-toggle {
      align-self: center;
    }
  }

  @media (max-width: 360px) {
    .auth-view__card {
      padding: var(--spacing-md, 1rem);
    }

    .auth-view__title {
      font-size: 1.125rem;
    }

    .auth-view__subtitle {
      font-size: 0.8rem;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .auth-view__gradient {
      animation: none;
    }

    .auth-view__particle {
      animation: none;
    }

    .auth-view__card::before {
      animation: none;
    }

    .auth-view__theme-toggle:hover {
      transform: none;
    }
  }
</style>
