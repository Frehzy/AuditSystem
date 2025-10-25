// ==================== CORE TYPES ====================

export interface MilitaryUnit {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'deployed' | 'headquarters';
  subnets: Subnet[];
  createdAt: string;
  description?: string;
}

export interface Subnet {
  id: string;
  unitId: string;
  name: string;
  network: string;
  mask: string;
  description?: string;
  devicesCount: number;
  lastScan: string | null;
}

export interface ScanResult {
  id: string;
  subnetId: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'in_progress';
  devicesScanned: number;
  devicesFound: number;
  vulnerabilitiesFound: number;
  scanDuration: number;
}

export interface Vulnerability {
  id: string;
  deviceId: string;
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
  autoReporting: boolean;
  notificationEnabled: boolean;
  reportFormat: 'pdf' | 'html' | 'json' | 'xml';
  maxScanDuration: number;
  deepScan?: boolean;
  notificationEmail?: string;
  realtimeNotifications?: boolean;
  reportDetailLevel?: 'basic' | 'detailed' | 'comprehensive';
  autoArchive?: boolean;
}

// ==================== REQUEST TYPES ====================

export interface StartScanCommand {
  subnetId: string;
  scanType: 'quick' | 'comprehensive' | 'targeted';
}

export interface CreateUnitCommand {
  name: string;
  location: string;
  status: 'active' | 'deployed' | 'headquarters';
  description?: string;
}

export interface CreateSubnetCommand {
  unitId: string;
  name: string;
  network: string;
  mask: string;
  description?: string;
}

export interface UpdateSettingsCommand {
  settings: Partial<AuditSettings>;
}

// ==================== RESPONSE TYPES ====================

export interface ScanStatusResponse {
  scanId: string;
  status: 'in_progress' | 'completed' | 'failed';
  progress: number;
  currentAction: string;
  devicesProcessed: number;
  totalDevices: number;
  estimatedTimeRemaining: number | null;
}

// ==================== STATE TYPES ====================

export interface AuditState {
  units: MilitaryUnit[];
  currentScan: ScanStatusResponse | null;
  settings: AuditSettings;
  scanHistory: ScanResult[];
  isLoading: boolean;
  error: string | null;
}

// ==================== CONSTANTS ====================

export const DEFAULT_SETTINGS: AuditSettings = {
  scanInterval: 3600000,
  autoReporting: true,
  notificationEnabled: true,
  reportFormat: 'pdf',
  maxScanDuration: 1800000
};
