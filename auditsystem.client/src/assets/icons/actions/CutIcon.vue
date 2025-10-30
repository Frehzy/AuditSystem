<!-- src/assets/icons/actions/CutIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="6"
            cy="6"
            r="3"
            :stroke="computedColor"
            stroke-width="2" />
    <circle cx="6"
            cy="18"
            r="3"
            :stroke="computedColor"
            stroke-width="2" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"
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
    'cut-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .cut-icon {
    transition: color var(--transition-normal);
  }

    .cut-icon svg {
      color: var(--color-text-primary);
    }

    .cut-icon:hover {
      color: var(--color-warning);
    }

  .cut-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .cut-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .cut-icon {
      transition: none;
    }

      .cut-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .cut-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
