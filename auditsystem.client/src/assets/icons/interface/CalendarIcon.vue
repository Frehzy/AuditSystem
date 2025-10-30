<!-- CalendarIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"
          :stroke="computedColor"
          stroke-width="2" />
    <path d="M16 2v4M8 2v4M3 10h18"
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
    'calendar-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .calendar-icon {
    transition: color var(--transition-normal);
  }

    .calendar-icon svg {
      color: var(--color-text-primary);
    }

    .calendar-icon:hover {
      color: var(--color-primary);
    }

  .calendar-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .calendar-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .calendar-icon {
      transition: none;
    }

      .calendar-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .calendar-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
