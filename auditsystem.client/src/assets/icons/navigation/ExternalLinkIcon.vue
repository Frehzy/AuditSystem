<!-- ExternalLinkIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6m4-3h6v6m-11 5L21 3"
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
    'external-link-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .external-link-icon {
    transition: color var(--transition-normal);
  }

    .external-link-icon svg {
      color: var(--color-text-primary);
    }

    .external-link-icon:hover {
      color: var(--color-info);
    }

  .external-link-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .external-link-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .external-link-icon {
      transition: none;
    }

      .external-link-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .external-link-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
