/**
 * Типы для стора аудита
 */

export interface AuditState {
  currentScanId: string | null;
  scanProgress: number;
  scanStatus: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  lastScanResult: any | null;
  activeReports: string[];
  selectedScripts: string[];
  scanHistory: ScanHistoryItem[];
  filters: AuditFilters;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: Date;
  scriptName: string;
  status: 'success' | 'failed' | 'partial';
  hostsScanned: number;
  vulnerabilitiesFound: number;
  duration: number;
}

export interface AuditFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  status: string[];
  severity: string[];
  hosts: string[];
  scripts: string[];
}

export interface ScanConfig {
  scriptId: string;
  hosts: string[];
  parameters: Record<string, any>;
  timeout: number;
  concurrentScans: number;
  saveReport: boolean;
  notifyOnComplete: boolean;
}

export interface ReportData {
  id: string;
  scanId: string;
  timestamp: Date;
  title: string;
  summary: ReportSummary;
  details: ReportDetails[];
  recommendations: string[];
  exportFormats: string[];
}

export interface ReportSummary {
  totalHosts: number;
  scannedHosts: number;
  vulnerabilities: VulnerabilityStats;
  executionTime: number;
  status: 'success' | 'warning' | 'critical';
}

export interface VulnerabilityStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

export interface ReportDetails {
  host: string;
  ip: string;
  findings: Finding[];
  status: 'clean' | 'vulnerable' | 'error';
  scanDuration: number;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  recommendation: string;
  references: string[];
  cve?: string[];
}
