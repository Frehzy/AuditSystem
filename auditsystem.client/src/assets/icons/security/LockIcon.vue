<!-- LockIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"
          :stroke="computedColor"
          stroke-width="2" />
    <path d="M7 11V7a5 5 0 0110 0v4"
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
    'lock-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .lock-icon {
    transition: color var(--transition-normal);
  }

    .lock-icon svg {
      color: var(--color-text-primary);
    }

    .lock-icon:hover {
      color: var(--color-primary);
    }

  .lock-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .lock-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .lock-icon {
      transition: none;
    }

      .lock-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .lock-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
