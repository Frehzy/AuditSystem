<!-- src/assets/icons/actions/PlusIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 5v14m-7-7h14"
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
    'plus-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .plus-icon {
    transition: color var(--transition-normal);
  }

    .plus-icon svg {
      color: var(--color-text-primary);
    }

    .plus-icon:hover {
      color: var(--color-success);
    }

  .plus-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .plus-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .plus-icon {
      transition: none;
    }

      .plus-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .plus-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
