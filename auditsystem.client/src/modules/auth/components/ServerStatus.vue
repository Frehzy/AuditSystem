<!-- src/modules/auth/components/ServerStatus.vue -->
<template>
  <div class="server-status" :class="statusClass" @click="handleClick">
    <div class="server-status__content">
      <div class="server-status__info">
        <div class="server-status__icon">
          <GlobeIcon />
        </div>
        <div class="server-status__details">
          <div class="server-status__label">Статус сервера</div>
          <div class="server-status__url" :title="serverUrl">
            {{ truncatedUrl }}
          </div>
          <div v-if="responseTime" class="server-status__response-time">
            {{ responseTime }}ms
          </div>
        </div>
      </div>

      <div class="server-status__indicator">
        <div class="server-status__status-icon">
          <StatusIcon :status="status" />
        </div>
        <div class="server-status__dot"></div>
        <span class="server-status__text">{{ statusText }}</span>
      </div>

      <BaseButton v-if="showRetry && (status === 'offline' || status === 'checking')"
                  @click.stop="handleRetry"
                  :disabled="status === 'checking'"
                  variant="secondary"
                  size="sm"
                  class="server-status__retry"
                  :title="status === 'checking' ? 'Проверка соединения...' : 'Проверить снова'">
        <template #icon>
          <span v-if="status === 'checking'" class="server-status__spinner">
            <SpinnerIcon />
          </span>
          <span v-else class="server-status__retry-icon">
            <RefreshIcon />
          </span>
        </template>
      </BaseButton>
    </div>

    <div v-if="lastCheck" class="server-status__timestamp">
      Последняя проверка: {{ formatRelativeTime(lastCheck) }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import { GlobeIcon, SpinnerIcon, RefreshIcon } from '@/assets/icons';
  import StatusIcon from './StatusIcon.vue';

  interface Props {
    serverUrl: string;
    status: 'online' | 'offline' | 'checking';
    showRetry?: boolean;
    lastCheck?: Date;
    responseTime?: number;
    clickable?: boolean;
  }

  interface Emits {
    (e: 'retry'): void;
    (e: 'click'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    showRetry: true,
    lastCheck: undefined,
    responseTime: undefined,
    clickable: false,
  });

  const emit = defineEmits<Emits>();

  /**
   * Класс статуса для стилизации
   */
  const statusClass = computed(() => `server-status--${props.status}`);

  /**
   * Текст статуса
   */
  const statusText = computed(() => {
    const statusMap = {
      'checking': 'Проверка...',
      'online': 'Доступен',
      'offline': 'Недоступен'
    };
    return statusMap[props.status] || 'Неизвестен';
  });

  /**
   * Обрезанный URL для отображения
   */
  const truncatedUrl = computed(() => {
    const url = props.serverUrl;
    if (url.length <= 30) return url;
    return url.substring(0, 15) + '...' + url.substring(url.length - 12);
  });

  /**
   * Форматирование относительного времени
   */
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) {
      return 'только что';
    } else if (diffMin < 60) {
      return `${diffMin} мин назад`;
    } else if (diffHour < 24) {
      return `${diffHour} ч назад`;
    } else {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  /**
   * Обработка повторной проверки
   */
  const handleRetry = (): void => {
    if (props.status !== 'checking') {
      emit('retry');
    }
  };

  /**
   * Обработка клика по компоненту
   */
  const handleClick = (): void => {
    if (props.clickable) {
      emit('click');
    }
  };
</script>

<style scoped>
  .server-status {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--space-lg);
    transition: all var(--transition-normal);
    backdrop-filter: blur(10px);
    cursor: v-bind('clickable ? "pointer" : "default"');
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

    .server-status:hover {
      transform: v-bind('clickable ? "translateY(-2px)" : "none"');
      box-shadow: v-bind('clickable ? "var(--shadow-md)" : "var(--shadow-sm)"');
    }

  .server-status__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    min-height: 24px;
  }

  .server-status__info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex: 1;
    min-width: 0;
  }

  .server-status__icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary);
    border-radius: var(--radius-lg);
    color: white;
    flex-shrink: 0;
    box-shadow: var(--shadow-primary);
  }

    .server-status__icon ::v-deep(svg) {
      width: 20px;
      height: 20px;
    }

  .server-status__details {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .server-status__label {
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold, 700);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--space-xs);
  }

  .server-status__url {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-family: var(--font-family-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 2px;
  }

  .server-status__response-time {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    font-weight: var(--font-weight-medium, 500);
  }

  .server-status__indicator {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: var(--font-weight-bold, 700);
    flex-shrink: 0;
    max-width: 120px;
    transition: all var(--transition-normal);
    border: 1px solid transparent;
  }

  .server-status__status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
  }

    .server-status__status-icon ::v-deep(svg) {
      width: 14px;
      height: 14px;
    }

  .server-status__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all var(--transition-normal);
    flex-shrink: 0;
    box-shadow: 0 0 0 2px transparent;
  }

  .server-status__text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .server-status__retry {
    flex-shrink: 0;
  }

  .server-status__spinner {
    animation: spin 1s linear infinite;
  }

    .server-status__spinner ::v-deep(svg) {
      width: 16px;
      height: 16px;
    }

  .server-status__retry-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .server-status__retry-icon ::v-deep(svg) {
      width: 16px;
      height: 16px;
    }

  .server-status__timestamp {
    margin-top: var(--space-md);
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    text-align: center;
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-sm);
  }

  /* Status variants - используем цвета из темы */
  .server-status--online {
    border-color: color-mix(in srgb, var(--color-success) 20%, transparent);
    background: color-mix(in srgb, var(--color-success) 5%, var(--color-surface));
  }

    .server-status--online .server-status__dot {
      background: var(--color-success);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-success) 30%, transparent);
      animation: pulse 2s infinite;
    }

    .server-status--online .server-status__indicator {
      background: color-mix(in srgb, var(--color-success) 8%, transparent);
      color: var(--color-success);
      border-color: color-mix(in srgb, var(--color-success) 20%, transparent);
    }

  .server-status--offline {
    border-color: color-mix(in srgb, var(--color-error) 20%, transparent);
    background: color-mix(in srgb, var(--color-error) 5%, var(--color-surface));
  }

    .server-status--offline .server-status__dot {
      background: var(--color-error);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-error) 30%, transparent);
    }

    .server-status--offline .server-status__indicator {
      background: color-mix(in srgb, var(--color-error) 8%, transparent);
      color: var(--color-error);
      border-color: color-mix(in srgb, var(--color-error) 20%, transparent);
    }

  .server-status--checking {
    border-color: color-mix(in srgb, var(--color-warning) 20%, transparent);
    background: color-mix(in srgb, var(--color-warning) 5%, var(--color-surface));
  }

    .server-status--checking .server-status__dot {
      background: var(--color-warning);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-warning) 30%, transparent);
      animation: pulse 1.5s infinite;
    }

    .server-status--checking .server-status__indicator {
      background: color-mix(in srgb, var(--color-warning) 8%, transparent);
      color: var(--color-warning);
      border-color: color-mix(in srgb, var(--color-warning) 20%, transparent);
    }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }

    50% {
      opacity: 0.7;
      transform: scale(1.1);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .server-status {
      padding: var(--space-md);
      border-radius: var(--radius-lg);
    }

    .server-status__content {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-md);
    }

    .server-status__info {
      justify-content: flex-start;
    }

    .server-status__indicator {
      align-self: stretch;
      justify-content: center;
      max-width: none;
    }

    .server-status__retry {
      align-self: center;
    }
  }

  @media (max-width: 480px) {
    .server-status__icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
    }

      .server-status__icon ::v-deep(svg) {
        width: 18px;
        height: 18px;
      }

    .server-status__details {
      min-width: 0;
    }

    .server-status__url {
      font-size: 0.8125rem;
    }
  }

  @media (max-width: 360px) {
    .server-status {
      padding: var(--space-md) var(--space-sm);
    }

    .server-status__info {
      gap: var(--space-sm);
    }

    .server-status__icon {
      width: 32px;
      height: 32px;
    }

      .server-status__icon ::v-deep(svg) {
        width: 16px;
        height: 16px;
      }
  }
</style>
