<!-- MoonIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
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
    'moon-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .moon-icon {
    transition: color var(--transition-normal);
  }

    .moon-icon svg {
      color: var(--color-text-primary);
    }

    .moon-icon:hover {
      color: var(--color-warning);
    }

  .moon-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .moon-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .moon-icon {
      transition: none;
    }

      .moon-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .moon-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
