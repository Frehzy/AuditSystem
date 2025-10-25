<!-- src/framework/ui/components/feedback/BaseAlert.vue -->
<template>
  <div class="base-alert" :class="alertClasses" role="alert" :aria-live="ariaLive">
    <div class="base-alert__icon">
      <component :is="alertIcon" :size="20" />
    </div>

    <div class="base-alert__content">
      <div v-if="title" class="base-alert__title">
        {{ title }}
      </div>
      <div class="base-alert__message">
        <slot>{{ message }}</slot>
      </div>
    </div>

    <div v-if="dismissible" class="base-alert__actions">
      <button v-if="actionText"
              @click="handleAction"
              class="base-alert__action"
              :aria-label="actionText">
        {{ actionText }}
      </button>

      <button @click="handleDismiss"
              class="base-alert__close"
              aria-label="Закрыть уведомление">
        <CloseIcon :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { InfoIcon, AlertIcon, CheckCircleIcon, XCircleIcon, CloseIcon } from '@/assets/icons'

  interface Props {
    title?: string
    message?: string
    variant?: 'info' | 'success' | 'warning' | 'error'
    dismissible?: boolean
    actionText?: string
    ariaLive?: 'polite' | 'assertive'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'info',
    dismissible: false,
    ariaLive: 'polite',
  })

  const emit = defineEmits<{
    dismiss: []
    action: []
  }>()

  const alertIcon = computed(() => {
    const icons = {
      info: InfoIcon,
      success: CheckCircleIcon,
      warning: AlertIcon,
      error: XCircleIcon,
    }
    return icons[props.variant]
  })

  const alertClasses = computed(() => [
    'base-alert',
    `base-alert--${props.variant}`,
    {
      'base-alert--dismissible': props.dismissible,
      'base-alert--with-action': !!props.actionText,
    },
  ])

  const handleDismiss = () => {
    emit('dismiss')
  }

  const handleAction = () => {
    emit('action')
  }
</script>

<style scoped>
  .base-alert {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    border: 1px solid transparent;
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  .base-alert--info {
    border-color: var(--color-info);
    background: color-mix(in srgb, var(--color-info) 8%, transparent);
  }

  .base-alert--success {
    border-color: var(--color-success);
    background: color-mix(in srgb, var(--color-success) 8%, transparent);
  }

  .base-alert--warning {
    border-color: var(--color-warning);
    background: color-mix(in srgb, var(--color-warning) 8%, transparent);
  }

  .base-alert--error {
    border-color: var(--color-error);
    background: color-mix(in srgb, var(--color-error) 8%, transparent);
  }

  .base-alert__icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .base-alert--info .base-alert__icon {
    color: var(--color-info);
  }

  .base-alert--success .base-alert__icon {
    color: var(--color-success);
  }

  .base-alert--warning .base-alert__icon {
    color: var(--color-warning);
  }

  .base-alert--error .base-alert__icon {
    color: var(--color-error);
  }

  .base-alert__content {
    flex: 1;
    min-width: 0;
  }

  .base-alert__title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-xs);
    font-size: 0.875rem;
  }

  .base-alert__message {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .base-alert__actions {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    flex-shrink: 0;
  }

  .base-alert__action {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-fast);
    color: currentColor;
  }

    .base-alert__action:hover {
      background: color-mix(in srgb, currentColor 12%, transparent);
    }

  .base-alert__close {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
  }

    .base-alert__close:hover {
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
    }

  /* Compact variant */
  .base-alert--compact {
    padding: var(--space-sm) var(--space-md);
  }

    .base-alert--compact .base-alert__icon {
      margin-top: 0;
    }

  /* Banner variant */
  .base-alert--banner {
    border-radius: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
  }
</style>
