/**
 * Конфигурация функциональных возможностей приложения
 */

export interface FeatureFlags {
  // Авторизация и безопасность
  auth: {
    enabled: boolean;
    multiFactorAuth: boolean;
    sessionTimeout: boolean;
    automaticLogout: boolean;
    passwordPolicy: {
      enabled: boolean;
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };

  // Аудит и мониторинг
  audit: {
    realtimeMonitoring: boolean;
    automatedScans: boolean;
    vulnerabilityDetection: boolean;
    complianceChecking: boolean;
    reportGeneration: boolean;
  };

  // UI/UX возможности
  ui: {
    darkMode: boolean;
    themeSwitching: boolean;
    animations: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
    keyboardNavigation: boolean;
  };

  // Производительность
  performance: {
    lazyLoading: boolean;
    codeSplitting: boolean;
    caching: boolean;
    compression: boolean;
    prefetching: boolean;
  };

  // Уведомления
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    browserNotifications: boolean;
    soundNotifications: boolean;
  };

  // Экспериментальные функции
  experimental: {
    [key: string]: boolean;
  };
}

export const FEATURE_FLAGS: FeatureFlags = {
  auth: {
    enabled: true,
    multiFactorAuth: false,
    sessionTimeout: true,
    automaticLogout: true,
    passwordPolicy: {
      enabled: true,
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  },

  audit: {
    realtimeMonitoring: true,
    automatedScans: true,
    vulnerabilityDetection: true,
    complianceChecking: true,
    reportGeneration: true
  },

  ui: {
    darkMode: true,
    themeSwitching: true,
    animations: true,
    reducedMotion: true,
    highContrast: true,
    keyboardNavigation: true
  },

  performance: {
    lazyLoading: true,
    codeSplitting: true,
    caching: true,
    compression: true,
    prefetching: false
  },

  notifications: {
    pushNotifications: true,
    emailNotifications: false,
    browserNotifications: true,
    soundNotifications: false
  },

  experimental: {
    aiAssistedScans: false,
    predictiveAnalysis: false,
    voiceCommands: false
  }
};

export const isFeatureEnabled = (featurePath: string): boolean => {
  const parts = featurePath.split('.');
  let current: any = FEATURE_FLAGS;

  for (const part of parts) {
    if (current[part] === undefined) {
      return false;
    }
    current = current[part];
  }

  return Boolean(current);
};

export const setFeatureFlag = (featurePath: string, value: boolean): void => {
  const parts = featurePath.split('.');
  let current: any = FEATURE_FLAGS;

  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] === undefined) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
};

export const getFeatureDescription = (featurePath: string): string => {
  const descriptions: Record<string, string> = {
    'auth.enabled': 'Включение системы аутентификации',
    'auth.multiFactorAuth': 'Двухфакторная аутентификация',
    'audit.realtimeMonitoring': 'Мониторинг в реальном времени',
    'audit.automatedScans': 'Автоматизированное сканирование',
    'ui.darkMode': 'Темная тема интерфейса',
    'performance.lazyLoading': 'Ленивая загрузка компонентов',
    'notifications.pushNotifications': 'Push-уведомления'
  };

  return descriptions[featurePath] || featurePath;
};
