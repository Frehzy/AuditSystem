<!-- HomeIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          :stroke="computedColor"
          stroke-width="2" />
    <path d="M9 22V12h6v10"
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
    'home-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .home-icon {
    transition: color var(--transition-normal);
  }

    .home-icon svg {
      color: var(--color-text-primary);
    }

    .home-icon:hover {
      color: var(--color-success);
    }

  .home-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .home-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .home-icon {
      transition: none;
    }

      .home-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .home-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
