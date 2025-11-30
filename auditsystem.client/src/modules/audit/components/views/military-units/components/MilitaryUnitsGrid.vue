<template>
  <div class="units-grid">
    <MilitaryUnitCard v-for="unit in units"
                      :key="unit.id"
                      :unit="unit"
                      @edit="$emit('edit-unit', unit)"
                      @delete="$emit('delete-unit', unit)"
                      @view-details="$emit('view-details', unit)" />
  </div>
</template>

<script setup lang="ts">
  import MilitaryUnitCard from '../partials/MilitaryUnitCard.vue';
  import type { MilitaryUnit } from '@/modules/audit/api/audit.types';

  interface Props {
    units: MilitaryUnit[];
  }

  interface Emits {
    (e: 'edit-unit', unit: MilitaryUnit): void;
    (e: 'delete-unit', unit: MilitaryUnit): void;
    (e: 'view-details', unit: MilitaryUnit): void;
  }

  defineProps<Props>();
  defineEmits<Emits>();
</script>

<style scoped>
  .units-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: var(--spacing-lg);
  }

  @media (max-width: 1024px) {
    .units-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .units-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
