<!-- src/assets/icons/interface/PieChartIcon.vue -->
<!-- Иконка круговой диаграммы -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"
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
</script>
