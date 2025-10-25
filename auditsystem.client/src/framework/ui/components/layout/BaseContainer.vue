<!-- src/framework/ui/components/layout/BaseContainer.vue -->
<template>
  <div class="base-container" :class="containerClasses" :style="containerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    centered?: boolean
    fluid?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    maxWidth: 'lg',
    padding: 'md',
    centered: true,
    fluid: false,
  })

  const containerClasses = computed(() => [
    'base-container',
    `base-container--max-width-${props.maxWidth}`,
    `base-container--padding-${props.padding}`,
    {
      'base-container--centered': props.centered,
      'base-container--fluid': props.fluid,
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
      full: '100%',
    }
    return widths[props.maxWidth]
  }
</script>

<style scoped>
  .base-container {
    width: 100%;
    margin: 0 auto;
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .base-container--centered {
    margin-left: auto;
    margin-right: auto;
  }

  .base-container--fluid {
    max-width: 100%;
  }

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

  .base-container--max-width-full {
    max-width: var(--container-max-width, 100%);
  }

  /* Padding variants */
  .base-container--padding-none {
    padding-left: 0;
    padding-right: 0;
  }

  .base-container--padding-sm {
    padding-left: var(--space-sm);
    padding-right: var(--space-sm);
  }

  .base-container--padding-md {
    padding-left: var(--space-md);
    padding-right: var(--space-md);
  }

  .base-container--padding-lg {
    padding-left: var(--space-lg);
    padding-right: var(--space-lg);
  }

  .base-container--padding-xl {
    padding-left: var(--space-xl);
    padding-right: var(--space-xl);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-container {
      padding-left: var(--space-sm);
      padding-right: var(--space-sm);
    }

    .base-container--padding-lg,
    .base-container--padding-xl {
      padding-left: var(--space-md);
      padding-right: var(--space-md);
    }
  }

  @media (max-width: 480px) {
    .base-container {
      padding-left: var(--space-xs);
      padding-right: var(--space-xs);
    }

    .base-container--padding-md {
      padding-left: var(--space-sm);
      padding-right: var(--space-sm);
    }
  }
</style>
