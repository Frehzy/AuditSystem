<!-- src/assets/icons/actions/PlayIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <polygon points="5 3 19 12 5 21 5 3"
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
    'play-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .play-icon {
    transition: color var(--transition-normal);
  }

    .play-icon svg {
      color: var(--color-text-primary);
    }

    .play-icon:hover {
      color: var(--color-success);
    }

  .play-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .play-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .play-icon {
      transition: none;
    }

      .play-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .play-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
