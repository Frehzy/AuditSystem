<!-- src/assets/icons/system/SunIcon.vue -->
<!-- Иконка солнца (дневной режим) -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <circle cx="12" cy="12" r="5" :stroke="computedColor" stroke-width="2" />
    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
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
    return 'var(--color-warning)'
  })

  const iconClasses = computed(() => ({
    'sun-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .sun-icon {
    transition: color var(--transition-normal);
  }

    .sun-icon svg {
      color: var(--color-warning);
    }

    .sun-icon:hover {
      color: var(--color-warning-dark);
    }

  .sun-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .sun-icon:hover {
      transform: scale(1.05) rotate(15deg);
    }

  @media (prefers-reduced-motion: reduce) {
    .sun-icon {
      transition: none;
    }

      .sun-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .sun-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
