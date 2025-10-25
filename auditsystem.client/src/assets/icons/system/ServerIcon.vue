<!-- src/assets/icons/system/ServerIcon.vue -->
<!-- Иконка сервера -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" :stroke="color" stroke-width="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" :stroke="color" stroke-width="2" />
    <path d="M6 6h.01M6 18h.01" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  interface Props {
    color?: string;
  }

  withDefaults(defineProps<Props>(), {
    color: 'currentColor'
  });
</script>
