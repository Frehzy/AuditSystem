<!-- StarIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          :fill="computedFill"
          :stroke="computedColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    size?: number;
    fill?: string;
    color?: string;
    strokeWidth?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 20,
    fill: '',
    color: '',
    strokeWidth: 1.5
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-warning)'
  })

  const computedFill = computed(() => {
    if (props.fill) return props.fill
    return 'var(--color-warning-light)'
  })

  const iconClasses = computed(() => ({
    'star-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .star-icon {
    transition: color var(--transition-normal);
  }

    .star-icon svg {
      color: var(--color-warning);
    }

    .star-icon:hover {
      color: var(--color-warning-dark);
    }

  .star-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .star-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .star-icon {
      transition: none;
    }

      .star-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .star-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
