<!-- src/assets/icons/actions/RefreshIcon.vue -->
<!-- Иконка обновления -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 4v6h-6M1 20v-6h6m-4 4a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
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
