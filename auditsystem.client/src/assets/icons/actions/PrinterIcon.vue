<!-- src/assets/icons/actions/PrinterIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <path d="M6 14h12v8H6z"
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
    'printer-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .printer-icon {
    transition: color var(--transition-normal);
  }

    .printer-icon svg {
      color: var(--color-text-primary);
    }

    .printer-icon:hover {
      color: var(--color-info);
    }

  .printer-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .printer-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .printer-icon {
      transition: none;
    }

      .printer-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .printer-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
