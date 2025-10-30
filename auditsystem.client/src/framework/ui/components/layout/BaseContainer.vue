<!-- src/framework/ui/components/layout/BaseContainer.vue -->
<template>
  <div class="base-container" :class="containerClasses" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    centered?: boolean
    fluid?: boolean
    background?: 'default' | 'card' | 'muted' | 'transparent'
    border?: boolean
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  }

  const props = withDefaults(defineProps<Props>(), {
    maxWidth: 'lg',
    padding: 'md',
    centered: true,
    fluid: false,
    background: 'default',
    border: false,
    borderRadius: 'none',
    shadow: 'none',
  })

  const containerClasses = computed(() => [
    'base-container',
    `base-container--max-width-${props.maxWidth}`,
    `base-container--padding-${props.padding}`,
    `base-container--background-${props.background}`,
    `base-container--radius-${props.borderRadius}`,
    `base-container--shadow-${props.shadow}`,
    {
      'base-container--centered': props.centered,
      'base-container--fluid': props.fluid,
      'base-container--bordered': props.border,
    },
  ])

  const containerStyle = computed(() => ({
    '--container-max-width': getMaxWidth(),
  }))

  const getMaxWidth = (): string => {
    if (props.fluid) return '100%'

    const widths = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      full: '100%',
    }
    return widths[props.maxWidth]
  }
</script>

<style scoped>
  .base-container {
    width: 100%;
    margin: 0 auto;
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
    background: var(--container-bg, transparent);
    border: var(--container-border, none);
    border-radius: var(--container-radius, 0);
    box-shadow: var(--container-shadow, none);
    transition: all var(--transition-normal);
  }

  .base-container--centered {
    margin-left: auto;
    margin-right: auto;
  }

  .base-container--fluid {
    max-width: 100%;
  }

  /* Max width variants */
  .base-container--max-width-sm {
    max-width: var(--container-max-width, 640px);
  }

  .base-container--max-width-md {
    max-width: var(--container-max-width, 768px);
  }

  .base-container--max-width-lg {
    max-width: var(--container-max-width, 1024px);
  }

  .base-container--max-width-xl {
    max-width: var(--container-max-width, 1280px);
  }

  .base-container--max-width-2xl {
    max-width: var(--container-max-width, 1536px);
  }

  .base-container--max-width-full {
    max-width: var(--container-max-width, 100%);
  }

  /* Padding variants */
  .base-container--padding-none {
    padding-left: 0;
    padding-right: 0;
  }

  .base-container--padding-xs {
    padding-left: var(--spacing-xs);
    padding-right: var(--spacing-xs);
  }

  .base-container--padding-sm {
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
  }

  .base-container--padding-md {
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
  }

  .base-container--padding-lg {
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
  }

  .base-container--padding-xl {
    padding-left: var(--spacing-xl);
    padding-right: var(--spacing-xl);
  }

  .base-container--padding-2xl {
    padding-left: var(--spacing-2xl);
    padding-right: var(--spacing-2xl);
  }

  /* Background variants */
  .base-container--background-default {
    --container-bg: var(--color-background);
  }

  .base-container--background-card {
    --container-bg: var(--color-background-card);
  }

  .base-container--background-muted {
    --container-bg: var(--color-surface-hover);
  }

  .base-container--background-transparent {
    --container-bg: transparent;
  }

  /* Border */
  .base-container--bordered {
    --container-border: 1px solid var(--color-border);
  }

  /* Border radius variants */
  .base-container--radius-none {
    --container-radius: 0;
  }

  .base-container--radius-sm {
    --container-radius: var(--radius-sm);
  }

  .base-container--radius-md {
    --container-radius: var(--radius-md);
  }

  .base-container--radius-lg {
    --container-radius: var(--radius-lg);
  }

  .base-container--radius-xl {
    --container-radius: var(--radius-xl);
  }

  .base-container--radius-2xl {
    --container-radius: var(--radius-2xl);
  }

  /* Shadow variants */
  .base-container--shadow-none {
    --container-shadow: none;
  }

  .base-container--shadow-sm {
    --container-shadow: var(--shadow-sm);
  }

  .base-container--shadow-md {
    --container-shadow: var(--shadow-md);
  }

  .base-container--shadow-lg {
    --container-shadow: var(--shadow-lg);
  }

  .base-container--shadow-xl {
    --container-shadow: var(--shadow-xl);
  }

  /* Hover effects for interactive containers */
  .base-container--bordered.base-container--background-card:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
  }

  .base-container--shadow-sm:hover {
    box-shadow: var(--shadow-md);
  }

  .base-container--shadow-md:hover {
    box-shadow: var(--shadow-lg);
  }

  /* Focus styles for accessibility */
  .base-container:focus-within {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--shadow-focus);
  }

  /* Responsive design */
  @media (max-width: 1024px) {
    .base-container--max-width-xl,
    .base-container--max-width-2xl {
      max-width: var(--container-max-width, 1024px);
    }
  }

  @media (max-width: 768px) {
    .base-container {
      padding-left: var(--spacing-sm);
      padding-right: var(--spacing-sm);
    }

    .base-container--padding-lg,
    .base-container--padding-xl,
    .base-container--padding-2xl {
      padding-left: var(--spacing-md);
      padding-right: var(--spacing-md);
    }

    .base-container--max-width-lg,
    .base-container--max-width-xl,
    .base-container--max-width-2xl {
      max-width: var(--container-max-width, 768px);
    }
  }

  @media (max-width: 640px) {
    .base-container {
      padding-left: var(--spacing-xs);
      padding-right: var(--spacing-xs);
    }

    .base-container--padding-md {
      padding-left: var(--spacing-sm);
      padding-right: var(--spacing-sm);
    }

    .base-container--max-width-md,
    .base-container--max-width-lg,
    .base-container--max-width-xl,
    .base-container--max-width-2xl {
      max-width: var(--container-max-width, 100%);
    }
  }

  @media (max-width: 480px) {
    .base-container {
      padding-left: var(--spacing-xs);
      padding-right: var(--spacing-xs);
    }

    .base-container--padding-sm {
      padding-left: var(--spacing-xs);
      padding-right: var(--spacing-xs);
    }

    /* Remove shadows on mobile for better performance */
    .base-container--shadow-lg,
    .base-container--shadow-xl {
      box-shadow: var(--shadow-md);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-container--bordered {
      --container-border: 2px solid var(--color-text-primary);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-container {
      transition: none;
    }
  }

  /* Print styles */
  @media print {
    .base-container {
      background: white !important;
      border: 1px solid var(--color-gray-300) !important;
      box-shadow: none !important;
      margin: 0 !important;
      max-width: 100% !important;
    }
  }
</style>
