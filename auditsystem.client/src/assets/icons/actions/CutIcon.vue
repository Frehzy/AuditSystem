<!-- src/assets/icons/actions/CutIcon.vue -->
<!-- Иконка вырезания -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="3" :stroke="color" stroke-width="2" />
    <circle cx="6" cy="18" r="3" :stroke="color" stroke-width="2" />
    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"
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
