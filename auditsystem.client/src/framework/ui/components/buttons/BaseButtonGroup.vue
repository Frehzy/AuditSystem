<template>
  <div class="base-button-group"
       :class="computedClasses"
       role="group"
       :aria-label="ariaLabel">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    orientation?: 'horizontal' | 'vertical'
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    fullWidth?: boolean
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    orientation: 'horizontal',
    size: 'md',
    variant: 'primary',
    fullWidth: false,
    ariaLabel: 'Button group',
  })

  const computedClasses = computed(() => [
    `base-button-group--${props.orientation}`,
    `base-button-group--${props.size}`,
    `base-button-group--${props.variant}`,
    {
      'base-button-group--full-width': props.fullWidth
    }
  ])
</script>

<style scoped>
  .base-button-group {
    display: inline-flex;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
    position: relative;
  }

  .base-button-group--full-width {
    width: 100%;
    display: flex;
  }

  /* Orientation styles */
  .base-button-group--horizontal {
    flex-direction: row;
  }

  .base-button-group--vertical {
    flex-direction: column;
  }

  /* Size variants */
  .base-button-group--sm {
    border-radius: var(--radius-md);
  }

  .base-button-group--lg {
    border-radius: var(--radius-xl);
  }

  /* Variant styles */
  .base-button-group--primary {
    background: var(--gradient-primary);
    box-shadow: var(--shadow-primary);
  }

  .base-button-group--secondary {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-sm);
  }

  .base-button-group--outline {
    background: transparent;
    border: 1px solid var(--color-border);
    box-shadow: none;
  }

  .base-button-group--ghost {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  /* Horizontal group button styles */
  .base-button-group--horizontal ::v-deep(.base-button) {
    border-radius: 0;
    margin: 0;
    flex: 1;
  }

  .base-button-group--horizontal ::v-deep(.base-button:first-child) {
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
  }

  .base-button-group--horizontal ::v-deep(.base-button:last-child) {
    border-top-right-radius: inherit;
    border-bottom-right-radius: inherit;
  }

  /* Vertical group button styles */
  .base-button-group--vertical ::v-deep(.base-button) {
    border-radius: 0;
    margin: 0;
    width: 100%;
  }

  .base-button-group--vertical ::v-deep(.base-button:first-child) {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }

  .base-button-group--vertical ::v-deep(.base-button:last-child) {
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
  }

  /* Border styles for different variants */
  .base-button-group--primary.base-button-group--horizontal ::v-deep(.base-button:not(:last-child)) {
    border-right: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  .base-button-group--secondary.base-button-group--horizontal ::v-deep(.base-button:not(:last-child)) {
    border-right: 1px solid var(--color-border);
  }

  .base-button-group--outline.base-button-group--horizontal ::v-deep(.base-button:not(:last-child)) {
    border-right: 1px solid var(--color-border);
  }

  .base-button-group--ghost.base-button-group--horizontal ::v-deep(.base-button:not(:last-child)) {
    border-right: 1px solid var(--color-border-light);
  }

  .base-button-group--primary.base-button-group--vertical ::v-deep(.base-button:not(:last-child)) {
    border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  }

  .base-button-group--secondary.base-button-group--vertical ::v-deep(.base-button:not(:last-child)) {
    border-bottom: 1px solid var(--color-border);
  }

  .base-button-group--outline.base-button-group--vertical ::v-deep(.base-button:not(:last-child)) {
    border-bottom: 1px solid var(--color-border);
  }

  .base-button-group--ghost.base-button-group--vertical ::v-deep(.base-button:not(:last-child)) {
    border-bottom: 1px solid var(--color-border-light);
  }

  /* Hover effects */
  .base-button-group--primary:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }

  .base-button-group--secondary:hover {
    box-shadow: var(--shadow-md);
  }

  .base-button-group--outline:hover {
    border-color: var(--color-primary);
  }

  .base-button-group--ghost:hover {
    background: var(--color-surface-hover);
  }

  /* Focus states for accessibility */
  .base-button-group:focus-within {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--shadow-focus);
  }

  /* Disabled state */
  .base-button-group:has(::v-deep(.base-button--disabled)) {
    opacity: 0.6;
    cursor: not-allowed;
  }

    .base-button-group:has(::v-deep(.base-button--disabled)):hover {
      transform: none;
      box-shadow: var(--shadow-sm);
    }

  /* Animation for state changes */
  .base-button-group ::v-deep(.base-button) {
    transition: all var(--transition-fast);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .base-button-group--horizontal {
      flex-direction: column;
    }

      .base-button-group--horizontal.base-button-group--primary ::v-deep(.base-button:not(:last-child)) {
        border-right: none;
        border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
      }

      .base-button-group--horizontal.base-button-group--secondary ::v-deep(.base-button:not(:last-child)) {
        border-right: none;
        border-bottom: 1px solid var(--color-border);
      }

      .base-button-group--horizontal.base-button-group--outline ::v-deep(.base-button:not(:last-child)) {
        border-right: none;
        border-bottom: 1px solid var(--color-border);
      }

      .base-button-group--horizontal.base-button-group--ghost ::v-deep(.base-button:not(:last-child)) {
        border-right: none;
        border-bottom: 1px solid var(--color-border-light);
      }

      .base-button-group--horizontal ::v-deep(.base-button:first-child) {
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      }

      .base-button-group--horizontal ::v-deep(.base-button:last-child) {
        border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-button-group {
      border: 2px solid var(--color-text-primary);
    }

    .base-button-group--outline {
      border-width: 2px;
    }

    .base-button-group--ghost {
      border: 2px solid var(--color-text-primary);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-button-group,
    .base-button-group ::v-deep(.base-button) {
      transition: none;
    }

    .base-button-group--primary:hover {
      transform: none;
    }
  }
</style>
