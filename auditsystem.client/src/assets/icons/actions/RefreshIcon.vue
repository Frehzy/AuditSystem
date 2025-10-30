<!-- src/assets/icons/actions/RefreshIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M23 4v6h-6M1 20v-6h6m-4 4a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
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
    'refresh-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .refresh-icon {
    transition: color var(--transition-normal);
  }

    .refresh-icon svg {
      color: var(--color-text-primary);
    }

    .refresh-icon:hover {
      color: var(--color-primary);
      animation: spin 1s linear;
    }

  .refresh-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .refresh-icon:hover {
      transform: scale(1.05);
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
    .refresh-icon {
      transition: none;
    }

      .refresh-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .refresh-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
