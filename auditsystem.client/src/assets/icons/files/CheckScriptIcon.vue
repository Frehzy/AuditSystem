<!-- src/assets/icons/files/CheckScriptIcon.vue -->
<template>
  <svg :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <polyline points="14 2 14 8 20 8"
              :stroke="computedColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
    <path d="m9 15 2 2 4-4"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <circle cx="9"
            cy="9"
            r="1"
            :stroke="computedColor"
            stroke-width="2" />
    <circle cx="15"
            cy="9"
            r="1"
            :stroke="computedColor"
            stroke-width="2" />
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
    size: 24
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'check-script-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .check-script-icon {
    transition: color var(--transition-normal);
  }

    .check-script-icon svg {
      color: var(--color-text-primary);
    }

    .check-script-icon:hover {
      color: var(--color-success);
    }

  .check-script-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .check-script-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .check-script-icon {
      transition: none;
    }

      .check-script-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .check-script-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
