<!-- src/assets/icons/actions/ArchiveIcon.vue -->
<!-- Иконка архива -->
<template>
  <svg width="20"
       height="20"
       viewBox="0 0 24 24"
       fill="none"
       xmlns="http://www.w3.org/2000/svg"
       :class="iconClasses">
    <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"
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

  // Используем цвета из темы, если не указан кастомный цвет
  const computedColor = computed(() => {
    if (props.color) return props.color
    return 'var(--color-text-primary)'
  })

  const iconClasses = computed(() => ({
    'archive-icon': true,
    'theme-transition': true
  }))
</script>

<style scoped>
  .archive-icon {
    transition: color var(--transition-normal);
  }

    /* Адаптация под светлую и темную тему через CSS переменные */
    .archive-icon svg {
      color: var(--color-text-primary);
    }

    /* Состояния иконки */
    .archive-icon:hover {
      color: var(--color-primary);
    }

  /* Анимации */
  .archive-icon {
    transform-origin: center;
    transition: all var(--transition-fast);
  }

    .archive-icon:hover {
      transform: scale(1.05);
    }

  /* Доступность */
  @media (prefers-reduced-motion: reduce) {
    .archive-icon {
      transition: none;
    }

      .archive-icon:hover {
        transform: none;
      }
  }

  /* Высокая контрастность */
  @media (prefers-contrast: high) {
    .archive-icon svg {
      stroke-width: 2.5;
    }
  }
</style>
