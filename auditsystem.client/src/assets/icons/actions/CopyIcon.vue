<!-- src/assets/icons/actions/CopyIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <rect x="9"
          y="9"
          width="13"
          height="13"
          rx="2"
          ry="2"
          :stroke="computedColor"
          stroke-width="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
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
    'copy-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .copy-icon {
    transition: color var(--transition-normal);
  }

    .copy-icon svg {
      color: var(--color-text-primary);
    }

    .copy-icon:hover {
      color: var(--color-info);
    }

  .copy-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .copy-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .copy-icon {
      transition: none;
    }

      .copy-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .copy-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
