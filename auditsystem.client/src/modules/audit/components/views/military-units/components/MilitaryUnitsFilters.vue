<template>
  <div class="units-filters">
    <div class="filter-group">
      <BaseInput v-model="localSearchQuery"
                 placeholder="Поиск по названию или локации..."
                 size="sm">
        <template #prefix>
          <SearchIcon class="input-icon" />
        </template>
      </BaseInput>
    </div>

    <div class="filter-group">
      <BaseSelect v-model="localStatusFilter"
                  :options="statusOptions"
                  placeholder="Все статусы"
                  size="sm" />
    </div>

    <div class="filter-group">
      <BaseSelect v-model="localSortBy"
                  :options="sortOptions"
                  placeholder="Сортировка"
                  size="sm" />
    </div>

    <div class="filter-group">
      <BaseButton v-if="hasActiveFilters"
                  @click="clearFilters"
                  variant="text"
                  size="sm"
                  color="error">
        <CloseIcon class="button-icon" />
        Сбросить
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import { SearchIcon, CloseIcon } from '@/assets/icons';

  interface Props {
    searchQuery?: string;
    statusFilter?: string;
    sortBy?: string;
  }

  interface Emits {
    (e: 'update:searchQuery', value: string): void;
    (e: 'update:statusFilter', value: string): void;
    (e: 'update:sortBy', value: string): void;
    (e: 'clear-filters'): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    searchQuery: '',
    statusFilter: '',
    sortBy: 'name'
  });

  const emit = defineEmits<Emits>();

  const localSearchQuery = ref(props.searchQuery);
  const localStatusFilter = ref(props.statusFilter);
  const localSortBy = ref(props.sortBy);

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'active', label: 'Активна' },
    { value: 'deployed', label: 'На выезде' },
    { value: 'headquarters', label: 'Штаб' }
  ];

  const sortOptions = [
    { value: 'name', label: 'По названию' },
    { value: 'location', label: 'По локации' },
    { value: 'createdAt', label: 'По дате создания' },
    { value: 'hosts', label: 'По количеству хостов' },
    { value: 'subnets', label: 'По количеству подсетей' }
  ];

  const hasActiveFilters = computed(() =>
    !!(localSearchQuery.value || localStatusFilter.value || localSortBy.value !== 'name')
  );

  // Watch for local changes and emit updates
  watch(localSearchQuery, (value) => {
    emit('update:searchQuery', value);
  });

  watch(localStatusFilter, (value) => {
    emit('update:statusFilter', value);
  });

  watch(localSortBy, (value) => {
    emit('update:sortBy', value);
  });

  // Watch for prop changes to update local values
  watch(() => props.searchQuery, (value) => {
    if (value !== undefined) localSearchQuery.value = value;
  });

  watch(() => props.statusFilter, (value) => {
    if (value !== undefined) localStatusFilter.value = value;
  });

  watch(() => props.sortBy, (value) => {
    if (value !== undefined) localSortBy.value = value;
  });

  const clearFilters = (): void => {
    localSearchQuery.value = '';
    localStatusFilter.value = '';
    localSortBy.value = 'name';
    emit('clear-filters');
  };
</script>

<style scoped>
  .units-filters {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    align-items: end;
  }

  .filter-group {
    display: flex;
    align-items: center;
  }

  .input-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-muted);
  }

  .button-icon {
    width: 1rem;
    height: 1rem;
  }

  @media (max-width: 1024px) {
    .units-filters {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 768px) {
    .units-filters {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }
</style>
