<!-- src/assets/icons/actions/ResetIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8M3 3v5h5"
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
    'reset-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .reset-icon {
    transition: color var(--transition-normal);
  }

    .reset-icon svg {
      color: var(--color-text-primary);
    }

    .reset-icon:hover {
      color: var(--color-warning);
      animation: spin 1s linear;
    }

  .reset-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .reset-icon:hover {
      transform: scale(1.05);
    }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(-360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reset-icon {
      transition: none;
    }

      .reset-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .reset-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
