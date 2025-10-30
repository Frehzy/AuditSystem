<template>
  <div class="units-view">
    <!-- Header Section -->
    <div class="units-view__header">
      <div class="header-content">
        <div class="header-icon">
          <ServerIcon class="icon" />
        </div>
        <div class="header-text">
          <h1 class="units-view__title">Войсковые части</h1>
          <p class="units-view__subtitle">Управление военными подразделениями и их сетевыми ресурсами</p>
        </div>
      </div>
    </div>

    <div class="units-view__content">
      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">Быстрые действия</h2>
            <p class="section-description">Создание новых единиц и сканирование сети</p>
          </div>
        </div>

        <div class="actions-grid">
          <div class="action-card" @click="showCreateUnitDialog = true">
            <div class="action-icon primary">
              <PlusIcon class="icon" />
            </div>
            <div class="action-content">
              <h3 class="action-title">Добавить часть</h3>
              <p class="action-description">Создать новую войсковую часть с подсетями и хостами</p>
            </div>
            <div class="action-arrow">
              <ArrowRightIcon class="icon" />
            </div>
          </div>

          <div class="action-card" @click="showNetworkScanDialog = true">
            <div class="action-icon secondary">
              <ScanIcon class="icon" />
            </div>
            <div class="action-content">
              <h3 class="action-title">Сканировать сеть</h3>
              <p class="action-description">Запустить автоматическое сканирование сетевых ресурсов</p>
            </div>
            <div class="action-arrow">
              <ArrowRightIcon class="icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon total-units">
              <ServerIcon class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalUnits }}</div>
              <div class="stat-label">Всего частей</div>
              <div class="stat-trend" v-if="unitsGrowth > 0">
                <TrendUpIcon class="trend-icon" />
                <span>+{{ unitsGrowth }} за месяц</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon active-units">
              <ActivityIcon class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ activeUnits }}</div>
              <div class="stat-label">Активных</div>
              <div class="stat-percentage">{{ activePercentage }}% от общего числа</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon total-subnets">
              <NetworkIcon class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalSubnets }}</div>
              <div class="stat-label">Подсетей</div>
              <div class="stat-change" v-if="subnetsChange !== 0">
                <span :class="subnetsChange > 0 ? 'change-positive' : 'change-negative'">
                  {{ subnetsChange > 0 ? '+' : '' }}{{ subnetsChange }}
                </span>
                с прошлого месяца
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon total-hosts">
              <HostIcon class="icon" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalHosts }}</div>
              <div class="stat-label">Хостов</div>
              <div class="hosts-status">
                <span class="online-count">{{ onlineHosts }} онлайн</span>
                <span class="offline-count">{{ offlineHosts }} офлайн</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Units List Section -->
      <div class="units-list-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">Список войсковых частей</h2>
            <p class="section-description">Управление существующими подразделениями и их ресурсами</p>
          </div>
          <div class="section-actions">
            <BaseButton @click="refreshUnits"
                        variant="secondary"
                        size="sm"
                        :loading="isLoading"
                        class="refresh-btn">
              <RefreshIcon class="button-icon" />
              Обновить
            </BaseButton>
            <BaseButton @click="exportUnits"
                        variant="text"
                        size="sm">
              <DownloadIcon class="button-icon" />
              Экспорт
            </BaseButton>
          </div>
        </div>

        <!-- Filters -->
        <div class="units-filters">
          <div class="filter-group">
            <BaseInput v-model="searchQuery"
                       placeholder="Поиск по названию или локации..."
                       size="sm">
              <template #prefix>
                <SearchIcon class="input-icon" />
              </template>
            </BaseInput>
          </div>
          <div class="filter-group">
            <BaseSelect v-model="statusFilter"
                        :options="statusOptions"
                        placeholder="Все статусы"
                        size="sm" />
          </div>
          <div class="filter-group">
            <BaseSelect v-model="sortBy"
                        :options="sortOptions"
                        placeholder="Сортировка"
                        size="sm" />
          </div>
        </div>

        <!-- Units Grid -->
        <div class="units-grid">
          <div v-for="unit in filteredUnits"
               :key="unit.id"
               class="unit-card">
            <div class="unit-card__header">
              <div class="unit-badge" :class="`status--${unit.status}`">
                {{ getStatusText(unit.status) }}
              </div>
              <div class="unit-actions">
                <BaseButton @click.stop="editUnit(unit)"
                            variant="text"
                            size="sm"
                            class="action-btn">
                  <EditIcon class="button-icon" />
                </BaseButton>
                <BaseButton @click.stop="deleteUnit(unit)"
                            variant="text"
                            size="sm"
                            color="error"
                            class="action-btn">
                  <DeleteIcon class="button-icon" />
                </BaseButton>
              </div>
            </div>

            <div class="unit-card__content">
              <div class="unit-main-info">
                <h3 class="unit-name">{{ unit.name }}</h3>
                <div class="unit-location">
                  <MapPinIcon class="location-icon" />
                  <span>{{ unit.location }}</span>
                </div>
                <p v-if="unit.description" class="unit-description">
                  {{ unit.description }}
                </p>
              </div>

              <div class="unit-stats">
                <div class="stat-item">
                  <div class="stat-icon">
                    <NetworkIcon class="icon" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ unit.subnets.length }}</div>
                    <div class="stat-label">подсетей</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <HostIcon class="icon" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ unit.hosts.length }}</div>
                    <div class="stat-label">хостов</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <CalendarIcon class="icon" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ formatUnitDate(unit.createdAt) }}</div>
                    <div class="stat-label">создано</div>
                  </div>
                </div>
              </div>

              <!-- Subnets Preview -->
              <div v-if="unit.subnets.length > 0" class="subnets-preview">
                <h4 class="preview-title">Подсети</h4>
                <div class="preview-list">
                  <div v-for="subnet in unit.subnets.slice(0, 3)"
                       :key="subnet.id"
                       class="preview-item">
                    <div class="preview-content">
                      <span class="preview-name">{{ subnet.name }}</span>
                      <code class="preview-address">{{ subnet.network }}/{{ subnet.mask }}</code>
                    </div>
                    <div class="preview-meta">
                      <span class="devices-count">{{ subnet.devicesCount }} устройств</span>
                      <span class="last-scan" :class="{ 'never-scanned': !subnet.lastScan }">
                        {{ subnet.lastScan ? formatRelativeTime(subnet.lastScan) : 'Никогда' }}
                      </span>
                    </div>
                  </div>
                  <div v-if="unit.subnets.length > 3" class="preview-more">
                    +{{ unit.subnets.length - 3 }} еще
                  </div>
                </div>
              </div>

              <!-- Hosts Preview -->
              <div v-if="unit.hosts.length > 0" class="hosts-preview">
                <h4 class="preview-title">Хосты</h4>
                <div class="preview-list">
                  <div v-for="host in unit.hosts.slice(0, 3)"
                       :key="host.id"
                       class="preview-item host-item"
                       :class="`host-status--${host.status}`">
                    <div class="preview-content">
                      <span class="preview-name">{{ host.name }}</span>
                      <code class="preview-address">{{ host.ipAddress }}</code>
                      <BaseChip :color="getOsColor(host.osType)" size="xs">
                        {{ getOsText(host.osType) }}
                      </BaseChip>
                    </div>
                    <div class="host-status">
                      <div class="status-indicator" :class="`status--${host.status}`"></div>
                      <span class="status-text">{{ getHostStatusText(host.status) }}</span>
                    </div>
                  </div>
                  <div v-if="unit.hosts.length > 3" class="preview-more">
                    +{{ unit.hosts.length - 3 }} еще
                  </div>
                </div>
              </div>
            </div>

            <div class="unit-card__footer">
              <div class="footer-actions">
                <BaseButton @click="addSubnet(unit)"
                            variant="text"
                            size="sm"
                            class="footer-btn">
                  <PlusIcon class="button-icon" />
                  Подсеть
                </BaseButton>
                <BaseButton @click="addHost(unit)"
                            variant="text"
                            size="sm"
                            class="footer-btn">
                  <PlusIcon class="button-icon" />
                  Хост
                </BaseButton>
                <BaseButton @click="viewUnitDetails(unit)"
                            variant="text"
                            size="sm"
                            class="footer-btn">
                  <EyeIcon class="button-icon" />
                  Подробнее
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUnits.length === 0" class="empty-state">
          <div class="empty-icon">
            <ServerIcon class="icon" />
          </div>
          <div class="empty-content">
            <h3 class="empty-title">Войсковые части не найдены</h3>
            <p class="empty-description">
              {{ searchQuery || statusFilter ? 'Попробуйте изменить параметры поиска' : 'Добавьте первую войсковую часть для начала работы' }}
            </p>
            <div class="empty-actions">
              <BaseButton @click="showCreateUnitDialog = true"
                          variant="primary">
                <PlusIcon class="button-icon" />
                Добавить войсковую часть
              </BaseButton>
              <BaseButton v-if="searchQuery || statusFilter"
                          @click="clearFilters"
                          variant="secondary">
                Сбросить фильтры
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалоги (остаются без изменений) -->
    <BaseModal v-if="showCreateUnitDialog"
               :modelValue="showCreateUnitDialog"
               :title="editingUnit ? 'Редактирование войсковой части' : 'Создание войсковой части'"
               size="medium"
               @update:modelValue="showCreateUnitDialog = $event"
               @close="closeUnitDialog">
      <MilitaryUnitForm :unit="editingUnit"
                        @save="handleSaveUnit"
                        @cancel="closeUnitDialog" />
    </BaseModal>

    <BaseModal v-if="showSubnetDialog"
               :modelValue="showSubnetDialog"
               title="Добавление подсети"
               size="medium"
               @update:modelValue="showSubnetDialog = $event"
               @close="closeSubnetDialog">
      <SubnetForm :unit-id="selectedUnit?.id"
                  @save="handleSaveSubnet"
                  @cancel="closeSubnetDialog" />
    </BaseModal>

    <BaseModal v-if="showHostDialog"
               :modelValue="showHostDialog"
               title="Добавление хоста"
               size="medium"
               @update:modelValue="showHostDialog = $event"
               @close="closeHostDialog">
      <HostForm :unit-id="selectedUnit?.id"
                @save="handleSaveHost"
                @cancel="closeHostDialog" />
    </BaseModal>

    <BaseModal v-if="showNetworkScanDialog"
               :modelValue="showNetworkScanDialog"
               title="Сканирование сети"
               size="large"
               @update:modelValue="showNetworkScanDialog = $event"
               @close="showNetworkScanDialog = false">
      <NetworkScanForm :units="units"
                       @scan="handleNetworkScan"
                       @cancel="showNetworkScanDialog = false" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseButton from '@/framework/ui/components/buttons/BaseButton.vue';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';
  import BaseInput from '@/framework/ui/components/forms/BaseInput.vue';
  import BaseSelect from '@/framework/ui/components/forms/BaseSelect.vue';
  import BaseChip from '@/framework/ui/components/data-display/BaseChip.vue';
  import MilitaryUnitForm from '../forms/MilitaryUnitForm.vue';
  import SubnetForm from '../forms/SubnetForm.vue';
  import HostForm from '../forms/HostForm.vue';
  import NetworkScanForm from '../forms/NetworkScanForm.vue';
  import {
    PlusIcon,
    RefreshIcon,
    EditIcon,
    DeleteIcon,
    ScanIcon,
    ServerIcon,
    HostIcon,
    NetworkIcon,
    ActivityIcon,
    SearchIcon,
    DownloadIcon,
    ArrowRightIcon,
    MapPinIcon,
    CalendarIcon,
    EyeIcon,
    TrendUpIcon
  } from '@/assets/icons';
  import { useMilitaryUnits } from '../../composables/useMilitaryUnits';
  import type { MilitaryUnit, CreateUnitCommand, CreateSubnetCommand, CreateHostCommand } from '../../api/audit.types';

  interface Props {
    units?: MilitaryUnit[];
    isLoading?: boolean;
  }

  const props = defineProps<Props>();

  const { showToast } = useToast();
  const militaryUnits = useMilitaryUnits();

  // State
  const showCreateUnitDialog = ref(false);
  const showSubnetDialog = ref(false);
  const showHostDialog = ref(false);
  const showNetworkScanDialog = ref(false);
  const editingUnit = ref<MilitaryUnit | null>(null);
  const selectedUnit = ref<MilitaryUnit | null>(null);

  // Filters
  const searchQuery = ref('');
  const statusFilter = ref('');
  const sortBy = ref('name');

  // Options
  const statusOptions = ref([
    { value: '', label: 'Все статусы' },
    { value: 'active', label: 'Активна' },
    { value: 'deployed', label: 'На выезде' },
    { value: 'headquarters', label: 'Штаб' }
  ]);

  const sortOptions = ref([
    { value: 'name', label: 'По названию' },
    { value: 'location', label: 'По локации' },
    { value: 'createdAt', label: 'По дате создания' },
    { value: 'hosts', label: 'По количеству хостов' }
  ]);

  // Computed properties
  const totalUnits = computed(() => props.units?.length || 0);
  const activeUnits = computed(() => props.units?.filter(unit => unit.status === 'active').length || 0);
  const totalSubnets = computed(() => props.units?.reduce((total, unit) => total + unit.subnets.length, 0) || 0);
  const totalHosts = computed(() => props.units?.reduce((total, unit) => total + unit.hosts.length, 0) || 0);

  // Demo data for stats
  const unitsGrowth = computed(() => Math.floor(totalUnits.value * 0.1));
  const activePercentage = computed(() => totalUnits.value ? Math.round((activeUnits.value / totalUnits.value) * 100) : 0);
  const subnetsChange = computed(() => Math.floor(totalSubnets.value * 0.05));
  const onlineHosts = computed(() => props.units?.reduce((total, unit) =>
    total + unit.hosts.filter(host => host.status === 'online').length, 0) || 0);
  const offlineHosts = computed(() => totalHosts.value - onlineHosts.value);

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
        units.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'hosts':
        units.sort((a, b) => b.hosts.length - a.hosts.length);
        break;
    }

    return units;
  });

  // Methods (остаются без изменений)
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

  const getOsColor = (osType: string): string => {
    const colorMap: Record<string, string> = {
      linux: 'info',
      windows: 'primary',
      unknown: 'default'
    };
    return colorMap[osType] || 'default';
  };

  const formatUnitDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);

    if (hours < 1) return 'Менее часа назад';
    if (hours < 24) return `${hours} ч назад`;
    return `${Math.floor(hours / 24)} дн назад`;
  };

  const refreshUnits = (): void => {
    militaryUnits.loadUnits();
  };

  const exportUnits = (): void => {
    showToast({
      type: 'success',
      title: 'Экспорт начат',
      message: 'Данные будут подготовлены для скачивания'
    });
  };

  const clearFilters = (): void => {
    searchQuery.value = '';
    statusFilter.value = '';
    sortBy.value = 'name';
  };

  const viewUnitDetails = (unit: MilitaryUnit): void => {
    // Implement unit details view
    console.log('View unit details:', unit);
  };

  // Остальные методы остаются без изменений...
  const editUnit = (unit: MilitaryUnit): void => {
    editingUnit.value = { ...unit };
    showCreateUnitDialog.value = true;
  };

  const addSubnet = (unit: MilitaryUnit): void => {
    selectedUnit.value = unit;
    showSubnetDialog.value = true;
  };

  const addHost = (unit: MilitaryUnit): void => {
    selectedUnit.value = unit;
    showHostDialog.value = true;
  };

  const deleteUnit = async (unit: MilitaryUnit): Promise<void> => {
    if (confirm(`Удалить войсковую часть "${unit.name}"?`)) {
      try {
        await militaryUnits.deleteUnit(unit.id);
        showToast({
          type: 'success',
          title: 'Войсковая часть удалена',
          message: 'Войсковая часть успешно удалена из системы'
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось удалить войсковую часть'
        });
      }
    }
  };

  const handleSaveUnit = async (unitData: CreateUnitCommand): Promise<void> => {
    try {
      if (editingUnit.value) {
        await militaryUnits.updateUnit(editingUnit.value.id, unitData);
        showToast({
          type: 'success',
          title: 'Войсковая часть обновлена',
          message: 'Данные войсковой части успешно обновлены'
        });
      } else {
        await militaryUnits.createUnit(unitData);
        showToast({
          type: 'success',
          title: 'Войсковая часть создана',
          message: 'Новая войсковая часть успешно создана'
        });
      }
      closeUnitDialog();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сохранить войсковую часть'
      });
    }
  };

  const handleSaveSubnet = async (subnetData: CreateSubnetCommand): Promise<void> => {
    try {
      await militaryUnits.createSubnet(subnetData);
      showToast({
        type: 'success',
        title: 'Подсеть добавлена',
        message: 'Новая подсеть успешно создана'
      });
      closeSubnetDialog();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось создать подсеть'
      });
    }
  };

  const handleSaveHost = async (hostData: CreateHostCommand): Promise<void> => {
    try {
      await militaryUnits.createHost(hostData);
      showToast({
        type: 'success',
        title: 'Хост добавлен',
        message: 'Новый хост успешно создан'
      });
      closeHostDialog();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось создать хост'
      });
    }
  };

  const handleNetworkScan = async (scanData: any): Promise<void> => {
    try {
      console.log('Network scan data:', scanData);
      showToast({
        type: 'success',
        title: 'Сканирование запущено',
        message: 'Сканирование сети успешно начато'
      });
      showNetworkScanDialog.value = false;
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось запустить сканирование сети'
      });
    }
  };

  const closeUnitDialog = (): void => {
    showCreateUnitDialog.value = false;
    editingUnit.value = null;
  };

  const closeSubnetDialog = (): void => {
    showSubnetDialog.value = false;
    selectedUnit.value = null;
  };

  const closeHostDialog = (): void => {
    showHostDialog.value = false;
    selectedUnit.value = null;
  };

  onMounted(() => {
    militaryUnits.loadUnits();
  });
</script>

<style scoped>
  .units-view {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl, 2rem);
    padding: var(--spacing-xl, 1.5rem);
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Header Section */
  .units-view__header {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--spacing-2xl, 2rem);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg, 1.5rem);
  }

  .header-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-lg, 0.75rem);
    background: var(--gradient-primary, linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

    .header-icon .icon {
      width: 2rem;
      height: 2rem;
      color: white;
    }

  .header-text {
    flex: 1;
  }

  .units-view__title {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 var(--spacing-sm, 0.5rem) 0;
    background: var(--gradient-primary, linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
    line-height: 1.2;
  }

  .units-view__subtitle {
    font-size: 1.125rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    font-weight: 400;
    line-height: 1.5;
  }

  /* Quick Actions */
  .quick-actions-section {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--spacing-2xl, 2rem);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-xl, 1.5rem);
  }

  .section-title-group {
    flex: 1;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 var(--spacing-sm, 0.5rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .section-description {
    font-size: 1rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg, 1.5rem);
  }

  .action-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg, 1.5rem);
    padding: var(--spacing-xl, 1.5rem);
    background: var(--color-surface-hover, #f8fafc);
    border: 2px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.75rem);
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s);
    text-align: left;
  }

    .action-card:hover {
      border-color: var(--color-primary, #0ea5e9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .action-icon {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-md, 0.5rem);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

    .action-icon.primary {
      background: var(--color-primary-light, #e0f2fe);
      color: var(--color-primary, #0ea5e9);
    }

    .action-icon.secondary {
      background: var(--color-info-light, #dbeafe);
      color: var(--color-info, #3b82f6);
    }

    .action-icon .icon {
      width: 1.5rem;
      height: 1.5rem;
    }

  .action-content {
    flex: 1;
  }

  .action-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 var(--spacing-xs, 0.25rem) 0;
    color: var(--color-text-primary, #1e293b);
  }

  .action-description {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    line-height: 1.4;
  }

  .action-arrow .icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-muted, #64748b);
  }

  /* Stats Overview */
  .stats-overview {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--spacing-2xl, 2rem);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg, 1.5rem);
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg, 1.5rem);
    padding: var(--spacing-xl, 1.5rem);
    background: var(--color-surface-hover, #f8fafc);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.75rem);
    transition: all var(--transition-normal, 0.3s);
  }

    .stat-card:hover {
      border-color: var(--color-primary, #0ea5e9);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .stat-icon {
    width: 4rem;
    height: 4rem;
    border-radius: var(--radius-lg, 0.75rem);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
  }

    .stat-icon.total-units {
      background: var(--color-primary, #0ea5e9);
    }

    .stat-icon.active-units {
      background: var(--color-success, #10b981);
    }

    .stat-icon.total-subnets {
      background: var(--color-info, #3b82f6);
    }

    .stat-icon.total-hosts {
      background: var(--color-warning, #f59e0b);
    }

    .stat-icon .icon {
      width: 2rem;
      height: 2rem;
    }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: var(--spacing-xs, 0.25rem);
    color: var(--color-text-primary, #1e293b);
    line-height: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
    font-weight: 500;
    margin-bottom: var(--spacing-xs, 0.25rem);
  }

  .stat-trend,
  .stat-percentage,
  .stat-change,
  .hosts-status {
    font-size: 0.75rem;
    color: var(--color-text-muted, #64748b);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 0.25rem);
  }

  .trend-icon {
    width: 0.875rem;
    height: 0.875rem;
    color: var(--color-success, #10b981);
  }

  .change-positive {
    color: var(--color-success, #10b981);
    font-weight: 600;
  }

  .change-negative {
    color: var(--color-error, #ef4444);
    font-weight: 600;
  }

  .hosts-status {
    gap: var(--spacing-sm, 0.5rem);
  }

  .online-count {
    color: var(--color-success, #10b981);
    font-weight: 500;
  }

  .offline-count {
    color: var(--color-error, #ef4444);
    font-weight: 500;
  }

  /* Units List Section */
  .units-list-section {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-xl, 1rem);
    padding: var(--spacing-2xl, 2rem);
    box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  }

  .section-actions {
    display: flex;
    gap: var(--spacing-sm, 0.5rem);
  }

  .refresh-btn {
    min-width: 120px;
  }

  /* Filters */
  .units-filters {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--spacing-lg, 1.5rem);
    margin-bottom: var(--spacing-xl, 1.5rem);
    padding: var(--spacing-lg, 1.5rem);
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-lg, 0.75rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  /* Units Grid */
  .units-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: var(--spacing-lg, 1.5rem);
  }

  .unit-card {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.75rem);
    overflow: hidden;
    transition: all var(--transition-normal, 0.3s);
  }

    .unit-card:hover {
      border-color: var(--color-primary, #0ea5e9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
    }

  .unit-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg, 1.5rem) var(--spacing-lg, 1.5rem) 0;
    margin-bottom: var(--spacing-md, 1rem);
  }

  .unit-badge {
    padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
    border-radius: var(--radius-full, 9999px);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

    .unit-badge.status--active {
      background: var(--color-success-light, #d1fae5);
      color: var(--color-success-dark, #065f46);
    }

    .unit-badge.status--deployed {
      background: var(--color-warning-light, #fef3c7);
      color: var(--color-warning-dark, #92400e);
    }

    .unit-badge.status--headquarters {
      background: var(--color-info-light, #dbeafe);
      color: var(--color-info-dark, #1e40af);
    }

  .unit-actions {
    display: flex;
    gap: var(--spacing-xs, 0.25rem);
  }

  .action-btn {
    width: 2rem;
    height: 2rem;
    padding: 0;
  }

  .unit-card__content {
    padding: 0 var(--spacing-lg, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 1.5rem);
  }

  .unit-main-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.5rem);
  }

  .unit-name {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary, #1e293b);
  }

  .unit-location {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 0.25rem);
    font-size: 0.875rem;
    color: var(--color-text-secondary, #475569);
  }

  .location-icon {
    width: 1rem;
    height: 1rem;
  }

  .unit-description {
    font-size: 0.875rem;
    color: var(--color-text-muted, #64748b);
    margin: 0;
    line-height: 1.4;
  }

  .unit-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md, 1rem);
    padding: var(--spacing-md, 1rem);
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-md, 0.5rem);
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 0.5rem);
  }

    .stat-item .stat-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--color-primary-light, #e0f2fe);
      color: var(--color-primary, #0ea5e9);
    }

      .stat-item .stat-icon .icon {
        width: 1.25rem;
        height: 1.25rem;
      }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-item .stat-value {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary, #1e293b);
  }

  .stat-item .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-muted, #64748b);
    margin: 0;
  }

  /* Preview Sections */
  .subnets-preview,
  .hosts-preview {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.5rem);
  }

  .preview-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary, #1e293b);
    margin: 0;
  }

  .preview-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.5rem);
  }

  .preview-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm, 0.5rem);
    background: var(--color-surface-hover, #f8fafc);
    border-radius: var(--radius-md, 0.5rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

    .preview-item.host-item {
      align-items: flex-start;
    }

  .preview-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 0.25rem);
    flex: 1;
  }

  .preview-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary, #1e293b);
  }

  .preview-address {
    font-size: 0.75rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    color: var(--color-text-muted, #64748b);
    background: var(--color-surface, #fff);
    padding: 0.125rem 0.25rem;
    border-radius: var(--radius-sm, 0.25rem);
    border: 1px solid var(--color-border, #e2e8f0);
  }

  .preview-meta {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 0.25rem);
    align-items: flex-end;
    font-size: 0.75rem;
    color: var(--color-text-muted, #64748b);
  }

  .devices-count {
    font-weight: 500;
  }

  .last-scan {
    color: var(--color-text-muted, #64748b);
  }

    .last-scan.never-scanned {
      color: var(--color-error, #ef4444);
    }

  .host-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 0.25rem);
  }

  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

    .status-indicator.status--online {
      background: var(--color-success, #10b981);
    }

    .status-indicator.status--offline {
      background: var(--color-error, #ef4444);
    }

    .status-indicator.status--unknown {
      background: var(--color-warning, #f59e0b);
    }

  .status-text {
    font-size: 0.75rem;
    color: var(--color-text-muted, #64748b);
  }

  .preview-more {
    font-size: 0.75rem;
    color: var(--color-primary, #0ea5e9);
    font-weight: 500;
    text-align: center;
    padding: var(--spacing-xs, 0.25rem);
    cursor: pointer;
  }

    .preview-more:hover {
      text-decoration: underline;
    }

  /* Unit Card Footer */
  .unit-card__footer {
    padding: var(--spacing-lg, 1.5rem);
    background: var(--color-surface-hover, #f8fafc);
    border-top: 1px solid var(--color-border, #e2e8f0);
    margin-top: var(--spacing-lg, 1.5rem);
  }

  .footer-actions {
    display: flex;
    gap: var(--spacing-sm, 0.5rem);
    justify-content: flex-end;
  }

  .footer-btn {
    font-size: 0.875rem;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xl, 1.5rem);
    padding: var(--spacing-3xl, 3rem);
    text-align: center;
  }

  .empty-icon {
    width: 6rem;
    height: 6rem;
    border-radius: var(--radius-full, 9999px);
    background: var(--color-surface-hover, #f8fafc);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted, #64748b);
  }

    .empty-icon .icon {
      width: 3rem;
      height: 3rem;
    }

  .empty-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 0.5rem);
    max-width: 400px;
  }

  .empty-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary, #1e293b);
  }

  .empty-description {
    font-size: 1rem;
    color: var(--color-text-secondary, #475569);
    margin: 0;
    line-height: 1.5;
  }

  .empty-actions {
    display: flex;
    gap: var(--spacing-md, 1rem);
    justify-content: center;
    margin-top: var(--spacing-md, 1rem);
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .units-grid {
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    }
  }

  @media (max-width: 768px) {
    .units-view {
      padding: var(--spacing-md, 1rem);
      gap: var(--spacing-lg, 1.5rem);
    }

    .units-view__header,
    .quick-actions-section,
    .stats-overview,
    .units-list-section {
      padding: var(--spacing-lg, 1.5rem);
    }

    .header-content {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md, 1rem);
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .units-filters {
      grid-template-columns: 1fr;
    }

    .units-grid {
      grid-template-columns: 1fr;
    }

    .section-header {
      flex-direction: column;
      gap: var(--spacing-md, 1rem);
    }

    .section-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .empty-actions {
      flex-direction: column;
      align-items: center;
    }
  }

  @media (max-width: 480px) {
    .unit-stats {
      grid-template-columns: 1fr;
    }

    .footer-actions {
      flex-direction: column;
    }

    .footer-btn {
      justify-content: center;
    }
  }

  /* Button Icons */
  .button-icon {
    width: 1rem;
    height: 1rem;
  }

  .input-icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-text-muted, #64748b);
  }
</style>
