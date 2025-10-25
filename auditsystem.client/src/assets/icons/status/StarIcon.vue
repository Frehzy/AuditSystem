<!-- src/assets/icons/status/StarIcon.vue -->
<!-- Иконка звезды -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          :fill="fill"
          :stroke="color"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  interface Props {
    size?: number;
    fill?: string;
    color?: string;
  }

  withDefaults(defineProps<Props>(), {
    size: 20,
    fill: 'none',
    color: 'currentColor'
  });
</script>
