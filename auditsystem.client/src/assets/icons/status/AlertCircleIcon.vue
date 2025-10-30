<!-- src/assets/icons/status/AlertCircleIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12" cy="12" r="10" :stroke="computedColor" stroke-width="2" />
    <line x1="12" y1="8" x2="12" y2="12" :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
    <line x1="12" y1="16" x2="12.01" y2="16" :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
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
    return 'var(--color-warning)'
  })

  const iconClasses = computed(() => ({
    'alert-circle-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .alert-circle-icon {
    transition: color var(--transition-normal);
  }

    .alert-circle-icon svg {
      color: var(--color-warning);
    }

    .alert-circle-icon:hover {
      color: var(--color-warning-dark);
    }

  .alert-circle-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .alert-circle-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .alert-circle-icon {
      transition: none;
    }

      .alert-circle-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .alert-circle-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
