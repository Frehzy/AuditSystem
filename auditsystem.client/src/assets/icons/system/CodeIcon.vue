<!-- CodeIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6"
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
    'code-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .code-icon {
    transition: color var(--transition-normal);
  }

    .code-icon svg {
      color: var(--color-text-primary);
    }

    .code-icon:hover {
      color: var(--color-primary);
    }

  .code-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .code-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .code-icon {
      transition: none;
    }

      .code-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .code-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
