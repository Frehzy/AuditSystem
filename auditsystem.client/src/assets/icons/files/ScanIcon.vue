<!-- ScanIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 22H5a2 2 0 01-2-2v-2m4-10h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"
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
    'scan-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .scan-icon {
    transition: color var(--transition-normal);
  }

    .scan-icon svg {
      color: var(--color-text-primary);
    }

    .scan-icon:hover {
      color: var(--color-primary);
    }

  .scan-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .scan-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .scan-icon {
      transition: none;
    }

      .scan-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .scan-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
