<!-- PieChartIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"
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
    'pie-chart-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .pie-chart-icon {
    transition: color var(--transition-normal);
  }

    .pie-chart-icon svg {
      color: var(--color-text-primary);
    }

    .pie-chart-icon:hover {
      color: var(--color-primary);
    }

  .pie-chart-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .pie-chart-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .pie-chart-icon {
      transition: none;
    }

      .pie-chart-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .pie-chart-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
