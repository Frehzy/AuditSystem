<!-- src/assets/icons/actions/StopIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          ry="2"
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
    size: 24
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'stop-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .stop-icon {
    transition: color var(--transition-normal);
  }

    .stop-icon svg {
      color: var(--color-text-primary);
    }

    .stop-icon:hover {
      color: var(--color-error);
    }

  .stop-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .stop-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .stop-icon {
      transition: none;
    }

      .stop-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .stop-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
