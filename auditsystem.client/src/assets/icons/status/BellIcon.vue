<!-- BellIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9m-4 13a2 2 0 01-3.46 0"
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
    size: 20
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'bell-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .bell-icon {
    transition: color var(--transition-normal);
  }

    .bell-icon svg {
      color: var(--color-text-primary);
    }

    .bell-icon:hover {
      color: var(--color-warning);
    }

  .bell-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .bell-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .bell-icon {
      transition: none;
    }

      .bell-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .bell-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
