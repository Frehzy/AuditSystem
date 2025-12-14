<!-- src/modules/auth/components/server-status/ServerStatus.vue -->
<template>
  <div :class="['server-status', statusClass]" @click="handleClick">
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

        <div v-if="responseTime" class="server-status__response">
          Время ответа: {{ responseTime }}мс
        </div>
      </div>

      <button v-if="showRetry"
              @click.stop="handleRetry"
              :disabled="isChecking"
              :class="['server-status__retry', { 'server-status__retry--disabled': isChecking }]"
              :title="retryTitle">
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
  import type { ServerStatus } from '../../types';

  interface Props {
    serverUrl: string;
    status: ServerStatus;
    showUrl?: boolean;
    showRetry?: boolean;
    lastCheck?: Date;
    responseTime?: number;
    isChecking?: boolean;
    clickable?: boolean;
  }

  interface Emits {
    (e: 'retry'): void;
    (e: 'click'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    showUrl: true,
    showRetry: true,
    isChecking: false,
    clickable: false,
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
      second: '2-digit',
    });
  };

  const handleRetry = () => {
    if (!props.isChecking) {
      emit('retry');
    }
  };

  const handleClick = () => {
    if (props.clickable) {
      emit('click');
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
    background: var(--status-online-bg);
    border-color: var(--status-online-border);
    color: var(--status-online-text);
  }

  .server-status--offline {
    background: var(--status-offline-bg);
    border-color: var(--status-offline-border);
    color: var(--status-offline-text);
  }

  .server-status--checking {
    background: var(--status-checking-bg);
    border-color: var(--status-checking-border);
    color: var(--status-checking-text);
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
    width: 2.5rem;
    height: 2.5rem;
    border-radius: var(--radius-md);
    padding: var(--spacing-xs);
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
    width: 1.5rem;
    height: 1.5rem;
  }

  .server-status__content {
    flex: 1;
    min-width: 0;
  }

  .server-status__header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
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
    margin-bottom: var(--spacing-xs);
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
    margin-bottom: var(--spacing-xs);
  }

  .server-status__response {
    margin-bottom: 0;
  }

  .server-status__retry {
    flex-shrink: 0;
    background: none;
    border: 1px solid currentColor;
    border-radius: var(--radius-md);
    padding: var(--spacing-sm);
    cursor: pointer;
    color: inherit;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
  }

    .server-status__retry:hover:not(.server-status__retry--disabled) {
      background: color-mix(in srgb, currentColor 10%, transparent);
      transform: scale(1.05);
    }

  .server-status__retry--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .server-status__retry-icon,
  .server-status__retry-loading {
    width: 1.25rem;
    height: 1.25rem;
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
