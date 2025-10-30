<!-- src/assets/icons/actions/DeleteIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
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
    'delete-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .delete-icon {
    transition: color var(--transition-normal);
  }

    .delete-icon svg {
      color: var(--color-text-primary);
    }

    .delete-icon:hover {
      color: var(--color-error);
    }

  .delete-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .delete-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .delete-icon {
      transition: none;
    }

      .delete-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .delete-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
