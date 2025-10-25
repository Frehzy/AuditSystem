<!-- src/assets/icons/communication/VideoIcon.vue -->
<!-- Иконка видео -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 7l-7 5 7 5V7z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" :stroke="color" stroke-width="2" />
  </svg>
</template>

<script setup lang="ts">
  interface Props { color?: string; }
  withDefaults(defineProps<Props>(), { color: 'currentColor' });
</script>
