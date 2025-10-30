<!-- src/assets/icons/actions/WrenchIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
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
    'wrench-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .wrench-icon {
    transition: color var(--transition-normal);
  }

    .wrench-icon svg {
      color: var(--color-text-primary);
    }

    .wrench-icon:hover {
      color: var(--color-warning);
      animation: wrench-animation 0.6s ease-in-out;
    }

  .wrench-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .wrench-icon:hover {
      transform: scale(1.05);
    }

  @keyframes wrench-animation {
    0%, 100% {
      transform: scale(1.05) rotate(0deg);
    }

    25% {
      transform: scale(1.08) rotate(-15deg);
    }

    75% {
      transform: scale(1.08) rotate(15deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .wrench-icon {
      transition: none;
    }

      .wrench-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .wrench-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
