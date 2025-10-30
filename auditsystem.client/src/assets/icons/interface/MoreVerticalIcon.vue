<!-- MoreVerticalIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12" cy="12" r="1"
            :stroke="computedColor"
            stroke-width="2" />
    <circle cx="12" cy="5" r="1"
            :stroke="computedColor"
            stroke-width="2" />
    <circle cx="12" cy="19" r="1"
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
    'more-vertical-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .more-vertical-icon {
    transition: color var(--transition-normal);
  }

    .more-vertical-icon svg {
      color: var(--color-text-primary);
    }

    .more-vertical-icon:hover {
      color: var(--color-text-secondary);
    }

  .more-vertical-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .more-vertical-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .more-vertical-icon {
      transition: none;
    }

      .more-vertical-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .more-vertical-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
