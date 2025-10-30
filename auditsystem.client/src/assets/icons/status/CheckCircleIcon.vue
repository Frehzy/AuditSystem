<!-- CheckCircleIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3"
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
    return 'var(--color-success)'
  })

  const iconClasses = computed(() => ({
    'check-circle-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .check-circle-icon {
    transition: color var(--transition-normal);
  }

    .check-circle-icon svg {
      color: var(--color-success);
    }

    .check-circle-icon:hover {
      color: var(--color-success-dark);
    }

  .check-circle-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .check-circle-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .check-circle-icon {
      transition: none;
    }

      .check-circle-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .check-circle-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
