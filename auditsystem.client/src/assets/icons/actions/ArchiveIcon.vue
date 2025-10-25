<!-- src/assets/icons/actions/ArchiveIcon.vue -->
<!-- Иконка архива -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  interface Props { color?: string; }
  withDefaults(defineProps<Props>(), { color: 'currentColor' });
</script>
