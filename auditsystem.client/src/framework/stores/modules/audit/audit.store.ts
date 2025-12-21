/**
 * Стор для модуля аудита
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AuditState, ScanConfig, ReportData, ScanHistoryItem, AuditFilters } from './audit.types';
import { logger } from '@/core/services/logger/logger.service';
import { notificationService } from '@/core/services/notification/notification.service';

export const useAuditStore = defineStore('audit', () => {
  const loggerContext = logger.create('AuditStore');

  // Состояние
  const state = ref<AuditState>({
    currentScanId: null,
    scanProgress: 0,
    scanStatus: 'idle',
    lastScanResult: null,
    activeReports: [],
    selectedScripts: [],
    scanHistory: [],
    filters: {
      dateRange: { start: null, end: null },
      status: [],
      severity: [],
      hosts: [],
      scripts: []
    }
  });

  // Геттеры
  const isScanning = computed(() => state.value.scanStatus === 'running');
  const scanHistorySorted = computed(() =>
    [...state.value.scanHistory].sort((a, b) =>
      b.timestamp.getTime() - a.timestamp.getTime()
    )
  );

  const criticalFindingsCount = computed(() => {
    if (!state.value.lastScanResult?.summary?.vulnerabilities) return 0;
    return state.value.lastScanResult.summary.vulnerabilities.critical || 0;
  });

  const recentScans = computed(() =>
    scanHistorySorted.value.slice(0, 5)
  );

  // Действия
  const startScan = async (config: ScanConfig): Promise<string> => {
    try {
      loggerContext.info('Starting scan', { config });

      state.value.scanStatus = 'running';
      state.value.scanProgress = 0;
      state.value.currentScanId = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      // Эмуляция прогресса сканирования
      const progressInterval = setInterval(() => {
        if (state.value.scanProgress < 95) {
          state.value.scanProgress += Math.random() * 10;
        }
      }, 500);

      // TODO: Здесь будет реальный вызов API
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      state.value.scanProgress = 100;
      state.value.scanStatus = 'completed';

      const scanResult: ScanHistoryItem = {
        id: state.value.currentScanId!,
        timestamp: new Date(),
        scriptName: config.scriptId,
        status: 'success',
        hostsScanned: config.hosts.length,
        vulnerabilitiesFound: Math.floor(Math.random() * 10),
        duration: 3000
      };

      state.value.scanHistory.unshift(scanResult);
      state.value.lastScanResult = scanResult;

      notificationService.success('Сканирование успешно завершено', {
        title: 'Аудит'
      });

      loggerContext.info('Scan completed', { scanId: state.value.currentScanId });
      return state.value.currentScanId!;
    } catch (error) {
      state.value.scanStatus = 'failed';
      loggerContext.error('Scan failed', { error });
      notificationService.error('Ошибка при сканировании', { title: 'Аудит' });
      throw error;
    }
  };

  const stopScan = (): void => {
    if (state.value.scanStatus === 'running') {
      state.value.scanStatus = 'idle';
      state.value.scanProgress = 0;
      loggerContext.info('Scan stopped');
      notificationService.info('Сканирование остановлено', { title: 'Аудит' });
    }
  };

  const addReport = (report: ReportData): void => {
    state.value.activeReports.push(report.id);
    loggerContext.info('Report added', { reportId: report.id });
  };

  const removeReport = (reportId: string): void => {
    state.value.activeReports = state.value.activeReports.filter(id => id !== reportId);
    loggerContext.info('Report removed', { reportId });
  };

  const updateFilters = (filters: Partial<AuditFilters>): void => {
    state.value.filters = { ...state.value.filters, ...filters };
    loggerContext.debug('Filters updated', { filters: state.value.filters });
  };

  const clearFilters = (): void => {
    state.value.filters = {
      dateRange: { start: null, end: null },
      status: [],
      severity: [],
      hosts: [],
      scripts: []
    };
    loggerContext.info('Filters cleared');
  };

  const clearHistory = (): void => {
    state.value.scanHistory = [];
    state.value.lastScanResult = null;
    loggerContext.info('Scan history cleared');
  };

  const getScanById = (scanId: string): ScanHistoryItem | undefined => {
    return state.value.scanHistory.find(scan => scan.id === scanId);
  };

  return {
    // State
    state: computed(() => state.value),

    // Getters
    isScanning,
    scanHistorySorted,
    criticalFindingsCount,
    recentScans,

    // Actions
    startScan,
    stopScan,
    addReport,
    removeReport,
    updateFilters,
    clearFilters,
    clearHistory,
    getScanById
  };
});
