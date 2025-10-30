<!-- src/assets/icons/interface/LifebuoyIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12" cy="12" r="10" :stroke="computedColor" stroke-width="2" />
    <circle cx="12" cy="12" r="4" :stroke="computedColor" stroke-width="2" />
    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" :stroke="computedColor" stroke-width="2" />
    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" :stroke="computedColor" stroke-width="2" />
    <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" :stroke="computedColor" stroke-width="2" />
    <line x1="14.83" y1="9.17" x2="18.36" y2="5.64" :stroke="computedColor" stroke-width="2" />
    <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" :stroke="computedColor" stroke-width="2" />
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
    return 'var(--color-info)'
  })

  const iconClasses = computed(() => ({
    'lifebuoy-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .lifebuoy-icon {
    transition: color var(--transition-normal);
  }

    .lifebuoy-icon svg {
      color: var(--color-info);
    }

    .lifebuoy-icon:hover {
      color: var(--color-info-dark);
    }

  .lifebuoy-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .lifebuoy-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .lifebuoy-icon {
      transition: none;
    }

      .lifebuoy-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .lifebuoy-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
