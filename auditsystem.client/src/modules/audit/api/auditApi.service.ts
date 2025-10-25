// src/modules/audit/api/auditApi.service.ts
import { apiClient } from '@/core/services/core/api/api-client.service';
import { errorHandler } from '@/core/services/core/utils/error-handler.service';
import { logger } from '@/core/utils/logger';
import type {
  MilitaryUnit,
  Subnet,
  ScanResult,
  AuditSettings,
  CreateUnitCommand,
  CreateSubnetCommand,
  StartScanCommand
} from './audit.types';

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

  // Scanning
  async startScan(command: StartScanCommand): Promise<{ scanId: string }> {
    try {
      return await apiClient.post<{ scanId: string }>(`${this.basePath}/scans`, command, {
        requireAuth: true,
        timeout: 15000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.startScan');
      this.logger.error('Failed to start scan', { error: handledError.message });
      throw handledError;
    }
  }

  async getScanStatus(scanId: string): Promise<ScanResult> {
    try {
      return await apiClient.get<ScanResult>(`${this.basePath}/scans/${scanId}`, {
        requireAuth: true,
        timeout: 10000,
      });
    } catch (error: unknown) {
      const handledError = errorHandler.handle(error, 'audit.getScanStatus');
      this.logger.error('Failed to get scan status', { error: handledError.message });
      throw handledError;
    }
  }

  async getScanProgress(scanId: string): Promise<ScanResult> {
    // Используем getScanStatus для получения прогресса
    return this.getScanStatus(scanId);
  }

  async cancelScan(scanId: string): Promise<void> {
    try {
      await apiClient.post<void>(`${this.basePath}/scans/${scanId}/cancel`, {}, {
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
}

export const auditApiService = new AuditApiService();
