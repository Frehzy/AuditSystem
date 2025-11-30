import { ref, computed } from 'vue';
import { useToast } from '@/framework/ui/composables/useToast';
import { auditApiService } from '../api/auditApi.service';
import type {
  MilitaryUnit,
  CreateUnitCommand,
  UpdateUnitCommand,
  NetworkScanCommand
} from '../api/audit.types';

export function useMilitaryUnits() {
  const { showToast } = useToast();

  const units = ref<MilitaryUnit[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const loadUnits = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await auditApiService.getMilitaryUnits();
      units.value = response.data;
    } catch (err) {
      error.value = 'Не удалось загрузить войсковые части';
      console.error('Failed to load military units:', err);
      showToast({
        type: 'error',
        title: 'Ошибка загрузки',
        message: 'Не удалось загрузить список войсковых частей'
      });
    } finally {
      isLoading.value = false;
    }
  };

  const createUnit = async (unitData: CreateUnitCommand): Promise<MilitaryUnit> => {
    try {
      const response = await auditApiService.createMilitaryUnit(unitData);
      units.value.push(response.data);
      showToast({
        type: 'success',
        title: 'Успешно',
        message: 'Войсковая часть успешно создана'
      });
      return response.data;
    } catch (err) {
      console.error('Failed to create military unit:', err);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось создать войсковую часть'
      });
      throw err;
    }
  };

  const updateUnit = async (unitId: string, unitData: UpdateUnitCommand): Promise<MilitaryUnit> => {
    try {
      const response = await auditApiService.updateMilitaryUnit(unitId, unitData);
      const index = units.value.findIndex(unit => unit.id === unitId);
      if (index !== -1) {
        units.value[index] = response.data;
      }
      showToast({
        type: 'success',
        title: 'Успешно',
        message: 'Войсковая часть успешно обновлена'
      });
      return response.data;
    } catch (err) {
      console.error('Failed to update military unit:', err);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось обновить войсковую часть'
      });
      throw err;
    }
  };

  const deleteUnit = async (unitId: string): Promise<void> => {
    try {
      await auditApiService.deleteMilitaryUnit(unitId);
      units.value = units.value.filter(unit => unit.id !== unitId);
      showToast({
        type: 'success',
        title: 'Успешно',
        message: 'Войсковая часть успешно удалена'
      });
    } catch (err) {
      console.error('Failed to delete military unit:', err);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось удалить войсковую часть'
      });
      throw err;
    }
  };

  const startNetworkScan = async (scanData: NetworkScanCommand): Promise<void> => {
    try {
      await auditApiService.startNetworkScan(scanData);
      showToast({
        type: 'success',
        title: 'Сканирование запущено',
        message: 'Сетевое сканирование успешно начато'
      });
    } catch (err) {
      console.error('Failed to start network scan:', err);
      showToast({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось запустить сетевое сканирование'
      });
      throw err;
    }
  };

  const getUnitById = computed(() => (unitId: string) => {
    return units.value.find(unit => unit.id === unitId);
  });

  const unitsCount = computed(() => units.value.length);

  const totalHosts = computed(() =>
    units.value.reduce((total, unit) => total + unit.hosts.length, 0)
  );

  const totalSubnets = computed(() =>
    units.value.reduce((total, unit) => total + unit.subnets.length, 0)
  );

  const onlineHosts = computed(() =>
    units.value.reduce((total, unit) =>
      total + unit.hosts.filter(host => host.status === 'online').length, 0
    )
  );

  return {
    // State
    units,
    isLoading,
    error,

    // Actions
    loadUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    startNetworkScan,

    // Getters
    getUnitById,
    unitsCount,
    totalHosts,
    totalSubnets,
    onlineHosts
  };
}
