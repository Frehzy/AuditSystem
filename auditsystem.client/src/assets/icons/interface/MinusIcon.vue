<!-- src/assets/icons/interface/MinusIcon.vue -->
<template>
  <svg xmlns="http://www.w3.org/2000/svg"
       :width="size"
       :height="size"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       :stroke-width="strokeWidth"
       stroke-linecap="round"
       stroke-linejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: number | string;
  strokeWidth?: number;
}

withDefaults(defineProps<Props>(), {
  size: 24,
  strokeWidth: 2
});
</script>
