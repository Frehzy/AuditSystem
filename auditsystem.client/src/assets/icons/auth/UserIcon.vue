<!-- src/assets/icons/auth/UserIcon.vue -->
<!-- Иконка пользователя -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
          :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="12" cy="7" r="4" :stroke="color" stroke-width="2" />
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
