<!-- src/assets/icons/files/HistoryIcon.vue -->
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
    <polyline points="12 6 12 12 16 14"
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
    'history-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .history-icon {
    transition: color var(--transition-normal);
  }

    .history-icon svg {
      color: var(--color-text-primary);
    }

    .history-icon:hover {
      color: var(--color-info);
      animation: rotate-clockwise 4s linear infinite;
    }

  .history-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .history-icon:hover {
      transform: scale(1.05);
    }

  @keyframes rotate-clockwise {
    from {
      transform: scale(1.05) rotate(0deg);
    }

    to {
      transform: scale(1.05) rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .history-icon {
      transition: none;
    }

      .history-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .history-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
