<!-- src/assets/icons/system/ServerIcon.vue -->
<!-- Иконка сервера -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" :stroke="computedColor" stroke-width="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" :stroke="computedColor" stroke-width="2" />
    <path d="M6 6h.01M6 18h.01" :stroke="computedColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
    'server-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .server-icon {
    transition: color var(--transition-normal);
  }

    .server-icon svg {
      color: var(--color-text-primary);
    }

    .server-icon:hover {
      color: var(--color-primary);
    }

  .server-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .server-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .server-icon {
      transition: none;
    }

      .server-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .server-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
