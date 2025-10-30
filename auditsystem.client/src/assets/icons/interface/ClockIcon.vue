<!-- ClockIcon.vue -->
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
    <path d="M12 6v6l4 2"
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
    'clock-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .clock-icon {
    transition: color var(--transition-normal);
  }

    .clock-icon svg {
      color: var(--color-text-primary);
    }

    .clock-icon:hover {
      color: var(--color-warning);
    }

  .clock-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .clock-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .clock-icon {
      transition: none;
    }

      .clock-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .clock-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
