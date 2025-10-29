<template>
  <div class="host-selection-dialog">
    <div class="dialog-header">
      <h2 class="dialog-title">Выбор целей сканирования</h2>
      <p class="dialog-description">Выберите войсковые части и конкретные хосты для сканирования</p>
    </div>

    <div class="dialog-content">
      <!-- Выбор войсковых частей -->
      <div class="selection-section">
        <h3 class="section-title">Войсковые части</h3>

        <div class="selection-actions">
          <BaseToggle v-model="selectAllUnits"
                      @change="handleSelectAllUnits"
                      class="select-all-toggle" />
          <span class="selection-label">Выбрать все части</span>
          <span class="selection-count">Выбрано: {{ selectedUnitsCount }}</span>
        </div>

        <div class="units-grid">
          <div v-for="unit in units"
               :key="unit.id"
               class="unit-card"
               :class="{ 'unit-card--selected': isUnitSelected(unit.id) }"
               @click="toggleUnitSelection(unit.id)">
            <BaseCheckbox :model-value="isUnitSelected(unit.id)"
                          @click.stop
                          class="unit-checkbox" />
            <div class="unit-info">
              <h4 class="unit-name">{{ unit.name }}</h4>
              <div class="unit-details">
                <span class="unit-location">{{ unit.location }}</span>
                <span class="unit-status" :class="`status--${unit.status}`">
                  {{ getStatusText(unit.status) }}
                </span>
              </div>
              <div class="unit-stats">
                <span class="stat">{{ unit.subnets.length }} подсетей</span>
                <span class="stat">{{ unit.hosts.length }} хостов</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Выбор конкретных хостов -->
      <div class="selection-section">
        <h3 class="section-title">Конкретные хосты</h3>

        <div class="selection-actions">
          <BaseToggle v-model="selectAllHosts"
                      @change="handleSelectAllHosts"
                      class="select-all-toggle" />
          <span class="selection-label">Выбрать все хосты</span>
          <span class="selection-count">Выбрано: {{ selectedHostsCount }}</span>
        </div>

        <div class="hosts-filters">
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
              <BaseCheckbox v-model="selectAllFilteredHosts"
                            @change="handleSelectAllFilteredHosts" />
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
              <div class="host-name">
                <span class="name">{{ host.name }}</span>
                <span v-if="host.description" class="description">
                  {{ host.description }}
                </span>
              </div>
            </div>
            <div class="table-cell">
              <code class="ip-address">{{ host.ipAddress }}</code>
            </div>
            <div class="table-cell">
              <span class="unit-name">{{ getUnitName(host.unitId) }}</span>
            </div>
            <div class="table-cell">
              <span class="os-type">{{ getOsText(host.osType) }}</span>
            </div>
            <div class="table-cell">
              <div class="status-indicator" :class="`status--${host.status}`">
                {{ getHostStatusText(host.status) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredHosts.length === 0" class="empty-state">
          <ServerIcon class="empty-icon" />
          <p>Хосты не найдены</p>
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
          <ul class="details-list">
            <li v-for="unitId in selectedUnitIds"
                :key="unitId"
                class="detail-item">
              <ServerIcon class="detail-icon" />
              <span>{{ getUnitName(unitId) }} ({{ getUnitHostsCount(unitId) }} хостов)</span>
            </li>
            <li v-for="hostId in selectedSpecificHostIds"
                :key="hostId"
                class="detail-item">
              <HostIcon class="detail-icon" />
              <span>{{ getHostName(hostId) }} ({{ getHostIp(hostId) }})</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseToggle from '@/framework/ui/components/forms/BaseToggle.vue';
  import BaseCheckbox from '@/framework/ui/components/forms/BaseCheckbox.vue';
  import {
    SearchIcon,
    ServerIcon,
    HostIcon,
    ScanIcon,
    CheckIcon
  } from '@/assets/icons';

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

  const selectAllUnits = ref(false);
  const selectAllHosts = ref(false);
  const selectAllFilteredHosts = ref(false);
  const selectedUnitFilter = ref('');
  const hostSearchQuery = ref('');

  const selectedUnitIds = ref<string[]>([]);
  const selectedHostIds = ref<string[]>([]);

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

  const selectedUnitsCount = computed(() => selectedUnitIds.value.length);
  const selectedHostsCount = computed(() => selectedHostIds.value.length);
  const selectedSpecificHostIds = computed(() => {
    return selectedHostIds.value.filter(hostId => {
      const host = allHosts.value.find(h => h.id === hostId);
      return host && !selectedUnitIds.value.includes(host.unitId);
    });
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
    selectedSpecificHostIds.value.forEach(hostId => {
      total += 1;
    });

    return total;
  });

  const canConfirm = computed(() => {
    return selectedUnitIds.value.length > 0 || selectedHostIds.value.length > 0;
  });

  const isUnitSelected = (unitId: string): boolean => {
    return selectedUnitIds.value.includes(unitId);
  };

  const isHostSelected = (hostId: string): boolean => {
    return selectedHostIds.value.includes(hostId);
  };

  const getStatusText = (status: string): string => {
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

  const handleSelectAllUnits = (): void => {
    if (selectAllUnits.value) {
      selectedUnitIds.value = props.units?.map(unit => unit.id) || [];
    } else {
      selectedUnitIds.value = [];
    }
  };

  const handleSelectAllHosts = (): void => {
    if (selectAllHosts.value) {
      selectedHostIds.value = allHosts.value.map(host => host.id);
    } else {
      selectedHostIds.value = [];
    }
  };

  const handleSelectAllFilteredHosts = (): void => {
    if (selectAllFilteredHosts.value) {
      const filteredHostIds = filteredHosts.value.map(host => host.id);
      selectedHostIds.value = [...new Set([...selectedHostIds.value, ...filteredHostIds])];
    } else {
      const filteredHostIds = filteredHosts.value.map(host => host.id);
      selectedHostIds.value = selectedHostIds.value.filter(id => !filteredHostIds.includes(id));
    }
  };

  const toggleUnitSelection = (unitId: string): void => {
    const index = selectedUnitIds.value.indexOf(unitId);
    if (index > -1) {
      selectedUnitIds.value.splice(index, 1);
    } else {
      selectedUnitIds.value.push(unitId);
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
  .host-selection-dialog {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-height: 80vh;
  }

  .dialog-header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .dialog-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--color-text-primary);
  }

  .dialog-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 1;
    overflow-y: auto;
  }

  .selection-section {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .selection-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    margin-bottom: 1rem;
  }

  .selection-label {
    font-weight: 600;
    color: var(--color-text-primary);
    flex: 1;
  }

  .selection-count {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  /* Units Grid */
  .units-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .unit-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 2px solid var(--color-border);
    cursor: pointer;
    transition: all 0.2s ease;
  }

    .unit-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
    }

  .unit-card--selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .unit-checkbox {
    margin-top: 0.125rem;
  }

  .unit-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .unit-name {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary);
  }

  .unit-details {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
  }

  .unit-location {
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .unit-status {
    padding: 0.25rem 0.75rem;
    border-radius: 2rem;
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
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  /* Hosts Table */
  .hosts-filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .hosts-table {
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 60px 2fr 1.5fr 1.5fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
    font-weight: 700;
    color: var(--color-text-primary);
    font-size: 0.9rem;
  }

  .table-row {
    display: grid;
    grid-template-columns: 60px 2fr 1.5fr 1.5fr 1fr 1fr;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    transition: background-color 0.2s ease;
    cursor: pointer;
  }

    .table-row:hover {
      background: var(--color-surface-hover);
    }

  .table-row--selected {
    background: var(--color-primary-light);
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .table-cell {
    display: flex;
    align-items: center;
    color: var(--color-text-primary);
  }

  .checkbox-cell {
    justify-content: center;
  }

  .host-name {
    display: flex;
    flex-direction: column;
  }

  .name {
    font-weight: 600;
  }

  .description {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
  }

  .ip-address {
    background: var(--color-surface-hover);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .unit-name {
    font-weight: 500;
  }

  .os-type {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .status-indicator {
    padding: 0.375rem 0.75rem;
    border-radius: 2rem;
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

  .input-icon {
    width: 1.125rem;
    height: 1.125rem;
    color: var(--color-text-muted);
  }

  /* Selection Summary */
  .selection-summary {
    background: var(--color-surface-hover);
    border-radius: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--color-border);
  }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .summary-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
  }

  .summary-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
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
    font-weight: 800;
    margin-bottom: 0.25rem;
    color: var(--color-text-primary);
  }

  .summary-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .summary-details {
    background: var(--color-surface);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border: 1px solid var(--color-border);
  }

  .details-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
  }

  .details-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--color-surface-hover);
    border-radius: 0.5rem;
    font-size: 0.875rem;
  }

  .detail-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-primary);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--color-text-secondary);
  }

  .empty-icon {
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.75rem;
    opacity: 0.5;
  }

  /* Dialog Actions */
  .dialog-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .cancel-btn,
  .confirm-btn {
    min-width: 160px;
  }

  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .units-grid {
      grid-template-columns: 1fr;
    }

    .hosts-filters {
      grid-template-columns: 1fr;
    }

    .table-header,
    .table-row {
      grid-template-columns: 50px 1fr 1fr;
      gap: 0.75rem;
    }

    .table-cell:nth-child(4),
    .table-cell:nth-child(5),
    .table-cell:nth-child(6) {
      display: none;
    }

    .summary-cards {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .host-selection-dialog {
      gap: 1.5rem;
    }

    .selection-section {
      padding: 1.25rem;
    }

    .selection-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .dialog-actions {
      flex-direction: column;
    }

    .cancel-btn,
    .confirm-btn {
      width: 100%;
    }
  }
</style>
