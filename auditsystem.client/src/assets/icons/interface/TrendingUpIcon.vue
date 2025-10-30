<!-- TrendingUpIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M23 6l-9.5 9.5-5-5L1 18"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="M17 6h6v6"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    color?: string;
    size?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    color: '',
    size: 20
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'trending-up-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .trending-up-icon {
    transition: color var(--transition-normal);
  }

    .trending-up-icon svg {
      color: var(--color-text-primary);
    }

    .trending-up-icon:hover {
      color: var(--color-success);
    }

  .trending-up-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .trending-up-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .trending-up-icon {
      transition: none;
    }

      .trending-up-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .trending-up-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
