<!-- KeyIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
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
    'key-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .key-icon {
    transition: color var(--transition-normal);
  }

    .key-icon svg {
      color: var(--color-text-primary);
    }

    .key-icon:hover {
      color: var(--color-warning);
    }

  .key-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .key-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .key-icon {
      transition: none;
    }

      .key-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .key-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
