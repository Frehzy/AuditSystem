<!-- MonitorIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"
          :stroke="computedColor"
          stroke-width="2" />
    <path d="M8 21h8m-4-4v4"
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
    'monitor-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .monitor-icon {
    transition: color var(--transition-normal);
  }

    .monitor-icon svg {
      color: var(--color-text-primary);
    }

    .monitor-icon:hover {
      color: var(--color-primary);
    }

  .monitor-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .monitor-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .monitor-icon {
      transition: none;
    }

      .monitor-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .monitor-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
