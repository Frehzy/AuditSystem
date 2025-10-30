<!-- src/assets/icons/auth/EyeIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <circle cx="12"
            cy="12"
            r="3"
            :stroke="computedColor"
            stroke-width="2" />
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
    'eye-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .eye-icon {
    transition: color var(--transition-normal);
  }

    .eye-icon svg {
      color: var(--color-text-primary);
    }

    .eye-icon:hover {
      color: var(--color-success);
    }

  .eye-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .eye-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .eye-icon {
      transition: none;
    }

      .eye-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .eye-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
