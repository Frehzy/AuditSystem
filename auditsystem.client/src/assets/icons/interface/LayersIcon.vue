<!-- LayersIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
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
    'layers-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .layers-icon {
    transition: color var(--transition-normal);
  }

    .layers-icon svg {
      color: var(--color-text-primary);
    }

    .layers-icon:hover {
      color: var(--color-info);
    }

  .layers-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .layers-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .layers-icon {
      transition: none;
    }

      .layers-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .layers-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
