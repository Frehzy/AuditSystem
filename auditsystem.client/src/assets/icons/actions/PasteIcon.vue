<!-- src/assets/icons/actions/PasteIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <rect x="8"
          y="2"
          width="8"
          height="4"
          rx="1"
          ry="1"
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
    size: 20
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'paste-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .paste-icon {
    transition: color var(--transition-normal);
  }

    .paste-icon svg {
      color: var(--color-text-primary);
    }

    .paste-icon:hover {
      color: var(--color-success);
    }

  .paste-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .paste-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .paste-icon {
      transition: none;
    }

      .paste-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .paste-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
