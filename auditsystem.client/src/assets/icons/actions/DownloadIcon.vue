<!-- src/assets/icons/actions/DownloadIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-4l4 4 4-4m-4 4V3"
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
    'download-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .download-icon {
    transition: color var(--transition-normal);
  }

    .download-icon svg {
      color: var(--color-text-primary);
    }

    .download-icon:hover {
      color: var(--color-success);
    }

  .download-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .download-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .download-icon {
      transition: none;
    }

      .download-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .download-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
