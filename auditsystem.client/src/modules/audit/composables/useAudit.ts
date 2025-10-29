// src/modules/audit/composables/useAudit.ts
import { ref, computed } from 'vue';
import { useAppStore } from '@/framework/stores/app.store';
import { auditApiService } from '../api/auditApi.service';
import type {
  MilitaryUnit,
  Host,
  Script,
  ScanTask,
  ScanResult,
  Report,
  AuditSettings,
  StartScanCommand,
  CreateUnitCommand,
  CreateHostCommand,
  CreateScriptCommand,
  ScanNetworkCommand,
  TestEmailConnectionCommand,
  TestProxyConnectionCommand,
  NetworkScanResult,
  ConnectionTestResult
} from '../api/audit.types';

export const useAudit = () => {
  const appStore = useAppStore();

  // State
  const units = ref<MilitaryUnit[]>([]);
  const hosts = ref<Host[]>([]);
  const scripts = ref<Script[]>([]);
  const tasks = ref<ScanTask[]>([]);
  const currentScan = ref<ScanTask | null>(null);
  const scanHistory = ref<ScanResult[]>([]);
  const reports = ref<Report[]>([]);
  const settings = ref<AuditSettings>(getDefaultSettings());

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const totalDevices = computed(() => {
    return units.value.reduce((total, unit) => {
      return total + unit.hosts.length;
    }, 0);
  });

  const activeScans = computed(() => {
    return tasks.value.filter(task => task.status === 'running');
  });

  const checkScripts = computed(() => {
    return scripts.value.filter(script => script.type === 'check');
  });

  const fixScripts = computed(() => {
    return scripts.value.filter(script => script.type === 'fix');
  });

  // Military Units Management
  const loadMilitaryUnits = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      units.value = await auditApiService.getMilitaryUnits();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load military units';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'loadMilitaryUnits');
      console.error('Error loading military units:', err);
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const createMilitaryUnit = async (command: CreateUnitCommand): Promise<MilitaryUnit> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      const unit = await auditApiService.createMilitaryUnit(command);
      units.value.push(unit);
      return unit;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create military unit';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'createMilitaryUnit');
      console.error('Error creating military unit:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const updateMilitaryUnit = async (id: string, command: Partial<CreateUnitCommand>): Promise<MilitaryUnit> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      const unit = await auditApiService.updateMilitaryUnit(id, command);
      const index = units.value.findIndex(u => u.id === id);
      if (index !== -1) {
        units.value[index] = { ...units.value[index], ...unit };
      }
      return unit;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update military unit';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'updateMilitaryUnit');
      console.error('Error updating military unit:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const deleteMilitaryUnit = async (id: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      await auditApiService.deleteMilitaryUnit(id);
      units.value = units.value.filter(unit => unit.id !== id);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete military unit';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'deleteMilitaryUnit');
      console.error('Error deleting military unit:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  // Hosts Management
  const loadHosts = async (unitId?: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      hosts.value = await auditApiService.getHosts(unitId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load hosts';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'loadHosts');
      console.error('Error loading hosts:', err);
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const createHost = async (command: CreateHostCommand): Promise<Host> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      const host = await auditApiService.createHost(command);
      hosts.value.push(host);

      // Update the unit's hosts list
      const unitIndex = units.value.findIndex(unit => unit.id === command.unitId);
      if (unitIndex !== -1) {
        units.value[unitIndex].hosts.push(host);
      }

      return host;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create host';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'createHost');
      console.error('Error creating host:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  // Scripts Management
  const loadScripts = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      scripts.value = await auditApiService.getScripts();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scripts';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'loadScripts');
      console.error('Error loading scripts:', err);
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const createScript = async (command: CreateScriptCommand): Promise<Script> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      const script = await auditApiService.createScript(command);
      scripts.value.push(script);
      return script;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create script';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'createScript');
      console.error('Error creating script:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  // Network Scanning
  const scanNetwork = async (command: ScanNetworkCommand): Promise<NetworkScanResult> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      return await auditApiService.scanNetwork(command);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan network';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'scanNetwork');
      console.error('Error scanning network:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  // Scanning
  const startScan = async (command: StartScanCommand): Promise<{ scanId: string; taskId: string }> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      const result = await auditApiService.startScan(command);

      // Create temporary task object
      const task: ScanTask = {
        id: result.taskId,
        name: command.name,
        description: command.description,
        unitIds: command.unitIds,
        hostIds: command.hostIds,
        scriptIds: command.scriptIds,
        autoFix: command.autoFix,
        status: 'running',
        progress: 0,
        createdAt: new Date().toISOString(),
        startedAt: new Date().toISOString()
      };

      tasks.value.push(task);
      currentScan.value = task;

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start scan';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'startScan');
      console.error('Error starting scan:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const getScanProgress = async (taskId: string): Promise<ScanTask> => {
    try {
      const task = await auditApiService.getScanProgress(taskId);

      // Update task in local state
      const index = tasks.value.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.value[index] = task;
      }

      if (currentScan.value?.id === taskId) {
        currentScan.value = task;
      }

      return task;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get scan progress';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'getScanProgress');
      console.error('Error getting scan progress:', err);
      throw err;
    }
  };

  const cancelScan = async (taskId: string): Promise<void> => {
    try {
      await auditApiService.cancelScan(taskId);

      // Update local state
      const task = tasks.value.find(t => t.id === taskId);
      if (task) {
        task.status = 'cancelled';
      }

      if (currentScan.value?.id === taskId) {
        currentScan.value = null;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel scan';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'cancelScan');
      console.error('Error cancelling scan:', err);
      throw err;
    }
  };

  // Reports
  const loadReports = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      reports.value = await auditApiService.getReports();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'loadReports');
      console.error('Error loading reports:', err);
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const generateReport = async (taskId: string, format: string): Promise<Report> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      const report = await auditApiService.generateReport(taskId, format);
      reports.value.push(report);
      return report;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'generateReport');
      console.error('Error generating report:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const downloadReport = async (reportId: string): Promise<void> => {
    try {
      const blob = await auditApiService.downloadReport(reportId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download report';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'downloadReport');
      console.error('Error downloading report:', err);
      throw err;
    }
  };

  // Settings
  const loadSettings = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      settings.value = await auditApiService.getSettings();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'loadSettings');
      console.error('Error loading settings:', err);
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AuditSettings>): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      settings.value = await auditApiService.updateSettings(newSettings);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'updateSettings');
      console.error('Error updating settings:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const testEmailConnection = async (command: TestEmailConnectionCommand): Promise<ConnectionTestResult> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      return await auditApiService.testEmailConnection(command);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test email connection';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'testEmailConnection');
      console.error('Error testing email connection:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  const testProxyConnection = async (command: TestProxyConnectionCommand): Promise<ConnectionTestResult> => {
    isLoading.value = true;
    error.value = null;
    appStore.setLoading(true);

    try {
      return await auditApiService.testProxyConnection(command);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test proxy connection';
      error.value = errorMessage;
      appStore.addError(errorMessage, 'error', 'testProxyConnection');
      console.error('Error testing proxy connection:', err);
      throw err;
    } finally {
      isLoading.value = false;
      appStore.setLoading(false);
    }
  };

  // Utility functions
  const clearError = (): void => {
    error.value = null;
  };

  // Initialize
  const initialize = async (): Promise<void> => {
    await Promise.all([
      loadMilitaryUnits(),
      loadScripts(),
      loadSettings(),
      loadReports()
    ]);
  };

  return {
    // State
    units,
    hosts,
    scripts,
    tasks,
    currentScan,
    scanHistory,
    reports,
    settings,
    isLoading,
    error,

    // Computed
    totalDevices,
    activeScans,
    checkScripts,
    fixScripts,

    // Actions
    initialize,
    loadMilitaryUnits,
    createMilitaryUnit,
    updateMilitaryUnit,
    deleteMilitaryUnit,
    loadHosts,
    createHost,
    loadScripts,
    createScript,
    scanNetwork,
    startScan,
    getScanProgress,
    cancelScan,
    loadReports,
    generateReport,
    downloadReport,
    loadSettings,
    updateSettings,
    testEmailConnection,
    testProxyConnection,
    clearError
  };
};

function getDefaultSettings(): AuditSettings {
  return {
    scanInterval: 3600000,
    autoReporting: true,
    notificationEnabled: true,
    reportFormat: 'pdf',
    maxScanDuration: 1800000,
    deepScan: false,
    proxySettings: {
      enabled: false,
      host: '',
      port: 8080,
      authType: 'none'
    },
    emailSettings: {
      enabled: false,
      host: '',
      port: 25,
      useSSL: false,
      username: '',
      password: '',
      fromAddress: '',
      toAddresses: [],
      notifyOnScanComplete: true,
      notifyOnCritical: true
    },
    realtimeNotifications: true,
    reportDetailLevel: 'detailed',
    autoArchive: true
  };
}
