<!-- src/assets/icons/interface/MoreVerticalIcon.vue -->
<!-- Иконка дополнительных действий (вертикальная) -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="1" :stroke="color" stroke-width="2" />
    <circle cx="12" cy="5" r="1" :stroke="color" stroke-width="2" />
    <circle cx="12" cy="19" r="1" :stroke="color" stroke-width="2" />
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
