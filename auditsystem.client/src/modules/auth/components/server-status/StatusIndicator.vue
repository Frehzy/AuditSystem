<!-- src/modules/auth/components/server-status/StatusIndicator.vue -->
<template>
  <div :class="['status-indicator', `status-indicator--${status}`]">
    <span class="status-indicator__dot"></span>
    <span v-if="showText" class="status-indicator__text">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { ServerStatus } from '../../types';

  interface Props {
    status: ServerStatus;
    showText?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    showText: true,
  });

  const statusText = computed(() => {
    const texts: Record<ServerStatus, string> = {
      online: 'Доступен',
      offline: 'Недоступен',
      checking: 'Проверка...',
    };
    return texts[props.status];
  });
</script>

<style scoped>
  .status-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.75rem;
    font-weight: var(--font-weight-medium);
  }

  .status-indicator__dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .status-indicator--online .status-indicator__dot {
    background: var(--color-success);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success) 30%, transparent);
  }

  .status-indicator--offline .status-indicator__dot {
    background: var(--color-error);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 30%, transparent);
  }

  .status-indicator--checking .status-indicator__dot {
    background: var(--color-warning);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-warning) 30%, transparent);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .status-indicator__text {
    line-height: 1;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }
  }
</style>
