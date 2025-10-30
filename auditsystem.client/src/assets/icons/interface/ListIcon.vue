<!-- ListIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
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
    'list-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .list-icon {
    transition: color var(--transition-normal);
  }

    .list-icon svg {
      color: var(--color-text-primary);
    }

    .list-icon:hover {
      color: var(--color-primary);
    }

  .list-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .list-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .list-icon {
      transition: none;
    }

      .list-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .list-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
