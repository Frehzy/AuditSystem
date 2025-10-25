<!-- src/assets/icons/security/FingerprintIcon.vue -->
<!-- Иконка отпечатка пальца -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11a4 4 0 00-4 4c0 5 4 9 4 9s4-4 4-9a4 4 0 00-4-4zm0 0V7a2 2 0 10-4 0m4 4h4"
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
