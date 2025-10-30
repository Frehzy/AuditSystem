<!-- DatabaseIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <ellipse cx="12" cy="5" rx="9" ry="3"
             :stroke="computedColor"
             stroke-width="2" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3m18 5c0 1.66-4 3-9 3s-9-1.34-9-3"
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
    'database-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .database-icon {
    transition: color var(--transition-normal);
  }

    .database-icon svg {
      color: var(--color-text-primary);
    }

    .database-icon:hover {
      color: var(--color-info);
    }

  .database-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .database-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .database-icon {
      transition: none;
    }

      .database-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .database-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
