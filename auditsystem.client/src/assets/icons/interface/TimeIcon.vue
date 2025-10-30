<!-- src/assets/icons/interface/TimeIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12" cy="12" r="10" :stroke="computedColor" stroke-width="2" />
    <polyline points="12 6 12 12 16 14" :stroke="computedColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
    'time-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .time-icon {
    transition: color var(--transition-normal);
  }

    .time-icon svg {
      color: var(--color-text-primary);
    }

    .time-icon:hover {
      color: var(--color-primary);
    }

  .time-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .time-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .time-icon {
      transition: none;
    }

      .time-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .time-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
