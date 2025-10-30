<!-- src/assets/icons/auth/UserIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <circle cx="12"
            cy="7"
            r="4"
            :stroke="computedColor"
            stroke-width="2" />
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
    'user-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .user-icon {
    transition: color var(--transition-normal);
  }

    .user-icon svg {
      color: var(--color-text-primary);
    }

    .user-icon:hover {
      color: var(--color-primary);
    }

  .user-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .user-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .user-icon {
      transition: none;
    }

      .user-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .user-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
