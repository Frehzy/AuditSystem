<template>
  <BaseModal :model-value="true"
             title="Выбор целей сканирования"
             subtitle="Выберите войсковые части и конкретные хосты для сканирования"
             icon="ServerIcon"
             size="xl"
             :wrapper-class="`host-selection-dialog-modal`"
             @close="$emit('cancel')">

    <div class="host-selection-content">
      <!-- Выбор войсковых частей -->
      <div class="selection-section">
        <div class="section-header">
          <h3 class="section-title">
            <ServerIcon class="title-icon" />
            Войсковые части
          </h3>
          <div class="section-actions">
            <BaseCheckbox :model-value="allUnitsSelected"
                          :indeterminate="someUnitsSelected"
                          @update:model-value="handleSelectAllUnits"
                          class="select-all-checkbox" />
            <span class="selection-count">{{ selectedUnitsCount }} выбрано</span>
          </div>
        </div>

        <div class="units-grid">
          <div v-for="unit in units"
               :key="unit.id"
               class="unit-card"
               :class="{ 'unit-card--selected': isUnitSelected(unit.id) }"
               @click="toggleUnitSelection(unit.id)">
            <BaseCheckbox :model-value="getUnitSelectionState(unit.id) === 'checked'"
                          :indeterminate="getUnitSelectionState(unit.id) === 'indeterminate'"
                          @click.stop
                          class="unit-checkbox" />
            <div class="unit-content">
              <h4 class="unit-name">{{ unit.name }}</h4>
              <div class="unit-meta">
                <span class="unit-location">{{ unit.location }}</span>
                <span class="unit-status" :class="`status--${unit.status}`">
                  {{ getUnitStatusText(unit.status) }}
                </span>
              </div>
              <div class="unit-stats">
                <div class="stat">
                  <NetworkIcon class="stat-icon" />
                  <span>{{ unit.subnets.length }} подсетей</span>
                </div>
                <div class="stat">
                  <HostIcon class="stat-icon" />
                  <span>{{ unit.hosts.length }} хостов</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Выбор конкретных хостов -->
      <div class="selection-section">
        <div class="section-header">
          <h3 class="section-title">
            <HostIcon class="title-icon" />
            Конкретные хосты
          </h3>
          <div class="section-actions">
            <BaseCheckbox :model-value="allHostsSelected"
                          :indeterminate="someHostsSelected"
                          @update:model-value="handleSelectAllHosts"
                          class="select-all-checkbox" />
            <span class="selection-count">{{ selectedHostsCount }} выбрано</span>
          </div>
        </div>

        <div class="hosts-table-container">
          <div class="table-filters">
            <BaseSelect v-model="selectedUnitFilter"
                        :options="unitFilterOptions"
                        placeholder="Все войсковые части"
                        size="sm" />
            <BaseInput v-model="hostSearchQuery"
                       placeholder="Поиск хостов..."
                       size="sm">
              <template #prefix>
                <SearchIcon class="input-icon" />
              </template>
            </BaseInput>
          </div>

          <div class="hosts-table">
            <div class="table-header">
              <div class="table-cell checkbox-cell">
                <BaseCheckbox :model-value="allFilteredHostsSelected"
                              :indeterminate="someFilteredHostsSelected"
                              @update:model-value="handleSelectAllFilteredHosts" />
              </div>
              <div class="table-cell">Имя хоста</div>
              <div class="table-cell">IP адрес</div>
              <div class="table-cell">Войсковая часть</div>
              <div class="table-cell">ОС</div>
              <div class="table-cell">Статус</div>
            </div>

            <div v-for="host in filteredHosts"
                 :key="host.id"
                 class="table-row"
                 :class="{ 'table-row--selected': isHostSelected(host.id) }"
                 @click="toggleHostSelection(host.id)">
              <div class="table-cell checkbox-cell">
                <BaseCheckbox :model-value="isHostSelected(host.id)"
                              @click.stop />
              </div>
              <div class="table-cell">
                <div class="host-info">
                  <span class="host-name">{{ host.name }}</span>
                  <span v-if="host.description" class="host-description">
                    {{ host.description }}
                  </span>
                </div>
              </div>
              <div class="table-cell">
                <code class="host-ip">{{ host.ipAddress }}</code>
              </div>
              <div class="table-cell">
                <span class="unit-name">{{ getUnitName(host.unitId) }}</span>
              </div>
              <div class="table-cell">
                <BaseChip :color="getOsColor(host.osType)" size="xs">
                  {{ getOsText(host.osType) }}
                </BaseChip>
              </div>
              <div class="table-cell">
                <div class="status-indicator" :class="`status--${host.status}`">
                  {{ getHostStatusText(host.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredHosts.length === 0" class="empty-state">
          <ServerIcon class="empty-icon" />
          <p>Хосты не найдены</p>
          <p class="empty-description">
            Попробуйте изменить параметры поиска или выбрать другую войсковую часть
          </p>
        </div>
      </div>

      <!-- Сводка выбора -->
      <div class="selection-summary">
        <h3 class="section-title">Сводка выбора</h3>

        <div class="summary-cards">
          <div class="summary-card">
            <div class="summary-icon units">
              <ServerIcon />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ selectedUnitsCount }}</div>
              <div class="summary-label">Войсковых частей</div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon hosts">
              <HostIcon />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ selectedHostsCount }}</div>
              <div class="summary-label">Хостов</div>
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-icon total">
              <ScanIcon />
            </div>
            <div class="summary-content">
              <div class="summary-value">{{ totalTargets }}</div>
              <div class="summary-label">Всего целей</div>
            </div>
          </div>
        </div>

        <div class="summary-details">
          <h4 class="details-title">Детали выбора:</h4>
          <div class="details-list">
            <div v-for="unitId in selectedUnitIds"
                 :key="unitId"
                 class="detail-item">
              <ServerIcon class="detail-icon" />
              <span class="detail-text">{{ getUnitName(unitId) }} ({{ getUnitHostsCount(unitId) }} хостов)</span>
            </div>
            <div v-for="hostId in selectedSpecificHostIds"
                 :key="hostId"
                 class="detail-item">
              <HostIcon class="detail-icon" />
              <span class="detail-text">{{ getHostName(hostId) }} ({{ getHostIp(hostId) }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-actions">
        <BaseButton @click="$emit('cancel')"
                    variant="secondary"
                    class="cancel-btn">
          Отмена
        </BaseButton>
        <BaseButton @click="handleConfirm"
                    variant="primary"
                    :disabled="!canConfirm"
                    class="confirm-btn">
          <CheckIcon class="button-icon" />
          Подтвердить выбор
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseCheckbox from '@/framework/ui/components/forms/BaseCheckbox.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import {
    SearchIcon,
    ServerIcon,
    HostIcon,
    ScanIcon,
    CheckIcon,
    NetworkIcon
  } from '@/assets/icons';
  import type { Host } from '../../api/audit.types';

  interface Props {
    units?: any[];
  }

  interface Emits {
    (e: 'confirm', selection: HostSelection): void;
    (e: 'cancel'): void;
  }

  interface HostSelection {
    unitIds: string[];
    hostIds: string[];
  }

  const props = defineProps<Props>();
  const emit = defineEmits<Emits>();

  const { showToast } = useToast();

  // Filters
  const selectedUnitFilter = ref('');
  const hostSearchQuery = ref('');

  // Selections
  const selectedUnitIds = ref<string[]>([]);
  const selectedHostIds = ref<string[]>([]);

  // Computed properties
  const allHosts = computed(() => {
    return props.units?.flatMap(unit => unit.hosts.map((host: any) => ({
      ...host,
      unitName: unit.name
    }))) || [];
  });

  const unitFilterOptions = computed(() => {
    const options = [{ value: '', label: 'Все войсковые части' }];
    props.units?.forEach(unit => {
      options.push({ value: unit.id, label: unit.name });
    });
    return options;
  });

  const filteredHosts = computed(() => {
    let hosts = allHosts.value;

    if (selectedUnitFilter.value) {
      hosts = hosts.filter(host => host.unitId === selectedUnitFilter.value);
    }

    if (hostSearchQuery.value) {
      const query = hostSearchQuery.value.toLowerCase();
      hosts = hosts.filter(host =>
        host.name.toLowerCase().includes(query) ||
        host.ipAddress.toLowerCase().includes(query) ||
        host.description?.toLowerCase().includes(query)
      );
    }

    return hosts;
  });

  // Selection counts
  const selectedUnitsCount = computed(() => selectedUnitIds.value.length);
  const selectedHostsCount = computed(() => selectedHostIds.value.length);
  const selectedSpecificHostIds = computed(() => {
    return selectedHostIds.value.filter(hostId => {
      const host = allHosts.value.find(h => h.id === hostId);
      return host && !selectedUnitIds.value.includes(host.unitId);
    });
  });

  // Select all states
  const allUnitsSelected = computed(() => {
    return (props.units?.length || 0) > 0 && selectedUnitIds.value.length === (props.units?.length || 0);
  });

  const someUnitsSelected = computed(() => {
    return selectedUnitIds.value.length > 0 && selectedUnitIds.value.length < (props.units?.length || 0);
  });

  const allHostsSelected = computed(() => {
    return allHosts.value.length > 0 && selectedHostIds.value.length === allHosts.value.length;
  });

  const someHostsSelected = computed(() => {
    return selectedHostIds.value.length > 0 && selectedHostIds.value.length < allHosts.value.length;
  });

  const allFilteredHostsSelected = computed(() => {
    return filteredHosts.value.length > 0 &&
      filteredHosts.value.every(host => selectedHostIds.value.includes(host.id));
  });

  const someFilteredHostsSelected = computed(() => {
    const hasSelected = filteredHosts.value.some(host => selectedHostIds.value.includes(host.id));
    return hasSelected && !allFilteredHostsSelected.value;
  });

  const totalTargets = computed(() => {
    let total = 0;

    // Хосты из выбранных войсковых частей
    selectedUnitIds.value.forEach(unitId => {
      const unit = props.units?.find(u => u.id === unitId);
      if (unit) {
        total += unit.hosts.length;
      }
    });

    // Плюс конкретные выбранные хосты (исключая дубликаты)
    total += selectedSpecificHostIds.value.length;

    return total;
  });

  const canConfirm = computed(() => {
    return selectedUnitIds.value.length > 0 || selectedHostIds.value.length > 0;
  });

  // Methods
  const isUnitSelected = (unitId: string): boolean => {
    return selectedUnitIds.value.includes(unitId);
  };

  const isHostSelected = (hostId: string): boolean => {
    return selectedHostIds.value.includes(hostId);
  };

  const getUnitSelectionState = (unitId: string): 'checked' | 'indeterminate' | 'unchecked' => {
    const unit = props.units?.find(u => u.id === unitId);
    if (!unit?.hosts) return 'unchecked';

    const unitHosts = unit.hosts || [];
    const selectedHostsCount = unitHosts.filter((host: Host) =>
      selectedHostIds.value.includes(host.id)
    ).length;

    if (selectedHostsCount === 0) return 'unchecked';
    if (selectedHostsCount === unitHosts.length) return 'checked';
    return 'indeterminate';
  };

  const getUnitStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Активна',
      deployed: 'На выезде',
      headquarters: 'Штаб'
    };
    return statusMap[status] || status;
  };

  const getHostStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      online: 'В сети',
      offline: 'Не в сети',
      unknown: 'Неизвестно'
    };
    return statusMap[status] || status;
  };

  const getOsText = (osType: string): string => {
    const osMap: Record<string, string> = {
      linux: 'Linux',
      windows: 'Windows',
      unknown: 'Неизвестно'
    };
    return osMap[osType] || osType;
  };

  const getOsColor = (osType: string): string => {
    const colorMap: Record<string, string> = {
      linux: 'info',
      windows: 'primary',
      unknown: 'default'
    };
    return colorMap[osType] || 'default';
  };

  const getUnitName = (unitId: string): string => {
    const unit = props.units?.find(u => u.id === unitId);
    return unit?.name || 'Неизвестно';
  };

  const getUnitHostsCount = (unitId: string): number => {
    const unit = props.units?.find(u => u.id === unitId);
    return unit?.hosts.length || 0;
  };

  const getHostName = (hostId: string): string => {
    const host = allHosts.value.find(h => h.id === hostId);
    return host?.name || 'Неизвестно';
  };

  const getHostIp = (hostId: string): string => {
    const host = allHosts.value.find(h => h.id === hostId);
    return host?.ipAddress || 'Неизвестно';
  };

  const handleSelectAllUnits = (isChecked: boolean): void => {
    if (isChecked) {
      selectedUnitIds.value = props.units?.map(unit => unit.id) || [];
      selectedHostIds.value = allHosts.value.map(host => host.id);
    } else {
      selectedUnitIds.value = [];
      selectedHostIds.value = [];
    }
  };

  const handleSelectAllHosts = (isChecked: boolean): void => {
    if (isChecked) {
      selectedHostIds.value = allHosts.value.map(host => host.id);
      selectedUnitIds.value = props.units?.map(unit => unit.id) || [];
    } else {
      selectedHostIds.value = [];
      selectedUnitIds.value = [];
    }
  };

  const handleSelectAllFilteredHosts = (isChecked: boolean): void => {
    if (isChecked) {
      const filteredHostIds = filteredHosts.value.map(host => host.id);
      selectedHostIds.value = [...new Set([...selectedHostIds.value, ...filteredHostIds])];
    } else {
      const filteredHostIds = filteredHosts.value.map(host => host.id);
      selectedHostIds.value = selectedHostIds.value.filter(id => !filteredHostIds.includes(id));
    }
  };

  const toggleUnitSelection = (unitId: string): void => {
    const index = selectedUnitIds.value.indexOf(unitId);
    const unit = props.units?.find(u => u.id === unitId);

    if (index > -1) {
      selectedUnitIds.value.splice(index, 1);
      // Убираем хосты этой части из выбора
      if (unit?.hosts) {
        unit.hosts.forEach((host: Host) => {
          const hostIndex = selectedHostIds.value.indexOf(host.id);
          if (hostIndex > -1) {
            selectedHostIds.value.splice(hostIndex, 1);
          }
        });
      }
    } else {
      selectedUnitIds.value.push(unitId);
      // Добавляем все хосты этой части в выбор
      if (unit?.hosts) {
        unit.hosts.forEach((host: Host) => {
          if (!selectedHostIds.value.includes(host.id)) {
            selectedHostIds.value.push(host.id);
          }
        });
      }
    }
  };

  const toggleHostSelection = (hostId: string): void => {
    const index = selectedHostIds.value.indexOf(hostId);
    if (index > -1) {
      selectedHostIds.value.splice(index, 1);
    } else {
      selectedHostIds.value.push(hostId);
    }
  };

  const handleConfirm = (): void => {
    if (!canConfirm.value) {
      showToast({
        type: 'warning',
        title: 'Выберите цели',
        message: 'Для продолжения необходимо выбрать хотя бы одну цель для сканирования'
      });
      return;
    }

    const selection: HostSelection = {
      unitIds: selectedUnitIds.value,
      hostIds: selectedHostIds.value
    };

    emit('confirm', selection);
    showToast({
      type: 'success',
      title: 'Цели выбраны',
      message: `Выбрано ${totalTargets.value} целей для сканирования`
    });
  };
</script>

<style scoped>
  .host-selection-dialog-modal ::v-deep(.base-modal__container) {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }

  .host-selection-dialog-modal ::v-deep(.base-modal__content) {
    padding: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  .host-selection-content {
    flex: 1;
    padding: var(--spacing-xl);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
  }

  /* Selection Sections */
  .selection-section {
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    border: 1px solid var(--color-border);
    overflow: hidden;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .title-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary);
  }

  .section-actions {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .selection-count {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  /* Units Grid */
  .units-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .unit-card {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

    .unit-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

  .unit-card--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
  }

  .unit-checkbox {
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .unit-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .unit-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .unit-meta {
    display: flex;
    gap: var(--spacing-md);
    font-size: 0.875rem;
  }

  .unit-location {
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .unit-status {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status--active {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .status--deployed {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  .status--headquarters {
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .unit-stats {
    display: flex;
    gap: var(--spacing-lg);
  }

  .stat {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .stat-icon {
    width: 1rem;
    height: 1rem;
  }

  /* Hosts Table */
  .hosts-table-container {
    padding: var(--spacing-lg);
    min-width: 0;
  }

  .table-filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .hosts-table {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
    max-height: 400px;
    overflow-y: auto;
  }

  .table-header {
    display: grid;
    grid-template-columns: 60px minmax(200px, 2fr) minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 0.9rem;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .table-row {
    display: grid;
    grid-template-columns: 60px minmax(200px, 2fr) minmax(120px, 1.5fr) minmax(120px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr);
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--color-border-light);
    transition: background-color var(--transition-fast);
    cursor: pointer;
  }

    .table-row:hover {
      background: var(--color-surface-hover);
    }

  .table-row--selected {
    background: var(--color-primary-50);
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-cell {
    display: flex;
    align-items: center;
    color: var(--color-text-primary);
    min-width: 0;
  }

  .checkbox-cell {
    justify-content: center;
  }

  .host-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .host-name {
    font-weight: 600;
  }

  .host-description {
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .host-ip {
    background: var(--color-surface-hover);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-sm);
    font-family: var(--font-family-mono);
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .unit-name {
    font-weight: 500;
  }

  .status-indicator {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status--online {
    background: var(--color-success-light);
    color: var(--color-success);
  }

  .status--offline {
    background: var(--color-error-light);
    color: var(--color-error);
  }

  .status--unknown {
    background: var(--color-warning-light);
    color: var(--color-warning);
  }

  /* Selection Summary */
  .selection-summary {
    background: var(--color-surface);
    border-radius: var(--radius-xl);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .summary-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

    .summary-icon.units {
      background: var(--color-primary);
    }

    .summary-icon.hosts {
      background: var(--color-success);
    }

    .summary-icon.total {
      background: var(--color-info);
    }

  .summary-content {
    flex: 1;
  }

  .summary-value {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: var(--spacing-xs);
    color: var(--color-text-primary);
  }

  .summary-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .summary-details {
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
  }

  .details-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-md) 0;
    color: var(--color-text-primary);
  }

  .details-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-height: 200px;
    overflow-y: auto;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
  }

  .detail-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .detail-text {
    color: var(--color-text-primary);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--color-text-secondary);
  }

  .empty-icon {
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }

  .empty-description {
    margin: var(--spacing-sm) 0 0 0;
    font-size: 0.9rem;
  }

  /* Dialog Actions */
  .dialog-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
    padding: var(--spacing-lg) var(--spacing-xl);
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .cancel-btn,
  .confirm-btn {
    min-width: 160px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: var(--spacing-sm);
  }

  .input-icon {
    width: 1.125rem;
    height: 1.125rem;
    color: var(--color-text-muted);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .units-grid {
      grid-template-columns: 1fr;
    }

    .table-filters {
      grid-template-columns: 1fr;
    }

    .hosts-table {
      min-width: 800px;
    }

    .summary-cards {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .host-selection-content {
      padding: var(--spacing-lg);
      gap: var(--spacing-xl);
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .table-header,
    .table-row {
      grid-template-columns: 50px minmax(150px, 1.5fr) minmax(100px, 1fr) minmax(100px, 1fr);
      font-size: 0.8rem;
    }

    .table-cell:nth-child(4),
    .table-cell:nth-child(5),
    .table-cell:nth-child(6) {
      display: none;
    }

    .dialog-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .confirm-btn {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    .host-selection-content {
      padding: var(--spacing-md);
    }

    .units-grid {
      padding: var(--spacing-md);
    }

    .unit-card {
      padding: var(--spacing-md);
    }

    .unit-meta {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .unit-stats {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }
</style>
