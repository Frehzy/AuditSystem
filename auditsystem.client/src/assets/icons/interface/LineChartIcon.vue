<!-- src/assets/icons/interface/LineChartIcon.vue -->
<!-- Иконка линейного графика -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3v18h18M7 16l3-3 3 3 4-4" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
interface Props { color?: string; }
withDefaults(defineProps<Props>(), { color: 'currentColor' });
</script>
