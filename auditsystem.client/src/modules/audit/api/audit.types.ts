// ==================== CORE TYPES ====================

export interface MilitaryUnit {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'deployed' | 'headquarters';
  subnets: Subnet[];
  hosts: Host[];
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

export interface Host {
  id: string;
  unitId: string;
  subnetId?: string;
  name: string;
  ipAddress: string;
  osType: 'linux' | 'windows' | 'unknown';
  status: 'online' | 'offline' | 'unknown';
  lastSeen: string | null;
  description?: string;
  credentials?: HostCredentials;
}

export interface HostCredentials {
  id: string;
  hostId: string;
  authType: 'password' | 'rsa';
  username: string;
  password?: string;
  rsaKey?: string;
  port: number;
}

export interface Script {
  id: string;
  name: string;
  description: string;
  type: 'check' | 'fix';
  category: 'security' | 'compliance' | 'performance' | 'custom';
  checkScriptId?: string; // For fix scripts, link to corresponding check script
  content: string;
  parameters: ScriptParameter[];
  createdAt: string;
  updatedAt: string;
}

export interface ScriptParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: unknown;
  options?: string[];
  description: string;
}

export interface ScanTask {
  id: string;
  name: string;
  description?: string;
  unitIds: string[];
  hostIds: string[];
  scriptIds: string[];
  autoFix: boolean;
  parallelExecution: boolean;
  generateReport: boolean;
  stopOnError?: boolean;
  schedule?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ScanResult {
  id: string;
  taskId: string;
  hostId: string;
  scriptId: string;
  status: 'success' | 'failed' | 'error' | 'skipped';
  output: string;
  errors: string[];
  executionTime: number;
  timestamp: string;
  fixesApplied?: boolean;
  fixOutput?: string;
}

export interface Vulnerability {
  id: string;
  hostId: string;
  scriptId: string;
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

export interface Report {
  id: string;
  name: string;
  description?: string;
  taskId: string;
  format: 'html' | 'pdf' | 'json' | 'csv' | 'txt';
  content: string;
  generatedAt: string;
  fileSize: number;
}

export interface ProxySettings {
  enabled: boolean;
  host: string;
  port: number;
  authType: 'none' | 'password' | 'rsa';
  username?: string;
  password?: string;
  rsaKey?: string;
}

export interface EmailSettings {
  enabled: boolean;
  host: string;
  port: number;
  useSSL: boolean;
  username: string;
  password: string;
  fromAddress: string;
  toAddresses: string[];
  notifyOnScanComplete: boolean;
  notifyOnCritical: boolean;
}

export interface AuditSettings {
  scanInterval: number;
  autoReporting: boolean;
  notificationEnabled: boolean;
  reportFormat: 'pdf' | 'html' | 'json' | 'csv' | 'txt';
  maxScanDuration: number;
  deepScan?: boolean;
  proxySettings: ProxySettings;
  emailSettings: EmailSettings;
  realtimeNotifications?: boolean;
  reportDetailLevel?: 'basic' | 'detailed' | 'comprehensive';
  autoArchive?: boolean;
}

// ==================== REQUEST TYPES ====================

export interface StartScanCommand {
  taskId?: string;
  name: string;
  description?: string;
  unitIds: string[];
  hostIds: string[];
  scriptIds: string[];
  autoFix: boolean;
  parallelExecution: boolean;
  generateReport: boolean;
  stopOnError?: boolean;
  notifyOnComplete?: boolean;
  emailReport?: boolean;
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

export interface CreateHostCommand {
  unitId: string;
  subnetId?: string;
  name: string;
  ipAddress: string;
  osType: 'linux' | 'windows' | 'unknown';
  description?: string;
  credentials?: Omit<HostCredentials, 'id' | 'hostId'>;
}

export interface ScanNetworkCommand {
  unitId: string;
  subnetId: string;
  scanType: 'quick' | 'comprehensive';
}

export interface CreateScriptCommand {
  name: string;
  description: string;
  type: 'check' | 'fix';
  category: 'security' | 'compliance' | 'performance' | 'custom';
  checkScriptId?: string;
  content: string;
  parameters: ScriptParameter[];
}

export interface UpdateSettingsCommand {
  settings: Partial<AuditSettings>;
}

export interface TestEmailConnectionCommand {
  host: string;
  port: number;
  useSSL: boolean;
  username: string;
  password: string;
}

export interface TestProxyConnectionCommand {
  host: string;
  port: number;
  authType: 'none' | 'password' | 'rsa';
  username?: string;
  password?: string;
  rsaKey?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  timestamp: string;
  details?: string;
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

export interface NetworkScanResult {
  hosts: DiscoveredHost[];
  scanDuration: number;
  timestamp: string;
}

export interface DiscoveredHost {
  ipAddress: string;
  hostname?: string;
  osType: 'linux' | 'windows' | 'unknown';
  macAddress?: string;
  ports: number[];
}

// ==================== STATE TYPES ====================

export interface AuditState {
  units: MilitaryUnit[];
  scripts: Script[];
  tasks: ScanTask[];
  currentScan: ScanStatusResponse | null;
  settings: AuditSettings;
  scanHistory: ScanResult[];
  reports: Report[];
  isLoading: boolean;
  error: string | null;
}

// ==================== CONSTANTS ====================

export const DEFAULT_SETTINGS: AuditSettings = {
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
