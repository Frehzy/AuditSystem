<!-- src/assets/icons/files/HostIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="2"
          y="2"
          width="20"
          height="8"
          rx="2"
          ry="2"
          :stroke="computedColor"
          stroke-width="2" />
    <rect x="2"
          y="14"
          width="20"
          height="8"
          rx="2"
          ry="2"
          :stroke="computedColor"
          stroke-width="2" />
    <line x1="6"
          y1="6"
          x2="6.01"
          y2="6"
          :stroke="computedColor"
          stroke-width="2" />
    <line x1="6"
          y1="18"
          x2="6.01"
          y2="18"
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
    size: 24
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'host-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .host-icon {
    transition: color var(--transition-normal);
  }

    .host-icon svg {
      color: var(--color-text-primary);
    }

    .host-icon:hover {
      color: var(--color-primary);
    }

  .host-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .host-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .host-icon {
      transition: none;
    }

      .host-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .host-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
