<!-- MinusIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <line x1="5" y1="12" x2="19" y2="12"
          :stroke="computedColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    color?: string;
    size?: number;
    strokeWidth?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    color: '',
    size: 24,
    strokeWidth: 2
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'minus-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .minus-icon {
    transition: color var(--transition-normal);
  }

    .minus-icon svg {
      color: var(--color-text-primary);
    }

    .minus-icon:hover {
      color: var(--color-error);
    }

  .minus-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .minus-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .minus-icon {
      transition: none;
    }

      .minus-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .minus-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
