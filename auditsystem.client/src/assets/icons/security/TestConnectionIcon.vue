<!-- TestConnectionIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="m22 2-7 20-4-9-9-4Z"
          :stroke="computedColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="M22 2 11 13"
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
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'test-connection-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .test-connection-icon {
    transition: color var(--transition-normal);
  }

    .test-connection-icon svg {
      color: var(--color-text-primary);
    }

    .test-connection-icon:hover {
      color: var(--color-info);
    }

  .test-connection-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .test-connection-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .test-connection-icon {
      transition: none;
    }

      .test-connection-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .test-connection-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
