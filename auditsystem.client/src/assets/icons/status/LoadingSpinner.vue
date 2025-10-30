<!-- src/assets/icons/status/LoadingSpinner.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.657-5.657l-2.828 2.828m-8.486 8.485l-2.828 2.829m14.142 0l-2.828-2.829m-8.485-8.485l-2.829-2.828"
          :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
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
    return 'var(--color-primary)'
  })

  const iconClasses = computed(() => ({
    'loading-spinner': true,
    'theme-transition': true,
    'spinning': true
  }))
</script>

<style scoped>
  .loading-spinner {
    transition: color var(--transition-normal);
  }

    .loading-spinner svg {
      color: var(--color-primary);
    }

    .loading-spinner:hover {
      color: var(--color-primary-dark);
    }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinning {
      animation: none;
    }
  }

  @media (prefers-contrast: high) {
    .loading-spinner svg {
      stroke-width: 2.5;
    }
  }
</style>
