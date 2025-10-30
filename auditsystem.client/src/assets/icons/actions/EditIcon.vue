<!-- src/assets/icons/actions/EditIcon.vue -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-7-7l5.5-5.5 4 4L15 11"
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
    'edit-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .edit-icon {
    transition: color var(--transition-normal);
  }

    .edit-icon svg {
      color: var(--color-text-primary);
    }

    .edit-icon:hover {
      color: var(--color-primary);
    }

  .edit-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .edit-icon:hover {
      transform: scale(1.05);
    }

  @media (prefers-reduced-motion: reduce) {
    .edit-icon {
      transition: none;
    }

      .edit-icon:hover {
        transform: none;
      }
  }

  @media (prefers-contrast: high) {
    .edit-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
