<!-- ToggleRightIcon.vue -->
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
    <circle cx="16" cy="12" r="3"
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
    'toggle-right-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .toggle-right-icon {
    transition: color var(--transition-normal);
  }

    .toggle-right-icon svg {
      color: var(--color-text-primary);
    }

    .toggle-right-icon:hover {
      color: var(--color-success);
    }

  .toggle-right-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .toggle-right-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .toggle-right-icon {
      transition: none;
    }

      .toggle-right-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .toggle-right-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
