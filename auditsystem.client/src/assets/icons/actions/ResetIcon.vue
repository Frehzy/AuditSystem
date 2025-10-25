<!-- src/assets/icons/actions/ResetIcon.vue -->
<!-- Иконка сброса -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8M3 3v5h5"
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
