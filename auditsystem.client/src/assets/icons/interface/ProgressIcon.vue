<!-- src/assets/icons/interface/ProgressIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12" cy="12" r="10" :stroke="computedColor" stroke-width="2" stroke-dasharray="60 100" />
    <circle cx="12" cy="12" r="10" :stroke="computedColor" stroke-width="2" stroke-dasharray="30 100" transform="rotate(-90 12 12)" />
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
    return 'var(--color-primary)'
  })

  const iconClasses = computed(() => ({
    'progress-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .progress-icon {
    transition: color var(--transition-normal);
  }

    .progress-icon svg {
      color: var(--color-primary);
    }

    .progress-icon:hover {
      color: var(--color-primary-dark);
    }

  .progress-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .progress-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .progress-icon {
      transition: none;
    }

      .progress-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .progress-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
