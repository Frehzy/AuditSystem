<!-- InfoIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12" cy="12" r="10"
            :stroke="computedColor"
            stroke-width="2" />
    <path d="M12 16v-4m0-4h.01"
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
    return 'var(--color-info)'
  })

  const iconClasses = computed(() => ({
    'info-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .info-icon {
    transition: color var(--transition-normal);
  }

    .info-icon svg {
      color: var(--color-info);
    }

    .info-icon:hover {
      color: var(--color-info-dark);
    }

  .info-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .info-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .info-icon {
      transition: none;
    }

      .info-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .info-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
