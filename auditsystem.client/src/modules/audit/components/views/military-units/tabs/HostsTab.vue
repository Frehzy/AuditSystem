<template>
  <div class="hosts-tab">
    <div class="tab-content">
      <!-- Заголовок и описание -->
      <div class="tab-header">
        <div class="header-icon">
          <HostIcon class="icon" />
        </div>
        <div class="header-text">
          <h2 class="tab-title">Управление хостами</h2>
          <p class="tab-description">
            Просмотр и редактирование найденных хостов во всех войсковых частях
          </p>
        </div>
        <BaseButton @click="$emit('refresh')"
                    variant="secondary"
                    size="sm"
                    :loading="isLoading">
          <RefreshIcon class="button-icon" />
          Обновить
        </BaseButton>
      </div>

      <!-- Статистика хостов -->
      <div class="hosts-stats">
        <div class="stat-card">
          <div class="stat-value">{{ totalHosts }}</div>
          <div class="stat-label">Всего хостов</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ onlineHosts }}</div>
          <div class="stat-label">Активных хостов</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ uniqueUnits }}</div>
          <div class="stat-label">Войсковых частей</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ uniqueSubnets }}</div>
          <div class="stat-label">Подсетей</div>
        </div>
      </div>

      <!-- Фильтры -->
      <div class="hosts-filters">
        <div class="filter-group">
          <BaseInput v-model="searchQuery"
                     placeholder="Поиск по имени, IP или описанию..."
                     size="sm">
            <template #prefix>
              <SearchIcon class="input-icon" />
            </template>
          </BaseInput>
        </div>
        <div class="filter-group">
          <BaseSelect v-model="osFilter"
                      :options="osOptions"
                      placeholder="Все ОС"
                      size="sm" />
        </div>
        <div class="filter-group">
          <BaseSelect v-model="statusFilter"
                      :options="statusOptions"
                      placeholder="Все статусы"
                      size="sm" />
        </div>
      </div>

      <!-- Список хостов -->
      <div class="hosts-list-section">
        <div class="section-header">
          <h3 class="section-title">
            Все хосты
            <span class="hosts-count">({{ filteredHosts.length }})</span>
          </h3>
          <div class="section-actions">
            <BaseButton @click="exportHosts"
                        variant="secondary"
                        size="sm">
              <DownloadIcon class="button-icon" />
              Экспорт
            </BaseButton>
          </div>
        </div>

        <div class="hosts-container">
          <div v-if="filteredHosts.length === 0 && !isLoading" class="empty-hosts">
            <div class="empty-icon">
              <HostIcon class="icon" />
            </div>
            <h4>Хосты не найдены</h4>
            <p v-if="hasActiveFilters">
              Попробуйте изменить параметры поиска или <a @click="clearFilters">сбросить фильтры</a>
            </p>
            <p v-else>Запустите сканирование сети для обнаружения хостов</p>
          </div>

          <BaseSkeleton v-else-if="isLoading" count="6" />

          <div v-else class="hosts-table">
            <div class="table-header">
              <div class="table-column">Хост</div>
              <div class="table-column">IP адрес</div>
              <div class="table-column">ОС</div>
              <div class="table-column">Статус</div>
              <div class="table-column">Войсковая часть</div>
              <div class="table-column">Подсеть</div>
              <div class="table-column">Последнее сканирование</div>
            </div>
            <div class="table-body">
              <div v-for="host in paginatedHosts"
                   :key="host.id"
                   class="table-row"
                   @click="viewHostDetails(host)">
                <div class="table-column">
                  <div class="host-name">{{ host.name }}</div>
                  <div v-if="host.description" class="host-description">
                    {{ host.description }}
                  </div>
                </div>
                <div class="table-column">
                  <code class="host-ip">{{ host.ipAddress }}</code>
                </div>
                <div class="table-column">
                  <BaseChip :color="getOsColor(host.osType)" size="xs">
                    {{ getOsText(host.osType) }}
                  </BaseChip>
                </div>
                <div class="table-column">
                  <div class="status-indicator" :class="`status--${host.status}`"></div>
                  <span class="status-text">{{ getHostStatusText(host.status) }}</span>
                </div>
                <div class="table-column">
                  <span class="host-unit">{{ getUnitName(host.unitId) }}</span>
                </div>
                <div class="table-column">
                  <span class="host-subnet">{{ getSubnetInfo(host.subnetId) }}</span>
                </div>
                <div class="table-column">
                  <span class="host-last-seen">{{ formatLastSeen(host.lastSeen) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Пагинация -->
          <BasePagination v-if="totalPages > 1"
                          v-model:current-page="currentPage"
                          :total-pages="totalPages"
                          :total-items="filteredHosts.length"
                          class="pagination" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import BaseSkeleton from '@/framework/ui/components/feedback/BaseSkeleton.vue';
  import BasePagination from '@/framework/ui/components/navigation/BasePagination.vue';
  import {
    HostIcon,
    RefreshIcon,
    SearchIcon,
    DownloadIcon
  } from '@/assets/icons';
  import type { MilitaryUnit, Host } from '@/modules/audit/api/audit.types';
  import { formatDate } from '@/core/utils/date.utils';

  interface Props {
    units?: MilitaryUnit[];
    isLoading?: boolean;
  }

  interface Emits {
    (e: 'refresh'): void;
  }

  const props = defineProps < Props > ();
  const emit = defineEmits < Emits > ();

  const searchQuery = ref('');
  const osFilter = ref('');
  const statusFilter = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 20;

  const osOptions = [
    { value: '', label: 'Все ОС' },
    { value: 'linux', label: 'Linux' },
    { value: 'windows', label: 'Windows' },
    { value: 'unknown', label: 'Неизвестно' }
  ];

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'online', label: 'В сети' },
    { value: 'offline', label: 'Не в сети' },
    { value: 'unknown', label: 'Неизвестно' }
  ];

  // Статистика
  const totalHosts = computed(() => {
    return props.units?.reduce((total, unit) => total + unit.hosts.length, 0) || 0;
  });

  const onlineHosts = computed(() => {
    return props.units?.reduce((total, unit) =>
      total + unit.hosts.filter(host => host.status === 'online').length, 0
    ) || 0;
  });

  const uniqueUnits = computed(() => props.units?.length || 0);

  const uniqueSubnets = computed(() => {
    return props.units?.reduce((total, unit) => total + unit.subnets.length, 0) || 0;
  });

  // Все хосты
  const allHosts = computed(() => {
    const hosts: (Host & { unitId: string; subnetId: string })[] = [];
    props.units?.forEach(unit => {
      unit.hosts.forEach(host => {
        hosts.push({
          ...host,
          unitId: unit.id,
          subnetId: host.subnetId || ''
        });
      });
    });
    return hosts;
  });

  const filteredHosts = computed(() => {
    let hosts = allHosts.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      hosts = hosts.filter(host =>
        host.name.toLowerCase().includes(query) ||
        host.ipAddress.toLowerCase().includes(query) ||
        host.description?.toLowerCase().includes(query)
      );
    }

    if (osFilter.value) {
      hosts = hosts.filter(host => host.osType === osFilter.value);
    }

    if (statusFilter.value) {
      hosts = hosts.filter(host => host.status === statusFilter.value);
    }

    return hosts;
  });

  const hasActiveFilters = computed(() =>
    !!(searchQuery.value || osFilter.value || statusFilter.value)
  );

  const totalPages = computed(() =>
    Math.ceil(filteredHosts.value.length / itemsPerPage)
  );

  const paginatedHosts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredHosts.value.slice(start, end);
  });

  // Вспомогательные функции
  const getUnitName = (unitId: string) => {
    const unit = props.units?.find(u => u.id === unitId);
    return unit?.name || 'Неизвестно';
  };

  const getSubnetInfo = (subnetId: string) => {
    for (const unit of props.units || []) {
      const subnet = unit.subnets.find(s => s.id === subnetId);
      if (subnet) return `${subnet.network}/${subnet.mask}`;
    }
    return 'Неизвестно';
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

  const getHostStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      online: 'В сети',
      offline: 'Не в сети',
      unknown: 'Неизвестно'
    };
    return statusMap[status] || status;
  };

  const formatLastSeen = (dateString?: string): string => {
    if (!dateString) return 'Никогда';
    return formatDate(dateString, 'DD.MM.YYYY HH:mm');
  };

  const clearFilters = (): void => {
    searchQuery.value = '';
    osFilter.value = '';
    statusFilter.value = '';
    currentPage.value = 1;
  };

  const exportHosts = (): void => {
    // TODO: Implement export functionality
    console.log('Exporting hosts...');
  };

  const viewHostDetails = (host: Host): void => {
    // TODO: Implement host details view
    console.log('View host details:', host);
  };
</script>

<style scoped>
  .hosts-tab {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-sm);
  }

  .tab-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
  }

  .tab-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
  }

  .header-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-lg);
    background: var(--color-primary-light);
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

    .header-icon .icon {
      width: 2rem;
      height: 2rem;
    }

  .header-text {
    flex: 1;
  }

  .tab-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--color-text-primary);
  }

  .tab-description {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .hosts-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }

  .stat-card {
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    transition: all var(--transition-normal);
  }

    .stat-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: var(--spacing-xs);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .hosts-filters {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .hosts-list-section {
    background: var(--color-surface-hover);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--color-border);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .hosts-count {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: 400;
  }

  .hosts-container {
    min-height: 300px;
  }

  .empty-hosts {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-3xl);
    text-align: center;
    color: var(--color-text-secondary);
  }

  .empty-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-full);
    background: var(--color-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
  }

    .empty-icon .icon {
      width: 2rem;
      height: 2rem;
    }

  .empty-hosts a {
    color: var(--color-primary);
    cursor: pointer;
    text-decoration: underline;
  }

    .empty-hosts a:hover {
      color: var(--color-primary-dark);
    }

  /* Table Styles */
  .hosts-table {
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    overflow: hidden;
  }

  .table-header {
    display: grid;
    grid-template-columns: 1.5fr 1fr 0.8fr 1fr 1.2fr 1.2fr 1.5fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: var(--color-surface-hover);
    border-bottom: 1px solid var(--color-border);
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .table-body {
    max-height: 600px;
    overflow-y: auto;
  }

  .table-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr 0.8fr 1fr 1.2fr 1.2fr 1.5fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--color-border);
    cursor: pointer;
    transition: background-color var(--transition-fast);
  }

    .table-row:hover {
      background: var(--color-surface-hover);
    }

    .table-row:last-child {
      border-bottom: none;
    }

  .table-column {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: 0.875rem;
  }

  .host-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .host-description {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: var(--spacing-xs);
  }

  .host-ip {
    font-family: var(--font-family-mono);
    color: var(--color-text-secondary);
    background: var(--color-surface);
    padding: 0.125rem 0.25rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

    .status-indicator.status--online {
      background: var(--color-success);
    }

    .status-indicator.status--offline {
      background: var(--color-error);
    }

    .status-indicator.status--unknown {
      background: var(--color-warning);
    }

  .status-text {
    color: var(--color-text-muted);
  }

  .host-unit,
  .host-subnet {
    color: var(--color-text-secondary);
  }

  .host-last-seen {
    color: var(--color-text-muted);
    font-size: 0.75rem;
  }

  .pagination {
    margin-top: var(--spacing-lg);
    justify-content: center;
  }

  @media (max-width: 1024px) {
    .hosts-table {
      overflow-x: auto;
    }

    .table-header,
    .table-row {
      grid-template-columns: 200px 150px 120px 120px 180px 180px 200px;
      min-width: 1150px;
    }
  }

  @media (max-width: 768px) {
    .tab-header {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md);
    }

    .section-header {
      flex-direction: column;
      gap: var(--spacing-md);
      align-items: stretch;
    }

    .hosts-filters {
      grid-template-columns: 1fr;
    }

    .hosts-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .hosts-stats {
      grid-template-columns: 1fr;
    }

    .hosts-tab {
      padding: var(--spacing-lg);
    }
  }
</style>
