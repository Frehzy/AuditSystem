<template>
  <div class="base-button-group" :class="computedClasses" role="group" :aria-label="ariaLabel">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    orientation?: 'horizontal' | 'vertical'
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'secondary' | 'outline'
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    orientation: 'horizontal',
    size: 'md',
    variant: 'primary',
    ariaLabel: 'Button group',
  })

  const computedClasses = computed(() => [
    'base-button-group',
    `base-button-group--${props.orientation}`,
    `base-button-group--${props.size}`,
    `base-button-group--${props.variant}`,
  ])
</script>

<style scoped>
  .base-button-group {
    display: inline-flex;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  .base-button-group--horizontal {
    flex-direction: row;
  }

  .base-button-group--vertical {
    flex-direction: column;
  }

  /* Horizontal group styles */
  .base-button-group--horizontal ::v-deep(.base-button) {
    border-radius: 0;
    margin: 0;
  }

  .base-button-group--horizontal ::v-deep(.base-button:first-child) {
    border-top-left-radius: var(--radius-lg);
    border-bottom-left-radius: var(--radius-lg);
  }

  .base-button-group--horizontal ::v-deep(.base-button:last-child) {
    border-top-right-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
  }

  .base-button-group--horizontal ::v-deep(.base-button:not(:last-child)) {
    border-right: 1px solid rgba(0, 0, 0, 0.2);
  }

  /* Vertical group styles */
  .base-button-group--vertical ::v-deep(.base-button) {
    border-radius: 0;
    margin: 0;
  }

  .base-button-group--vertical ::v-deep(.base-button:first-child) {
    border-top-left-radius: var(--radius-lg);
    border-top-right-radius: var(--radius-lg);
  }

  .base-button-group--vertical ::v-deep(.base-button:last-child) {
    border-bottom-left-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
  }

  .base-button-group--vertical ::v-deep(.base-button:not(:last-child)) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  }

  /* Size variants */
  .base-button-group--sm {
    border-radius: var(--radius-md);
  }

    .base-button-group--sm ::v-deep(.base-button:first-child) {
      border-top-left-radius: var(--radius-md);
      border-bottom-left-radius: var(--radius-md);
    }

    .base-button-group--sm ::v-deep(.base-button:last-child) {
      border-top-right-radius: var(--radius-md);
      border-bottom-right-radius: var(--radius-md);
    }

  .base-button-group--lg {
    border-radius: var(--radius-xl);
  }

    .base-button-group--lg ::v-deep(.base-button:first-child) {
      border-top-left-radius: var(--radius-xl);
      border-bottom-left-radius: var(--radius-xl);
    }

    .base-button-group--lg ::v-deep(.base-button:last-child) {
      border-top-right-radius: var(--radius-xl);
      border-bottom-right-radius: var(--radius-xl);
    }

  /* Variant styles */
  .base-button-group--outline {
    box-shadow: none;
    border: 1px solid var(--color-border);
  }

    .base-button-group--outline ::v-deep(.base-button) {
      background: transparent;
      border: none;
      box-shadow: none;
    }

    .base-button-group--outline ::v-deep(.base-button:hover) {
      background: var(--color-surface-hover);
    }
</style>
