<!-- src/assets/icons/interface/GridIcon.vue -->
<!-- Иконка сетки -->
<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" :stroke="color" stroke-width="2" />
    <rect x="14" y="3" width="7" height="7" :stroke="color" stroke-width="2" />
    <rect x="14" y="14" width="7" height="7" :stroke="color" stroke-width="2" />
    <rect x="3" y="14" width="7" height="7" :stroke="color" stroke-width="2" />
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
