/**
 * Типы для auth store
 */

import type { UserDto } from '@/modules/auth/api/types';
import type { LoginRequest } from '@/modules/auth/api/types';

export interface AuthState {
  token: string | null;
  user: UserDto | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  lastTokenRefresh: number | null;
}

export interface TokenValidationResult {
  isValid: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
}

export interface AuthStore extends AuthState {
  isAuthenticated: boolean;
  tokenExpiresIn: number;
  needsTokenRefresh: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  refreshAuthToken: () => Promise<string | null>;
  setAuthData: (token: string, user: UserDto, refreshToken?: string) => void;
  clearAuthData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  startTokenRefreshMonitor: () => void;
  stopTokenRefreshMonitor: () => void;
}
