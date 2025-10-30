<template>
  <div class="base-skeleton" :class="computedClasses" :style="computedStyle">
    <div v-if="animation === 'shimmer'" class="base-skeleton__shimmer"></div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    width?: string
    height?: string
    variant?: 'text' | 'circular' | 'rectangular' | 'card'
    animation?: 'pulse' | 'shimmer' | 'none'
    borderRadius?: string
    color?: 'default' | 'subtle' | 'primary'
  }

  const props = withDefaults(defineProps<Props>(), {
    width: '100%',
    height: '1rem',
    variant: 'text',
    animation: 'pulse',
    borderRadius: undefined,
    color: 'default'
  })

  const computedClasses = computed(() => [
    'base-skeleton',
    `base-skeleton--${props.variant}`,
    `base-skeleton--${props.animation}`,
    `base-skeleton--${props.color}`
  ])

  const computedStyle = computed(() => ({
    width: props.width,
    height: props.height,
    borderRadius: props.borderRadius || getDefaultBorderRadius(),
  }))

  const getDefaultBorderRadius = (): string => {
    switch (props.variant) {
      case 'circular':
        return '50%'
      case 'rectangular':
        return '0px'
      case 'card':
        return 'var(--radius-lg)'
      case 'text':
      default:
        return 'var(--radius-md)'
    }
  }
</script>

<style scoped>
  .base-skeleton {
    position: relative;
    background: var(--skeleton-background);
    overflow: hidden;
    display: inline-block;
    vertical-align: middle;
  }

  /* Color variants */
  .base-skeleton--default {
    --skeleton-background: var(--color-border);
    --skeleton-shimmer: linear-gradient( 90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100% );
  }

  .base-skeleton--subtle {
    --skeleton-background: var(--color-border-card);
    --skeleton-shimmer: linear-gradient( 90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100% );
  }

  .base-skeleton--primary {
    --skeleton-background: color-mix(in srgb, var(--color-primary) 15%, transparent);
    --skeleton-shimmer: linear-gradient( 90deg, transparent 0%, color-mix(in srgb, var(--color-primary) 30%, transparent) 50%, transparent 100% );
  }

  /* Shape variants */
  .base-skeleton--circular {
    border-radius: 50%;
    aspect-ratio: 1;
  }

  .base-skeleton--text {
    border-radius: var(--radius-md);
  }

  .base-skeleton--rectangular {
    border-radius: 0;
  }

  .base-skeleton--card {
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--color-border-card);
  }

  /* Animations */
  .base-skeleton--pulse {
    animation: skeleton-pulse 1.5s ease-in-out 0.5s infinite;
  }

  .base-skeleton--shimmer {
    background: linear-gradient( 90deg, var(--skeleton-background) 0%, color-mix(in srgb, var(--skeleton-background) 80%, white) 50%, var(--skeleton-background) 100% );
    background-size: 200% 100%;
    animation: skeleton-wave 2s ease-in-out infinite;
  }

  .base-skeleton--none {
    animation: none;
  }

  .base-skeleton__shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--skeleton-shimmer);
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
  }

  .base-skeleton--shimmer .base-skeleton__shimmer {
    display: none;
  }

  @keyframes skeleton-pulse {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.4;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes skeleton-wave {
    0% {
      background-position: -200% 0;
    }

    100% {
      background-position: 200% 0;
    }
  }

  @keyframes skeleton-shimmer {
    0% {
      left: -100%;
    }

    100% {
      left: 100%;
    }
  }

  /* Responsive text skeleton */
  .base-skeleton--text::before {
    content: '\00a0'; /* Non-breaking space */
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .base-skeleton {
      animation: none;
    }

    .base-skeleton__shimmer {
      animation: none;
      display: none;
    }
  }

  /* Theme compatibility */
  .theme-light .base-skeleton {
    /* Light theme specific adjustments if needed */
  }

  .theme-dark .base-skeleton {
    /* Dark theme specific adjustments if needed */
  }

  /* Print styles */
  @media print {
    .base-skeleton {
      background: var(--color-gray-200) !important;
      animation: none !important;
    }

    .base-skeleton__shimmer {
      display: none !important;
    }
  }
</style>
