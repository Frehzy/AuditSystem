<template>
  <div class="overview-tab">
    <!-- Быстрые действия -->
    <MilitaryUnitsActions @create-unit="$emit('create-unit')"
                          @scan-network="$emit('scan-network')" />

    <!-- Статистика -->
    <MilitaryUnitsStats :units="units"
                        :is-loading="isLoading" />

    <!-- Недавно добавленные части -->
    <div class="overview-section">
      <div class="section-header">
        <h2 class="section-title">Недавно добавленные</h2>
        <BaseButton @click="$emit('refresh')"
                    variant="text"
                    size="sm"
                    :loading="isLoading">
          <RefreshIcon class="button-icon" />
          Обновить
        </BaseButton>
      </div>

      <MilitaryUnitsGrid :units="recentUnits"
                         @edit-unit="$emit('edit-unit', $event)"
                         @delete-unit="$emit('delete-unit', $event)"
                         @view-details="$emit('view-details', $event)" />

      <MilitaryUnitsEmptyState v-if="recentUnits.length === 0 && !isLoading"
                               @create-unit="$emit('create-unit')" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import { RefreshIcon } from '@/assets/icons';

  import MilitaryUnitsActions from '../components/MilitaryUnitsActions.vue';
  import MilitaryUnitsStats from '../components/MilitaryUnitsStats.vue';
  import MilitaryUnitsGrid from '../components/MilitaryUnitsGrid.vue';
  import MilitaryUnitsEmptyState from '../components/MilitaryUnitsEmptyState.vue';
  import type { MilitaryUnit } from '@/modules/audit/api/audit.types';

  interface Props {
    units?: MilitaryUnit[];
    isLoading?: boolean;
  }

  interface Emits {
    (e: 'create-unit'): void;
    (e: 'scan-network'): void;
    (e: 'refresh'): void;
    (e: 'edit-unit', unit: MilitaryUnit): void;
    (e: 'delete-unit', unit: MilitaryUnit): void;
    (e: 'view-details', unit: MilitaryUnit): void;
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const recentUnits = computed(() => {
    const units = props.units || [];
    return units
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  });
</script>

<style scoped>
  .overview-tab {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .overview-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-sm);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  @media (max-width: 768px) {
    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }
  }
</style>
