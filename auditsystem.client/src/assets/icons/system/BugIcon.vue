<!-- BugIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M18 12h2m-2 0a6 6 0 01-12 0m12 0a6 6 0 00-12 0m0 0H4m2 6v2m0-10V4m8 16v2m0-10V4"
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
    return 'var(--color-error)'
  })

  const iconClasses = computed(() => ({
    'bug-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .bug-icon {
    transition: color var(--transition-normal);
  }

    .bug-icon svg {
      color: var(--color-error);
    }

    .bug-icon:hover {
      color: var(--color-error-dark);
    }

  .bug-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .bug-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .bug-icon {
      transition: none;
    }

      .bug-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .bug-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
