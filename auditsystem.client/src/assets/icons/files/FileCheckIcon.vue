<!-- src/assets/icons/files/FileCheckIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <polyline points="14 2 14 8 20 8"
              :stroke="computedColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
    <path d="m9 15 2 2 4-4"
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
    size: 24
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'file-check-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .file-check-icon {
    transition: color var(--transition-normal);
  }

    .file-check-icon svg {
      color: var(--color-text-primary);
    }

    .file-check-icon:hover {
      color: var(--color-success);
    }

  .file-check-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .file-check-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .file-check-icon {
      transition: none;
    }

      .file-check-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .file-check-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
