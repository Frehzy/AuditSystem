<!-- src/assets/icons/arrows/ChevronUpIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M18 15l-6-6-6 6"
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
    'chevron-up-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .chevron-up-icon {
    transition: color var(--transition-normal);
  }

    .chevron-up-icon svg {
      color: var(--color-text-primary);
    }

    .chevron-up-icon:hover {
      color: var(--color-primary);
    }

  .chevron-up-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .chevron-up-icon:hover {
      transform: scale(1.05) translateY(-1px);
    }

  @media (prefers-reduced-motion: reduce) {
    .chevron-up-icon {
      transition: none;
    }

      .chevron-up-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .chevron-up-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
