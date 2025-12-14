<!-- src/modules/auth/views/AuthView.vue -->
<template>
  <div :class="['auth-view', themeClass]">
    <div class="auth-view__background">
      <div class="auth-view__gradient"></div>
      <div class="auth-view__particles">
        <div v-for="i in 20" :key="i" class="auth-view__particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <div class="auth-view__container">
      <div class="auth-view__card">
        <header class="auth-view__header">
          <div class="auth-view__brand">
            <div class="auth-view__logo">
              <RobotIcon />
            </div>
            <div class="auth-view__brand-info">
              <h1 class="auth-view__title">AuditSystem Client</h1>
              <p class="auth-view__subtitle">Аудит информационной безопасности</p>
            </div>
          </div>

          <button @click="toggleTheme"
                  class="auth-view__theme-toggle"
                  :title="themeButtonTitle"
                  aria-label="Переключить тему">
            <SunIcon v-if="isDarkTheme" />
            <MoonIcon v-else />
          </button>
        </header>

        <ServerStatus :server-url="serverUrl"
                      :status="serverStatus"
                      :last-check="lastServerCheck"
                      :response-time="serverResponseTime"
                      :is-checking="isCheckingServer"
                      show-retry
                      @retry="checkServerHealth"
                      class="auth-view__server-status" />

        <AuthForm :is-loading="isLoggingIn"
                  :error="loginError"
                  :server-available="isServerAvailable"
                  @submit="handleLogin"
                  @cancel="cancelLogin"
                  @clear-error="clearLoginError"
                  class="auth-view__form" />

        <footer class="auth-view__footer">
          <div class="auth-view__info">
            <div class="auth-view__info-item">
              <CodeIcon />
              <span>Версия {{ appVersion }}</span>
            </div>

            <div v-if="isDevelopment" class="auth-view__info-item">
              <ServerIcon />
              <span>{{ environment }}</span>
            </div>
          </div>

          <div class="auth-view__links">
            <a href="#" class="auth-view__link">Документация</a>
            <a href="#" class="auth-view__link">Поддержка</a>
          </div>
        </footer>
      </div>
    </div>

    <AuthFormLoading v-if="isLoggingIn"
                     :message="loginMessage"
                     :fullscreen="false"
                     class="auth-view__loading" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAppStore } from '@/framework/stores/app.store';
  import { useToast } from '@/framework/ui/composables/useToast';
  import { AuthForm, ServerStatus } from '../components';
  import AuthFormLoading from '../components/auth-form/AuthFormLoading.vue';
  import { useAuth } from '../composables/use-auth';
  import { useServerHealth } from '../composables/use-server-health';
  import { RobotIcon, SunIcon, MoonIcon, CodeIcon, ServerIcon } from '@/assets/icons';
  import { APP_CONFIG } from '@/core/config/app.config';
  import { logger } from '@/core/utils/logger';

  const router = useRouter();
  const appStore = useAppStore();
  const toast = useToast();
  const loggerContext = logger.create('AuthView');

  // Авторизация
  const auth = useAuth();
  const isLoggingIn = computed(() => auth.isLoading.value);
  const loginError = computed(() => auth.error.value);

  // Здоровье сервера
  const serverHealth = useServerHealth({
    checkInterval: APP_CONFIG.API.HEALTH_CHECK_INTERVAL,
    notifyOnChange: true,
  });

  const serverStatus = computed(() => serverHealth.status.value);
  const isServerAvailable = computed(() => serverHealth.isOnline.value);
  const lastServerCheck = computed(() => serverHealth.lastCheck.value);
  const serverResponseTime = computed(() => serverHealth.lastResponseTime.value);
  const isCheckingServer = computed(() => serverHealth.isChecking.value);
  const serverUrl = APP_CONFIG.API.BASE_URL;

  // Тема
  const themeClass = computed(() => `theme-${appStore.theme.resolved}`);
  const isDarkTheme = computed(() => appStore.theme.resolved === 'dark');
  const themeButtonTitle = computed(() =>
    isDarkTheme.value ? 'Переключить на светлую тему' : 'Переключить на темную тему'
  );

  // Версия и окружение
  const appVersion = APP_CONFIG.APP.VERSION;
  const isDevelopment = import.meta.env.DEV;
  const environment = import.meta.env.MODE || 'development';

  // Локальное состояние
  const loginMessage = ref('Выполняется вход в систему...');

  // Методы
  const toggleTheme = () => {
    appStore.theme.toggleTheme();
    loggerContext.debug('Theme toggled');
  };

  const checkServerHealth = async () => {
    await serverHealth.manualCheck();
  };

  const handleLogin = async (credentials: { username: string; password: string }) => {
    loggerContext.info('Login attempt', { username: credentials.username });

    const success = await auth.login({
      username: credentials.username,
      password: credentials.password,
    });

    if (success) {
      toast.success('Вход выполнен успешно');
      loggerContext.info('Login successful, redirecting...');

      // Даем время на обновление состояния
      await new Promise(resolve => setTimeout(resolve, 100));

      if (auth.isAuthenticated.value) {
        await router.replace('/audit');
      } else {
        loggerContext.error('Authentication state mismatch after login');
        toast.error('Ошибка аутентификации');
      }
    } else {
      loggerContext.error('Login failed', { error: auth.error.value });
    }
  };

  const cancelLogin = () => {
    loggerContext.info('Login cancelled by user');
    // В будущем можно добавить отмену запроса через API
  };

  const clearLoginError = () => {
    auth.clearError();
  };

  const getParticleStyle = (index: number) => {
    const size = Math.random() * 4 + 1;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    const left = Math.random() * 100;

    return {
      width: `${size}px`,
      height: `${size}px`,
      left: `${left}%`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    };
  };

  // Хуки жизненного цикла
  onMounted(async () => {
    loggerContext.info('AuthView mounted');

    // Проверяем авторизацию
    if (auth.isAuthenticated.value) {
      const isValid = await auth.validateToken();
      if (!isValid) {
        loggerContext.warn('Token invalid on mount, clearing auth');
        auth.clearAuth();
        return;
      }

      loggerContext.info('User already authenticated, redirecting');
      await router.replace('/audit');
      return;
    }

    // Запускаем проверку сервера
    await serverHealth.check();
    serverHealth.startPeriodicChecks();
    loggerContext.info('Server health monitoring started');
  });

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
    padding: var(--spacing-md);
    position: relative;
    overflow: hidden;
    background: var(--color-background);
    color: var(--color-text-primary);
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }

  .auth-view__background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    overflow: hidden;
  }

  .auth-view__gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient-primary);
    opacity: 0.05;
    animation: gradient-shift 20s ease infinite;
    background-size: 200% 200%;
  }

  .theme-dark .auth-view__gradient {
    opacity: 0.08;
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
    border-radius: var(--radius-full);
    animation: float linear infinite;
    pointer-events: none;
    top: 110%;
  }

  .theme-light .auth-view__particle {
    background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  .theme-dark .auth-view__particle {
    background: color-mix(in srgb, var(--color-primary-light) 25%, transparent);
  }

  .auth-view__container {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: min(26rem, 95vw);
  }

  .auth-view__card {
    background: var(--color-card-bg);
    border: 1px solid var(--color-border-card);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-xl);
    backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
  }

    .auth-view__card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 0.25rem;
      background: var(--gradient-primary);
    }

  .auth-view__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-lg);
    gap: var(--spacing-md);
  }

  .auth-view__brand {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .auth-view__logo {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary);
    border-radius: var(--radius-lg);
    color: white;
    flex-shrink: 0;
  }

    .auth-view__logo svg {
      width: 1.75rem;
      height: 1.75rem;
    }

  .auth-view__brand-info {
    flex: 1;
    min-width: 0;
  }

  .auth-view__title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--spacing-xs);
    background: var(--gradient-primary);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    line-height: 1.2;
  }

  .auth-view__subtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
  }

  .auth-view__theme-toggle {
    padding: var(--spacing-sm);
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
  }

    .auth-view__theme-toggle:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-primary);
      transform: scale(1.05);
    }

    .auth-view__theme-toggle:active {
      transform: scale(0.95);
    }

    .auth-view__theme-toggle svg {
      width: 1.25rem;
      height: 1.25rem;
    }

  .auth-view__server-status {
    margin-bottom: var(--spacing-lg);
  }

  .auth-view__form {
    margin-bottom: var(--spacing-lg);
  }

  .auth-view__footer {
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .auth-view__info {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .auth-view__info-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

    .auth-view__info-item svg {
      width: 0.875rem;
      height: 0.875rem;
      opacity: 0.7;
    }

  .auth-view__links {
    display: flex;
    gap: var(--spacing-md);
  }

  .auth-view__link {
    font-size: 0.75rem;
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

    .auth-view__link:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }

  .auth-view__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    background: color-mix(in srgb, var(--color-background) 90%, transparent);
    backdrop-filter: blur(4px);
  }

  @keyframes gradient-shift {
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
      transform: translateY(0) translateX(0) rotate(0deg);
      opacity: 0;
    }

    10% {
      opacity: 1;
    }

    90% {
      opacity: 1;
    }

    100% {
      transform: translateY(-120vh) translateX(20px) rotate(360deg);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-view__gradient {
      animation: none;
    }

    .auth-view__particle {
      animation: none;
      display: none;
    }

    .auth-view__theme-toggle:hover {
      transform: none;
    }
  }

  @media (max-width: 640px) {
    .auth-view {
      padding: var(--spacing-sm);
    }

    .auth-view__card {
      padding: var(--spacing-lg);
    }

    .auth-view__header {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .auth-view__theme-toggle {
      align-self: flex-end;
    }
  }
</style>
