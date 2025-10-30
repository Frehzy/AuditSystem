<!-- src/assets/icons/communication/CameraIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <circle cx="12"
            cy="13"
            r="4"
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
    'camera-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .camera-icon {
    transition: color var(--transition-normal);
  }

    .camera-icon svg {
      color: var(--color-text-primary);
    }

    .camera-icon:hover {
      color: var(--color-primary);
    }

  .camera-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .camera-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .camera-icon {
      transition: none;
    }

      .camera-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .camera-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
