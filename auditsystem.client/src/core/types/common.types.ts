/**
 * Общие типы для всего приложения
 */

export type Theme = 'light' | 'dark' | 'auto';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}
