<!-- LineChartIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M3 3v18h18M7 16l3-3 3 3 4-4"
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
    'line-chart-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .line-chart-icon {
    transition: color var(--transition-normal);
  }

    .line-chart-icon svg {
      color: var(--color-text-primary);
    }

    .line-chart-icon:hover {
      color: var(--color-primary);
    }

  .line-chart-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .line-chart-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .line-chart-icon {
      transition: none;
    }

      .line-chart-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .line-chart-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
