// src/modules/audit/composables/useAudit.ts
import { ref, computed } from 'vue';
import { auditApiService } from '../api/auditApi.service';
import { logger } from '@/core/utils/logger/logger';
import type {
  AuditState,
  MilitaryUnit,
  Subnet,
  AuditSettings,
  CreateUnitCommand,
  CreateSubnetCommand,
  StartScanCommand
} from '../api/audit.types';

const DEFAULT_SETTINGS: AuditSettings = {
  scanInterval: 3600000,
  autoReporting: true,
  notificationEnabled: true,
  reportFormat: 'pdf',
  maxScanDuration: 1800000
};

export const useAudit = () => {
  const loggerContext = logger.create('useAudit');

  // State
  const state = ref<AuditState>({
    units: [],
    currentScan: null,
    settings: { ...DEFAULT_SETTINGS },
    scanHistory: [],
    isLoading: false,
    error: null
  });

  // Computed
  const units = computed(() => state.value.units);
  const currentScan = computed(() => state.value.currentScan);
  const settings = computed(() => state.value.settings);
  const scanHistory = computed(() => state.value.scanHistory);
  const isLoading = computed(() => state.value.isLoading);
  const error = computed(() => state.value.error);

  const totalDevices = computed(() => {
    return state.value.units.reduce((total, unit) => {
      return total + unit.subnets.reduce((subTotal, subnet) => subTotal + subnet.devicesCount, 0);
    }, 0);
  });

  // Military Units Management
  const loadMilitaryUnits = async (): Promise<void> => {
    state.value.isLoading = true;
    state.value.error = null;

    try {
      const units = await auditApiService.getMilitaryUnits();
      state.value.units = units;
      loggerContext.info('Military units loaded', { count: units.length });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      state.value.error = errorMessage;
      loggerContext.error('Failed to load military units', { error: errorMessage });
      throw err;
    } finally {
      state.value.isLoading = false;
    }
  };

  const createMilitaryUnit = async (command: CreateUnitCommand): Promise<MilitaryUnit> => {
    state.value.isLoading = true;
    state.value.error = null;

    try {
      const newUnit = await auditApiService.createMilitaryUnit(command);
      state.value.units.push(newUnit);
      loggerContext.info('Military unit created', { unitId: newUnit.id });
      return newUnit;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      state.value.error = errorMessage;
      loggerContext.error('Failed to create military unit', { error: errorMessage });
      throw err;
    } finally {
      state.value.isLoading = false;
    }
  };

  // Subnets Management
  const createSubnet = async (command: CreateSubnetCommand): Promise<Subnet> => {
    state.value.isLoading = true;
    state.value.error = null;

    try {
      const newSubnet = await auditApiService.createSubnet(command);

      const unitIndex = state.value.units.findIndex(unit => unit.id === command.unitId);
      if (unitIndex !== -1) {
        state.value.units[unitIndex].subnets.push(newSubnet);
      }

      loggerContext.info('Subnet created', { subnetId: newSubnet.id });
      return newSubnet;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      state.value.error = errorMessage;
      loggerContext.error('Failed to create subnet', { error: errorMessage });
      throw err;
    } finally {
      state.value.isLoading = false;
    }
  };

  // Scanning
  const startScan = async (command: StartScanCommand): Promise<void> => {
    state.value.isLoading = true;
    state.value.error = null;

    try {
      const { scanId } = await auditApiService.startScan(command);

      state.value.currentScan = {
        scanId,
        status: 'in_progress',
        progress: 0,
        currentAction: 'Инициализация сканирования...',
        devicesProcessed: 0,
        totalDevices: 0,
        estimatedTimeRemaining: null
      };

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      state.value.error = errorMessage;
      loggerContext.error('Failed to start scan', { error: errorMessage });
      throw err;
    } finally {
      state.value.isLoading = false;
    }
  };

  const loadScanHistory = async (limit?: number): Promise<void> => {
    try {
      const history = await auditApiService.getScanHistory(limit);
      state.value.scanHistory = history;
      loggerContext.info('Scan history loaded', { count: history.length });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      loggerContext.error('Failed to load scan history', { error: errorMessage });
      throw err;
    }
  };

  // Settings
  const loadSettings = async (): Promise<void> => {
    try {
      const settings = await auditApiService.getSettings();
      state.value.settings = settings;
      loggerContext.info('Settings loaded');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      loggerContext.error('Failed to load settings', { error: errorMessage });
      throw err;
    }
  };

  const updateSettings = async (newSettings: Partial<AuditSettings>): Promise<void> => {
    state.value.isLoading = true;
    state.value.error = null;

    try {
      const updatedSettings = await auditApiService.updateSettings(newSettings);
      state.value.settings = updatedSettings;
      loggerContext.info('Settings updated');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      state.value.error = errorMessage;
      loggerContext.error('Failed to update settings', { error: errorMessage });
      throw err;
    } finally {
      state.value.isLoading = false;
    }
  };

  const clearError = (): void => {
    state.value.error = null;
  };

  return {
    // State
    state,
    units,
    currentScan,
    settings,
    scanHistory,
    isLoading,
    error,

    // Computed
    totalDevices,

    // Actions
    loadMilitaryUnits,
    createMilitaryUnit,
    createSubnet,
    startScan,
    loadScanHistory,
    loadSettings,
    updateSettings,
    clearError
  };
};

export type UseAuditReturn = ReturnType<typeof useAudit>;
