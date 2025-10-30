<!-- src/modules/auth/views/AuthView.vue -->
<template>
  <div class="auth-view" :class="themeClass">
    <div class="auth-view__background">
      <div class="auth-view__gradient"></div>
      <div class="auth-view__particles">
        <div v-for="i in 15" :key="i" class="auth-view__particle" :style="getParticleStyle(i)"></div>
      </div>
    </div>

    <div class="auth-view__container">
      <div class="auth-view__card">
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

        <ServerStatus :server-url="serverUrl"
                      :status="serverHealth.status.value"
                      :last-check="serverHealth.lastCheck.value || undefined"
                      :response-time="serverHealth.responseTime.value || undefined"
                      :show-retry="true"
                      @retry="handleRetry"
                      class="auth-view__status" />

        <AuthForm ref="authFormRef"
                  :is-loading="auth.isLoading.value"
                  :general-error="localError || auth.error.value"
                  :server-available="isServerAvailable"
                  @submit="handleLogin"
                  @retry-connection="handleRetry"
                  @clear-error="clearError"
                  @cancel-request="handleCancelRequest"
                  class="auth-view__form" />

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
  const localError = ref<string | null>(null);
  const authFormRef = ref<{ cancelRequest: () => void }>();

  const themeClass = computed(() => `theme-${appStore.resolvedTheme}`);
  const isDarkTheme = computed(() => appStore.isDark);

  const themeButtonTitle = computed(() =>
    isDarkTheme.value ? 'Переключить на светлую тему' : 'Переключить на темную тему'
  );

  const toggleTheme = (): void => {
    appStore.toggleTheme();
    loggerContext.info('Theme toggled', { theme: appStore.currentTheme });
  };

  const isServerAvailable = computed(() => {
    return serverHealth.isOnline.value && serverHealth.isInitialized.value;
  });

  const appVersion = computed(() => {
    return APP_CONFIG.APP.VERSION;
  });

  const environment = computed(() => {
    return import.meta.env.MODE || 'development';
  });

  const getParticleStyle = (index: number) => {
    const size = Math.random() * 4 + 2;
    const duration = Math.random() * 20 + 15;
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

  const handleLogin = async (credentials: { username: string; password: string }): Promise<void> => {
    if (auth.isLoading.value || !isServerAvailable.value) return;

    localError.value = null;
    auth.clearError();
    loggerContext.info('Login attempt', { username: credentials.username });

    const success = await auth.login(credentials);

    if (success) {
      toast.success('Вход выполнен успешно!');
      loggerContext.info('Login successful, redirecting to audit');

      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));

      if (auth.isAuthenticated.value) {
        loggerContext.info('Authentication confirmed, redirecting to audit');
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
      localError.value = auth.error.value;
      loggerContext.error('Login failed', { error: auth.error.value });
    }
  };

  const handleRetry = async (): Promise<void> => {
    await serverHealth.manualCheck();
  };

  const handleCancelRequest = (): void => {
    loggerContext.info('Login request cancelled by user');
    localError.value = 'Запрос отменен пользователем';
    // Можно также вызвать метод отмены в API сервисе, если он реализован
  };

  const clearError = (): void => {
    localError.value = null;
    auth.clearError();
    appStore.setAuthError(null);
  };

  onMounted(async () => {
    loggerContext.info('AuthView mounted');

    // Если пользователь уже аутентифицирован, проверяем токен
    if (auth.isAuthenticated.value) {
      const isValid = await auth.validateCurrentToken();
      if (!isValid) {
        loggerContext.warn('Token invalid on AuthView mount, clearing auth');
        appStore.clearAuth();
        return;
      }

      loggerContext.info('User already authenticated with valid token, redirecting to audit');
      await router.replace('/audit');
      return;
    }

    try {
      await serverHealth.checkServerConnection();
      serverHealth.startPeriodicChecks();
      loggerContext.info('Server health checks started');
    } catch (error) {
      loggerContext.error('Failed to initialize server health checks', { error });
    }
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
    font-family: var(--font-family-sans);
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
    opacity: 0.08;
  }

  .theme-dark .auth-view__gradient {
    opacity: 0.12;
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
  }

  .theme-light .auth-view__particle {
    background: color-mix(in srgb, var(--color-primary) 25%, transparent);
  }

  .theme-dark .auth-view__particle {
    background: color-mix(in srgb, var(--color-primary-light) 30%, transparent);
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
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
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
    margin-bottom: var(--spacing-lg);
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .auth-view__logo {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex: 1;
  }

  .auth-view__logo-icon {
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary);
    border-radius: var(--radius-lg);
    flex-shrink: 0;
    color: white;
    box-shadow: var(--shadow-primary);
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
    font-weight: 700;
    margin: 0 0 var(--spacing-xs) 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    line-height: 1.2;
  }

  .auth-view__subtitle {
    font-size: 0.875rem;
    margin: 0;
    opacity: 0.8;
    font-weight: 500;
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .auth-view__theme-toggle {
    padding: var(--spacing-sm);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    width: 2.5rem;
    height: 2.5rem;
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

    .auth-view__theme-toggle:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

  .auth-view__theme-icon svg {
    width: 1.25rem;
    height: 1.25rem;
    color: currentColor;
  }

  .auth-view__status {
    margin-bottom: var(--spacing-lg);
  }

  .auth-view__form {
    margin-bottom: var(--spacing-lg);
  }

  .auth-view__footer {
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-border);
  }

  .auth-view__info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    transition: background-color var(--transition-fast);
  }

    .info-item:hover {
      background: var(--color-surface-hover);
    }

  .info-icon {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
  }

    .info-icon.version {
      background: var(--color-info);
    }

    .info-icon.environment {
      background: var(--color-success);
    }

    .info-icon svg {
      width: 1rem;
      height: 1rem;
    }

  .info-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .info-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
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
