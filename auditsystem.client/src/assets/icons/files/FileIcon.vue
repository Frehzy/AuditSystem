<!-- src/assets/icons/files/FileIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" :stroke="computedColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <polyline points="14 2 14 8 20 8" :stroke="computedColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="16" y1="13" x2="8" y2="13" :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
    <line x1="16" y1="17" x2="8" y2="17" :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
    <polyline points="10 9 9 9 8 9" :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
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
    'file-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .file-icon {
    transition: color var(--transition-normal);
  }

    .file-icon svg {
      color: var(--color-text-primary);
    }

    .file-icon:hover {
      color: var(--color-primary);
    }

  .file-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .file-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .file-icon {
      transition: none;
    }

      .file-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .file-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
