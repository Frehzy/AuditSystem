// ==================== CORE TYPES ====================

export interface AuditSystem {
  id: string;
  name: string;
  version: string;
  status: 'online' | 'offline' | 'scanning';
  lastScan: string | null;
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityScanResult {
  id: string;
  systemId: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'in_progress';
  vulnerabilities: Vulnerability[];
  scanDuration: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'network' | 'application' | 'configuration';
  description: string;
  recommendation: string;
  cve?: string;
  cvssScore?: number;
  status: 'open' | 'fixed' | 'mitigated';
  detectedAt: string;
}

export interface AuditSettings {
  scanInterval: number;
  autoRemediation: boolean;
  notificationEnabled: boolean;
  reportFormat: 'pdf' | 'html' | 'json';
  scanDepth: 'basic' | 'standard' | 'deep';
  excludedPaths: string[];
  maxScanDuration: number;
}

// ==================== REQUEST TYPES ====================

export interface StartScanCommand {
  systemId: string;
  scanType: 'quick' | 'full' | 'custom';
  options?: ScanOptions;
}

export interface ScanOptions {
  checkNetwork: boolean;
  checkFilesystem: boolean;
  checkUsers: boolean;
  checkServices: boolean;
  checkFirewall: boolean;
}

export interface UpdateSettingsCommand {
  settings: Partial<AuditSettings>;
}

// ==================== RESPONSE TYPES ====================

export interface ScanStatusResponse {
  scanId: string;
  status: 'in_progress' | 'completed' | 'failed';
  progress: number;
  currentCheck: string;
  estimatedTimeRemaining: number | null;
}

export interface SystemsListResponse {
  systems: AuditSystem[];
  totalCount: number;
}

export interface ScanHistoryResponse {
  scans: SecurityScanResult[];
  totalCount: number;
}

// ==================== STATE TYPES ====================

export interface AuditState {
  systems: AuditSystem[];
  currentScan: ScanStatusResponse | null;
  settings: AuditSettings;
  scanHistory: SecurityScanResult[];
  isLoading: boolean;
  error: string | null;
}

// ==================== CONSTANTS ====================

export const SCAN_CATEGORIES = {
  SYSTEM: 'system',
  NETWORK: 'network',
  APPLICATION: 'application',
  CONFIGURATION: 'configuration'
} as const;

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const DEFAULT_SETTINGS: AuditSettings = {
  scanInterval: 3600000, // 1 hour
  autoRemediation: false,
  notificationEnabled: true,
  reportFormat: 'pdf',
  scanDepth: 'standard',
  excludedPaths: ['/proc', '/sys', '/dev'],
  maxScanDuration: 1800000 // 30 minutes
};
