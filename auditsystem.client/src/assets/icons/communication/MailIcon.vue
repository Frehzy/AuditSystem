<!-- src/assets/icons/communication/MailIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
          :stroke="computedColor"
          stroke-width="2" />
    <path d="M22 6l-10 7L2 6"
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
    'mail-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .mail-icon {
    transition: color var(--transition-normal);
  }

    .mail-icon svg {
      color: var(--color-text-primary);
    }

    .mail-icon:hover {
      color: var(--color-info);
    }

  .mail-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .mail-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .mail-icon {
      transition: none;
    }

      .mail-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .mail-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
