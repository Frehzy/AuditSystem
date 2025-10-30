<!-- GridIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="3" y="3" width="7" height="7"
          :stroke="computedColor"
          stroke-width="2" />
    <rect x="14" y="3" width="7" height="7"
          :stroke="computedColor"
          stroke-width="2" />
    <rect x="14" y="14" width="7" height="7"
          :stroke="computedColor"
          stroke-width="2" />
    <rect x="3" y="14" width="7" height="7"
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
    'grid-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .grid-icon {
    transition: color var(--transition-normal);
  }

    .grid-icon svg {
      color: var(--color-text-primary);
    }

    .grid-icon:hover {
      color: var(--color-primary);
    }

  .grid-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .grid-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .grid-icon {
      transition: none;
    }

      .grid-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .grid-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
