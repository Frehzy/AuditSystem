<template>
  <div class="base-spinner"
       role="status"
       :aria-label="computedAriaLabel"
       :aria-live="ariaLive"
       :class="computedSpinnerClasses">
    <div class="base-spinner__circle" :style="computedCircleStyle"></div>
    <span v-if="showText" class="base-spinner__text">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl' | string
    color?: string
    borderColor?: string
    borderWidth?: string
    speed?: 'slow' | 'normal' | 'fast' | string
    showText?: boolean
    text?: string
    ariaLabel?: string
    ariaLive?: 'polite' | 'assertive' | 'off'
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
    animation?: 'spin' | 'pulse'
    centered?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    color: '',
    borderColor: '',
    borderWidth: '',
    speed: 'normal',
    showText: false,
    text: 'Loading...',
    ariaLabel: '',
    ariaLive: 'polite',
    variant: 'primary',
    animation: 'spin',
    centered: false
  })

  // Size mapping
  const sizeMap = {
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px'
  }

  // Speed mapping
  const speedMap = {
    slow: '1.5s',
    normal: '1s',
    fast: '0.5s'
  }

  // Computed properties
  const computedSize = computed(() => {
    return sizeMap[props.size as keyof typeof sizeMap] || props.size
  })

  const computedSpeed = computed(() => {
    return speedMap[props.speed as keyof typeof speedMap] || props.speed
  })

  const computedAriaLabel = computed(() => {
    return props.ariaLabel || props.text || 'Loading'
  })

  const computedSpinnerClasses = computed(() => [
    'base-spinner',
    `base-spinner--${props.variant}`,
    `base-spinner--${props.animation}`,
    {
      'base-spinner--centered': props.centered,
      'base-spinner--with-text': props.showText
    }
  ])

  const computedSpinnerStyle = computed(() => ({
    width: computedSize.value,
    height: computedSize.value,
  }))

  const computedVariantColor = computed(() => {
    if (props.color) return props.color

    const colors = {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-text-secondary)',
      success: 'var(--color-success)',
      error: 'var(--color-error)',
      warning: 'var(--color-warning)',
      info: 'var(--color-info)'
    }
    return colors[props.variant] || colors.primary
  })

  const computedBorderColor = computed(() => {
    return props.borderColor || 'var(--color-border)'
  })

  const computedBorderWidth = computed(() => {
    return props.borderWidth || '2px'
  })

  const computedCircleStyle = computed(() => ({
    borderWidth: computedBorderWidth.value,
    borderColor: computedBorderColor.value,
    borderTopColor: computedVariantColor.value,
    animationDuration: computedSpeed.value,
  }))
</script>

<style scoped>
  .base-spinner {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 0.5rem);
    transition: all var(--transition-fast, 0.15s);
  }

  .base-spinner--centered {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .base-spinner--with-text {
    padding: var(--space-md, 1rem);
  }

  .base-spinner__circle {
    width: 100%;
    height: 100%;
    border-style: solid;
    border-radius: 50%;
    animation: spin var(--transition-normal, 0.3s) linear infinite;
    box-sizing: border-box;
    border-color: color-mix(in srgb, var(--color-border) 30%, transparent);
    border-top-color: currentColor;
  }

  .base-spinner__text {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    text-align: center;
    line-height: 1.3;
    font-weight: var(--font-weight-medium, 500);
    max-width: 120px;
  }

  /* Animation variants */
  .base-spinner--spin .base-spinner__circle {
    animation: spin-animation var(--transition-normal, 0.3s) linear infinite;
  }

  .base-spinner--pulse .base-spinner__circle {
    animation: pulse-animation 1.5s ease-in-out infinite;
    border-style: double;
  }

  @keyframes spin-animation {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse-animation {
    0% {
      transform: rotate(0deg) scale(0.8);
      opacity: 0.7;
      border-top-color: currentColor;
    }

    50% {
      transform: rotate(180deg) scale(1.1);
      opacity: 1;
      border-top-color: color-mix(in srgb, currentColor 40%, transparent);
    }

    100% {
      transform: rotate(360deg) scale(0.8);
      opacity: 0.7;
      border-top-color: currentColor;
    }
  }

  /* Size variants */
  .base-spinner--sm {
    width: 16px;
    height: 16px;
  }

  .base-spinner--md {
    width: 20px;
    height: 20px;
  }

  .base-spinner--lg {
    width: 24px;
    height: 24px;
  }

  .base-spinner--xl {
    width: 32px;
    height: 32px;
  }

  /* Color variants using theme.css colors */
  .base-spinner--primary .base-spinner__circle {
    border-top-color: var(--color-primary);
  }

  .base-spinner--secondary .base-spinner__circle {
    border-top-color: var(--color-text-secondary);
  }

  .base-spinner--success .base-spinner__circle {
    border-top-color: var(--color-success);
  }

  .base-spinner--error .base-spinner__circle {
    border-top-color: var(--color-error);
  }

  .base-spinner--warning .base-spinner__circle {
    border-top-color: var(--color-warning);
  }

  .base-spinner--info .base-spinner__circle {
    border-top-color: var(--color-info);
  }

  /* Text size variants */
  .base-spinner--sm .base-spinner__text {
    font-size: 0.75rem;
  }

  .base-spinner--md .base-spinner__text {
    font-size: 0.875rem;
  }

  .base-spinner--lg .base-spinner__text,
  .base-spinner--xl .base-spinner__text {
    font-size: 1rem;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .base-spinner--xl {
      width: 28px;
      height: 28px;
    }

      .base-spinner--xl .base-spinner__text {
        font-size: 0.875rem;
      }
  }

  @media (max-width: 480px) {
    .base-spinner--lg {
      width: 20px;
      height: 20px;
    }

    .base-spinner--xl {
      width: 24px;
      height: 24px;
    }

    .base-spinner__text {
      font-size: 0.75rem;
      max-width: 100px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-spinner__circle {
      animation-duration: 2s;
    }

    .base-spinner--pulse .base-spinner__circle {
      animation: none;
      opacity: 0.8;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .base-spinner__circle {
      border-color: var(--color-text-primary);
      border-top-color: currentColor;
    }

    .base-spinner__text {
      color: var(--color-text-primary);
      font-weight: var(--font-weight-semibold, 600);
    }
  }

  /* Print styles */
  @media print {
    .base-spinner {
      display: none;
    }
  }
</style>
