<!-- src/assets/icons/arrows/ArrowUpIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 19V5m-7 7l7-7 7 7"
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
    'arrow-up-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .arrow-up-icon {
    transition: color var(--transition-normal);
  }

    .arrow-up-icon svg {
      color: var(--color-text-primary);
    }

    .arrow-up-icon:hover {
      color: var(--color-primary);
    }

  .arrow-up-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .arrow-up-icon:hover {
      transform: scale(1.05) translateY(-1px);
    }

  @media (prefers-reduced-motion: reduce) {
    .arrow-up-icon {
      transition: none;
    }

      .arrow-up-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .arrow-up-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
