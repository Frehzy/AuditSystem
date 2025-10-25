<template>
  <div class="base-skeleton" :class="computedClasses" :style="computedStyle">
    <div class="base-skeleton__shimmer"></div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    width?: string
    height?: string
    variant?: 'text' | 'circular' | 'rectangular'
    animation?: 'pulse' | 'wave' | 'none'
    borderRadius?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    width: '100%',
    height: '1rem',
    variant: 'text',
    animation: 'pulse',
    borderRadius: undefined,
  })

  const computedClasses = computed(() => [
    'base-skeleton',
    `base-skeleton--${props.variant}`,
    `base-skeleton--${props.animation}`,
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
      case 'text':
      default:
        return '4px'
    }
  }
</script>

<style scoped>
  .base-skeleton {
    position: relative;
    background: var(--color-border);
    overflow: hidden;
    display: inline-block;
  }

  .base-skeleton--circular {
    border-radius: 50%;
  }

  .base-skeleton--text {
    border-radius: 4px;
  }

  .base-skeleton--rectangular {
    border-radius: 0;
  }

  /* Animations */
  .base-skeleton--pulse {
    animation: skeleton-pulse 1.5s ease-in-out 0.5s infinite;
  }

  .base-skeleton--wave {
    background: linear-gradient(90deg, var(--color-border) 0%, rgba(255, 255, 255, 0.4) 50%, var(--color-border) 100%);
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
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: skeleton-shimmer 2s ease-in-out infinite;
  }

  .base-skeleton--wave .base-skeleton__shimmer {
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
</style>
