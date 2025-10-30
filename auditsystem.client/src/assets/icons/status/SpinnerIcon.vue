<!-- SpinnerIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M21 12a9 9 0 11-6.219-8.56"
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
    return 'var(--color-primary)'
  })

  const iconClasses = computed(() => ({
    'spinner-icon': true,
    'theme-transition': true,
    'spinner-animation': true
  }))
</script>

<style scoped>
  .spinner-icon {
    transition: color var(--transition-normal);
  }

    .spinner-icon svg {
      color: var(--color-primary);
    }

    .spinner-icon:hover {
      color: var(--color-primary-dark);
    }

  .spinner-animation {
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
    .spinner-animation {
      animation: none;
    }

    .spinner-icon {
      transition: none;
    }

      .spinner-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .spinner-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
