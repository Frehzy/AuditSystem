<!-- src/assets/icons/system/PortIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="2" y="6" width="20" height="12" rx="2" :stroke="computedColor" stroke-width="2" />
    <circle cx="7" cy="12" r="1" :fill="computedColor" />
    <circle cx="12" cy="12" r="1" :fill="computedColor" />
    <circle cx="17" cy="12" r="1" :fill="computedColor" />
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
    return 'var(--color-info)'
  })

  const iconClasses = computed(() => ({
    'port-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .port-icon {
    transition: color var(--transition-normal);
  }

    .port-icon svg {
      color: var(--color-info);
    }

    .port-icon:hover {
      color: var(--color-info-dark);
    }

  .port-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .port-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .port-icon {
      transition: none;
    }

      .port-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .port-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
