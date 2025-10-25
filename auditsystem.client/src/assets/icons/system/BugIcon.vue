<!-- src/assets/icons/system/BugIcon.vue -->
<!-- Иконка бага/ошибки -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 12h2m-2 0a6 6 0 01-12 0m12 0a6 6 0 00-12 0m0 0H4m2 6v2m0-10V4m8 16v2m0-10V4"
          :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  interface Props { color?: string; }
  withDefaults(defineProps<Props>(), { color: 'currentColor' });
</script>
