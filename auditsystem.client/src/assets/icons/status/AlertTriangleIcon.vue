<!-- AlertTriangleIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
          :stroke="computedColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <line x1="12" y1="9" x2="12" y2="13"
          :stroke="computedColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <line x1="12" y1="17" x2="12.01" y2="17"
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
    return 'var(--color-warning)'
  })

  const iconClasses = computed(() => ({
    'alert-triangle-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .alert-triangle-icon {
    transition: color var(--transition-normal);
  }

    .alert-triangle-icon svg {
      color: var(--color-warning);
    }

    .alert-triangle-icon:hover {
      color: var(--color-warning-dark);
    }

  .alert-triangle-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .alert-triangle-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .alert-triangle-icon {
      transition: none;
    }

      .alert-triangle-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .alert-triangle-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
