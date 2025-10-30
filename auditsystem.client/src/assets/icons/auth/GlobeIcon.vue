<!-- src/assets/icons/auth/GlobeIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12"
            cy="12"
            r="10"
            :stroke="computedColor"
            stroke-width="2" />
    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
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
    'globe-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .globe-icon {
    transition: color var(--transition-normal);
  }

    .globe-icon svg {
      color: var(--color-text-primary);
    }

    .globe-icon:hover {
      color: var(--color-info);
      animation: rotate 3s linear infinite;
    }

  .globe-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .globe-icon:hover {
      transform: scale(1.05);
    }

  @keyframes rotate {
    from {
      transform: scale(1.05) rotate(0deg);
    }

    to {
      transform: scale(1.05) rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .globe-icon {
      transition: none;
    }

      .globe-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .globe-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
