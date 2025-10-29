// src/modules/audit/composables/useMonitoring.ts
import { ref, computed } from 'vue';
import { auditApiService } from '../api/auditApi.service';
import type { ScanTask, ScanResult, StartScanCommand } from '../api/audit.types';

export const useMonitoring = () => {
  const tasks = ref<ScanTask[]>([]);
  const currentScan = ref<ScanTask | null>(null);
  const scanHistory = ref<ScanResult[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const activeScans = computed(() => {
    return tasks.value.filter(task => task.status === 'running');
  });

  const completedScans = computed(() => {
    return tasks.value.filter(task => task.status === 'completed');
  });

  const failedScans = computed(() => {
    return tasks.value.filter(task => task.status === 'failed');
  });

  const startScan = async (command: StartScanCommand): Promise<{ scanId: string; taskId: string }> => {
    isLoading.value = true;
    error.value = null;

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
      error.value = err instanceof Error ? err.message : 'Failed to start scan';
      console.error('Error starting scan:', err);
      throw err;
    } finally {
      isLoading.value = false;
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
      error.value = err instanceof Error ? err.message : 'Failed to get scan progress';
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
      error.value = err instanceof Error ? err.message : 'Failed to cancel scan';
      console.error('Error cancelling scan:', err);
      throw err;
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

  const clearError = (): void => {
    error.value = null;
  };

  return {
    tasks,
    currentScan,
    scanHistory,
    isLoading,
    error,
    activeScans,
    completedScans,
    failedScans,
    startScan,
    getScanProgress,
    cancelScan,
    loadScanHistory,
    clearError
  };
};
