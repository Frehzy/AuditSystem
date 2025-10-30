<!-- src/assets/icons/communication/SendIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
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
    'send-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .send-icon {
    transition: color var(--transition-normal);
  }

    .send-icon svg {
      color: var(--color-text-primary);
    }

    .send-icon:hover {
      color: var(--color-success);
      animation: send 0.6s ease-out;
    }

  .send-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .send-icon:hover {
      transform: scale(1.05);
    }

  @keyframes send {
    0% {
      transform: scale(1.05) translateX(0);
    }

    50% {
      transform: scale(1.08) translateX(3px);
    }

    100% {
      transform: scale(1.05) translateX(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .send-icon {
      transition: none;
    }

      .send-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .send-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
