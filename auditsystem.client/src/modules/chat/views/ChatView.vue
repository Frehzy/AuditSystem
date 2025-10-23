<template>
  <div class="chat-view">
    <div class="chat-view__header">
      <div class="chat-view__header-content">
        <div class="chat-view__title-section">
          <h1 class="chat-view__title">Чат</h1>
          <div class="chat-view__user-info-mini">
            <div class="chat-view__user-avatar-mini">
              {{ userInitials }}
            </div>
            <span class="chat-view__username">{{ auth.user.value?.username }}</span>
          </div>
        </div>
        <div class="chat-view__actions">
          <button @click="toggleTheme" class="chat-view__theme-toggle" :title="themeButtonTitle">
            <span v-if="isDarkTheme" class="chat-view__theme-icon">
              <MoonIcon />
            </span>
            <span v-else class="chat-view__theme-icon">
              <SunIcon />
            </span>
          </button>
          <ServerStatus :server-url="serverUrl"
                        :status="serverHealth.status.value"
                        :show-retry="true"
                        @retry="handleRetry"
                        size="compact" />
          <BaseButton @click="handleLogout"
                      variant="ghost"
                      size="sm"
                      class="chat-view__logout-btn">
            <template #icon-left>
              <LogOutIcon />
            </template>
            Выйти
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="chat-view__content">
      <div class="chat-view__welcome">
        <div class="chat-view__welcome-icon">
          <RobotIcon />
        </div>
        <h2 class="chat-view__welcome-title">Добро пожаловать в AuditSystem Client!</h2>
        <p class="chat-view__welcome-text">
          Это демонстрационная версия чата. Функциональность будет добавлена в будущих обновлениях.
        </p>
        <div class="chat-view__user-info">
          <div class="chat-view__user-avatar">
            {{ userInitials }}
          </div>
          <div class="chat-view__user-details">
            <div class="chat-view__user-name">{{ auth.user.value?.username }}</div>
            <div class="chat-view__user-email">{{ auth.user.value?.email }}</div>
            <div class="chat-view__theme-info">
              <span class="chat-view__theme-label">Тема:</span>
              <span class="chat-view__theme-value">{{ isDarkTheme ? 'Тёмная' : 'Светлая' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-view__footer">
      <div class="chat-view__disclaimer">
        <p>Это демонстрационное приложение. Реальная функциональность чата находится в разработке.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { BaseButton } from '@/framework/ui';
import ServerStatus from '@/modules/auth/components/ServerStatus.vue';
import { useAuth } from '@/modules/auth/composables/useAuth';
import { useServerHealth } from '@/modules/auth/composables/useServerHealth';
import { useThemeStore } from '@/framework/stores/theme.store';
import { RobotIcon, LogOutIcon, MoonIcon, SunIcon } from '@/assets/icons';
import { apiHelper } from '@/services/api/api.client';
import { logger } from '@/core/utils/logger/logger';

// Импорт стилей темы
import '@/assets/styles/theme.css';

const router = useRouter();
const auth = useAuth();
const serverHealth = useServerHealth();
const themeStore = useThemeStore();

const serverUrl = apiHelper.getBaseURL();
const loggerContext = logger.create('ChatView');

/**
 * Текущая тема
 */
const isDarkTheme = computed(() => themeStore.isDark);
const themeButtonTitle = computed(() =>
  isDarkTheme.value ? 'Переключить на светлую тему' : 'Переключить на темную тему'
);

/**
 * Инициалы пользователя для аватара
 */
const userInitials = computed(() => {
  const username = auth.user.value?.username || '';
  return username
    .split(' ')
    .map((name: string) => name.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
});

/**
 * Переключение темы
 */
const toggleTheme = (): void => {
  themeStore.toggleTheme();
  logger.info('Theme toggled from ChatView', { theme: themeStore.theme });
};

/**
 * Обработка выхода
 */
const handleLogout = async (): Promise<void> => {
  try {
    await auth.logout();
    router.push('/login');
  } catch (error) {
    loggerContext.error('Logout failed', { error });
  }
};

/**
 * Обработка проверки сервера
 */
const handleRetry = async (): Promise<void> => {
  await serverHealth.manualCheck();
};

onMounted(() => {
  loggerContext.info('ChatView mounted', {
    userId: auth.user.value?.id,
    username: auth.user.value?.username,
    theme: themeStore.theme
  });

  serverHealth.startPeriodicChecks(30000);
});

onUnmounted(() => {
  serverHealth.stopPeriodicChecks();
  loggerContext.info('ChatView unmounted');
});
</script>

<style scoped>
  .chat-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
    background: var(--color-background);
    color: var(--color-text-primary);
    transition: background-color var(--transition-normal);
  }

  .chat-view__header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 1.5rem;
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(10px);
  }

  .chat-view__header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    gap: 1rem;
  }

  .chat-view__title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .chat-view__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .chat-view__user-info-mini {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 2rem;
    font-size: 0.875rem;
  }

  .chat-view__user-avatar-mini {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.75rem;
    flex-shrink: 0;
  }

  .chat-view__username {
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .chat-view__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .chat-view__theme-toggle {
    padding: 0.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all var(--transition-normal);
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-primary);
    box-shadow: var(--shadow-sm);
  }

    .chat-view__theme-toggle:hover {
      background: var(--color-surface-hover);
      border-color: var(--color-primary-light);
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }

  .chat-view__theme-icon svg {
    width: 1.125rem;
    height: 1.125rem;
  }

  .chat-view__logout-btn {
    white-space: nowrap;
  }

  .chat-view__content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .chat-view__welcome {
    text-align: center;
    max-width: 500px;
    padding: 3rem 2rem;
    background: var(--color-surface);
    border-radius: 1rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--color-border-card);
    backdrop-filter: blur(10px);
  }

  .chat-view__welcome-icon {
    margin-bottom: 1.5rem;
    animation: bounce 2s ease-in-out infinite;
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .chat-view__welcome-icon svg {
      width: 64px;
      height: 64px;
      color: var(--color-primary);
    }

  .chat-view__welcome-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 1rem;
    line-height: 1.3;
  }

  .chat-view__welcome-text {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .chat-view__user-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .chat-view__user-avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1rem;
    flex-shrink: 0;
    box-shadow: var(--shadow-primary);
  }

  .chat-view__user-details {
    text-align: left;
  }

  .chat-view__user-name {
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .chat-view__user-email {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.5rem;
  }

  .chat-view__theme-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .chat-view__theme-label {
    color: var(--color-text-muted);
  }

  .chat-view__theme-value {
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .chat-view__footer {
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    padding: 1rem 1.5rem;
    backdrop-filter: blur(10px);
  }

  .chat-view__disclaimer {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
  }

    .chat-view__disclaimer p {
      color: var(--color-text-muted);
      font-size: 0.875rem;
      margin: 0;
      line-height: 1.5;
    }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-10px);
    }
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .chat-view__header-content {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .chat-view__title-section {
      flex-direction: column;
      gap: 0.5rem;
    }

    .chat-view__content {
      padding: 1rem;
    }

    .chat-view__welcome {
      padding: 2rem 1.5rem;
    }

    .chat-view__welcome-icon svg {
      width: 48px;
      height: 48px;
    }

    .chat-view__welcome-title {
      font-size: 1.5rem;
    }

    .chat-view__actions {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .chat-view__header {
      padding: 0.75rem 1rem;
    }

    .chat-view__actions {
      flex-direction: column;
      width: 100%;
    }

    .chat-view__logout-btn {
      width: 100%;
    }

    .chat-view__user-info {
      flex-direction: column;
      text-align: center;
    }

    .chat-view__user-details {
      text-align: center;
    }

    .chat-view__theme-toggle {
      width: 2.25rem;
      height: 2.25rem;
    }
  }
</style>
