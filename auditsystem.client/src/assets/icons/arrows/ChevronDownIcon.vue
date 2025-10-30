<!-- src/assets/icons/arrows/ChevronDownIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M6 9l6 6 6-6"
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
    'chevron-down-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .chevron-down-icon {
    transition: color var(--transition-normal);
  }

    .chevron-down-icon svg {
      color: var(--color-text-primary);
    }

    .chevron-down-icon:hover {
      color: var(--color-primary);
    }

  .chevron-down-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .chevron-down-icon:hover {
      transform: scale(1.05) translateY(1px);
    }

  @media (prefers-reduced-motion: reduce) {
    .chevron-down-icon {
      transition: none;
    }

      .chevron-down-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .chevron-down-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
