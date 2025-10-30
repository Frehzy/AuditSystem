<!-- FingerprintIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M12 11a4 4 0 00-4 4c0 5 4 9 4 9s4-4 4-9a4 4 0 00-4-4zm0 0V7a2 2 0 10-4 0m4 4h4"
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
    'fingerprint-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .fingerprint-icon {
    transition: color var(--transition-normal);
  }

    .fingerprint-icon svg {
      color: var(--color-text-primary);
    }

    .fingerprint-icon:hover {
      color: var(--color-success);
    }

  .fingerprint-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .fingerprint-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .fingerprint-icon {
      transition: none;
    }

      .fingerprint-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .fingerprint-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
