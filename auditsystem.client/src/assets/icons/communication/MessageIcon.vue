<!-- src/assets/icons/communication/MessageIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
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
    'message-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .message-icon {
    transition: color var(--transition-normal);
  }

    .message-icon svg {
      color: var(--color-text-primary);
    }

    .message-icon:hover {
      color: var(--color-primary);
    }

  .message-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .message-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .message-icon {
      transition: none;
    }

      .message-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .message-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
