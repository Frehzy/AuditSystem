<!-- src/assets/icons/files/FolderIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"
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
    'folder-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .folder-icon {
    transition: color var(--transition-normal);
  }

    .folder-icon svg {
      color: var(--color-text-primary);
    }

    .folder-icon:hover {
      color: var(--color-warning);
    }

  .folder-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .folder-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .folder-icon {
      transition: none;
    }

      .folder-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .folder-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
