// src/modules/audit/index.ts
export { useAudit } from './composables/useAudit';
export { useMilitaryUnits } from './composables/useMilitaryUnits';
export { useScripts } from './composables/useScripts';
export { useMonitoring } from './composables/useMonitoring';
export { useReports } from './composables/useReports';
export { auditApiService } from './api/auditApi.service';

export type {
  // Core Types
  MilitaryUnit,
  Subnet,
  Host,
  Script,
  ScanTask,
  ScanResult,
  Report,
  AuditSettings,

  // Request Types
  StartScanCommand,
  CreateUnitCommand,
  CreateSubnetCommand,
  CreateHostCommand,
  CreateScriptCommand,

  // Response Types
  NetworkScanResult,
  ConnectionTestResult
} from './api/audit.types';
