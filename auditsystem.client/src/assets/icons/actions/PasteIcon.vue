<!-- src/assets/icons/actions/PasteIcon.vue -->
<!-- Иконка вставки -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
          :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" :stroke="color" stroke-width="2" />
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
