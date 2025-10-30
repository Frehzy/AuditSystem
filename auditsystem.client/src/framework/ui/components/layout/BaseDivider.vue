<!-- src/framework/ui/components/layout/BaseDivider.vue -->
<template>
  <div class="base-divider-wrapper" :class="wrapperClasses">
    <hr v-if="!label || orientation === 'vertical'"
        class="base-divider"
        :class="dividerClasses"
        :style="dividerStyle"
        role="separator"
        :aria-label="label || 'Divider'" />

    <!-- Horizontal divider with label -->
    <div v-else
         class="base-divider--labeled"
         :class="labelPositionClasses"
         role="separator"
         :aria-label="label">
      <span class="divider-line" :style="lineStyle"></span>
      <span class="divider-label" :style="labelStyle">
        <slot name="label">
          {{ label }}
        </slot>
      </span>
      <span class="divider-line" :style="lineStyle"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, type CSSProperties } from 'vue'

  interface Props {
    orientation?: 'horizontal' | 'vertical'
    variant?: 'solid' | 'dashed' | 'dotted' | 'gradient'
    color?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    label?: string
    labelPosition?: 'start' | 'center' | 'end'
    labelColor?: string
    gradientFrom?: string
    gradientTo?: string
    inset?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    orientation: 'horizontal',
    variant: 'solid',
    size: 'md',
    spacing: 'md',
    labelPosition: 'center',
    labelColor: '',
    gradientFrom: 'var(--color-primary)',
    gradientTo: 'var(--color-primary-dark)',
    inset: false,
  })

  // Computed classes
  const wrapperClasses = computed(() => [
    'base-divider-wrapper',
    `base-divider-wrapper--${props.orientation}`,
    {
      'base-divider-wrapper--inset': props.inset,
    },
  ])

  const dividerClasses = computed(() => [
    'base-divider',
    `base-divider--${props.orientation}`,
    `base-divider--${props.variant}`,
    `base-divider--size-${props.size}`,
    `base-divider--spacing-${props.spacing}`,
  ])

  const labelPositionClasses = computed(() => [
    'base-divider--labeled',
    `base-divider--label-${props.labelPosition}`,
  ])

  // Computed styles
  const dividerStyle = computed(() => {
    const style: CSSProperties = {}

    if (props.color) {
      style['--divider-color'] = props.color
    }

    if (props.variant === 'gradient') {
      style['--gradient-from'] = props.gradientFrom
      style['--gradient-to'] = props.gradientTo
    }

    return style
  })

  const lineStyle = computed(() => {
    const style: CSSProperties = {}

    if (props.color) {
      style.background = props.color
    } else if (props.variant === 'gradient') {
      style.background = `linear-gradient(to right, ${props.gradientFrom}, ${props.gradientTo})`
    }

    return style
  })

  const labelStyle = computed(() => {
    const style: CSSProperties = {}

    if (props.labelColor) {
      style.color = props.labelColor
    }

    return style
  })
</script>

<style scoped>
  .base-divider-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .base-divider-wrapper--horizontal {
    flex-direction: row;
  }

  .base-divider-wrapper--vertical {
    flex-direction: column;
    height: 100%;
  }

  .base-divider-wrapper--inset {
    padding: 0 var(--spacing-md);
  }

  .base-divider-wrapper--vertical.base-divider-wrapper--inset {
    padding: var(--spacing-md) 0;
  }

  /* Base divider styles */
  .base-divider {
    border: none;
    background: var(--divider-color, var(--color-border));
    margin: 0;
    flex-shrink: 0;
  }

  /* Horizontal divider */
  .base-divider--horizontal {
    width: 100%;
    height: 1px;
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
    background: none;
    border-color: var(--divider-color, var(--color-border));
  }

  .base-divider--dotted {
    border-style: dotted;
    background: none;
    border-color: var(--divider-color, var(--color-border));
  }

  .base-divider--gradient {
    background: linear-gradient( v-bind('props.orientation === "horizontal" ? "to right" : "to bottom"'), var(--gradient-from, var(--color-primary)), var(--gradient-to, var(--color-primary-dark)) );
    border: none;
  }

  /* Sizes for horizontal dividers */
  .base-divider--size-xs.base-divider--horizontal {
    height: 1px;
  }

  .base-divider--size-sm.base-divider--horizontal {
    height: 2px;
  }

  .base-divider--size-md.base-divider--horizontal {
    height: 3px;
  }

  .base-divider--size-lg.base-divider--horizontal {
    height: 4px;
  }

  .base-divider--size-xl.base-divider--horizontal {
    height: 6px;
  }

  /* Sizes for vertical dividers */
  .base-divider--size-xs.base-divider--vertical {
    width: 1px;
  }

  .base-divider--size-sm.base-divider--vertical {
    width: 2px;
  }

  .base-divider--size-md.base-divider--vertical {
    width: 3px;
  }

  .base-divider--size-lg.base-divider--vertical {
    width: 4px;
  }

  .base-divider--size-xl.base-divider--vertical {
    width: 6px;
  }

  /* Spacing */
  .base-divider--spacing-none {
    margin: 0;
  }

  .base-divider--spacing-xs {
    margin: var(--spacing-xs) 0;
  }

  .base-divider--spacing-sm {
    margin: var(--spacing-sm) 0;
  }

  .base-divider--spacing-md {
    margin: var(--spacing-md) 0;
  }

  .base-divider--spacing-lg {
    margin: var(--spacing-lg) 0;
  }

  .base-divider--spacing-xl {
    margin: var(--spacing-xl) 0;
  }

  .base-divider--spacing-2xl {
    margin: var(--spacing-2xl) 0;
  }

  /* Vertical spacing */
  .base-divider--vertical.base-divider--spacing-xs {
    margin: 0 var(--spacing-xs);
  }

  .base-divider--vertical.base-divider--spacing-sm {
    margin: 0 var(--spacing-sm);
  }

  .base-divider--vertical.base-divider--spacing-md {
    margin: 0 var(--spacing-md);
  }

  .base-divider--vertical.base-divider--spacing-lg {
    margin: 0 var(--spacing-lg);
  }

  .base-divider--vertical.base-divider--spacing-xl {
    margin: 0 var(--spacing-xl);
  }

  .base-divider--vertical.base-divider--spacing-2xl {
    margin: 0 var(--spacing-2xl);
  }

  /* Labeled divider */
  .base-divider--labeled {
    display: flex;
    align-items: center;
    width: 100%;
    gap: var(--spacing-md);
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: var(--divider-color, var(--color-border));
    transition: all var(--transition-fast);
  }

  .divider-label {
    padding: 0 var(--spacing-sm);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    font-weight: var(--font-weight-medium);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Label positions */
  .base-divider--label-start .divider-line:first-child {
    flex: 0 0 var(--spacing-md);
  }

  .base-divider--label-start .divider-line:last-child {
    flex: 1;
  }

  .base-divider--label-end .divider-line:first-child {
    flex: 1;
  }

  .base-divider--label-end .divider-line:last-child {
    flex: 0 0 var(--spacing-md);
  }

  .base-divider--label-center .divider-line {
    flex: 1;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .base-divider--vertical {
      display: none;
    }

    .base-divider--labeled {
      gap: var(--spacing-sm);
    }

    .divider-label {
      font-size: 0.8125rem;
      padding: 0 var(--spacing-xs);
    }
  }

  /* Dark theme adjustments */
  @media (prefers-color-scheme: dark) {
    .base-divider--gradient {
      opacity: 0.9;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .divider-line {
      transition: none;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .base-divider {
      background: var(--color-text-primary);
    }

    .divider-line {
      background: var(--color-text-primary);
    }

    .divider-label {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-bold);
    }
  }

  /* Print styles */
  @media print {
    .base-divider {
      background: #000;
    }

    .divider-line {
      background: #000;
    }

    .divider-label {
      color: #000;
    }
  }
</style>
