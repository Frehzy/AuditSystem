<!-- AlertIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01"
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
    return 'var(--color-warning)'
  })

  const iconClasses = computed(() => ({
    'alert-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .alert-icon {
    transition: color var(--transition-normal);
  }

    .alert-icon svg {
      color: var(--color-warning);
    }

    .alert-icon:hover {
      color: var(--color-warning-dark);
    }

  .alert-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .alert-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .alert-icon {
      transition: none;
    }

      .alert-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .alert-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
