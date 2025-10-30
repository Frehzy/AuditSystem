<!-- src/assets/icons/files/FileTextIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-2 12H8m8 4H8m4-8H8"
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
    'file-text-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .file-text-icon {
    transition: color var(--transition-normal);
  }

    .file-text-icon svg {
      color: var(--color-text-primary);
    }

    .file-text-icon:hover {
      color: var(--color-info);
    }

  .file-text-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .file-text-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .file-text-icon {
      transition: none;
    }

      .file-text-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .file-text-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
