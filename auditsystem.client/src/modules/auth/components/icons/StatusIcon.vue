<!-- Иконка статуса -->
<template>
  <div :class="['status-icon', `status-icon--${status}`, `status-icon--${size}`]">
    <CheckCircleIcon v-if="status === 'online'" class="status-icon__svg" />
    <XCircleIcon v-else-if="status === 'offline'" class="status-icon__svg" />
    <ClockIcon v-else class="status-icon__svg" />
    <div v-if="withPulse" class="status-icon__pulse"></div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@/assets/icons';

interface Props {
  status: 'checking' | 'online' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  withPulse?: boolean;
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  withPulse: false
});
</script>

<style scoped>
  .status-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .status-icon--sm {
    width: 1rem;
    height: 1rem;
  }

  .status-icon--md {
    width: 1.25rem;
    height: 1.25rem;
  }

  .status-icon--lg {
    width: 1.5rem;
    height: 1.5rem;
  }

  .status-icon__svg {
    width: 100%;
    height: 100%;
    color: currentColor;
  }

  .status-icon--online {
    color: var(--color-success);
  }

  .status-icon--offline {
    color: var(--color-error);
  }

  .status-icon--checking {
    color: var(--color-warning);
  }

    .status-icon--checking .status-icon__svg {
      animation: rotate 2s linear infinite;
    }

  .status-icon__pulse {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: var(--radius-full);
    animation: pulse 2s ease-in-out infinite;
    z-index: -1;
  }

  .status-icon--online .status-icon__pulse {
    background: var(--color-success);
    opacity: 0.3;
  }

  .status-icon--offline .status-icon__pulse {
    background: var(--color-error);
    opacity: 0.3;
  }

  .status-icon--checking .status-icon__pulse {
    background: var(--color-warning);
    opacity: 0.3;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.3;
    }

    50% {
      transform: scale(1.5);
      opacity: 0.1;
    }

    100% {
      transform: scale(1);
      opacity: 0.3;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .status-icon--checking .status-icon__svg {
      animation: none;
    }

    .status-icon__pulse {
      animation: none;
      display: none;
    }
  }
</style>
