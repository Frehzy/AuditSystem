<!-- src/framework/ui/components/layout/BaseGrid.vue -->
<template>
  <div class="base-grid" :class="gridClasses" :style="gridStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  cols?: number | string
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cols: 1,
  gap: 'md',
  alignItems: 'stretch',
  justify: 'start',
  responsive: true,
})

const gridClasses = computed(() => [
  'base-grid',
  `base-grid--gap-${props.gap}`,
  `base-grid--align-${props.alignItems}`,
  `base-grid--justify-${props.justify}`,
  {
    'base-grid--responsive': props.responsive,
  },
])

const gridStyle = computed(() => ({
  '--grid-cols': props.cols,
}))
</script>

<style scoped>
  .base-grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-cols, 1), 1fr);
  }

  /* Gap variants */
  .base-grid--gap-none {
    gap: 0;
  }

  .base-grid--gap-xs {
    gap: var(--space-xs);
  }

  .base-grid--gap-sm {
    gap: var(--space-sm);
  }

  .base-grid--gap-md {
    gap: var(--space-md);
  }

  .base-grid--gap-lg {
    gap: var(--space-lg);
  }

  .base-grid--gap-xl {
    gap: var(--space-xl);
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

  /* Responsive behavior */
  .base-grid--responsive {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  /* Manual columns override */
  .base-grid[style*="--grid-cols"] {
    grid-template-columns: repeat(var(--grid-cols), 1fr);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .base-grid--responsive {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
  }

  @media (max-width: 480px) {
    .base-grid--responsive {
      grid-template-columns: 1fr;
    }

    .base-grid--gap-lg,
    .base-grid--gap-xl {
      gap: var(--space-md);
    }
  }
</style>
