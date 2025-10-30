<!-- LinkIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71m6 6a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
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
    'link-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .link-icon {
    transition: color var(--transition-normal);
  }

    .link-icon svg {
      color: var(--color-text-primary);
    }

    .link-icon:hover {
      color: var(--color-primary);
    }

  .link-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .link-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .link-icon {
      transition: none;
    }

      .link-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .link-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
