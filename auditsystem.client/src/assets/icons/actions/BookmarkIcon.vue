<!-- src/assets/icons/actions/BookmarkIcon.vue -->
<!-- Иконка закладки -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"
          :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
  interface Props { color?: string; }
  withDefaults(defineProps<Props>(), { color: 'currentColor' });
</script>
