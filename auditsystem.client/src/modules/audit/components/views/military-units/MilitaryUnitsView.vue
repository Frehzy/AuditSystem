<template>
  <div class="military-units-view">
    <MilitaryUnitsHeader />

    <MilitaryUnitsNavigation :active-tab="activeTab"
                             :tabs="navigationTabs"
                             @tab-change="handleTabChange" />

    <div class="units-view__content">
      <OverviewTab v-if="activeTab === 'overview'"
                   :units="filteredUnits"
                   :is-loading="isLoading"
                   @create-unit="showCreateUnitDialog = true"
                   @scan-network="showNetworkScanDialog = true"
                   @refresh="loadUnits"
                   @edit-unit="editUnit"
                   @delete-unit="handleDeleteUnit"
                   @view-details="viewUnitDetails" />

      <UnitsListTab v-if="activeTab === 'units'"
                    :units="filteredUnits"
                    :is-loading="isLoading"
                    @refresh="loadUnits"
                    @create-unit="showCreateUnitDialog = true"
                    @edit-unit="editUnit"
                    @delete-unit="handleDeleteUnit"
                    @view-details="viewUnitDetails" />

      <NetworkScanTab v-if="activeTab === 'scan'"
                      :units="filteredUnits"
                      @scan-network="showNetworkScanDialog = true" />

      <HostsTab v-if="activeTab === 'hosts'"
                :units="filteredUnits"
                :is-loading="isLoading"
                @refresh="loadUnits" />
    </div>

    <!-- Диалоги -->
    <BaseModal v-if="showCreateUnitDialog"
               :model-value="showCreateUnitDialog"
               :title="editingUnit ? 'Редактирование войсковой части' : 'Создание войсковой части'"
               size="large"
               @update:model-value="closeUnitDialog"
               @close="closeUnitDialog">
      <MilitaryUnitForm :unit="editingUnit"
                        @save="handleSaveUnit"
                        @cancel="closeUnitDialog" />
    </BaseModal>

    <BaseModal v-if="showNetworkScanDialog"
               :model-value="showNetworkScanDialog"
               title="Сканирование сети"
               size="large"
               @update:model-value="showNetworkScanDialog = false"
               @close="showNetworkScanDialog = false">
      <NetworkScanForm :units="filteredUnits"
                       @scan="handleNetworkScan"
                       @cancel="showNetworkScanDialog = false" />
    </BaseModal>

    <!-- Детали войсковой части -->
    <BaseModal v-if="selectedUnit"
               :model-value="!!selectedUnit"
               :title="selectedUnit?.name"
               size="large"
               @update:model-value="selectedUnit = null"
               @close="selectedUnit = null">
      <UnitDetails :unit="selectedUnit"
                   @edit="editUnit(selectedUnit!)"
                   @delete="handleDeleteUnit(selectedUnit!)" />
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useToast } from '@/framework/ui/composables/useToast';
  import BaseModal from '@/framework/ui/components/overlay/BaseModal.vue';

  // Components
  import MilitaryUnitsHeader from './components/MilitaryUnitsHeader.vue';
  import MilitaryUnitsNavigation from './components/MilitaryUnitsNavigation.vue';
  import UnitDetails from './components/UnitDetails.vue';

  // Tabs
  import OverviewTab from './tabs/OverviewTab.vue';
  import UnitsListTab from './tabs/UnitsListTab.vue';
  import NetworkScanTab from './tabs/NetworkScanTab.vue';
  import HostsTab from './tabs/HostsTab.vue';

  // Forms
  import MilitaryUnitForm from './components/forms/MilitaryUnitForm.vue';
  import NetworkScanForm from './components/forms/NetworkScanForm.vue';

  // Composables
  import { useMilitaryUnits } from '../../../composables/useMilitaryUnits';
  import type { MilitaryUnit, CreateUnitCommand } from '@/modules/audit/api/audit.types';

  // Icons
  import { ServerIcon, ListIcon, ScanIcon, HostIcon } from '@/assets/icons';

  interface Props {
    initialTab?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    initialTab: 'overview'
  });

  const { showToast } = useToast();
  const {
    units,
    isLoading,
    loadUnits,
    createUnit,
    updateUnit,
    deleteUnit: deleteUnitApi // Переименовываем при деструктуризации
  } = useMilitaryUnits();

  // State
  const activeTab = ref(props.initialTab);
  const showCreateUnitDialog = ref(false);
  const showNetworkScanDialog = ref(false);
  const editingUnit = ref<MilitaryUnit | null>(null);
  const selectedUnit = ref<MilitaryUnit | null>(null);

  // Tabs configuration
  const navigationTabs = computed(() => [
    {
      id: 'overview',
      title: 'Обзор',
      icon: ServerIcon,
      badge: units.value.length
    },
    {
      id: 'units',
      title: 'Войсковые части',
      icon: ListIcon,
      badge: units.value.length
    },
    {
      id: 'scan',
      title: 'Сканирование',
      icon: ScanIcon
    },
    {
      id: 'hosts',
      title: 'Хосты',
      icon: HostIcon,
      badge: units.value.reduce((total, unit) => total + unit.hosts.length, 0)
    }
  ]);

  const filteredUnits = computed(() => units.value);

  // Methods
  const handleTabChange = (tabId: string) => {
    activeTab.value = tabId;
  };

  const editUnit = (unit: MilitaryUnit): void => {
    editingUnit.value = { ...unit };
    showCreateUnitDialog.value = true;
  };

  const viewUnitDetails = (unit: MilitaryUnit): void => {
    selectedUnit.value = unit;
  };

  // Переименованная функция
  const handleDeleteUnit = async (unit: MilitaryUnit): Promise<void> => {
    if (confirm(`Удалить войсковую часть "${unit.name}"?`)) {
      try {
        await deleteUnitApi(unit.id); // Используем переименованную функцию из composable
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
        await updateUnit(editingUnit.value.id, unitData);
        showToast({
          type: 'success',
          title: 'Войсковая часть обновлена',
          message: 'Данные войсковой части успешно обновлены'
        });
      } else {
        await createUnit(unitData);
        showToast({
          type: 'success',
          title: 'Войсковая часть создана',
          message: 'Новая войсковая часть успешно создана'
        });
      }
      closeUnitDialog();
    } catch (error) {
      console.error('Failed to save military unit:', error);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сохранить войсковую часть'
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

      // Reload units after scan
      setTimeout(() => {
        loadUnits();
      }, 2000);
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

  onMounted(() => {
    loadUnits();
  });
</script>

<style scoped>
  .military-units-view {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-2xl);
    padding: var(--spacing-xl);
    max-width: 1400px;
    margin: 0 auto;
  }

  .units-view__content {
    flex: 1;
    min-height: 60vh;
  }

  @media (max-width: 768px) {
    .military-units-view {
      padding: var(--spacing-md);
      gap: var(--spacing-xl);
    }
  }
</style>
