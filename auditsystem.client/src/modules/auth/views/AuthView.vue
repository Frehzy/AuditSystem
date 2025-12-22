<!-- Страница авторизации -->
<template>
  <div :class="['auth-view', themeClass]">
    <!-- Частицы на заднем плане -->
    <div class="auth-view__particles">
      <div v-for="particle in particles"
           :key="particle.id"
           class="auth-view__particle"
           :style="getParticleStyle(particle)"></div>
    </div>

    <!-- Фон с градиентом - поверх частиц -->
    <div class="auth-view__background"></div>

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

          <button class="auth-view__theme-toggle"
                  :title="themeButtonTitle"
                  aria-label="Переключить тему"
                  @click="toggleTheme">
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
                      class="auth-view__server-status"
                      @retry="checkServerHealth" />

        <AuthForm :is-loading="isLoggingIn"
                  :server-available="isServerAvailable"
                  class="auth-view__form"
                  @submit="handleLogin"
                  @cancel="cancelLogin" />

        <footer class="auth-view__footer">
          <div class="auth-view__info">
            <div class="auth-view__info-item">
              <CodeIcon />
              <span>Версия {{ appVersion }}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>

    <AuthFormLoading v-if="isLoggingIn"
                     message="Выполняется вход в систему..."
                     :fullscreen="false"
                     class="auth-view__loading" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useThemeStore } from '@/framework/stores';
  import { AuthForm, ServerStatus } from '../components';
  import AuthFormLoading from '../components/auth-form/AuthFormLoading.vue';
  import { useAuth } from '../composables/use-auth';
  import { useServerHealth } from '../composables/use-server-health';
  import { RobotIcon, SunIcon, MoonIcon, CodeIcon } from '@/assets/icons';
  import { APP_CONFIG } from '@/core/config/app.config';
  import { logger } from '@/core/services/logger/logger.service';

  const router = useRouter();
  const themeStore = useThemeStore();
  const loggerContext = logger.create('AuthView');

  // Авторизация
  const auth = useAuth();
  const isLoggingIn = computed(() => auth.isLoading.value);

  // Здоровье сервера
  const serverHealth = useServerHealth({
    checkInterval: APP_CONFIG.API.HEALTH_CHECK_INTERVAL,
    notifyOnChange: true
  });

  const serverStatus = computed(() => serverHealth.status.value);
  const isServerAvailable = computed(() => serverHealth.isOnline.value);
  const lastServerCheck = computed(() => serverHealth.lastCheck.value);
  const serverResponseTime = computed(() => serverHealth.lastResponseTime.value);
  const isCheckingServer = computed(() => serverHealth.isChecking.value);
  const serverUrl = APP_CONFIG.API.BASE_URL;

  // Тема
  const themeClass = computed(() => `theme-${themeStore.resolved}`);
  const isDarkTheme = computed(() => themeStore.resolved === 'dark');
  const themeButtonTitle = computed(() =>
    isDarkTheme.value ? 'Переключить на светлую тему' : 'Переключить на темную тему'
  );

  // Версия
  const appVersion = APP_CONFIG.APP.VERSION;

  // Частицы
  interface Particle {
    id: number;
    x: number; // позиция X в %
    y: number; // позиция Y в %
    size: number; // размер в px
    speed: number; // скорость подъема (px за анимацию)
    opacity: number; // прозрачность
    colorIndex: number; // индекс цвета
    drift: number; // дрейф по X (px за анимацию)
    progress: number; // прогресс анимации (0-100%)
    isActive: boolean; // активна ли частица
  }

  const particles = ref<Particle[]>([]);
  const maxParticles = 30;
  let animationFrameId: number;
  let lastTimestamp = 0;

  // Создание новой частицы
  const createParticle = (id: number): Particle => {
    return {
      id,
      x: Math.random() * 100, // случайная позиция X по всей ширине
      y: Math.random() * 100, // случайная позиция Y по всей высоте
      size: Math.random() * 5, // размер 2-5px
      speed: Math.random() * 0.2, // скорость 0.2-0.7 px за кадр
      opacity: Math.random() * 0.9, // прозрачность 0.3-0.9
      colorIndex: Math.floor(Math.random() * 5), // один из 5 цветов
      drift: (Math.random() - 0.5) * 0.3, // дрейф -0.15 до 0.15 px за кадр
      progress: 0,
      isActive: true
    };
  };

  // Инициализация частиц
  const initParticles = () => {
    particles.value = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.value.push(createParticle(i));
    }
  };

  // Анимация частиц
  const animateParticles = (timestamp: number) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    // Обновляем позиции частиц
    particles.value.forEach(particle => {
      if (particle.isActive) {
        // Увеличиваем прогресс
        particle.progress += particle.speed;

        // Обновляем позицию Y (поднимаем вверх)
        particle.y -= particle.speed;

        // Добавляем дрейф по X
        particle.x += particle.drift;

        // Если частица ушла за верхнюю границу, сбрасываем её
        if (particle.y < -10) {
          // Сбрасываем частицу
          particle.y = 110; // начинаем снизу за пределами экрана
          particle.x = Math.random() * 100; // случайная позиция X
          particle.progress = 0;
          particle.speed = Math.random() * 0.5 + 0.2;
          particle.opacity = Math.random() * 0.6 + 0.3;
          particle.colorIndex = Math.floor(Math.random() * 5);
          particle.drift = (Math.random() - 0.5) * 0.3;
        }

        // Если частица ушла слишком далеко по X, корректируем
        if (particle.x < -10) particle.x = 110;
        if (particle.x > 110) particle.x = -10;
      }
    });

    animationFrameId = requestAnimationFrame(animateParticles);
  };

  const getParticleStyle = (particle: Particle) => {
    const colors = [
      'linear-gradient(45deg, #3b82f6, #8b5cf6)',
      'linear-gradient(45deg, #10b981, #3b82f6)',
      'linear-gradient(45deg, #8b5cf6, #ec4899)',
      'linear-gradient(45deg, #f59e0b, #ef4444)',
      'linear-gradient(45deg, #06b6d4, #10b981)'
    ];

    const darkColors = [
      'linear-gradient(45deg, #60a5fa, #a78bfa)',
      'linear-gradient(45deg, #34d399, #60a5fa)',
      'linear-gradient(45deg, #a78bfa, #f472b6)',
      'linear-gradient(45deg, #fbbf24, #f87171)',
      'linear-gradient(45deg, #22d3ee, #34d399)'
    ];

    return {
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      opacity: particle.opacity,
      background: isDarkTheme.value ? darkColors[particle.colorIndex] : colors[particle.colorIndex],
      transform: `translate(-50%, -50%)`, // центрируем частицу
      transition: 'opacity 1.5s ease, transform 0.1s linear' // плавное появление
    };
  };

  // Методы
  const toggleTheme = () => {
    themeStore.toggleTheme();
    loggerContext.debug('Тема переключена');
  };

  const checkServerHealth = async () => {
    await serverHealth.manualCheck();
  };

  const handleLogin = async (credentials: { username: string; password: string }) => {
    loggerContext.info('Попытка входа', { username: credentials.username });

    const success = await auth.login({
      username: credentials.username,
      password: credentials.password
    });

    if (success) {
      loggerContext.info('Вход успешен, перенаправление...');

      // Даем время на обновление состояния
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (auth.isAuthenticated.value) {
        await router.replace('/audit');
      } else {
        loggerContext.error('Несоответствие состояния аутентификации после входа');
      }
    } else {
      loggerContext.error('Ошибка входа', { error: auth.error.value });
    }
  };

  const cancelLogin = () => {
    loggerContext.info('Вход отменен пользователем');
  };

  // Хуки жизненного цикла
  onMounted(async () => {
    loggerContext.info('AuthView смонтирован');

    // Проверяем авторизацию
    if (auth.isAuthenticated.value) {
      const isValid = await auth.validateToken();
      if (!isValid) {
        loggerContext.warn('Токен недействителен при монтировании, очистка аутентификации');
        return;
      }

      loggerContext.info('Пользователь уже авторизован, перенаправление');
      await router.replace('/audit');
      return;
    }

    // Инициализируем и запускаем анимацию частиц
    initParticles();
    animationFrameId = requestAnimationFrame(animateParticles);

    // Запускаем проверку сервера
    await serverHealth.check();
    serverHealth.startPeriodicChecks();
    loggerContext.info('Мониторинг здоровья сервера запущен');
  });

  onUnmounted(() => {
    serverHealth.stopPeriodicChecks();
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    loggerContext.info('AuthView размонтирован');
  });
</script>

<style scoped>
  .auth-view {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
    overflow: auto;
    background: var(--color-background);
    color: var(--color-text-primary);
    transition: background-color var(--transition-normal), color var(--transition-normal);
    z-index: 1000;
  }

  /* Частицы - самый задний слой */
  .auth-view__particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1; /* Самый низкий слой */
    pointer-events: none;
    overflow: hidden;
  }

  .auth-view__particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(0.8px);
    will-change: transform, opacity; /* Оптимизация анимации */
  }

  .theme-dark .auth-view__particle {
    filter: blur(0.5px);
  }

  /* Градиентный фон - поверх частиц, но под контентом */
  .auth-view__background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    z-index: 2; /* Между частицами и контентом */
    pointer-events: none;
  }

  .theme-dark .auth-view__background {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
  }

  .auth-view__container {
    position: relative;
    z-index: 3; /* Самый верхний слой */
    width: 100%;
    max-width: 420px;
    padding: var(--spacing-sm);
    margin: auto;
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
      height: 4px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
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
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: var(--radius-lg);
    color: white;
    flex-shrink: 0;
  }

    .auth-view__logo svg {
      width: 24px;
      height: 24px;
    }

  .auth-view__brand-info {
    flex: 1;
    min-width: 0;
  }

  .auth-view__title {
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    margin: 0 0 4px;
    line-height: 1.2;
  }

  .auth-view__subtitle {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
  }

  .auth-view__theme-toggle {
    padding: 8px;
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
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
      width: 20px;
      height: 20px;
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
  }

  .auth-view__info {
    display: flex;
    justify-content: center;
  }

  .auth-view__info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

    .auth-view__info-item svg {
      width: 14px;
      height: 14px;
      opacity: 0.7;
    }

  .auth-view__loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
  }

  .theme-dark .auth-view__loading {
    background: rgba(0, 0, 0, 0.9);
  }

  @media (prefers-reduced-motion: reduce) {
    .auth-view__particle {
      animation: none !important;
      opacity: 0.1 !important;
    }

    .auth-view__theme-toggle:hover {
      transform: none;
    }
  }

  @media (max-width: 640px) {
    .auth-view {
      padding: var(--spacing-sm);
      align-items: flex-start;
      padding-top: 20px;
    }

    .auth-view__container {
      max-width: 100%;
      padding: 0;
      margin-top: 0;
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

    .auth-view__logo {
      width: 40px;
      height: 40px;
    }

      .auth-view__logo svg {
        width: 20px;
        height: 20px;
      }

    /* На мобильных уменьшаем количество частиц */
    .auth-view__particle:nth-child(n+20) {
      display: none;
    }
  }

  @media (max-height: 700px) {
    .auth-view {
      align-items: flex-start;
      padding-top: 20px;
      overflow-y: auto;
    }

    .auth-view__card {
      margin-top: 20px;
      margin-bottom: 20px;
    }
  }
</style>
