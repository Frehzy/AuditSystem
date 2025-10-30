<!-- src/assets/icons/arrows/ArrowLeftIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M19 12H5m7-7l-7 7 7 7"
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
    'arrow-left-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .arrow-left-icon {
    transition: color var(--transition-normal);
  }

    .arrow-left-icon svg {
      color: var(--color-text-primary);
    }

    .arrow-left-icon:hover {
      color: var(--color-primary);
    }

  .arrow-left-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .arrow-left-icon:hover {
      transform: scale(1.05) translateX(-1px);
    }

  @media (prefers-reduced-motion: reduce) {
    .arrow-left-icon {
      transition: none;
    }

      .arrow-left-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .arrow-left-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
