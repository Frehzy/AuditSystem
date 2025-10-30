<!-- SearchIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="11" cy="11" r="8"
            :stroke="computedColor"
            stroke-width="2" />
    <path d="M21 21l-4.35-4.35"
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
    'search-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .search-icon {
    transition: color var(--transition-normal);
  }

    .search-icon svg {
      color: var(--color-text-primary);
    }

    .search-icon:hover {
      color: var(--color-primary);
    }

  .search-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .search-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .search-icon {
      transition: none;
    }

      .search-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .search-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
