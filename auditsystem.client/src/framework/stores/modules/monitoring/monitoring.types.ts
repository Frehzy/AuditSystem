/**
 * Типы для стора мониторинга
 */

export interface MonitoringState {
  realtimeStats: RealtimeStats;
  activeAlerts: Alert[];
  systemMetrics: SystemMetrics;
  performanceData: PerformanceDataPoint[];
  connections: Connection[];
  lastUpdate: Date | null;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface RealtimeStats {
  activeScans: number;
  totalHosts: number;
  onlineHosts: number;
  vulnerabilitiesToday: number;
  avgResponseTime: number;
  requestsPerSecond: number;
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'security' | 'performance' | 'system' | 'network';
  title: string;
  description: string;
  source: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface SystemMetrics {
  cpu: ResourceUsage;
  memory: ResourceUsage;
  disk: ResourceUsage;
  network: NetworkMetrics;
}

export interface ResourceUsage {
  current: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
}

export interface NetworkMetrics {
  incoming: number; // bytes per second
  outgoing: number; // bytes per second
  connections: number;
  latency: number; // ms
}

export interface PerformanceDataPoint {
  timestamp: Date;
  cpu: number;
  memory: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
}

export interface Connection {
  id: string;
  host: string;
  ip: string;
  port: number;
  protocol: string;
  status: 'connected' | 'disconnected' | 'timeout';
  lastActivity: Date;
  bytesSent: number;
  bytesReceived: number;
}
