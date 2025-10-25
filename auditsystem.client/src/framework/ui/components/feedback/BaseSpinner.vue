<template>
  <div class="base-spinner"
       role="status"
       :aria-label="ariaLabel"
       :aria-live="ariaLive"
       :style="spinnerStyle">
    <div class="base-spinner__circle" :style="circleStyle"></div>
    <span v-if="showText" class="base-spinner__text">
      {{ text }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    size?: string
    color?: string
    borderColor?: string
    borderWidth?: string
    speed?: string
    showText?: boolean
    text?: string
    ariaLabel?: string
    ariaLive?: 'polite' | 'assertive' | 'off'
    variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  }

  const props = withDefaults(defineProps<Props>(), {
    size: '20px',
    color: 'var(--color-primary)',
    borderColor: 'var(--color-background)',
    borderWidth: '2px',
    speed: '1s',
    showText: false,
    text: 'Loading...',
    ariaLabel: 'Loading',
    ariaLive: 'polite',
    variant: 'primary'
  })

  const spinnerStyle = computed(() => ({
    width: props.size,
    height: props.size,
  }))

  const variantColor = computed(() => {
    const colors = {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-text-secondary)',
      success: 'var(--color-success)',
      error: 'var(--color-error)',
      warning: 'var(--color-warning)',
      info: 'var(--color-info)'
    }
    return colors[props.variant] || props.color
  })

  const circleStyle = computed(() => ({
    borderWidth: props.borderWidth,
    borderColor: props.borderColor,
    borderTopColor: variantColor.value,
    animationDuration: props.speed,
  }))
</script>

<style scoped>
  .base-spinner {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .base-spinner__circle {
    width: 100%;
    height: 100%;
    border-style: solid;
    border-radius: 50%;
    animation: spin v-bind('props.speed') linear infinite;
    box-sizing: border-box;
    border-color: color-mix(in srgb, var(--color-border) 30%, transparent);
    border-top-color: currentColor;
  }

  .base-spinner__text {
    font-size: 12px;
    color: var(--color-text-muted);
    text-align: center;
    line-height: 1.3;
    font-weight: 500;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  /* Size variants */
  .base-spinner--sm {
    width: 16px;
    height: 16px;
  }

  .base-spinner--lg {
    width: 24px;
    height: 24px;
  }

  /* Color variants */
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

  /* Pulse animation variant */
  .base-spinner--pulse .base-spinner__circle {
    animation: spin-pulse v-bind('props.speed') ease-in-out infinite;
    border-style: double;
  }

  @keyframes spin-pulse {
    0% {
      transform: rotate(0deg);
      border-top-color: color-mix(in srgb, currentColor 100%, transparent);
    }

    50% {
      border-top-color: color-mix(in srgb, currentColor 30%, transparent);
    }

    100% {
      transform: rotate(360deg);
      border-top-color: color-mix(in srgb, currentColor 100%, transparent);
    }
  }
</style>
