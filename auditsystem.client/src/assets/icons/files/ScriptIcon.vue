<!-- ScriptIcon.vue -->
<template>
  <svg width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <polyline points="14 3 14 8 19 8"
              :stroke="computedColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round" />
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <line x1="9" y1="9" x2="15" y2="9"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <line x1="9" y1="13" x2="15" y2="13"
          :stroke="computedColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round" />
    <line x1="9" y1="17" x2="13" y2="17"
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
    size: 24
  })

  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'script-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .script-icon {
    transition: color var(--transition-normal);
  }

    .script-icon svg {
      color: var(--color-text-primary);
    }

    .script-icon:hover {
      color: var(--color-info);
    }

  .script-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .script-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .script-icon {
      transition: none;
    }

      .script-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .script-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
