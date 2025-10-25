// Main View
export { default as AuditView } from './views/AuditView.vue';

// Layout Components
export { default as AuditLayout } from './components/layout/AuditLayout.vue';
export { default as AuditHeader } from './components/layout/AuditHeader.vue';
export { default as AuditSidebar } from './components/layout/AuditSidebar.vue';

// View Components (для вложенных маршрутов)
export { default as ReportsView } from './components/views/ReportsView.vue';
export { default as MonitoringView } from './components/views/MonitoringView.vue';
export { default as SettingsView } from './components/views/SettingsView.vue';

// Composables
export { default as useAudit } from './composables/useAudit';

// API
export { auditApiService } from './api/auditApi.service';

// Types
export type {
  MilitaryUnit,
  Subnet,
  ScanResult,
  Vulnerability,
  AuditSettings,
  StartScanCommand,
  CreateUnitCommand,
  CreateSubnetCommand
} from './api/audit.types';
