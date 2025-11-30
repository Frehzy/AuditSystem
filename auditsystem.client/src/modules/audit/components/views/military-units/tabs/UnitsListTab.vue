<template>
  <div class="units-list-tab">
    <MilitaryUnitsListSection :units="units"
                              :is-loading="isLoading"
                              @refresh="$emit('refresh')"
                              @create-unit="$emit('create-unit')"
                              @edit-unit="$emit('edit-unit', $event)"
                              @delete-unit="$emit('delete-unit', $event)"
                              @view-details="$emit('view-details', $event)" />
  </div>
</template>

<script setup lang="ts">
  import MilitaryUnitsListSection from '../components/MilitaryUnitsListSection.vue';
  import type { MilitaryUnit } from '@/modules/audit/api/audit.types';

  interface Props {
    units?: MilitaryUnit[];
    isLoading?: boolean;
  }

  interface Emits {
    (e: 'refresh'): void;
    (e: 'create-unit'): void;
    (e: 'edit-unit', unit: MilitaryUnit): void;
    (e: 'delete-unit', unit: MilitaryUnit): void;
    (e: 'view-details', unit: MilitaryUnit): void;
  }

  defineProps<Props>();
  defineEmits<Emits>();
</script>

<style scoped>
  .units-list-tab {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
</style>
