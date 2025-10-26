<!-- src/framework/ui/components/buttons/BaseButton.vue -->
<template>
  <button :type="type"
          :disabled="isDisabled"
          :class="buttonClasses"
          @click="handleClick"
          @keydown="handleKeydown">
    <span v-if="isLoading" class="base-button__loading">
      <!-- Заменяем BaseSpinner на простую анимацию -->
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
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
    gap: 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    outline: none;
    font-family: inherit;
    line-height: 1.5;
    user-select: none;
    white-space: nowrap;
    vertical-align: middle;
  }

    .base-button:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

  /* Variants */
  .base-button--primary {
    background: var(--gradient-primary);
    color: white;
    box-shadow: var(--shadow-primary);
  }

    .base-button--primary:hover:not(.base-button--disabled) {
      background: var(--gradient-primary-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
    }

  .base-button--secondary {
    background: var(--color-gray-100);
    color: var(--color-gray-900);
    border-color: var(--color-gray-300);
  }

    .base-button--secondary:hover:not(.base-button--disabled) {
      background: var(--color-gray-200);
      border-color: var(--color-gray-400);
    }

  .base-button--outline {
    background: transparent;
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

    .base-button--outline:hover:not(.base-button--disabled) {
      background: var(--color-primary);
      color: white;
    }

  .base-button--ghost {
    background: transparent;
    color: var(--color-gray-700);
    border-color: transparent;
  }

    .base-button--ghost:hover:not(.base-button--disabled) {
      background: var(--color-gray-100);
      color: var(--color-gray-900);
    }

  .base-button--danger {
    background: var(--color-error);
    color: white;
  }

    .base-button--danger:hover:not(.base-button--disabled) {
      background: var(--color-error-dark);
      transform: translateY(-1px);
    }

  /* Sizes */
  .base-button--sm {
    padding: 6px 12px;
    font-size: 13px;
    min-height: 32px;
  }

  .base-button--md {
    padding: 8px 16px;
    font-size: 14px;
    min-height: 36px;
  }

  .base-button--lg {
    padding: 12px 20px;
    font-size: 15px;
    min-height: 44px;
  }

  /* States */
  .base-button--disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
    gap: 8px;
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
  }

  .base-button__content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .base-button__prefix,
  .base-button__suffix {
    display: flex;
    align-items: center;
  }

  .base-button__text {
    flex: 1;
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
    background: var(--color-gray-800);
    color: var(--color-gray-100);
    border-color: var(--color-gray-700);
  }

    .theme-dark .base-button--secondary:hover:not(.base-button--disabled) {
      background: var(--color-gray-700);
      border-color: var(--color-gray-600);
    }

  .theme-dark .base-button--ghost {
    color: var(--color-gray-300);
  }

    .theme-dark .base-button--ghost:hover:not(.base-button--disabled) {
      background: var(--color-gray-800);
      color: var(--color-gray-100);
    }
</style>
