<!-- FilterIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"
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
    'filter-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .filter-icon {
    transition: color var(--transition-normal);
  }

    .filter-icon svg {
      color: var(--color-text-primary);
    }

    .filter-icon:hover {
      color: var(--color-info);
    }

  .filter-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .filter-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .filter-icon {
      transition: none;
    }

      .filter-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .filter-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
