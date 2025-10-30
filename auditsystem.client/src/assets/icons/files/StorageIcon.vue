<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" :class="iconClasses">
    <path d="M14 11H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Z"
          :stroke="computedColor"
          stroke-width="2" />
    <path d="M20 7H10a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"
          :stroke="computedColor"
          stroke-width="2" />
    <path d="M6 11v10M18 7v12"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round" />
    <path d="M10 7V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round" />
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
  'storage-icon': true,
  'theme-transition': true
}))
</script>

<style scoped>
  .storage-icon {
    transition: color var(--transition-normal);
  }

    .storage-icon svg {
      color: var(--color-text-primary);
    }

    .storage-icon:hover {
      color: var(--color-primary);
    }

  .storage-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .storage-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .storage-icon {
      transition: none;
    }

      .storage-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .storage-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
