<!-- src/assets/icons/auth/UsersIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <circle cx="9"
            cy="7"
            r="4"
            :stroke="computedColor"
            stroke-width="2" />
    <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"
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
    'users-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .users-icon {
    transition: color var(--transition-normal);
  }

    .users-icon svg {
      color: var(--color-text-primary);
    }

    .users-icon:hover {
      color: var(--color-primary);
    }

  .users-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .users-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .users-icon {
      transition: none;
    }

      .users-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .users-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
