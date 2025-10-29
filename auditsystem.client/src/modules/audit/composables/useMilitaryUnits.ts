// src/modules/audit/composables/useMilitaryUnits.ts
import { ref, computed } from 'vue';
import { auditApiService } from '../api/auditApi.service';
import type { MilitaryUnit, Subnet, Host, CreateUnitCommand, CreateSubnetCommand, CreateHostCommand } from '../api/audit.types';

export const useMilitaryUnits = () => {
  const units = ref<MilitaryUnit[]>([]);
  const selectedUnit = ref<MilitaryUnit | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const activeUnits = computed(() => {
    return units.value.filter(unit => unit.status === 'active');
  });

  const deployedUnits = computed(() => {
    return units.value.filter(unit => unit.status === 'deployed');
  });

  const loadUnits = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      units.value = await auditApiService.getMilitaryUnits();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load military units';
      console.error('Error loading military units:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const createUnit = async (command: CreateUnitCommand): Promise<MilitaryUnit> => {
    isLoading.value = true;
    error.value = null;

    try {
      const unit = await auditApiService.createMilitaryUnit(command);
      units.value.push(unit);
      return unit;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create military unit';
      console.error('Error creating military unit:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateUnit = async (id: string, command: Partial<CreateUnitCommand>): Promise<MilitaryUnit> => {
    isLoading.value = true;
    error.value = null;

    try {
      const unit = await auditApiService.updateMilitaryUnit(id, command);
      const index = units.value.findIndex(u => u.id === id);
      if (index !== -1) {
        units.value[index] = { ...units.value[index], ...unit };
      }
      return unit;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update military unit';
      console.error('Error updating military unit:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteUnit = async (id: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await auditApiService.deleteMilitaryUnit(id);
      units.value = units.value.filter(unit => unit.id !== id);
      if (selectedUnit.value?.id === id) {
        selectedUnit.value = null;
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to delete military unit';
      console.error('Error deleting military unit:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createSubnet = async (command: CreateSubnetCommand): Promise<Subnet> => {
    isLoading.value = true;
    error.value = null;

    try {
      const subnet = await auditApiService.createSubnet(command);

      // Update the unit's subnets list
      const unitIndex = units.value.findIndex(unit => unit.id === command.unitId);
      if (unitIndex !== -1) {
        units.value[unitIndex].subnets.push(subnet);
      }

      return subnet;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create subnet';
      console.error('Error creating subnet:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createHost = async (command: CreateHostCommand): Promise<Host> => {
    isLoading.value = true;
    error.value = null;

    try {
      const host = await auditApiService.createHost(command);

      // Update the unit's hosts list
      const unitIndex = units.value.findIndex(unit => unit.id === command.unitId);
      if (unitIndex !== -1) {
        units.value[unitIndex].hosts.push(host);
      }

      return host;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to create host';
      console.error('Error creating host:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const selectUnit = (unit: MilitaryUnit | null): void => {
    selectedUnit.value = unit;
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    units,
    selectedUnit,
    isLoading,
    error,
    activeUnits,
    deployedUnits,
    loadUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    createSubnet,
    createHost,
    selectUnit,
    clearError
  };
};
