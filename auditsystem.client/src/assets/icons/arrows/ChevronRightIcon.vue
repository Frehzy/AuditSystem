<!-- src/assets/icons/arrows/ChevronRightIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M9 18l6-6-6-6"
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
    'chevron-right-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .chevron-right-icon {
    transition: color var(--transition-normal);
  }

    .chevron-right-icon svg {
      color: var(--color-text-primary);
    }

    .chevron-right-icon:hover {
      color: var(--color-primary);
    }

  .chevron-right-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .chevron-right-icon:hover {
      transform: scale(1.05) translateX(1px);
    }

  @media (prefers-reduced-motion: reduce) {
    .chevron-right-icon {
      transition: none;
    }

      .chevron-right-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .chevron-right-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
