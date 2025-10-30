<template>
  <span class="base-chip" :class="computedClasses" :style="computedStyle" @click="handleChipClick">
    <component v-if="icon"
               :is="icon"
               class="base-chip__icon"
               :size="16" />

    <span class="base-chip__label">
      <slot>{{ label }}</slot>
    </span>

    <button v-if="closable"
            @click="handleCloseClick"
            class="base-chip__close"
            :aria-label="`Удалить ${label}`">
      <CloseIcon :size="12" />
    </button>
  </span>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import CloseIcon from '@/assets/icons/actions/CloseIcon.vue';
  import type { Component } from 'vue';

  interface Props {
    label?: string
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
    size?: 'sm' | 'md' | 'lg'
    closable?: boolean
    icon?: Component
    outlined?: boolean
    clickable?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    closable: false,
    outlined: false,
    clickable: false,
  })

  const emit = defineEmits<{
    'close': []
    'click': []
  }>()

  const computedClasses = computed(() => [
    'base-chip',
    `base-chip--${props.variant}`,
    `base-chip--${props.size}`,
    {
      'base-chip--outlined': props.outlined,
      'base-chip--clickable': props.clickable,
      'base-chip--closable': props.closable,
    },
  ])

  const computedStyle = computed(() => ({}))

  const handleCloseClick = (event: Event) => {
    event.stopPropagation()
    emit('close')
  }

  const handleChipClick = () => {
    if (props.clickable) {
      emit('click')
    }
  }
</script>

<style scoped>
  .base-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
    padding: var(--space-xs, 0.5rem) var(--space-sm, 0.75rem);
    border-radius: var(--radius-full, 9999px);
    font-weight: var(--font-weight-medium, 500);
    font-size: 0.75rem;
    line-height: 1;
    white-space: nowrap;
    transition: all var(--transition-fast, 0.15s);
    border: 1px solid transparent;
    background: var(--color-surface, #fff);
    color: var(--color-text-primary, #111827);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  }

  /* Variants */
  .base-chip--primary {
    background: var(--color-primary, #0ea5e9);
    color: white;
    border-color: var(--color-primary, #0ea5e9);
  }

  .base-chip--secondary {
    background: var(--color-surface, #fff);
    color: var(--color-text-primary, #111827);
    border-color: var(--color-border, #e2e8f0);
  }

  .base-chip--success {
    background: var(--color-success, #10b981);
    color: white;
    border-color: var(--color-success, #10b981);
  }

  .base-chip--error {
    background: var(--color-error, #ef4444);
    color: white;
    border-color: var(--color-error, #ef4444);
  }

  .base-chip--warning {
    background: var(--color-warning, #f59e0b);
    color: white;
    border-color: var(--color-warning, #f59e0b);
  }

  .base-chip--info {
    background: var(--color-info, #3b82f6);
    color: white;
    border-color: var(--color-info, #3b82f6);
  }

  /* Outlined variant */
  .base-chip--outlined {
    background: transparent;
  }

    .base-chip--outlined.base-chip--primary {
      color: var(--color-primary, #0ea5e9);
      border-color: color-mix(in srgb, var(--color-primary, #0ea5e9) 30%, transparent);
    }

    .base-chip--outlined.base-chip--secondary {
      color: var(--color-text-secondary, #475569);
      border-color: var(--color-border, #e2e8f0);
    }

    .base-chip--outlined.base-chip--success {
      color: var(--color-success, #10b981);
      border-color: color-mix(in srgb, var(--color-success, #10b981) 30%, transparent);
    }

    .base-chip--outlined.base-chip--error {
      color: var(--color-error, #ef4444);
      border-color: color-mix(in srgb, var(--color-error, #ef4444) 30%, transparent);
    }

    .base-chip--outlined.base-chip--warning {
      color: var(--color-warning, #f59e0b);
      border-color: color-mix(in srgb, var(--color-warning, #f59e0b) 30%, transparent);
    }

    .base-chip--outlined.base-chip--info {
      color: var(--color-info, #3b82f6);
      border-color: color-mix(in srgb, var(--color-info, #3b82f6) 30%, transparent);
    }

  /* Sizes */
  .base-chip--sm {
    padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
    font-size: 0.6875rem;
    gap: var(--space-xs, 0.25rem);
  }

  .base-chip--lg {
    padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
    font-size: 0.875rem;
    gap: var(--space-sm, 0.5rem);
  }

  /* Clickable */
  .base-chip--clickable {
    cursor: pointer;
    transition: all var(--transition-fast, 0.15s);
  }

    .base-chip--clickable:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

    .base-chip--clickable.base-chip--outlined:hover {
      background: var(--color-surface-hover, #f8fafc);
    }

    .base-chip--clickable:not(.base-chip--outlined):hover {
      filter: brightness(1.05);
    }

  /* Close button */
  .base-chip__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    background: none;
    border: none;
    border-radius: var(--radius-full, 9999px);
    color: inherit;
    cursor: pointer;
    opacity: 0.7;
    transition: all var(--transition-fast, 0.15s);
    margin-left: var(--space-xs, 0.25rem);
  }

    .base-chip__close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

  .base-chip--outlined .base-chip__close:hover {
    background: var(--color-surface-hover, #f8fafc);
  }

  /* Icon styling */
  .base-chip__icon {
    flex-shrink: 0;
    color: inherit;
  }

  /* Label styling */
  .base-chip__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-chip {
      font-size: 0.6875rem;
    }

    .base-chip--lg {
      font-size: 0.8125rem;
    }
  }

  /* Focus styles for accessibility */
  .base-chip:focus-visible {
    outline: 2px solid var(--color-primary, #0ea5e9);
    outline-offset: 2px;
  }

  .base-chip__close:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-chip {
      border-width: 2px;
    }

    .base-chip--outlined {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-chip {
      transition: none;
    }

    .base-chip--clickable:hover {
      transform: none;
    }

    .base-chip__close:hover {
      transform: none;
    }
  }
</style>
