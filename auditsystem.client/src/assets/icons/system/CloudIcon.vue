<!-- src/assets/icons/system/CloudIcon.vue -->
<!-- Иконка облака -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
          :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
interface Props { color?: string; }
withDefaults(defineProps<Props>(), { color: 'currentColor' });
</script>
