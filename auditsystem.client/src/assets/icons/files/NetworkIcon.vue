<!-- src/assets/icons/files/NetworkIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12"
            cy="12"
            r="10"
            :stroke="computedColor"
            stroke-width="2" />
    <circle cx="12"
            cy="12"
            r="2"
            :stroke="computedColor"
            stroke-width="2" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          :stroke="computedColor"
          stroke-width="2" />
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
    'network-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .network-icon {
    transition: color var(--transition-normal);
  }

    .network-icon svg {
      color: var(--color-text-primary);
    }

    .network-icon:hover {
      color: var(--color-info);
      animation: pulse 2s ease-in-out infinite;
    }

  .network-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .network-icon:hover {
      transform: scale(1.05);
    }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }

    50% {
      opacity: 0.8;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .network-icon {
      transition: none;
    }

      .network-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .network-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
