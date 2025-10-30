<!-- CheckIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <polyline points="20 6 9 17 4 12"
              :stroke="computedColor"
              :stroke-width="strokeWidth"
              stroke-linecap="round"
              stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    color?: string;
    size?: number;
    strokeWidth?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    color: '',
    size: 24,
    strokeWidth: 2
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-success)'
  })

  const iconClasses = computed(() => ({
    'check-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .check-icon {
    transition: color var(--transition-normal);
  }

    .check-icon svg {
      color: var(--color-success);
    }

    .check-icon:hover {
      color: var(--color-success-dark);
    }

  .check-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .check-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .check-icon {
      transition: none;
    }

      .check-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .check-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
