<!-- src/assets/icons/actions/PauseIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="6"
          y="4"
          width="4"
          height="16"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <rect x="14"
          y="4"
          width="4"
          height="16"
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
    'pause-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .pause-icon {
    transition: color var(--transition-normal);
  }

    .pause-icon svg {
      color: var(--color-text-primary);
    }

    .pause-icon:hover {
      color: var(--color-warning);
    }

  .pause-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .pause-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .pause-icon {
      transition: none;
    }

      .pause-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .pause-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
