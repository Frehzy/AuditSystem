<!-- ShieldIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
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
    'shield-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .shield-icon {
    transition: color var(--transition-normal);
  }

    .shield-icon svg {
      color: var(--color-text-primary);
    }

    .shield-icon:hover {
      color: var(--color-success);
    }

  .shield-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .shield-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .shield-icon {
      transition: none;
    }

      .shield-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .shield-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
