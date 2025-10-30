<!-- src/assets/icons/actions/SaveIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8"
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
    'save-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .save-icon {
    transition: color var(--transition-normal);
  }

    .save-icon svg {
      color: var(--color-text-primary);
    }

    .save-icon:hover {
      color: var(--color-success);
    }

  .save-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .save-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .save-icon {
      transition: none;
    }

      .save-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .save-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
