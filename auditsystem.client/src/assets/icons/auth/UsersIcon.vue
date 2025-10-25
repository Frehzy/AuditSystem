<!-- src/assets/icons/auth/UsersIcon.vue -->
<!-- Иконка группы пользователей -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
          :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="9" cy="7" r="4" :stroke="color" stroke-width="2" />
    <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"
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
