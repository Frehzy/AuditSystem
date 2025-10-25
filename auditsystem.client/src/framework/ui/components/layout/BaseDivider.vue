<!-- src/framework/ui/components/layout/BaseDivider.vue -->
<template>
  <hr class="base-divider" :class="dividerClasses" :style="dividerStyle" role="separator" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  color?: string
  size?: 'sm' | 'md' | 'lg'
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  labelPosition?: 'start' | 'center' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  orientation: 'horizontal',
  variant: 'solid',
  size: 'md',
  spacing: 'md',
  labelPosition: 'center',
})

const dividerClasses = computed(() => [
  'base-divider',
  `base-divider--${props.orientation}`,
  `base-divider--${props.variant}`,
  `base-divider--size-${props.size}`,
  `base-divider--spacing-${props.spacing}`,
  {
    'base-divider--with-label': !!props.label,
    [`base-divider--label-${props.labelPosition}`]: !!props.label,
  },
])

const dividerStyle = computed(() => ({
  '--divider-color': props.color,
}))
</script>

<style scoped>
  .base-divider {
    border: none;
    background: var(--divider-color, var(--color-border));
    margin: 0;
  }

  /* Horizontal divider */
  .base-divider--horizontal {
    width: 100%;
    height: 1px;
  }

    .base-divider--horizontal.base-divider--with-label {
      display: flex;
      align-items: center;
      background: none;
    }

      .base-divider--horizontal.base-divider--with-label::before,
      .base-divider--horizontal.base-divider--with-label::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--divider-color, var(--color-border));
      }

      .base-divider--horizontal.base-divider--with-label::before {
        margin-right: var(--space-md);
      }

      .base-divider--horizontal.base-divider--with-label::after {
        margin-left: var(--space-md);
      }

  .base-divider--label-start.base-divider--with-label::before {
    flex: 0;
    margin-right: var(--space-md);
  }

  .base-divider--label-end.base-divider--with-label::after {
    flex: 0;
    margin-left: var(--space-md);
  }

  /* Vertical divider */
  .base-divider--vertical {
    width: 1px;
    height: 100%;
    align-self: stretch;
  }

  /* Variants */
  .base-divider--solid {
    border-style: solid;
  }

  .base-divider--dashed {
    border-style: dashed;
  }

  .base-divider--dotted {
    border-style: dotted;
  }

  /* Sizes */
  .base-divider--size-sm.base-divider--horizontal {
    height: 1px;
  }

  .base-divider--size-md.base-divider--horizontal {
    height: 2px;
  }

  .base-divider--size-lg.base-divider--horizontal {
    height: 3px;
  }

  .base-divider--size-sm.base-divider--vertical {
    width: 1px;
  }

  .base-divider--size-md.base-divider--vertical {
    width: 2px;
  }

  .base-divider--size-lg.base-divider--vertical {
    width: 3px;
  }

  /* Spacing */
  .base-divider--spacing-none {
    margin: 0;
  }

  .base-divider--spacing-sm {
    margin: var(--space-sm) 0;
  }

  .base-divider--spacing-md {
    margin: var(--space-md) 0;
  }

  .base-divider--spacing-lg {
    margin: var(--space-lg) 0;
  }

  .base-divider--spacing-xl {
    margin: var(--space-xl) 0;
  }

  .base-divider--vertical.base-divider--spacing-sm {
    margin: 0 var(--space-sm);
  }

  .base-divider--vertical.base-divider--spacing-md {
    margin: 0 var(--space-md);
  }

  .base-divider--vertical.base-divider--spacing-lg {
    margin: 0 var(--space-lg);
  }

  .base-divider--vertical.base-divider--spacing-xl {
    margin: 0 var(--space-xl);
  }

  /* Label */
  .base-divider__label {
    padding: 0 var(--space-sm);
    color: var(--color-text-muted);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-divider--vertical {
      display: none;
    }

    .base-divider--horizontal.base-divider--with-label::before,
    .base-divider--horizontal.base-divider--with-label::after {
      margin-left: var(--space-sm);
      margin-right: var(--space-sm);
    }
  }
</style>
