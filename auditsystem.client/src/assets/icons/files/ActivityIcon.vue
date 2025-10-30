<!-- src/assets/icons/files/ActivityIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"
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
    'activity-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .activity-icon {
    transition: color var(--transition-normal);
  }

    .activity-icon svg {
      color: var(--color-text-primary);
    }

    .activity-icon:hover {
      color: var(--color-info);
      animation: pulse 1.5s ease-in-out infinite;
    }

  .activity-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .activity-icon:hover {
      transform: scale(1.05);
    }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }

    50% {
      opacity: 0.7;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .activity-icon {
      transition: none;
    }

      .activity-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .activity-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
