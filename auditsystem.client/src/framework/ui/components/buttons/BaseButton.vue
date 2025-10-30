<!-- src/framework/ui/components/buttons/BaseButton.vue -->
<template>
  <button :type="type"
          :disabled="isDisabled"
          :class="buttonClasses"
          @click="handleClick"
          @keydown="handleKeydown">
    <span v-if="isLoading" class="base-button__loading">
      <span class="base-button__spinner"></span>
      <span v-if="$slots.loader" class="base-button__loader-text">
        <slot name="loader" />
      </span>
    </span>

    <span v-else class="base-button__content">
      <span v-if="$slots.prefix" class="base-button__prefix">
        <slot name="prefix" />
      </span>

      <span class="base-button__text">
        <slot />
      </span>

      <span v-if="$slots.suffix" class="base-button__suffix">
        <slot name="suffix" />
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  interface Props {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'button',
    variant: 'primary',
    size: 'md',
    isLoading: false,
    disabled: false,
    fullWidth: false,
  });

  const emit = defineEmits<{
    click: [event: MouseEvent];
    keydown: [event: KeyboardEvent];
  }>();

  const isDisabled = computed(() => props.disabled || props.isLoading);

  const buttonClasses = computed(() => [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
      'base-button--loading': props.isLoading,
      'base-button--disabled': isDisabled.value,
      'base-button--full-width': props.fullWidth,
    },
  ]);

  const handleClick = (event: MouseEvent): void => {
    if (!isDisabled.value) {
      emit('click', event);
    }
  };

  const handleKeydown = (event: KeyboardEvent): void => {
    emit('keydown', event);
  };
</script>

<style scoped>
  .base-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm, 8px);
    border: 1px solid transparent;
    border-radius: var(--radius-lg, 8px);
    font-weight: var(--font-weight-medium, 500);
    text-decoration: none;
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s);
    outline: none;
    font-family: var(--font-family-sans, inherit);
    line-height: 1.5;
    user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    background: var(--color-surface, #fff);
    color: var(--color-text-primary, #111827);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

    .base-button:focus-visible {
      outline: 2px solid var(--color-primary, #3b82f6);
      outline-offset: 2px;
      box-shadow: var(--shadow-focus, 0 0 0 3px rgba(59, 130, 246, 0.4));
    }

  /* Variants */
  .base-button--primary {
    background: var(--gradient-primary, linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%));
    color: white;
    box-shadow: var(--shadow-primary, 0 4px 12px rgba(14, 165, 233, 0.25));
    border-color: transparent;
  }

    .base-button--primary:hover:not(.base-button--disabled) {
      background: var(--gradient-primary-hover, linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%));
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .base-button--secondary {
    background: var(--color-surface, #fff);
    color: var(--color-text-primary, #111827);
    border-color: var(--color-border, #e2e8f0);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

    .base-button--secondary:hover:not(.base-button--disabled) {
      background: var(--color-surface-hover, #f8fafc);
      border-color: var(--color-primary, #3b82f6);
      color: var(--color-primary, #3b82f6);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .base-button--outline {
    background: transparent;
    color: var(--color-primary, #3b82f6);
    border-color: var(--color-primary, #3b82f6);
    box-shadow: none;
  }

    .base-button--outline:hover:not(.base-button--disabled) {
      background: var(--color-primary, #3b82f6);
      color: white;
      transform: translateY(-1px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .base-button--ghost {
    background: transparent;
    color: var(--color-text-secondary, #475569);
    border-color: transparent;
    box-shadow: none;
  }

    .base-button--ghost:hover:not(.base-button--disabled) {
      background: var(--color-surface-hover, #f8fafc);
      color: var(--color-text-primary, #111827);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
    }

  .base-button--danger {
    background: var(--color-error, #ef4444);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-error, #ef4444) 25%, transparent);
  }

    .base-button--danger:hover:not(.base-button--disabled) {
      background: var(--color-error-dark, #dc2626);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .base-button--success {
    background: var(--color-success, #10b981);
    color: white;
    border-color: transparent;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--color-success, #10b981) 25%, transparent);
  }

    .base-button--success:hover:not(.base-button--disabled) {
      background: var(--color-success-dark, #059669);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  /* Sizes */
  .base-button--sm {
    padding: var(--spacing-xs, 6px) var(--spacing-sm, 12px);
    font-size: 0.8125rem;
    min-height: 32px;
    border-radius: var(--radius-md, 6px);
  }

  .base-button--md {
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    font-size: 0.875rem;
    min-height: 36px;
    border-radius: var(--radius-lg, 8px);
  }

  .base-button--lg {
    padding: var(--spacing-md, 12px) var(--spacing-lg, 20px);
    font-size: 0.9375rem;
    min-height: 44px;
    border-radius: var(--radius-xl, 12px);
  }

  /* States */
  .base-button--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

    .base-button--disabled:hover {
      transform: none !important;
    }

  .base-button--full-width {
    width: 100%;
  }

  /* Loading state */
  .base-button--loading {
    cursor: wait;
  }

  .base-button__loading {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
  }

  .base-button__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .base-button__loader-text {
    font-size: inherit;
    font-weight: var(--font-weight-medium, 500);
  }

  .base-button__content {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
  }

  .base-button__prefix,
  .base-button__suffix {
    display: flex;
    align-items: center;
  }

  .base-button__text {
    flex: 1;
    font-weight: inherit;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  /* Dark theme adjustments */
  .theme-dark .base-button--secondary {
    background: var(--color-surface-dark, #1e293b);
    color: var(--color-text-primary-dark, #f1f5f9);
    border-color: var(--color-border-dark, #334155);
  }

    .theme-dark .base-button--secondary:hover:not(.base-button--disabled) {
      background: var(--color-surface-hover-dark, #1e293b);
      border-color: var(--color-primary, #3b82f6);
      color: var(--color-primary, #3b82f6);
    }

  .theme-dark .base-button--ghost {
    color: var(--color-text-secondary-dark, #cbd5e1);
  }

    .theme-dark .base-button--ghost:hover:not(.base-button--disabled) {
      background: var(--color-surface-hover-dark, #1e293b);
      color: var(--color-text-primary-dark, #f1f5f9);
    }

  .theme-dark .base-button--outline {
    color: var(--color-primary, #3b82f6);
    border-color: var(--color-primary, #3b82f6);
  }

    .theme-dark .base-button--outline:hover:not(.base-button--disabled) {
      background: var(--color-primary, #3b82f6);
      color: white;
    }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .base-button--lg {
      padding: var(--spacing-sm, 10px) var(--spacing-md, 16px);
      font-size: 0.875rem;
      min-height: 40px;
    }
  }

  @media (max-width: 480px) {
    .base-button--md {
      padding: var(--spacing-xs, 6px) var(--spacing-sm, 12px);
      font-size: 0.8125rem;
      min-height: 34px;
    }

    .base-button--lg {
      padding: var(--spacing-sm, 8px) var(--spacing-md, 14px);
      min-height: 38px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-button {
      transition: none;
    }

      .base-button:hover:not(.base-button--disabled) {
        transform: none;
      }

    .base-button__spinner {
      animation-duration: 2s;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .base-button {
      border-width: 2px;
    }

    .base-button--disabled {
      opacity: 0.8;
    }
  }
</style>
