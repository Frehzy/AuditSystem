<!-- src/assets/icons/auth/EyeOffIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="M1 1l22 22"
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
    'eye-off-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .eye-off-icon {
    transition: color var(--transition-normal);
  }

    .eye-off-icon svg {
      color: var(--color-text-primary);
    }

    .eye-off-icon:hover {
      color: var(--color-warning);
    }

  .eye-off-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .eye-off-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .eye-off-icon {
      transition: none;
    }

      .eye-off-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .eye-off-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
