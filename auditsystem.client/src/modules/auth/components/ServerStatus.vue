<!-- src/modules/auth/components/ServerStatus.vue -->
<template>
  <div class="server-status" :class="[statusClass, { 'server-status--clickable': clickable }]" @click="handleClick">
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
          <div class="server-status__indicator">
            <div class="server-status__status-icon">
              <StatusIcon :status="status" size="sm" />
            </div>
            <span class="server-status__text">{{ statusText }}</span>
          </div>
        </div>
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
        <span v-if="status !== 'checking'" class="server-status__retry-text">Повторить</span>
      </BaseButton>
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

  const statusClass = computed(() => `server-status--${props.status}`);

  const statusText = computed(() => {
    const statusMap = {
      'checking': 'Проверка...',
      'online': 'Доступен',
      'offline': 'Недоступен'
    };
    return statusMap[props.status] || 'Неизвестен';
  });

  const truncatedUrl = computed(() => {
    const url = props.serverUrl;
    if (url.length <= 25) return url;
    return url.substring(0, 12) + '...' + url.substring(url.length - 10);
  });

  const handleRetry = (): void => {
    if (props.status !== 'checking') {
      emit('retry');
    }
  };

  const handleClick = (): void => {
    if (props.clickable) {
      emit('click');
    }
  };
</script>

<style scoped>
  .server-status {
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-sm);
    transition: all var(--transition-normal);
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .server-status--clickable {
    cursor: pointer;
  }

    .server-status--clickable:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

  .server-status__content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-sm);
    min-height: auto;
  }

  .server-status__info {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    flex: 1;
    min-width: 0;
  }

  .server-status__icon {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--gradient-primary);
    border-radius: var(--radius-md);
    color: white;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
  }

    .server-status__icon :deep(svg) {
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
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }

  .server-status__url {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    font-family: var(--font-family-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.375rem;
  }

  .server-status__response-time {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .server-status__indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 700;
    width: fit-content;
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

    .server-status__status-icon :deep(svg) {
      width: 14px;
      height: 14px;
    }

  .server-status__text {
    white-space: nowrap;
  }

  .server-status__retry {
    flex-shrink: 0;
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
    min-height: 2rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    white-space: nowrap;
  }

  .server-status__spinner {
    animation: spin 1s linear infinite;
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .server-status__spinner :deep(svg) {
      width: 14px;
      height: 14px;
    }

  .server-status__retry-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .server-status__retry-icon :deep(svg) {
      width: 14px;
      height: 14px;
    }

  .server-status__retry-text {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .server-status--online {
    border-color: var(--status-online-border);
    background: var(--status-online-bg);
  }

    .server-status--online .server-status__indicator {
      background: var(--status-online-indicator);
      color: var(--status-online-text);
      border-color: var(--status-online-border);
    }

  .server-status--offline {
    border-color: var(--status-offline-border);
    background: var(--status-offline-bg);
  }

    .server-status--offline .server-status__indicator {
      background: var(--status-offline-indicator);
      color: var(--status-offline-text);
      border-color: var(--status-offline-border);
    }

  .server-status--checking {
    border-color: var(--status-checking-border);
    background: var(--status-checking-bg);
  }

    .server-status--checking .server-status__indicator {
      background: var(--status-checking-indicator);
      color: var(--status-checking-text);
      border-color: var(--status-checking-border);
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
