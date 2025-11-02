// src/modules/audit/api/auditApi.service.ts
import { apiClient } from '@/core/services/api/api-client.service';
import { errorHandler } from '@/core/services/utils/error-handler.service';
import { logger } from '@/core/utils/logger';
import type {
  MilitaryUnit,
  Subnet,
  Host,
  Script,
  ScanTask,
  ScanResult,
  Report,
  AuditSettings,
  CreateUnitCommand,
  CreateSubnetCommand,
  CreateHostCommand,
  CreateScriptCommand,
  StartScanCommand,
  ScanNetworkCommand,
  TestEmailConnectionCommand,
  TestProxyConnectionCommand,
  NetworkScanResult,
  ConnectionTestResult
} from './audit.types';

interface ApiRequestOptions {
  requireAuth?: boolean;
  timeout?: number;
  responseType?: 'json' | 'blob' | 'text';
}

class AuditApiService {
  private readonly logger = logger.create('AuditApiService');
  private readonly basePath = 'api/audit';

  // Military Units
  async getMilitaryUnits(): Promise<MilitaryUnit[]> {
    try {
      return await apiClient.get<MilitaryUnit[]>(`${this.basePath}/units`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getMilitaryUnits');
      this.logger.error('Failed to get military units', { error: handledError.message });
      throw handledError;
    }
  }

  async createMilitaryUnit(command: CreateUnitCommand): Promise<MilitaryUnit> {
    try {
      return await apiClient.post<MilitaryUnit>(`${this.basePath}/units`, command, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.createMilitaryUnit');
      this.logger.error('Failed to create military unit', { error: handledError.message });
      throw handledError;
    }
  }

  async updateMilitaryUnit(id: string, command: Partial<CreateUnitCommand>): Promise<MilitaryUnit> {
    try {
      return await apiClient.put<MilitaryUnit>(`${this.basePath}/units/${id}`, command, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.updateMilitaryUnit');
      this.logger.error('Failed to update military unit', { error: handledError.message });
      throw handledError;
    }
  }

  async deleteMilitaryUnit(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/units/${id}`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.deleteMilitaryUnit');
      this.logger.error('Failed to delete military unit', { error: handledError.message });
      throw handledError;
    }
  }

  // Subnets
  async createSubnet(command: CreateSubnetCommand): Promise<Subnet> {
    try {
      return await apiClient.post<Subnet>(`${this.basePath}/subnets`, command, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.createSubnet');
      this.logger.error('Failed to create subnet', { error: handledError.message });
      throw handledError;
    }
  }

  // Hosts
  async getHosts(unitId?: string): Promise<Host[]> {
    try {
      const url = unitId ? `${this.basePath}/hosts?unitId=${unitId}` : `${this.basePath}/hosts`;
      return await apiClient.get<Host[]>(url, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getHosts');
      this.logger.error('Failed to get hosts', { error: handledError.message });
      throw handledError;
    }
  }

  async createHost(command: CreateHostCommand): Promise<Host> {
    try {
      return await apiClient.post<Host>(`${this.basePath}/hosts`, command, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.createHost');
      this.logger.error('Failed to create host', { error: handledError.message });
      throw handledError;
    }
  }

  async updateHost(id: string, command: Partial<CreateHostCommand>): Promise<Host> {
    try {
      return await apiClient.put<Host>(`${this.basePath}/hosts/${id}`, command, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.updateHost');
      this.logger.error('Failed to update host', { error: handledError.message });
      throw handledError;
    }
  }

  async deleteHost(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/hosts/${id}`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.deleteHost');
      this.logger.error('Failed to delete host', { error: handledError.message });
      throw handledError;
    }
  }

  // Network Scanning
  async scanNetwork(command: ScanNetworkCommand): Promise<NetworkScanResult> {
    try {
      return await apiClient.post<NetworkScanResult>(`${this.basePath}/network-scan`, command, {
        requireAuth: true,
        timeout: 300000, // 5 minutes for network scan
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.scanNetwork');
      this.logger.error('Failed to scan network', { error: handledError.message });
      throw handledError;
    }
  }

  // Scripts
  async getScripts(): Promise<Script[]> {
    try {
      return await apiClient.get<Script[]>(`${this.basePath}/scripts`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getScripts');
      this.logger.error('Failed to get scripts', { error: handledError.message });
      throw handledError;
    }
  }

  async createScript(command: CreateScriptCommand): Promise<Script> {
    try {
      return await apiClient.post<Script>(`${this.basePath}/scripts`, command, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.createScript');
      this.logger.error('Failed to create script', { error: handledError.message });
      throw handledError;
    }
  }

  async updateScript(id: string, command: Partial<CreateScriptCommand>): Promise<Script> {
    try {
      return await apiClient.put<Script>(`${this.basePath}/scripts/${id}`, command, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.updateScript');
      this.logger.error('Failed to update script', { error: handledError.message });
      throw handledError;
    }
  }

  async deleteScript(id: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.basePath}/scripts/${id}`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.deleteScript');
      this.logger.error('Failed to delete script', { error: handledError.message });
      throw handledError;
    }
  }

  // Scanning
  async startScan(command: StartScanCommand): Promise<{ scanId: string; taskId: string }> {
    try {
      return await apiClient.post<{ scanId: string; taskId: string }>(`${this.basePath}/scans`, command, {
        requireAuth: true,
        timeout: 15000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.startScan');
      this.logger.error('Failed to start scan', { error: handledError.message });
      throw handledError;
    }
  }

  async getScanStatus(scanId: string): Promise<ScanTask> {
    try {
      return await apiClient.get<ScanTask>(`${this.basePath}/scans/${scanId}`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getScanStatus');
      this.logger.error('Failed to get scan status', { error: handledError.message });
      throw handledError;
    }
  }

  async getScanProgress(taskId: string): Promise<ScanTask> {
    try {
      return await apiClient.get<ScanTask>(`${this.basePath}/tasks/${taskId}/progress`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getScanProgress');
      this.logger.error('Failed to get scan progress', { error: handledError.message });
      throw handledError;
    }
  }

  async cancelScan(taskId: string): Promise<void> {
    try {
      await apiClient.post<void>(`${this.basePath}/tasks/${taskId}/cancel`, {}, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.cancelScan');
      this.logger.error('Failed to cancel scan', { error: handledError.message });
      throw handledError;
    }
  }

  async getScanHistory(limit?: number): Promise<ScanResult[]> {
    try {
      const url = limit ? `${this.basePath}/scans/history?limit=${limit}` : `${this.basePath}/scans/history`;
      return await apiClient.get<ScanResult[]>(url, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getScanHistory');
      this.logger.error('Failed to get scan history', { error: handledError.message });
      throw handledError;
    }
  }

  // Reports
  async getReports(): Promise<Report[]> {
    try {
      return await apiClient.get<Report[]>(`${this.basePath}/reports`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getReports');
      this.logger.error('Failed to get reports', { error: handledError.message });
      throw handledError;
    }
  }

  async generateReport(taskId: string, format: string): Promise<Report> {
    try {
      return await apiClient.post<Report>(`${this.basePath}/reports/generate`, {
        taskId,
        format
      }, {
        requireAuth: true,
        timeout: 30000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.generateReport');
      this.logger.error('Failed to generate report', { error: handledError.message });
      throw handledError;
    }
  }

  async downloadReport(reportId: string): Promise<Blob> {
    try {
      return await apiClient.get<Blob>(`${this.basePath}/reports/${reportId}/download`, {
        requireAuth: true,
        timeout: 30000,
        responseType: 'blob'
      } as ApiRequestOptions);
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.downloadReport');
      this.logger.error('Failed to download report', { error: handledError.message });
      throw handledError;
    }
  }

  // Settings
  async getSettings(): Promise<AuditSettings> {
    try {
      return await apiClient.get<AuditSettings>(`${this.basePath}/settings`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getSettings');
      this.logger.error('Failed to get settings', { error: handledError.message });
      throw handledError;
    }
  }

  async updateSettings(settings: Partial<AuditSettings>): Promise<AuditSettings> {
    try {
      return await apiClient.put<AuditSettings>(`${this.basePath}/settings`, settings, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.updateSettings');
      this.logger.error('Failed to update settings', { error: handledError.message });
      throw handledError;
    }
  }

  async testEmailConnection(command: TestEmailConnectionCommand): Promise<ConnectionTestResult> {
    try {
      return await apiClient.post<ConnectionTestResult>(`${this.basePath}/settings/test-email`, command, {
        requireAuth: true,
        timeout: 30000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.testEmailConnection');
      this.logger.error('Failed to test email connection', { error: handledError.message });
      throw handledError;
    }
  }

  async testProxyConnection(command: TestProxyConnectionCommand): Promise<ConnectionTestResult> {
    try {
      return await apiClient.post<ConnectionTestResult>(`${this.basePath}/settings/test-proxy`, command, {
        requireAuth: true,
        timeout: 30000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.testProxyConnection');
      this.logger.error('Failed to test proxy connection', { error: handledError.message });
      throw handledError;
    }
  }
}

export const auditApiService = new AuditApiService();
