<!-- src/modules/auth/components/auth-form/AuthFormError.vue -->
<template>
  <div :class="['auth-error', `auth-error--${type}`]" role="alert">
    <div class="auth-error__icon">
      <slot name="icon">
        <AlertIcon v-if="type === 'error'" />
        <WarningIcon v-else-if="type === 'warning'" />
        <InfoIcon v-else />
      </slot>
    </div>

    <div class="auth-error__content">
      <div v-if="title" class="auth-error__title">
        {{ title }}
      </div>
      <div class="auth-error__message">
        {{ message }}
      </div>
    </div>

    <button v-if="dismissible"
            @click="handleDismiss"
            class="auth-error__dismiss"
            :title="dismissTitle"
            aria-label="Закрыть">
      <CloseIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { AlertIcon, WarningIcon, InfoIcon, CloseIcon } from '@/assets/icons';

  interface Props {
    message: string;
    title?: string;
    type?: 'error' | 'warning' | 'info';
    dismissible?: boolean;
    dismissTitle?: string;
  }

  interface Emits {
    (e: 'dismiss'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'error',
    dismissible: true,
    dismissTitle: 'Закрыть',
  });

  const emit = defineEmits<Emits>();

  const handleDismiss = () => {
    emit('dismiss');
  };
</script>

<style scoped>
  .auth-error {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    font-size: 0.875rem;
  }

  .auth-error--error {
    background: var(--status-offline-bg);
    border-color: var(--status-offline-border);
    color: var(--status-offline-text);
  }

  .auth-error--warning {
    background: var(--status-checking-bg);
    border-color: var(--status-checking-border);
    color: var(--status-checking-text);
  }

  .auth-error--info {
    background: color-mix(in srgb, var(--color-info) 8%, transparent);
    border-color: color-mix(in srgb, var(--color-info) 30%, transparent);
    color: var(--color-info-dark);
  }

  .auth-error__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    margin-top: 0.125rem;
  }

  .auth-error--error .auth-error__icon {
    color: var(--color-error);
  }

  .auth-error--warning .auth-error__icon {
    color: var(--color-warning);
  }

  .auth-error--info .auth-error__icon {
    color: var(--color-info);
  }

  .auth-error__icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .auth-error__content {
    flex: 1;
    min-width: 0;
  }

  .auth-error__title {
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-xs);
  }

  .auth-error__message {
    line-height: 1.4;
    word-break: break-word;
  }

  .auth-error__dismiss {
    flex-shrink: 0;
    background: none;
    border: none;
    padding: var(--spacing-xs);
    cursor: pointer;
    color: inherit;
    opacity: 0.7;
    transition: opacity var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-sm);
  }

    .auth-error__dismiss:hover {
      opacity: 1;
      background: color-mix(in srgb, currentColor 10%, transparent);
    }

    .auth-error__dismiss:active {
      transform: scale(0.95);
    }

    .auth-error__dismiss svg {
      width: 1rem;
      height: 1rem;
    }
</style>
