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

    <div v-if="dismissible || actionText" class="base-alert__actions">
      <BaseButton v-if="actionText"
                  @click="handleAction"
                  variant="text"
                  size="sm"
                  class="base-alert__action">
        {{ actionText }}
      </BaseButton>

      <BaseButton v-if="dismissible"
                  @click="handleDismiss"
                  variant="text"
                  size="sm"
                  class="base-alert__close"
                  aria-label="Закрыть уведомление">
        <CloseIcon :size="16" />
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue'
  import { InfoIcon, AlertIcon, CheckCircleIcon, XCircleIcon, CloseIcon } from '@/assets/icons'

  interface Props {
    title?: string
    message?: string
    variant?: 'info' | 'success' | 'warning' | 'error'
    dismissible?: boolean
    actionText?: string
    ariaLive?: 'polite' | 'assertive'
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'info',
    dismissible: false,
    ariaLive: 'polite',
    size: 'md'
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
    `base-alert--${props.variant}`,
    `base-alert--${props.size}`,
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
    gap: var(--space-md, 1rem);
    padding: var(--space-lg, 1.25rem);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid;
    background: var(--color-surface, #fff);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
    transition: all var(--transition-fast, 0.15s);
  }

  /* Variant Styles */
  .base-alert--info {
    border-color: var(--color-info, #3b82f6);
    background: color-mix(in srgb, var(--color-info, #3b82f6) 8%, transparent);
  }

  .base-alert--success {
    border-color: var(--color-success, #10b981);
    background: color-mix(in srgb, var(--color-success, #10b981) 8%, transparent);
  }

  .base-alert--warning {
    border-color: var(--color-warning, #f59e0b);
    background: color-mix(in srgb, var(--color-warning, #f59e0b) 8%, transparent);
  }

  .base-alert--error {
    border-color: var(--color-error, #ef4444);
    background: color-mix(in srgb, var(--color-error, #ef4444) 8%, transparent);
  }

  /* Size Variants */
  .base-alert--sm {
    padding: var(--space-md, 1rem);
    gap: var(--space-sm, 0.75rem);
  }

  .base-alert--lg {
    padding: var(--space-xl, 1.5rem);
    gap: var(--space-lg, 1.25rem);
  }

  .base-alert--sm .base-alert__icon {
    margin-top: 0;
  }

  .base-alert--lg .base-alert__icon {
    margin-top: 0.125rem;
  }

  /* Icon Styles */
  .base-alert__icon {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .base-alert--info .base-alert__icon {
    color: var(--color-info, #3b82f6);
  }

  .base-alert--success .base-alert__icon {
    color: var(--color-success, #10b981);
  }

  .base-alert--warning .base-alert__icon {
    color: var(--color-warning, #f59e0b);
  }

  .base-alert--error .base-alert__icon {
    color: var(--color-error, #ef4444);
  }

  /* Content Styles */
  .base-alert__content {
    flex: 1;
    min-width: 0;
  }

  .base-alert__title {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #111827);
    margin-bottom: var(--space-xs, 0.5rem);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .base-alert__message {
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .base-alert--sm .base-alert__title,
  .base-alert--sm .base-alert__message {
    font-size: 0.8125rem;
  }

  .base-alert--lg .base-alert__title {
    font-size: 0.9375rem;
    margin-bottom: var(--space-sm, 0.75rem);
  }

  .base-alert--lg .base-alert__message {
    font-size: 0.9375rem;
  }

  /* Actions Styles */
  .base-alert__actions {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm, 0.75rem);
    flex-shrink: 0;
  }

  .base-alert--sm .base-alert__actions {
    gap: var(--space-xs, 0.5rem);
  }

  .base-alert__action {
    font-weight: var(--font-weight-medium, 500);
    color: currentColor;
    white-space: nowrap;
  }

  .base-alert__close {
    color: var(--color-text-muted, #9ca3af);
    padding: var(--space-xs, 0.5rem);
  }

    .base-alert__close:hover {
      color: var(--color-text-primary, #111827);
      background: color-mix(in srgb, currentColor 8%, transparent);
    }

  /* Banner variant */
  .base-alert--banner {
    border-radius: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-alert {
      padding: var(--space-md, 1rem);
      gap: var(--space-sm, 0.75rem);
    }

    .base-alert__actions {
      flex-direction: column;
      gap: var(--space-xs, 0.5rem);
    }

    .base-alert__action,
    .base-alert__close {
      width: 100%;
      justify-content: center;
    }
  }

  @media (max-width: 480px) {
    .base-alert {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .base-alert__icon {
      align-self: center;
      margin-top: 0;
    }

    .base-alert__actions {
      justify-content: center;
      margin-top: var(--space-sm, 0.75rem);
    }
  }
</style>
