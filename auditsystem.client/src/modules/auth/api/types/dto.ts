/**
 * DTO для модуля авторизации
 */

export interface UserDto {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  permissions: string[];
}

export interface SessionDto {
  id: string;
  userId: string;
  device?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}
