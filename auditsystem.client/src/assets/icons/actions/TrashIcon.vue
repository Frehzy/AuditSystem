<!-- src/assets/icons/actions/TrashIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"
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
    'trash-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .trash-icon {
    transition: color var(--transition-normal);
  }

    .trash-icon svg {
      color: var(--color-text-primary);
    }

    .trash-icon:hover {
      color: var(--color-error);
    }

  .trash-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .trash-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .trash-icon {
      transition: none;
    }

      .trash-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .trash-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
