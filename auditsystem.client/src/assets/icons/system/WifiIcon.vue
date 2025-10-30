<!-- src/assets/icons/system/WifiIcon.vue -->
<!-- Иконка Wi-Fi -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"
          :stroke="computedColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
    'wifi-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .wifi-icon {
    transition: color var(--transition-normal);
  }

    .wifi-icon svg {
      color: var(--color-info);
    }

    .wifi-icon:hover {
      color: var(--color-info-dark);
    }

  .wifi-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .wifi-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .wifi-icon {
      transition: none;
    }

      .wifi-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .wifi-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
