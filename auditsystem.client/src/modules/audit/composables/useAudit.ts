// src/modules/audit/composables/useAudit.ts
import { ref, computed } from 'vue';
import { auditApiService } from '../api/auditApi.service';
import type {
  MilitaryUnit,
  Subnet,
  ScanResult,
  Vulnerability,
  AuditSettings,
  StartScanCommand,
  CreateUnitCommand,
  CreateSubnetCommand
} from '../api/audit.types';

export const useAudit = () => {
  // State
  const units = ref<MilitaryUnit[]>([]);
  const currentScan = ref<ScanResult | null>(null);
  const scanHistory = ref<ScanResult[]>([]);
  const vulnerabilities = ref<Vulnerability[]>([]);
  const settings = ref<AuditSettings>({
    scanInterval: 3600000,
    autoReporting: true,
    notificationEnabled: true,
    reportFormat: 'pdf',
    maxScanDuration: 1800000,
    deepScan: false,
    notificationEmail: '',
    realtimeNotifications: true,
    reportDetailLevel: 'detailed',
    autoArchive: true
  });

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const totalDevices = computed(() => {
    return units.value.reduce((total, unit) => {
      return total + unit.subnets.reduce((subTotal, subnet) => subTotal + subnet.devicesCount, 0);
    }, 0);
  });

  const activeScans = computed(() => {
    return scanHistory.value.filter(scan => scan.status === 'in_progress');
  });

  const criticalVulnerabilities = computed(() => {
    return vulnerabilities.value.filter(vuln => vuln.severity === 'critical');
  });

  // Actions
  const loadMilitaryUnits = async (): Promise<void> => {
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

  const startScan = async (command: StartScanCommand): Promise<ScanResult> => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await auditApiService.startScan(command);

      // Создаем временный объект ScanResult на основе ответа
      const scan: ScanResult = {
        id: result.scanId,
        subnetId: command.subnetId,
        timestamp: new Date().toISOString(),
        status: 'in_progress',
        devicesScanned: 0,
        devicesFound: 0,
        vulnerabilitiesFound: 0,
        scanDuration: 0
      };

      currentScan.value = scan;
      return scan;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to start scan';
      console.error('Error starting scan:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const loadScanHistory = async (limit?: number): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      scanHistory.value = await auditApiService.getScanHistory(limit);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load scan history';
      console.error('Error loading scan history:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const createMilitaryUnit = async (command: CreateUnitCommand): Promise<MilitaryUnit> => {
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

  const createSubnet = async (command: CreateSubnetCommand): Promise<Subnet> => {
    isLoading.value = true;
    error.value = null;

    try {
      const subnet = await auditApiService.createSubnet(command);

      // Find and update the unit
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

  const loadSettings = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      settings.value = await auditApiService.getSettings();
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load settings';
      console.error('Error loading settings:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateSettings = async (newSettings: AuditSettings): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await auditApiService.updateSettings(newSettings);
      settings.value = newSettings;
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to update settings';
      console.error('Error updating settings:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const getScanProgress = async (scanId: string): Promise<ScanResult> => {
    try {
      // Используем существующий метод getScanStatus вместо отсутствующего getScanProgress
      return await auditApiService.getScanStatus(scanId);
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to get scan progress';
      console.error('Error getting scan progress:', err);
      throw err;
    }
  };

  const cancelScan = async (scanId: string): Promise<void> => {
    try {
      // Временная заглушка для отсутствующего метода cancelScan
      console.warn('cancelScan method not implemented in AuditApiService');

      // Обновляем статус сканирования локально
      if (currentScan.value?.id === scanId) {
        currentScan.value.status = 'failed';
      }

      // Ищем в истории и обновляем
      const scanInHistory = scanHistory.value.find(scan => scan.id === scanId);
      if (scanInHistory) {
        scanInHistory.status = 'failed';
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to cancel scan';
      console.error('Error cancelling scan:', err);
      throw err;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    // State
    units: computed(() => units.value),
    currentScan: computed(() => currentScan.value),
    scanHistory: computed(() => scanHistory.value),
    vulnerabilities: computed(() => vulnerabilities.value),
    settings: computed(() => settings.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Computed
    totalDevices,
    activeScans,
    criticalVulnerabilities,

    // Actions
    loadMilitaryUnits,
    startScan,
    loadScanHistory,
    createMilitaryUnit,
    createSubnet,
    loadSettings,
    updateSettings,
    getScanProgress,
    cancelScan,
    clearError
  };
};

export default useAudit;
