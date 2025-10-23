<template>
  <button :type="buttonType"
          :disabled="isDisabled"
          :class="buttonClasses"
          @click="handleClick"
          :aria-label="ariaLabel"
          :aria-busy="isLoading">
    <span v-if="isLoading" class="base-button__loading-content">
      <BaseSpinner :size="spinnerSize"
                   :color="spinnerColor"
                   class="base-button__spinner" />
      <span v-if="showLoadingText" class="base-button__loading-text">
        {{ loadingText }}
      </span>
    </span>

    <span v-else class="base-button__content">
      <slot name="icon-left"></slot>
      <span class="base-button__text">
        <slot />
      </span>
      <slot name="icon-right"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import BaseSpinner from './BaseSpinner.vue';

  interface Props {
    buttonType?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loadingText?: string;
    showLoadingText?: boolean;
    ariaLabel?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    buttonType: 'button',
    disabled: false,
    isLoading: false,
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    loadingText: 'Loading...',
    showLoadingText: false,
    ariaLabel: undefined,
  });

  const emit = defineEmits<{
    click: [event: MouseEvent];
  }>();

  const isDisabled = computed(() => props.disabled || props.isLoading);

  const buttonClasses = computed(() => [
    'base-button',
    `base-button--${props.variant}`,
    `base-button--${props.size}`,
    {
      'base-button--disabled': isDisabled.value,
      'base-button--loading': props.isLoading,
      'base-button--full-width': props.fullWidth,
    },
  ]);

  const spinnerSize = computed(() => {
    const sizes = { sm: '14px', md: '16px', lg: '18px' };
    return sizes[props.size];
  });

  const spinnerColor = computed(() => {
    const colors = {
      primary: 'currentColor',
      secondary: 'currentColor',
      danger: 'currentColor',
      ghost: 'currentColor',
      success: 'currentColor',
    };
    return colors[props.variant];
  });

  const handleClick = (event: MouseEvent): void => {
    if (!isDisabled.value) {
      emit('click', event);
    }
  };
</script>

<style scoped>
  .base-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all var(--transition-normal);
    min-height: 40px;
    width: auto;
    min-width: max-content;
    position: relative;
    font-family: inherit;
    line-height: 1.4;
    background: var(--gradient-primary);
    color: white;
    box-shadow: var(--shadow-sm);
  }

  /* Primary variant */
  .base-button--primary {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
  }

    .base-button--primary:hover:not(.base-button--disabled) {
      background: var(--gradient-primary-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-primary);
    }

    .base-button--primary:active:not(.base-button--disabled) {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

  /* Secondary variant */
  .base-button--secondary {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border-color: var(--color-border);
  }

    .base-button--secondary:hover:not(.base-button--disabled) {
      background: var(--color-surface-hover);
      border-color: var(--color-primary-light);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

  /* Danger variant */
  .base-button--danger {
    background: var(--color-error);
    color: white;
    border-color: var(--color-error);
  }

    .base-button--danger:hover:not(.base-button--disabled) {
      background: var(--color-error-dark);
      border-color: var(--color-error-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--color-error) 30%, transparent);
    }

  /* Success variant */
  .base-button--success {
    background: var(--color-success);
    color: white;
    border-color: var(--color-success);
  }

    .base-button--success:hover:not(.base-button--disabled) {
      background: var(--color-success-dark);
      border-color: var(--color-success-dark);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--color-success) 30%, transparent);
    }

  /* Ghost variant */
  .base-button--ghost {
    background: transparent;
    color: var(--color-primary);
    border-color: transparent;
    box-shadow: none;
  }

    .base-button--ghost:hover:not(.base-button--disabled) {
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary-dark);
      transform: translateY(-1px);
    }

  /* Sizes */
  .base-button--sm {
    padding: 8px 12px;
    min-height: 32px;
    font-size: 12px;
    border-radius: 6px;
  }

  .base-button--lg {
    padding: 12px 20px;
    min-height: 48px;
    font-size: 16px;
    border-radius: 10px;
  }

  /* States */
  .base-button--disabled,
  .base-button--loading {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  .base-button--full-width {
    width: 100%;
  }

  /* Content */
  .base-button__content {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .base-button__loading-content {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .base-button__spinner {
    flex-shrink: 0;
  }

  .base-button__text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .base-button__loading-text {
    white-space: nowrap;
  }

  /* Focus styles */
  .base-button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Адаптивность */
  @media (max-width: 480px) {
    .base-button {
      min-height: 44px;
      border-radius: 8px;
    }

    .base-button--sm {
      min-height: 36px;
    }

    .base-button--lg {
      min-height: 52px;
    }
  }

  @media (max-width: 360px) {
    .base-button {
      min-height: 42px;
      font-size: 13px;
      padding: 8px 12px;
    }
  }
</style>
