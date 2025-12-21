/**
 * Стор для модуля мониторинга
 */

import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import type { MonitoringState, Alert, SystemMetrics, Connection } from './monitoring.types';
import { logger } from '@/core/services/logger/logger.service';
import { notificationService } from '@/core/services/notification/notification.service';

export const useMonitoringStore = defineStore('monitoring', () => {
  const loggerContext = logger.create('MonitoringStore');

  // Состояние
  const state = ref<MonitoringState>({
    realtimeStats: {
      activeScans: 0,
      totalHosts: 0,
      onlineHosts: 0,
      vulnerabilitiesToday: 0,
      avgResponseTime: 0,
      requestsPerSecond: 0
    },
    activeAlerts: [],
    systemMetrics: {
      cpu: { current: 0, max: 100, trend: 'stable' },
      memory: { current: 0, max: 100, trend: 'stable' },
      disk: { current: 0, max: 100, trend: 'stable' },
      network: { incoming: 0, outgoing: 0, connections: 0, latency: 0 }
    },
    performanceData: [],
    connections: [],
    lastUpdate: null,
    autoRefresh: true,
    refreshInterval: 5000 // 5 секунд
  });

  // Интервал обновления
  let refreshIntervalId: NodeJS.Timeout | null = null;

  // Геттеры
  const criticalAlerts = computed(() =>
    state.value.activeAlerts.filter(alert =>
      alert.severity === 'critical' && !alert.resolved
    )
  );

  const unacknowledgedAlerts = computed(() =>
    state.value.activeAlerts.filter(alert => !alert.acknowledged)
  );

  const connectionStats = computed(() => ({
    total: state.value.connections.length,
    connected: state.value.connections.filter(c => c.status === 'connected').length,
    disconnected: state.value.connections.filter(c => c.status === 'disconnected').length
  }));

  const performanceTrend = computed(() => {
    const data = state.value.performanceData;
    if (data.length < 2) return 'stable';

    const last = data[data.length - 1];
    const prev = data[data.length - 2];

    const cpuDiff = last.cpu - prev.cpu;
    const memDiff = last.memory - prev.memory;

    return cpuDiff > 5 || memDiff > 5 ? 'up' : cpuDiff < -5 || memDiff < -5 ? 'down' : 'stable';
  });

  // Действия
  const startAutoRefresh = (): void => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
    }

    state.value.autoRefresh = true;
    refreshIntervalId = setInterval(updateMonitoringData, state.value.refreshInterval);

    loggerContext.info('Auto refresh started', { interval: state.value.refreshInterval });
  };

  const stopAutoRefresh = (): void => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }

    state.value.autoRefresh = false;
    loggerContext.info('Auto refresh stopped');
  };

  const setRefreshInterval = (interval: number): void => {
    state.value.refreshInterval = interval;

    if (state.value.autoRefresh) {
      stopAutoRefresh();
      startAutoRefresh();
    }

    loggerContext.info('Refresh interval updated', { interval });
  };

  const updateMonitoringData = async (): Promise<void> => {
    try {
      // TODO: Здесь будет реальный вызов API для получения данных мониторинга
      // Пока используем моковые данные

      // Обновляем статистику
      state.value.realtimeStats = {
        activeScans: Math.floor(Math.random() * 10),
        totalHosts: 150,
        onlineHosts: Math.floor(Math.random() * 150),
        vulnerabilitiesToday: Math.floor(Math.random() * 50),
        avgResponseTime: Math.random() * 100,
        requestsPerSecond: Math.random() * 100
      };

      // Обновляем метрики системы
      state.value.systemMetrics = {
        cpu: {
          current: Math.random() * 100,
          max: 100,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        memory: {
          current: Math.random() * 100,
          max: 100,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        disk: {
          current: Math.random() * 100,
          max: 100,
          trend: 'stable'
        },
        network: {
          incoming: Math.random() * 1000000,
          outgoing: Math.random() * 1000000,
          connections: Math.floor(Math.random() * 100),
          latency: Math.random() * 100
        }
      };

      // Добавляем точку данных производительности
      const dataPoint = {
        timestamp: new Date(),
        cpu: state.value.systemMetrics.cpu.current,
        memory: state.value.systemMetrics.memory.current,
        networkIn: state.value.systemMetrics.network.incoming,
        networkOut: state.value.systemMetrics.network.outgoing,
        activeConnections: state.value.systemMetrics.network.connections
      };

      state.value.performanceData.push(dataPoint);

      // Ограничиваем количество точек данных
      if (state.value.performanceData.length > 100) {
        state.value.performanceData = state.value.performanceData.slice(-100);
      }

      // Обновляем время последнего обновления
      state.value.lastUpdate = new Date();

      loggerContext.debug('Monitoring data updated');
    } catch (error) {
      loggerContext.error('Failed to update monitoring data', { error });
    }
  };

  const addAlert = (alert: Omit<Alert, 'id' | 'timestamp'>): string => {
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date()
    };

    state.value.activeAlerts.unshift(newAlert);

    // Ограничиваем количество предупреждений
    if (state.value.activeAlerts.length > 50) {
      state.value.activeAlerts = state.value.activeAlerts.slice(0, 50);
    }

    // Показываем уведомление для критических предупреждений
    if (newAlert.severity === 'critical') {
      notificationService.warning(newAlert.title, {
        title: 'Критическое предупреждение',
        duration: 10000
      });
    }

    loggerContext.info('Alert added', { alertId: newAlert.id, severity: newAlert.severity });
    return newAlert.id;
  };

  const acknowledgeAlert = (alertId: string): void => {
    const alert = state.value.activeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      loggerContext.debug('Alert acknowledged', { alertId });
    }
  };

  const resolveAlert = (alertId: string): void => {
    const alert = state.value.activeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      loggerContext.debug('Alert resolved', { alertId });
    }
  };

  const clearResolvedAlerts = (): void => {
    const before = state.value.activeAlerts.length;
    state.value.activeAlerts = state.value.activeAlerts.filter(alert => !alert.resolved);
    const after = state.value.activeAlerts.length;

    loggerContext.info('Resolved alerts cleared', { cleared: before - after });
  };

  // Инициализация
  const initialize = (): void => {
    updateMonitoringData();

    if (state.value.autoRefresh) {
      startAutoRefresh();
    }

    loggerContext.info('Monitoring store initialized');
  };

  // Очистка
  onUnmounted(() => {
    stopAutoRefresh();
    loggerContext.info('Monitoring store unmounted');
  });

  return {
    // State
    state: computed(() => state.value),

    // Getters
    criticalAlerts,
    unacknowledgedAlerts,
    connectionStats,
    performanceTrend,

    // Actions
    startAutoRefresh,
    stopAutoRefresh,
    setRefreshInterval,
    updateMonitoringData,
    addAlert,
    acknowledgeAlert,
    resolveAlert,
    clearResolvedAlerts,
    initialize
  };
});
