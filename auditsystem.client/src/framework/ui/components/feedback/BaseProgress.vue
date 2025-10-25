<!-- src/framework/ui/components/feedback/BaseProgress.vue -->
<template>
  <div class="base-progress" :class="containerClasses" role="progressbar"
       :aria-valuenow="value"
       :aria-valuemin="min"
       :aria-valuemax="max"
       :aria-label="ariaLabel">

    <div v-if="label || showValue" class="base-progress__header">
      <span v-if="label" class="base-progress__label">{{ label }}</span>
      <span v-if="showValue" class="base-progress__value">{{ displayValue }}</span>
    </div>

    <div class="base-progress__track">
      <div class="base-progress__bar" :style="barStyle">
        <div v-if="indeterminate" class="base-progress__indeterminate"></div>
      </div>
    </div>

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
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
    ariaLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    min: 0,
    max: 100,
    showValue: false,
    indeterminate: false,
    size: 'md',
    variant: 'primary',
    ariaLabel: 'Progress indicator',
  })

  const normalizedValue = computed(() => {
    if (props.indeterminate) return 0
    const val = Math.max(props.min, Math.min(props.max, props.value))
    return ((val - props.min) / (props.max - props.min)) * 100
  })

  const displayValue = computed(() => {
    if (props.indeterminate) return ''
    return `${Math.round(normalizedValue.value)}%`
  })

  const containerClasses = computed(() => [
    'base-progress',
    `base-progress--${props.size}`,
    `base-progress--${props.variant}`,
    {
      'base-progress--indeterminate': props.indeterminate,
    },
  ])

  const barStyle = computed(() => ({
    width: `${normalizedValue.value}%`,
  }))
</script>

<style scoped>
  .base-progress {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    width: 100%;
  }

  .base-progress__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .base-progress__label {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    font-size: 0.875rem;
  }

  .base-progress__value {
    font-weight: var(--font-weight-medium);
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .base-progress__track {
    width: 100%;
    height: 8px;
    background: var(--color-border);
    border-radius: var(--radius-full);
    overflow: hidden;
    position: relative;
  }

  .base-progress__bar {
    height: 100%;
    border-radius: var(--radius-full);
    background: var(--color-primary);
    transition: width var(--transition-slow) ease;
    position: relative;
  }

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

  .base-progress__indeterminate {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient( 90deg, transparent 0%, color-mix(in srgb, currentColor 30%, transparent) 50%, transparent 100% );
    animation: indeterminate 1.5s ease-in-out infinite;
  }

  .base-progress__help {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.25;
  }

  /* Sizes */
  .base-progress--sm .base-progress__track {
    height: 4px;
  }

  .base-progress--lg .base-progress__track {
    height: 12px;
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

  /* Striped variant */
  .base-progress--striped .base-progress__bar {
    background-image: linear-gradient( 45deg, color-mix(in srgb, currentColor 20%, transparent) 25%, transparent 25%, transparent 50%, color-mix(in srgb, currentColor 20%, transparent) 50%, color-mix(in srgb, currentColor 20%, transparent) 75%, transparent 75%, transparent );
    background-size: 1rem 1rem;
  }

  .base-progress--striped.base-progress--indeterminate .base-progress__bar {
    animation: striped-animation 1s linear infinite;
  }

  @keyframes striped-animation {
    0% {
      background-position: 1rem 0;
    }

    100% {
      background-position: 0 0;
    }
  }
</style>
