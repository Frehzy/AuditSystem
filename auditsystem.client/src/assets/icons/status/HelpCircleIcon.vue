<!-- src/assets/icons/status/HelpCircleIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12" cy="12" r="10" :stroke="computedColor" stroke-width="2" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
    <line x1="12" y1="17" x2="12.01" y2="17" :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
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
    return 'var(--color-text-secondary)'
  })

  const iconClasses = computed(() => ({
    'help-circle-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .help-circle-icon {
    transition: color var(--transition-normal);
  }

    .help-circle-icon svg {
      color: var(--color-text-secondary);
    }

    .help-circle-icon:hover {
      color: var(--color-primary);
    }

  .help-circle-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .help-circle-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .help-circle-icon {
      transition: none;
    }

      .help-circle-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .help-circle-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
