<!-- src/modules/auth/components/StatusIcon.vue -->
<template>
  <component :is="iconComponent" />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@/assets/icons';

  interface Props {
    status: 'online' | 'offline' | 'checking';
  }

  const props = defineProps<Props>();

  const iconComponent = computed(() => {
    switch (props.status) {
      case 'online':
        return CheckCircleIcon;
      case 'offline':
        return XCircleIcon;
      case 'checking':
        return ClockIcon;
      default:
        return ClockIcon;
    }
  });
</script>
