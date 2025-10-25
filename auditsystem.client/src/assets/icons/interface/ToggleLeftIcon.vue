<!-- src/assets/icons/interface/ToggleLeftIcon.vue -->
<!-- Иконка переключателя (влево) -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="5" width="22" height="14" rx="7" ry="7" :stroke="color" stroke-width="2" />
    <circle cx="8" cy="12" r="3" :stroke="color" stroke-width="2" />
  </svg>
</template>

<script setup lang="ts">
  interface Props { color?: string; }
  withDefaults(defineProps<Props>(), { color: 'currentColor' });
</script>
