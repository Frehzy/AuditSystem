<!-- src/assets/icons/communication/PhoneIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
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
    'phone-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .phone-icon {
    transition: color var(--transition-normal);
  }

    .phone-icon svg {
      color: var(--color-text-primary);
    }

    .phone-icon:hover {
      color: var(--color-success);
      animation: shake 0.5s ease-in-out;
    }

  .phone-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .phone-icon:hover {
      transform: scale(1.05);
    }

  @keyframes shake {
    0%, 100% {
      transform: scale(1.05) rotate(0deg);
    }

    25% {
      transform: scale(1.05) rotate(-5deg);
    }

    75% {
      transform: scale(1.05) rotate(5deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .phone-icon {
      transition: none;
    }

      .phone-icon:hover {
        transform: none;
        animation: none;
      }
  }

  @media (prefers-contrast: high) {
    .phone-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
