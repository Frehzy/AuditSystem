<!-- TrendDownIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M23 18l-9.5-9.5-5 5L1 6"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="M17 18h6v-6"
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
    'trend-down-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .trend-down-icon {
    transition: color var(--transition-normal);
  }

    .trend-down-icon svg {
      color: var(--color-text-primary);
    }

    .trend-down-icon:hover {
      color: var(--color-error);
    }

  .trend-down-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .trend-down-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .trend-down-icon {
      transition: none;
    }

      .trend-down-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .trend-down-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
