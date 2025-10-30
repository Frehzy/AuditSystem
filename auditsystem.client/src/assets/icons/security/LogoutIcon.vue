<!-- LogoutIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l4-4-4-4m4 4H9"
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
    'logout-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .logout-icon {
    transition: color var(--transition-normal);
  }

    .logout-icon svg {
      color: var(--color-text-primary);
    }

    .logout-icon:hover {
      color: var(--color-error);
    }

  .logout-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .logout-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .logout-icon {
      transition: none;
    }

      .logout-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .logout-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
