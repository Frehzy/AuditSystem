<!-- src/assets/icons/system/RobotIcon.vue -->
<!-- Иконка робота -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" :stroke="color" stroke-width="2" />
    <circle cx="12" cy="5" r="2" :stroke="color" stroke-width="2" />
    <path d="M12 7v4M8 16h.01M16 16h.01" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
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
