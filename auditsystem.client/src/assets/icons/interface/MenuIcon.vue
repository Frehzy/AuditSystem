<!-- MenuIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M3 12h18M3 6h18M3 18h18"
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
    'menu-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .menu-icon {
    transition: color var(--transition-normal);
  }

    .menu-icon svg {
      color: var(--color-text-primary);
    }

    .menu-icon:hover {
      color: var(--color-primary);
    }

  .menu-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .menu-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .menu-icon {
      transition: none;
    }

      .menu-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .menu-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
