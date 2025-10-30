<!-- src/assets/icons/actions/BookmarkIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
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
    'bookmark-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .bookmark-icon {
    transition: color var(--transition-normal);
  }

    .bookmark-icon svg {
      color: var(--color-text-primary);
    }

    .bookmark-icon:hover {
      color: var(--color-primary);
    }

  .bookmark-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .bookmark-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .bookmark-icon {
      transition: none;
    }

      .bookmark-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .bookmark-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
