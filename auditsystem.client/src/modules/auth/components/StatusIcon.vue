<!-- src/modules/auth/components/StatusIcon.vue -->
<template>
  <div class="status-icon" :class="[`status--${props.status}`, sizeClasses]">
    <component :is="iconComponent" class="status-svg" />
    <div v-if="props.withPulse" class="status-pulse" :class="`pulse--${props.status}`"></div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@/assets/icons';

  interface Props {
    status: 'online' | 'offline' | 'checking';
    size?: 'sm' | 'md' | 'lg';
    withPulse?: boolean;
    animated?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    withPulse: false,
    animated: true
  });

  const iconComponent = computed(() => {
    switch (props.status) {
      case 'online':
        return CheckCircleIcon;
      case 'offline':
        return XCircleIcon;
      case 'checking':
        return ClockIcon;
      default:
        return ClockIcon;
    }
  });

  const sizeClasses = computed(() => {
    const sizeMap = {
      sm: 'size-sm',
      md: 'size-md',
      lg: 'size-lg'
    };
    return sizeMap[props.size];
  });
</script>

<style scoped>
  .status-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    transition: all var(--transition-fast);
  }

  .status-svg {
    width: 100%;
    height: 100%;
    transition: inherit;
  }

  /* Size variants */
  .size-sm {
    width: 0.875rem;
    height: 0.875rem;
  }

  .size-md {
    width: 1.25rem;
    height: 1.25rem;
  }

  .size-lg {
    width: 1.75rem;
    height: 1.75rem;
  }

  /* Status variants with theme colors */
  .status--online {
    color: var(--color-success);
    background: var(--status-online-bg);
    border: 1px solid var(--status-online-border);
  }

  .status--offline {
    color: var(--color-error);
    background: var(--status-offline-bg);
    border: 1px solid var(--status-offline-border);
  }

  .status--checking {
    color: var(--color-warning);
    background: var(--status-checking-bg);
    border: 1px solid var(--status-checking-border);
  }

    /* Animation for checking status */
    .status--checking .status-svg {
      animation: rotate 2s linear infinite;
    }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  /* Pulse animation */
  .status-pulse {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: var(--radius-full);
    animation: pulse 2s ease-in-out infinite;
  }

  .pulse--online {
    background: var(--status-online-indicator);
  }

  .pulse--offline {
    background: var(--status-offline-indicator);
  }

  .pulse--checking {
    background: var(--status-checking-indicator);
  }

  @keyframes pulse {
    0% {
      width: 100%;
      height: 100%;
      opacity: 1;
    }

    70% {
      width: 150%;
      height: 150%;
      opacity: 0;
    }

    100% {
      width: 150%;
      height: 150%;
      opacity: 0;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .status--checking .status-svg {
      animation: none;
    }

    .status-pulse {
      animation: none;
      display: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .status--online {
      border: 2px solid var(--color-success);
    }

    .status--offline {
      border: 2px solid var(--color-error);
    }

    .status--checking {
      border: 2px solid var(--color-warning);
    }
  }
</style>
