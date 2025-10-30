<!-- src/assets/icons/system/ThreadsIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 2L12 22M19 5L5 19M19 19L5 5" :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
    <circle cx="12" cy="12" r="3" :stroke="computedColor" stroke-width="2" />
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
    return 'var(--color-primary)'
  })

  const iconClasses = computed(() => ({
    'threads-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .threads-icon {
    transition: color var(--transition-normal);
  }

    .threads-icon svg {
      color: var(--color-primary);
    }

    .threads-icon:hover {
      color: var(--color-primary-dark);
    }

  .threads-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .threads-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .threads-icon {
      transition: none;
    }

      .threads-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .threads-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
