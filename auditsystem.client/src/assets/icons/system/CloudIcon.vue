<!-- CloudIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
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
    'cloud-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .cloud-icon {
    transition: color var(--transition-normal);
  }

    .cloud-icon svg {
      color: var(--color-text-primary);
    }

    .cloud-icon:hover {
      color: var(--color-info);
    }

  .cloud-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .cloud-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .cloud-icon {
      transition: none;
    }

      .cloud-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .cloud-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
