<!-- src/assets/icons/system/DatabaseIcon.vue -->
<!-- Иконка базы данных -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="5" rx="9" ry="3" :stroke="color" stroke-width="2" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3m18 5c0 1.66-4 3-9 3s-9-1.34-9-3"
          :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  interface Props {
    color?: string;
  }

  withDefaults(defineProps<Props>(), {
    color: 'currentColor'
  });
</script>auth
