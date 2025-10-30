<!-- RobotIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"
          :stroke="computedColor"
          stroke-width="2" />
    <circle cx="12" cy="5" r="2"
            :stroke="computedColor"
            stroke-width="2" />
    <path d="M12 7v4M8 16h.01M16 16h.01"
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
    'robot-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .robot-icon {
    transition: color var(--transition-normal);
  }

    .robot-icon svg {
      color: var(--color-text-primary);
    }

    .robot-icon:hover {
      color: var(--color-info);
    }

  .robot-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .robot-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .robot-icon {
      transition: none;
    }

      .robot-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .robot-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
