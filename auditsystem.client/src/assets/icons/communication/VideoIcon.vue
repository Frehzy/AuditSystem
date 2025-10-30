<!-- src/assets/icons/communication/VideoIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M23 7l-7 5 7 5V7z"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <rect x="1"
          y="5"
          width="15"
          height="14"
          rx="2"
          ry="2"
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
    'video-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .video-icon {
    transition: color var(--transition-normal);
  }

    .video-icon svg {
      color: var(--color-text-primary);
    }

    .video-icon:hover {
      color: var(--color-error);
    }

  .video-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .video-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .video-icon {
      transition: none;
    }

      .video-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .video-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
