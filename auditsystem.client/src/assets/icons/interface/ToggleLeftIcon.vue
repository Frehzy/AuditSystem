<!-- ToggleLeftIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7"
          :stroke="computedColor"
          stroke-width="2" />
    <circle cx="8" cy="12" r="3"
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
    'toggle-left-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .toggle-left-icon {
    transition: color var(--transition-normal);
  }

    .toggle-left-icon svg {
      color: var(--color-text-primary);
    }

    .toggle-left-icon:hover {
      color: var(--color-warning);
    }

  .toggle-left-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .toggle-left-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .toggle-left-icon {
      transition: none;
    }

      .toggle-left-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .toggle-left-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
