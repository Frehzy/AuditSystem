<!-- src/assets/icons/auth/EyeIcon.vue -->
<!-- Иконка видимости (открытый глаз) -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="12" cy="12" r="3" :stroke="color" stroke-width="2" />
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
