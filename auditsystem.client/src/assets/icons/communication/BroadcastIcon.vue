<!-- src/assets/icons/communication/BroadcastIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"
          :stroke="computedColor" stroke-width="2" stroke-linecap="round" />
    <circle cx="12" cy="12" r="2" :stroke="computedColor" stroke-width="2" />
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
    return 'var(--color-info)'
  })

  const iconClasses = computed(() => ({
    'broadcast-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .broadcast-icon {
    transition: color var(--transition-normal);
  }

    .broadcast-icon svg {
      color: var(--color-info);
    }

    .broadcast-icon:hover {
      color: var(--color-info-dark);
    }

  .broadcast-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .broadcast-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .broadcast-icon {
      transition: none;
    }

      .broadcast-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .broadcast-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
