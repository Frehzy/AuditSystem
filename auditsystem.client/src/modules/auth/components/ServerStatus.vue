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
            {{ urlUtils.truncateUrl(serverUrl) }}
          </div>
          <div v-if="responseTime" class="server-status__response-time">
            {{ responseTime }}ms
          </div>
        </div>
      </div>

      <div class="server-status__indicator">
        <div class="server-status__dot"></div>
        <span class="server-status__text">{{ statusText }}</span>
      </div>

      <button v-if="showRetry && (status === 'offline' || status === 'checking')"
              @click.stop="handleRetry"
              :disabled="status === 'checking'"
              class="server-status__retry"
              :title="status === 'checking' ? 'Проверка соединения...' : 'Проверить снова'"
              :aria-label="status === 'checking' ? 'Проверка соединения' : 'Проверить соединение'">
        <span v-if="status === 'checking'" class="server-status__spinner">
          <SpinnerIcon />
        </span>
        <span v-else class="server-status__retry-icon">↻</span>
      </button>
    </div>

    <div v-if="lastCheck" class="server-status__timestamp">
      Последняя проверка: {{ dateUtils.formatRelativeTime(lastCheck) }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { logger } from '@/core/utils/logger/logger';
  import dateUtils from '@/core/utils/date/date.utils';
  import urlUtils from '@/core/utils/url/url.utils';
  import { GlobeIcon, SpinnerIcon } from '@/assets/icons';

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
  const loggerContext = logger.create('ServerStatus');

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
   * Обработка повторной проверки
   */
  const handleRetry = (): void => {
    if (props.status !== 'checking') {
      loggerContext.info('Manual server check requested');
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
    border-radius: 16px;
    padding: 20px;
    transition: all var(--transition-normal);
    backdrop-filter: blur(10px);
    cursor: v-bind('clickable ? "pointer" : "default"');
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

    .server-status:hover {
      transform: v-bind('clickable ? "translateY(-2px)" : "none"');
      box-shadow: v-bind('clickable ? "var(--shadow-lg)" : "var(--shadow-sm)"');
    }

  .server-status__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 24px;
  }

  .server-status__info {
    display: flex;
    align-items: center;
    gap: 16px;
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
    border-radius: 10px;
    color: white;
    flex-shrink: 0;
    box-shadow: var(--shadow-primary);
  }

    .server-status__icon svg {
      width: 20px;
      height: 20px;
    }

  .server-status__details {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .server-status__label {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .server-status__url {
    font-size: 14px;
    color: var(--color-text-secondary);
    font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 2px;
  }

  .server-status__response-time {
    font-size: 11px;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .server-status__indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    max-width: 120px;
    transition: all var(--transition-normal);
    border: 1px solid transparent;
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
    padding: 8px;
    background: var(--color-info);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 14px;
    box-shadow: var(--shadow-sm);
  }

    .server-status__retry:hover:not(:disabled) {
      background: var(--color-info-dark);
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }

    .server-status__retry:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

  .server-status__spinner {
    animation: spin 1s linear infinite;
  }

    .server-status__spinner svg {
      width: 16px;
      height: 16px;
    }

  .server-status__retry-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .server-status__timestamp {
    margin-top: 12px;
    font-size: 11px;
    color: var(--color-text-muted);
    text-align: center;
    border-top: 1px solid var(--color-border);
    padding-top: 8px;
  }

  /* Status variants */
  .server-status--online {
    border-color: var(--status-online-border);
    background: var(--status-online-bg);
  }

    .server-status--online .server-status__dot {
      background: var(--status-online-dot);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--status-online-dot) 30%, transparent);
      animation: pulse 2s infinite;
    }

    .server-status--online .server-status__indicator {
      background: var(--status-online-indicator);
      color: var(--status-online-text);
      border-color: color-mix(in srgb, var(--status-online-border) 30%, transparent);
    }

  .server-status--offline {
    border-color: var(--status-offline-border);
    background: var(--status-offline-bg);
  }

    .server-status--offline .server-status__dot {
      background: var(--status-offline-dot);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--status-offline-dot) 30%, transparent);
    }

    .server-status--offline .server-status__indicator {
      background: var(--status-offline-indicator);
      color: var(--status-offline-text);
      border-color: color-mix(in srgb, var(--status-offline-border) 30%, transparent);
    }

  .server-status--checking {
    border-color: var(--status-checking-border);
    background: var(--status-checking-bg);
  }

    .server-status--checking .server-status__dot {
      background: var(--status-checking-dot);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--status-checking-dot) 30%, transparent);
      animation: pulse 1.5s infinite;
    }

    .server-status--checking .server-status__indicator {
      background: var(--status-checking-indicator);
      color: var(--status-checking-text);
      border-color: color-mix(in srgb, var(--status-checking-border) 30%, transparent);
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
      padding: 16px;
      border-radius: 12px;
    }

    .server-status__content {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
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
      width: 36px;
      height: 36px;
    }
  }

  @media (max-width: 480px) {
    .server-status__icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
    }

      .server-status__icon svg {
        width: 18px;
        height: 18px;
      }

    .server-status__details {
      min-width: 0;
    }

    .server-status__url {
      font-size: 13px;
    }
  }

  @media (max-width: 360px) {
    .server-status {
      padding: 14px;
    }

    .server-status__info {
      gap: 12px;
    }

    .server-status__icon {
      width: 32px;
      height: 32px;
    }

      .server-status__icon svg {
        width: 16px;
        height: 16px;
      }
  }
</style>
