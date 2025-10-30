// src/core/services/mock/mock.service.ts
import { logger } from '@/core/utils/logger';
import type {
  MilitaryUnit,
  Script,
  ScanTask,
  Report,
  AuditSettings,
  StartScanCommand
} from '@/modules/audit/api/audit.types';

export class MockService {
  private static instance: MockService;
  private enabled = false;

  static getInstance(): MockService {
    if (!MockService.instance) {
      MockService.instance = new MockService();
    }
    return MockService.instance;
  }

  enable(): void {
    this.enabled = true;
    logger.info('Mock service enabled');
  }

  disable(): void {
    this.enabled = false;
    logger.info('Mock service disabled');
  }

  isMockEnabled(): boolean {
    return this.enabled;
  }

  async handleRequest(method: string, endpoint: string, data?: unknown): Promise<unknown> {
    if (!this.enabled) {
      throw new Error('Mock service is disabled');
    }

    logger.debug(`Mock request: ${method} ${endpoint}`, { data });

    // Имитация сетевой задержки
    await this.delay(this.getRandomDelay());

    // Обработка различных endpoint'ов
    switch (method) {
      case 'GET':
        return this.handleGetRequest(endpoint);
      case 'POST':
        return this.handlePostRequest(endpoint, data);
      case 'PUT':
        return this.handlePutRequest(endpoint);
      case 'DELETE':
        return this.handleDeleteRequest(endpoint);
      default:
        throw new Error(`Mock method not implemented: ${method}`);
    }
  }

  private async handleGetRequest(endpoint: string): Promise<unknown> {
    switch (endpoint) {
      case '/api/audit/units':
        return this.getMilitaryUnits();
      case '/api/audit/scripts':
        return this.getScripts();
      case '/api/audit/scans/history':
        return this.getScanHistory();
      case '/api/audit/reports':
        return this.getReports();
      case '/api/audit/settings':
        return this.getSettings();
      case '/api/health':
        return { status: 'Healthy', timestamp: new Date().toISOString() };
      case '/api/health/db':
        return { status: 'Connected', timestamp: new Date().toISOString() };
      default:
        throw new Error(`Mock endpoint not found: ${endpoint}`);
    }
  }

  private async handlePostRequest(endpoint: string, data?: unknown): Promise<unknown> {
    switch (endpoint) {
      case '/api/audit/scans/start':
        return this.startScan(data as StartScanCommand);
      case '/api/auth/login':
        return this.handleLogin(data as { username: string; password: string });
      case '/api/auth/logout':
        return this.handleLogout();
      case '/api/auth/validate':
        return this.handleTokenValidation(data as { token: string });
      default:
        throw new Error(`Mock POST endpoint not implemented: ${endpoint}`);
    }
  }

  private async handlePutRequest(endpoint: string): Promise<unknown> {
    switch (endpoint) {
      case '/api/auth/refresh':
        return this.handleTokenRefresh();
      default:
        throw new Error(`Mock PUT endpoint not implemented: ${endpoint}`);
    }
  }

  private async handleDeleteRequest(endpoint: string): Promise<unknown> {
    switch (endpoint) {
      // Можно добавить обработку DELETE запросов
      default:
        throw new Error(`Mock DELETE endpoint not implemented: ${endpoint}`);
    }
  }

  // Mock данные для войсковых частей
  private async getMilitaryUnits(): Promise<MilitaryUnit[]> {
    return [
      {
        id: 'unit-1',
        name: 'Войсковая часть 12345',
        location: 'Москва',
        status: 'active',
        subnets: [
          {
            id: 'subnet-1',
            unitId: 'unit-1',
            name: 'Основная сеть',
            network: '192.168.1.0',
            mask: '255.255.255.0',
            devicesCount: 5,
            lastScan: new Date().toISOString()
          }
        ],
        hosts: [
          {
            id: 'host-1-1',
            unitId: 'unit-1',
            subnetId: 'subnet-1',
            name: 'WEB-SERVER-01',
            ipAddress: '192.168.1.10',
            osType: 'windows',
            status: 'online',
            lastSeen: new Date().toISOString()
          },
          {
            id: 'host-1-2',
            unitId: 'unit-1',
            subnetId: 'subnet-1',
            name: 'DB-SERVER-01',
            ipAddress: '192.168.1.11',
            osType: 'windows',
            status: 'online',
            lastSeen: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        description: 'Центральное подразделение'
      },
      {
        id: 'unit-2',
        name: 'Войсковая часть 54321',
        location: 'Санкт-Петербург',
        status: 'deployed',
        subnets: [
          {
            id: 'subnet-2',
            unitId: 'unit-2',
            name: 'Резервная сеть',
            network: '10.0.1.0',
            mask: '255.255.255.0',
            devicesCount: 3,
            lastScan: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        hosts: [
          {
            id: 'host-2-1',
            unitId: 'unit-2',
            subnetId: 'subnet-2',
            name: 'APP-SERVER-01',
            ipAddress: '10.0.1.10',
            osType: 'linux',
            status: 'online',
            lastSeen: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(),
        description: 'Северо-западное подразделение'
      }
    ];
  }

  // Mock данные для скриптов
  private async getScripts(): Promise<Script[]> {
    return [
      {
        id: 'script-1',
        name: 'Проверка обновлений безопасности',
        description: 'Проверяет наличие последних обновлений безопасности',
        type: 'check',
        category: 'security',
        content: 'echo "Security updates check script"',
        parameters: [
          {
            name: 'checkInterval',
            type: 'number',
            required: true,
            defaultValue: 7,
            description: 'Интервал проверки в днях'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'script-2',
        name: 'Проверка настроек брандмауэра',
        description: 'Проверяет корректность настроек брандмауэра',
        type: 'check',
        category: 'security',
        content: 'echo "Firewall settings check script"',
        parameters: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Mock данные для истории сканирований
  private async getScanHistory(): Promise<ScanTask[]> {
    return [
      {
        id: 'task-1',
        name: 'Полное сканирование',
        description: 'Полная проверка безопасности',
        unitIds: ['unit-1', 'unit-2'],
        hostIds: ['host-1-1', 'host-1-2', 'host-2-1'],
        scriptIds: ['script-1', 'script-2'],
        autoFix: false,
        parallelExecution: true,
        generateReport: true,
        status: 'completed',
        progress: 100,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'task-2',
        name: 'Быстрая проверка',
        description: 'Быстрая проверка основных параметров',
        unitIds: ['unit-1'],
        hostIds: ['host-1-1'],
        scriptIds: ['script-1'],
        autoFix: true,
        parallelExecution: false,
        generateReport: false,
        status: 'running',
        progress: 65,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        completedAt: undefined
      },
      {
        id: 'task-3',
        name: 'Плановое сканирование',
        description: 'Регулярная проверка безопасности',
        unitIds: ['unit-2'],
        hostIds: ['host-2-1'],
        scriptIds: ['script-2'],
        autoFix: false,
        parallelExecution: true,
        generateReport: true,
        status: 'pending',
        progress: 0,
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        startedAt: undefined,
        completedAt: undefined
      }
    ];
  }

  // Mock данные для отчетов
  private async getReports(): Promise<Report[]> {
    return [
      {
        id: 'report-1',
        name: 'Отчет по полному сканированию',
        taskId: 'task-1',
        format: 'pdf',
        content: 'Mock report content',
        generatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        fileSize: 1024
      },
      {
        id: 'report-2',
        name: 'Сводный отчет за месяц',
        taskId: 'task-2',
        format: 'html',
        content: 'Monthly summary report content',
        generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        fileSize: 2048
      }
    ];
  }

  // Mock данные для настроек
  private async getSettings(): Promise<AuditSettings> {
    return {
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
  }

  // Mock метод для запуска сканирования
  private async startScan(command: StartScanCommand): Promise<{ scanId: string; taskId: string }> {
    const taskId = `task-${Date.now()}`;
    logger.info(`Mock scan started: ${taskId}`, command);

    return {
      scanId: `scan-${Date.now()}`,
      taskId
    };
  }

  // Mock метод для авторизации с логином admin:123
  private async handleLogin(credentials: { username: string; password: string }): Promise<{ token: string; user: Record<string, unknown> }> {
    if (credentials.username === 'admin' && credentials.password === '123') {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'user-1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'administrator',
          firstName: 'Администратор',
          lastName: 'Системы'
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  // Mock метод для выхода
  private async handleLogout(): Promise<{ success: boolean }> {
    return { success: true };
  }

  // Mock метод для валидации токена
  private async handleTokenValidation(data: { token: string }): Promise<{ valid: boolean }> {
    return { valid: data.token.includes('mock-jwt-token') };
  }

  // Mock метод для обновления токена
  private async handleTokenRefresh(): Promise<{ token: string }> {
    return {
      token: 'mock-jwt-token-refreshed-' + Date.now()
    };
  }

  private getRandomDelay(): number {
    return Math.random() * 500 + 200; // 200-700ms
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockService = MockService.getInstance();
