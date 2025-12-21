<!-- Компонент статуса сервера -->
<template>
  <div :class="['server-status', statusClass]">
    <div class="server-status__inner">
      <div class="server-status__icon">
        <ServerIcon />
      </div>

      <div class="server-status__content">
        <div class="server-status__header">
          <span class="server-status__title">Статус сервера</span>
          <StatusIndicator :status="status" />
        </div>

        <div v-if="showUrl" class="server-status__url" :title="serverUrl">
          {{ truncatedUrl }}
        </div>

        <div v-if="lastCheck" class="server-status__timestamp">
          Последняя проверка: {{ formatTime(lastCheck) }}
        </div>

        <div v-if="responseTime !== null && responseTime !== undefined" class="server-status__response">
          Время ответа: {{ responseTime }}мс
        </div>
      </div>

      <button v-if="showRetry"
              :class="['server-status__retry', { 'server-status__retry--disabled': isChecking }]"
              :title="retryTitle"
              :disabled="isChecking"
              @click="handleRetry">
        <RefreshIcon v-if="!isChecking" class="server-status__retry-icon" />
        <LoadingSpinner v-else class="server-status__retry-loading" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { ServerIcon, RefreshIcon, LoadingSpinner } from '@/assets/icons';
  import StatusIndicator from './StatusIndicator.vue';
  import type { ServerStatus as ServerStatusType } from '../../services/health.service';

  interface Props {
    serverUrl: string;
    status: ServerStatusType;
    showUrl?: boolean;
    showRetry?: boolean;
    lastCheck?: Date | null;
    responseTime?: number | null;
    isChecking?: boolean;
  }

  interface Emits {
    (e: 'retry'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    showUrl: true,
    showRetry: true,
    isChecking: false,
    responseTime: null
  });

  const emit = defineEmits<Emits>();

  const statusClass = computed(() => `server-status--${props.status}`);
  const truncatedUrl = computed(() => {
    const url = props.serverUrl;
    if (url.length <= 30) return url;
    return url.substring(0, 15) + '...' + url.substring(url.length - 12);
  });

  const retryTitle = computed(() => {
    return props.isChecking ? 'Проверка...' : 'Проверить снова';
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleRetry = () => {
    if (!props.isChecking) {
      emit('retry');
    }
  };
</script>

<style scoped>
  .server-status {
    border-radius: var(--radius-lg);
    padding: var(--spacing-md);
    transition: all var(--transition-normal);
    border: 1px solid;
  }

  .server-status--online {
    background: color-mix(in srgb, var(--color-success) 8%, transparent);
    border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
    color: var(--color-success-dark);
  }

  .server-status--offline {
    background: color-mix(in srgb, var(--color-error) 8%, transparent);
    border-color: color-mix(in srgb, var(--color-error) 30%, transparent);
    color: var(--color-error-dark);
  }

  .server-status--checking {
    background: color-mix(in srgb, var(--color-warning) 8%, transparent);
    border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
    color: var(--color-warning-dark);
  }

  .server-status__inner {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .server-status__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    padding: 8px;
  }

  .server-status--online .server-status__icon {
    background: color-mix(in srgb, var(--color-success) 15%, transparent);
    color: var(--color-success);
  }

  .server-status--offline .server-status__icon {
    background: color-mix(in srgb, var(--color-error) 15%, transparent);
    color: var(--color-error);
  }

  .server-status--checking .server-status__icon {
    background: color-mix(in srgb, var(--color-warning) 15%, transparent);
    color: var(--color-warning);
  }

  .server-status__icon svg {
    width: 24px;
    height: 24px;
  }

  .server-status__content {
    flex: 1;
    min-width: 0;
  }

  .server-status__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .server-status__title {
    font-size: 0.875rem;
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .server-status__url {
    font-size: 0.875rem;
    font-family: var(--font-family-mono);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .server-status__timestamp,
  .server-status__response {
    font-size: 0.75rem;
    opacity: 0.8;
  }

  .server-status__timestamp {
    margin-bottom: 2px;
  }

  .server-status__response {
    margin-bottom: 0;
  }

  .server-status__retry {
    flex-shrink: 0;
    background: none;
    border: 1px solid currentColor;
    border-radius: var(--radius-md);
    padding: 8px;
    cursor: pointer;
    color: inherit;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
  }

    .server-status__retry:hover:not(.server-status__retry--disabled) {
      background: color-mix(in srgb, currentColor 10%, transparent);
      transform: scale(1.05);
    }

  .server-status__retry--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

    .server-status__retry--disabled:hover {
      transform: none;
      background: none;
    }

  .server-status__retry-icon,
  .server-status__retry-loading {
    width: 20px;
    height: 20px;
  }

  .server-status__retry-loading {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
