<template>
  <div class="base-progress" :class="computedClasses" role="progressbar"
       :aria-valuenow="computedValue"
       :aria-valuemin="min"
       :aria-valuemax="max"
       :aria-label="ariaLabel">

    <!-- Header with label and value -->
    <div v-if="label || showValue" class="base-progress__header">
      <span v-if="label" class="base-progress__label">{{ label }}</span>
      <span v-if="showValue" class="base-progress__value">{{ computedDisplayValue }}</span>
    </div>

    <!-- Progress track and bar -->
    <div class="base-progress__track">
      <div class="base-progress__bar" :style="computedBarStyle">
        <div v-if="indeterminate" class="base-progress__indeterminate"></div>
        <div v-if="striped && !indeterminate" class="base-progress__stripes"></div>
      </div>
    </div>

    <!-- Help text -->
    <div v-if="helpText" class="base-progress__help">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    value: number
    min?: number
    max?: number
    label?: string
    helpText?: string
    showValue?: boolean
    indeterminate?: boolean
    striped?: boolean
    animated?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    min: 0,
    max: 100,
    showValue: false,
    indeterminate: false,
    striped: false,
    animated: false,
    size: 'md',
    variant: 'primary',
    ariaLabel: 'Progress indicator',
  })

  const computedValue = computed(() => {
    if (props.indeterminate) return 0
    return Math.max(props.min, Math.min(props.max, props.value))
  })

  const normalizedValue = computed(() => {
    if (props.indeterminate) return 0
    const val = computedValue.value
    return ((val - props.min) / (props.max - props.min)) * 100
  })

  const computedDisplayValue = computed(() => {
    if (props.indeterminate) return ''
    return `${Math.round(normalizedValue.value)}%`
  })

  const computedClasses = computed(() => [
    `base-progress--${props.size}`,
    `base-progress--${props.variant}`,
    {
      'base-progress--indeterminate': props.indeterminate,
      'base-progress--striped': props.striped,
      'base-progress--animated': props.animated,
    },
  ])

  const computedBarStyle = computed(() => ({
    width: `${normalizedValue.value}%`,
  }))
</script>

<style scoped>
  .base-progress {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }

  .base-progress__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
  }

  .base-progress__label {
    font-weight: var(--font-weight-medium, 500);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-progress__value {
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-muted);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-progress__track {
    width: 100%;
    height: 8px;
    background: var(--color-border-light);
    border-radius: var(--radius-full);
    overflow: hidden;
    position: relative;
    box-shadow: var(--shadow-sm);
  }

  .base-progress__bar {
    height: 100%;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    transition: width var(--transition-slow) ease;
    position: relative;
    overflow: hidden;
  }

  /* Variant colors */
  .base-progress--success .base-progress__bar {
    background: var(--color-success);
  }

  .base-progress--warning .base-progress__bar {
    background: var(--color-warning);
  }

  .base-progress--error .base-progress__bar {
    background: var(--color-error);
  }

  .base-progress--info .base-progress__bar {
    background: var(--color-info);
  }

  /* Indeterminate animation */
  .base-progress__indeterminate {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient( 90deg, transparent 0%, color-mix(in srgb, var(--color-background) 20%, transparent) 50%, transparent 100% );
    animation: indeterminate 1.5s ease-in-out infinite;
  }

  /* Striped pattern */
  .base-progress__stripes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient( 45deg, color-mix(in srgb, var(--color-background) 15%, transparent) 25%, transparent 25%, transparent 50%, color-mix(in srgb, var(--color-background) 15%, transparent) 50%, color-mix(in srgb, var(--color-background) 15%, transparent) 75%, transparent 75%, transparent );
    background-size: 1rem 1rem;
  }

  .base-progress--animated .base-progress__stripes {
    animation: striped-animation 1s linear infinite;
  }

  /* Sizes */
  .base-progress--sm {
    gap: var(--spacing-xs);
  }

    .base-progress--sm .base-progress__track {
      height: 4px;
    }

    .base-progress--sm .base-progress__label,
    .base-progress--sm .base-progress__value {
      font-size: 0.75rem;
    }

  .base-progress--lg {
    gap: var(--spacing-md);
  }

    .base-progress--lg .base-progress__track {
      height: 12px;
    }

    .base-progress--lg .base-progress__label,
    .base-progress--lg .base-progress__value {
      font-size: 1rem;
    }

  .base-progress__help {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.25;
    margin-top: var(--spacing-xs);
  }

  /* Animations */
  @keyframes indeterminate {
    0% {
      transform: translateX(-100%);
    }

    100% {
      transform: translateX(100%);
    }
  }

  @keyframes striped-animation {
    0% {
      background-position: 1rem 0;
    }

    100% {
      background-position: 0 0;
    }
  }

  /* Focus styles for accessibility */
  .base-progress:focus-within .base-progress__track {
    box-shadow: var(--shadow-focus);
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-progress__track {
      border: 1px solid var(--color-text-primary);
      background: transparent;
    }

    .base-progress__bar {
      border: 1px solid var(--color-text-primary);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-progress__bar {
      transition: none;
    }

    .base-progress__indeterminate,
    .base-progress--animated .base-progress__stripes {
      animation: none;
    }

    .base-progress--animated .base-progress__stripes {
      background-image: none;
    }
  }

  /* Print styles */
  @media print {
    .base-progress__track {
      background: var(--color-gray-200);
      border: 1px solid var(--color-gray-400);
    }

    .base-progress__bar {
      background: var(--color-gray-700);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
