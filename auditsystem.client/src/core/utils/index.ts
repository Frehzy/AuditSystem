// src/core/utils/index.ts
// Импорт утилит
import * as dateUtils from './date.utils';
import * as domUtils from './dom.utils';
import * as logger from './logger';
import * as textUtils from './text.utils';
import * as urlUtils from './url.utils';
import * as validation from './validation.rules';

// Типы
export type { TimeUnit, CaseType, ValidationRule, ValidationResult, UrlParams } from './types';

// Экспорт утилит с явными именами
export { dateUtils, domUtils, logger, textUtils, urlUtils, validation };

/**
 * Утилитарные функции общего назначения
 */

// Дебаунс
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Троттлинг
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Глубокое клонирование
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

// Глубокое сравнение
export const deepEqual = (obj1: unknown, obj2: unknown): boolean => {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || obj1 === null ||
    typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
};

// Уникальный ID
export const generateId = (prefix: string = ''): string => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Проверка типа
export const typeCheck = {
  isString: (value: unknown): value is string => typeof value === 'string',
  isNumber: (value: unknown): value is number => typeof value === 'number' && !isNaN(value),
  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',
  isArray: (value: unknown): value is unknown[] => Array.isArray(value),
  isObject: (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value),
  isFunction: (value: unknown): value is (...args: unknown[]) => unknown => typeof value === 'function',
  isNull: (value: unknown): value is null => value === null,
  isUndefined: (value: unknown): value is undefined => value === undefined,
  isEmpty: (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  }
};

// Форматирование
export const format = {
  currency: (amount: number, currency: string = 'RUB', locale: string = 'ru-RU'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(amount);
  },

  percentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },

  plural: (count: number, words: [string, string, string]): string => {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[
      count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]
    ];
  }
};

// Default export для обратной совместимости
export default {
  // Утилиты
  dateUtils,
  domUtils,
  logger,
  textUtils,
  urlUtils,
  validation,

  // Общие функции
  debounce,
  throttle,
  deepClone,
  deepEqual,
  generateId,
  typeCheck,
  format
};
