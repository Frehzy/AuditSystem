<!-- BarChartIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 20V10m6 10V4M6 20v-6"
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
    'bar-chart-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .bar-chart-icon {
    transition: color var(--transition-normal);
  }

    .bar-chart-icon svg {
      color: var(--color-text-primary);
    }

    .bar-chart-icon:hover {
      color: var(--color-primary);
    }

  .bar-chart-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .bar-chart-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .bar-chart-icon {
      transition: none;
    }

      .bar-chart-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .bar-chart-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
