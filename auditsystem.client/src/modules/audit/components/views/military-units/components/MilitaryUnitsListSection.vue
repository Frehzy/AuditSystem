<template>
  <div class="units-list-section">
    <div class="section-header">
      <div class="section-title-group">
        <h2 class="section-title">Список войсковых частей</h2>
        <p class="section-description">
          Управление существующими подразделениями и их ресурсами
        </p>
      </div>
      <div class="section-actions">
        <BaseButton @click="$emit('refresh')"
                    variant="secondary"
                    size="sm"
                    :loading="isLoading"
                    class="refresh-btn">
          <RefreshIcon class="button-icon" />
          Обновить
        </BaseButton>
        <BaseButton @click="$emit('create-unit')"
                    variant="primary"
                    size="sm">
          <PlusIcon class="button-icon" />
          Добавить часть
        </BaseButton>
      </div>
    </div>

    <MilitaryUnitsFilters v-model:search-query="searchQuery"
                          v-model:status-filter="statusFilter"
                          v-model:sort-by="sortBy"
                          @clear-filters="clearFilters" />

    <div class="units-content">
      <MilitaryUnitsGrid :units="filteredUnits"
                         @edit-unit="$emit('edit-unit', $event)"
                         @delete-unit="$emit('delete-unit', $event)"
                         @view-details="$emit('view-details', $event)" />

      <MilitaryUnitsEmptyState v-if="filteredUnits.length === 0 && !isLoading"
                               :has-filters="hasActiveFilters"
                               @create-unit="$emit('create-unit')"
                               @clear-filters="clearFilters" />

      <BaseSkeleton v-else-if="isLoading"
                    count="4"
                    class="loading-skeleton" />
    </div>

    <!-- Пагинация -->
    <BasePagination v-if="totalPages > 1"
                    v-model:current-page="currentPage"
                    :total-pages="totalPages"
                    :total-items="filteredUnits.length"
                    class="pagination" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseSkeleton from '@/framework/ui/components/feedback/BaseSkeleton.vue';
  import BasePagination from '@/framework/ui/components/navigation/BasePagination.vue';
  import { RefreshIcon, PlusIcon } from '@/assets/icons';

  import MilitaryUnitsFilters from './MilitaryUnitsFilters.vue';
  import MilitaryUnitsGrid from './MilitaryUnitsGrid.vue';
  import MilitaryUnitsEmptyState from './MilitaryUnitsEmptyState.vue';
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

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  // Filters
  const searchQuery = ref('');
  const statusFilter = ref('');
  const sortBy = ref('name');
  const currentPage = ref(1);
  const itemsPerPage = 12;

  const hasActiveFilters = computed(() =>
    !!(searchQuery.value || statusFilter.value || sortBy.value !== 'name')
  );

  const filteredUnits = computed(() => {
    let units = props.units || [];

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      units = units.filter(unit =>
        unit.name.toLowerCase().includes(query) ||
        unit.location.toLowerCase().includes(query) ||
        unit.description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter.value) {
      units = units.filter(unit => unit.status === statusFilter.value);
    }

    // Sort units
    switch (sortBy.value) {
      case 'name':
        units.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'location':
        units.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case 'createdAt':
        units.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'hosts':
        units.sort((a, b) => b.hosts.length - a.hosts.length);
        break;
      case 'subnets':
        units.sort((a, b) => b.subnets.length - a.subnets.length);
        break;
    }

    return units;
  });

  const totalPages = computed(() =>
    Math.ceil(filteredUnits.value.length / itemsPerPage)
  );

  const paginatedUnits = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUnits.value.slice(start, end);
  });

  const clearFilters = (): void => {
    searchQuery.value = '';
    statusFilter.value = '';
    sortBy.value = 'name';
    currentPage.value = 1;
  };

  // Reset to first page when filters change
  watch([searchQuery, statusFilter, sortBy], () => {
    currentPage.value = 1;
  });
</script>

<style scoped>
  .units-list-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-sm);
  }

  .section-title-group {
    flex: 1;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
  }

  .section-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .section-actions {
    display: flex;
    gap: var(--spacing-sm);
  }

  .refresh-btn {
    min-width: 120px;
  }

  .units-content {
    min-height: 400px;
  }

  .loading-skeleton {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: var(--spacing-lg);
  }

  .pagination {
    margin-top: var(--spacing-lg);
    justify-content: center;
  }

  @media (max-width: 768px) {
    .section-header {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .section-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .units-list-section {
      padding: var(--spacing-lg);
    }

    .loading-skeleton {
      grid-template-columns: 1fr;
    }
  }
</style>
