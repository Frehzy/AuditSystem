<!-- src/assets/icons/files/FixIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="m18 2 4 4"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="m17 7 3-3"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="m9 11 4 4"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="m5 19-3 3"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="m14 4 6 6"
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
    'fix-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .fix-icon {
    transition: color var(--transition-normal);
  }

    .fix-icon svg {
      color: var(--color-text-primary);
    }

    .fix-icon:hover {
      color: var(--color-warning);
      animation: wrench 0.8s ease-in-out;
    }

  .fix-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .fix-icon:hover {
      transform: scale(1.05);
    }

  @keyframes wrench {
    0%, 100% {
      transform: scale(1.05) rotate(0deg);
    }

    25% {
      transform: scale(1.08) rotate(-10deg);
    }

    75% {
      transform: scale(1.08) rotate(10deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fix-icon {
      transition: none;
    }

      .fix-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .fix-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
