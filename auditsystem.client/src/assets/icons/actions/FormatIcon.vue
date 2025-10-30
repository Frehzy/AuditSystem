<!-- src/assets/icons/actions/FormatIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <polyline points="16 3 21 3 21 8" :stroke="computedColor" />
    <line x1="4" y1="20" x2="21" y2="3" :stroke="computedColor" />
    <polyline points="21 16 21 21 16 21" :stroke="computedColor" />
    <line x1="15" y1="15" x2="21" y2="21" :stroke="computedColor" />
    <line x1="4" y1="4" x2="9" y2="9" :stroke="computedColor" />
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
    size: 24
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'format-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .format-icon {
    transition: color var(--transition-normal);
  }

    .format-icon svg {
      color: var(--color-text-primary);
    }

    .format-icon:hover {
      color: var(--color-info);
    }

  .format-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .format-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .format-icon {
      transition: none;
    }

      .format-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .format-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
