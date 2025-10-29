<template>
  <div class="units-view">
    <div class="units-view__header">
      <h1 class="units-view__title">Войсковые части</h1>
      <p class="units-view__subtitle">Управление военными подразделениями и их сетевыми ресурсами</p>
    </div>

    <div class="units-view__content">
      <!-- Действия -->
      <div class="units-actions">
        <div class="actions-header">
          <h2 class="section-title">Управление войсковыми частями</h2>
          <div class="actions-buttons">
            <BaseButton @click="showCreateUnitDialog = true"
                        variant="primary">
              <PlusIcon class="button-icon" />
              Добавить часть
            </BaseButton>
            <BaseButton @click="showNetworkScanDialog = true"
                        variant="secondary">
              <ScanIcon class="button-icon" />
              Сканировать сеть
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Список войсковых частей -->
      <div class="units-section">
        <div class="section-header">
          <h2 class="section-title">Список войсковых частей</h2>
          <BaseButton @click="refreshUnits"
                      variant="text"
                      size="sm"
                      :loading="isLoading">
            <RefreshIcon class="button-icon" />
            Обновить
          </BaseButton>
        </div>

        <div class="units-list">
          <div v-for="unit in units"
               :key="unit.id"
               class="unit-card">
            <div class="unit-card__header">
              <div class="unit-card__title-section">
                <h3 class="unit-card__title">{{ unit.name }}</h3>
                <div class="unit-card__meta">
                  <span class="unit-location">{{ unit.location }}</span>
                  <span class="unit-status" :class="`status--${unit.status}`">
                    {{ getStatusText(unit.status) }}
                  </span>
                </div>
              </div>
              <div class="unit-card__stats">
                <div class="stat">
                  <ServerIcon class="stat-icon" />
                  <span class="stat-value">{{ unit.subnets.length }}</span>
                  <span class="stat-label">подсетей</span>
                </div>
                <div class="stat">
                  <HostIcon class="stat-icon" />
                  <span class="stat-value">{{ unit.hosts.length }}</span>
                  <span class="stat-label">хостов</span>
                </div>
              </div>
            </div>

            <div class="unit-card__content">
              <div v-if="unit.description" class="unit-card__description">
                {{ unit.description }}
              </div>

              <!-- Подсети -->
              <div v-if="unit.subnets.length > 0" class="subnets-section">
                <h4 class="subsection-title">Подсети</h4>
                <div class="subnets-list">
                  <div v-for="subnet in unit.subnets"
                       :key="subnet.id"
                       class="subnet-item">
                    <div class="subnet-info">
                      <span class="subnet-name">{{ subnet.name }}</span>
                      <code class="subnet-address">{{ subnet.network }}/{{ subnet.mask }}</code>
                    </div>
                    <div class="subnet-stats">
                      <span class="devices-count">{{ subnet.devicesCount }} устройств</span>
                      <span class="last-scan" :class="{ 'never-scanned': !subnet.lastScan }">
                        {{ subnet.lastScan ? formatRelativeTime(subnet.lastScan) : 'Никогда' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Хосты -->
              <div v-if="unit.hosts.length > 0" class="hosts-section">
                <h4 class="subsection-title">Хосты</h4>
                <div class="hosts-list">
                  <div v-for="host in unit.hosts"
                       :key="host.id"
                       class="host-item"
                       :class="`host-status--${host.status}`">
                    <div class="host-info">
                      <span class="host-name">{{ host.name }}</span>
                      <code class="host-address">{{ host.ipAddress }}</code>
                      <span class="host-os">{{ getOsText(host.osType) }}</span>
                    </div>
                    <div class="host-status">
                      <div class="status-indicator" :class="`status--${host.status}`"></div>
                      <span class="status-text">{{ getHostStatusText(host.status) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="unit-card__footer">
              <div class="unit-card__date">
                Создано: {{ formatUnitDate(unit.createdAt) }}
              </div>
              <div class="unit-card__actions">
                <BaseButton @click="editUnit(unit)"
                            variant="text"
                            size="sm">
                  <EditIcon class="button-icon" />
                  Редактировать
                </BaseButton>
                <BaseButton @click="addSubnet(unit)"
                            variant="text"
                            size="sm">
                  <PlusIcon class="button-icon" />
                  Добавить подсеть
                </BaseButton>
                <BaseButton @click="addHost(unit)"
                            variant="text"
                            size="sm">
                  <PlusIcon class="button-icon" />
                  Добавить хост
                </BaseButton>
                <BaseButton @click="deleteUnit(unit)"
                            variant="text"
                            size="sm"
                            color="error">
                  <DeleteIcon class="button-icon" />
                  Удалить
                </BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="units.length === 0" class="empty-state">
          <ServerIcon class="empty-state__icon" />
          <p class="empty-state__text">Войсковые части не найдены</p>
          <p class="empty-state__description">Добавьте первую войсковую часть для начала работы</p>
          <BaseButton @click="showCreateUnitDialog = true"
                      variant="primary">
            <PlusIcon class="button-icon" />
            Добавить войсковую часть
          </BaseButton>
        </div>
      </div>

      <!-- Статистика -->
      <div class="units-stats">
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-card__icon total-units">
              <ServerIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ totalUnits }}</div>
              <div class="stat-card__label">Всего частей</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon active-units">
              <ActivityIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ activeUnits }}</div>
              <div class="stat-card__label">Активных</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon total-subnets">
              <NetworkIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ totalSubnets }}</div>
              <div class="stat-card__label">Подсетей</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-card__icon total-hosts">
              <HostIcon />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__value">{{ totalHosts }}</div>
              <div class="stat-card__label">Хостов</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог создания/редактирования войсковой части -->
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

    <!-- Диалог добавления подсети -->
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

    <!-- Диалог добавления хоста -->
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

    <!-- Диалог сканирования сети -->
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
    ActivityIcon
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

  const showCreateUnitDialog = ref(false);
  const showSubnetDialog = ref(false);
  const showHostDialog = ref(false);
  const showNetworkScanDialog = ref(false);
  const editingUnit = ref<MilitaryUnit | null>(null);
  const selectedUnit = ref<MilitaryUnit | null>(null);

  const totalUnits = computed(() => props.units?.length || 0);
  const activeUnits = computed(() => props.units?.filter(unit => unit.status === 'active').length || 0);
  const totalSubnets = computed(() => props.units?.reduce((total, unit) => total + unit.subnets.length, 0) || 0);
  const totalHosts = computed(() => props.units?.reduce((total, unit) => total + unit.hosts.length, 0) || 0);

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
      // Implement network scanning logic here
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
    gap: 2rem;
  }

  .units-view__header {
    text-align: center;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .units-view__title {
    font-size: 2.25rem;
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.025em;
  }

  .units-view__subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin: 0;
    font-weight: 400;
  }

  /* Units Actions */
  .units-actions {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .actions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-text-primary);
  }

  .actions-buttons {
    display: flex;
    gap: 1rem;
  }

  /* Units List */
  .units-section {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .units-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .unit-card {
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 1.5rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

    .unit-card:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

  .unit-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .unit-card__title-section {
    flex: 1;
  }

  .unit-card__title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
  }

  .unit-card__meta {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
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

  .unit-card__stats {
    display: flex;
    gap: 1.5rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
  }

  .stat-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-primary);
  }

  .stat-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text-primary);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .unit-card__content {
    margin-bottom: 1.5rem;
  }

  .unit-card__description {
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border-left: 4px solid var(--color-primary);
  }

  /* Subsections */
  .subsection-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: var(--color-text-primary);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
  }

  .subnets-list,
  .hosts-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .subnet-item,
  .host-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 0.75rem;
    border: 1px solid var(--color-border);
    transition: all 0.2s ease;
  }

    .subnet-item:hover,
    .host-item:hover {
      border-color: var(--color-primary);
    }

  .subnet-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .subnet-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .subnet-address {
    background: var(--color-surface-hover);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
  }

  .subnet-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .devices-count {
    font-weight: 500;
  }

  .last-scan {
    color: var(--color-success);
  }

  .never-scanned {
    color: var(--color-text-muted);
    font-style: italic;
  }

  .host-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .host-name {
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .host-address {
    background: var(--color-surface-hover);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.875rem;
    color: var(--color-text-primary);
  }

  .host-os {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .host-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

  .status--online {
    background: var(--color-success);
  }

  .status--offline {
    background: var(--color-error);
  }

  .status--unknown {
    background: var(--color-warning);
  }

  .status-text {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .host-status--online .status-text {
    color: var(--color-success);
  }

  .host-status--offline .status-text {
    color: var(--color-error);
  }

  .host-status--unknown .status-text {
    color: var(--color-warning);
  }

  .unit-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
  }

  .unit-card__date {
    font-size: 0.875rem;
    color: var(--color-text-muted);
  }

  .unit-card__actions {
    display: flex;
    gap: 0.5rem;
  }

  /* Stats Section */
  .units-stats {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
    padding: 2rem;
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-surface-hover);
    border-radius: 1rem;
    border: 1px solid var(--color-border);
  }

  .stat-card__icon {
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .total-units {
    background: var(--color-primary);
  }

  .active-units {
    background: var(--color-success);
  }

  .total-subnets {
    background: var(--color-info);
  }

  .total-hosts {
    background: var(--color-warning);
  }

  .stat-card__content {
    flex: 1;
  }

  .stat-card__value {
    font-size: 1.75rem;
    font-weight: 800;
    margin-bottom: 0.25rem;
    color: var(--color-text-primary);
  }

  .stat-card__label {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 1.25rem;
  }

  .empty-state__icon {
    width: 4rem;
    height: 4rem;
    margin-bottom: 1.5rem;
    color: var(--color-text-muted);
    opacity: 0.5;
  }

  .empty-state__text {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--color-text-primary);
  }

  .empty-state__description {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
  }

  /* Icons */
  .button-icon {
    width: 1.125rem;
    height: 1.125rem;
    margin-right: 0.5rem;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .units-view__title {
      font-size: 2rem;
    }
  }

  @media (max-width: 1024px) {
    .units-view__title {
      font-size: 1.75rem;
    }

    .units-view__subtitle {
      font-size: 1.125rem;
    }

    .units-actions,
    .units-section,
    .units-stats {
      padding: 1.5rem;
    }

    .actions-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .actions-buttons {
      width: 100%;
      justify-content: space-between;
    }

    .unit-card__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .unit-card__stats {
      width: 100%;
      justify-content: space-around;
    }

    .subnet-item,
    .host-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .subnet-info,
    .host-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .unit-card__footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .unit-card__actions {
      width: 100%;
      justify-content: space-between;
    }
  }

  @media (max-width: 900px) {
    .units-view {
      gap: 1.5rem;
    }

    .stats-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 800px) {
    .units-view__title {
      font-size: 1.5rem;
    }

    .units-view__subtitle {
      font-size: 1rem;
    }

    .units-actions,
    .units-section,
    .units-stats {
      padding: 1.25rem;
      border-radius: 1rem;
    }

    .section-title {
      font-size: 1.25rem;
    }

    .unit-card {
      padding: 1.25rem;
    }

    .unit-card__title {
      font-size: 1.25rem;
    }

    .unit-card__meta {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  @media (max-width: 640px) {
    .stats-cards {
      grid-template-columns: 1fr;
    }

    .actions-buttons {
      flex-direction: column;
    }

    .unit-card__actions {
      flex-direction: column;
    }

      .unit-card__actions .base-button {
        justify-content: center;
      }
  }
</style>
