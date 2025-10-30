<template>
  <div class="base-grid" :class="computedClasses" :style="computedStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    cols?: number | string
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    alignItems?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
    responsive?: boolean
    compact?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    cols: 1,
    gap: 'md',
    alignItems: 'stretch',
    justify: 'start',
    responsive: true,
    compact: false,
  })

  const computedClasses = computed(() => [
    `base-grid--gap-${props.gap}`,
    `base-grid--align-${props.alignItems}`,
    `base-grid--justify-${props.justify}`,
    {
      'base-grid--responsive': props.responsive,
      'base-grid--compact': props.compact,
    },
  ])

  const computedStyle = computed(() => ({
    '--grid-cols': props.cols,
  }))
</script>

<style scoped>
  .base-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols, 1), 1fr);
    width: 100%;
  }

  /* Gap variants using theme spacing variables */
  .base-grid--gap-none {
    gap: 0;
  }

  .base-grid--gap-xs {
    gap: var(--spacing-xs, 0.25rem);
  }

  .base-grid--gap-sm {
    gap: var(--spacing-sm, 0.5rem);
  }

  .base-grid--gap-md {
    gap: var(--spacing-md, 1rem);
  }

  .base-grid--gap-lg {
    gap: var(--spacing-lg, 1.5rem);
  }

  .base-grid--gap-xl {
    gap: var(--spacing-xl, 2rem);
  }

  /* Alignment */
  .base-grid--align-start {
    align-items: start;
  }

  .base-grid--align-center {
    align-items: center;
  }

  .base-grid--align-end {
    align-items: end;
  }

  .base-grid--align-stretch {
    align-items: stretch;
  }

  /* Justification */
  .base-grid--justify-start {
    justify-content: start;
  }

  .base-grid--justify-center {
    justify-content: center;
  }

  .base-grid--justify-end {
    justify-content: end;
  }

  .base-grid--justify-between {
    justify-content: space-between;
  }

  .base-grid--justify-around {
    justify-content: space-around;
  }

  .base-grid--justify-evenly {
    justify-content: space-evenly;
  }

  /* Responsive behavior */
  .base-grid--responsive {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  }

  /* Compact mode */
  .base-grid--compact {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  }

  /* Manual columns override */
  .base-grid[style*="--grid-cols"] {
    grid-template-columns: repeat(var(--grid-cols), 1fr);
  }

  /* Enhanced hover effects for interactive grids */
  .base-grid--interactive :deep(.grid-item) {
    transition: all var(--transition-fast, 0.15s);
  }

  .base-grid--interactive :deep(.grid-item:hover) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  }

  /* Theme-aware grid items */
  .base-grid :deep(.grid-item) {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.5rem);
  }

  /* Focus styles for accessibility */
  .base-grid :deep(.grid-item:focus-within) {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--shadow-focus, 0 0 0 3px color-mix(in srgb, var(--color-primary) 40%, transparent));
  }

  /* Responsive adjustments with theme consistency */
  @media (max-width: 1200px) {
    .base-grid--responsive {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    }
  }

  @media (max-width: 768px) {
    .base-grid--responsive {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
    }

    .base-grid--compact {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
    }

    /* Adjust gaps for mobile */
    .base-grid--gap-lg,
    .base-grid--gap-xl {
      gap: var(--spacing-md, 1rem);
    }
  }

  @media (max-width: 480px) {
    .base-grid--responsive {
      grid-template-columns: 1fr;
    }

    .base-grid--compact {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 120px), 1fr));
    }

    /* Further reduce gaps on very small screens */
    .base-grid--gap-lg,
    .base-grid--gap-xl {
      gap: var(--spacing-sm, 0.5rem);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-grid :deep(.grid-item) {
      border: 2px solid var(--color-text-primary, #111827);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-grid--interactive :deep(.grid-item) {
      transition: none;
    }

    .base-grid--interactive :deep(.grid-item:hover) {
      transform: none;
    }
  }

  /* Print styles */
  @media print {
    .base-grid {
      break-inside: avoid;
    }

      .base-grid :deep(.grid-item) {
        background: #ffffff !important;
        border: 1px solid #000000 !important;
      }
  }
</style>
