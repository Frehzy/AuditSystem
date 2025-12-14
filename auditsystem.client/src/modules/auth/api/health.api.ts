// src/modules/auth/api/health.api.ts
import { apiClient } from '@/core/services/api/api-client.service';
import { logger } from '@/core/utils/logger';
import type { HealthCheckResponse, ServerStatus } from '../types';

class HealthApi {
  private readonly logger = logger.create('HealthApi');

  async check(): Promise<HealthCheckResponse> {
    try {
      const response = await apiClient.get<HealthCheckResponse>('/health', {
        requireAuth: false,
        timeout: 8000,
      });

      this.logger.debug('Health check completed', {
        status: response.status,
        services: response.services?.length
      });

      return response;
    } catch (error) {
      this.logger.error('Health check failed', { error });
      throw error;
    }
  }

  async quickCheck(): Promise<boolean> {
    try {
      await apiClient.get('/health/quick', {
        requireAuth: false,
        timeout: 3000,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const healthApi = new HealthApi();
