/**
 * Типы для app store
 */

export interface AppState {
  name: string;
  version: string;
  isLoading: boolean;
  isInitialized: boolean;
  startupTime: number;
}

export interface AppStore extends AppState {
  uptime: number;
  formattedUptime: string;
  initialize: (name: string, version: string) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export interface AppSettings {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoSave: boolean;
  debugMode: boolean;
}
