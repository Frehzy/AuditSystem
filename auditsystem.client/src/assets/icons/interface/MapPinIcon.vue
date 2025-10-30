<!-- src/assets/icons/interface/MapPinIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" :stroke="computedColor" stroke-width="2" />
    <circle cx="12" cy="10" r="3" :stroke="computedColor" stroke-width="2" />
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
    return 'var(--color-error)'
  })

  const iconClasses = computed(() => ({
    'map-pin-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .map-pin-icon {
    transition: color var(--transition-normal);
  }

    .map-pin-icon svg {
      color: var(--color-error);
    }

    .map-pin-icon:hover {
      color: var(--color-error-dark);
    }

  .map-pin-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .map-pin-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .map-pin-icon {
      transition: none;
    }

      .map-pin-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .map-pin-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
