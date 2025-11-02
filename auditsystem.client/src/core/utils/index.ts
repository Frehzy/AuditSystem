// src/core/utils/index.ts

// Импорт утилит
import * as dateUtils from './date.utils';
import * as domUtils from './dom.utils';
import * as logger from './logger';
import * as textUtils from './text.utils';
import * as urlUtils from './url.utils';
import * as validation from './validation.rules';

// Типы
export type {
  TimeUnit,
  CaseType,
  ValidationRule,
  ValidationResult,
  ValidationConfig,
  UrlParams,
  PaginationParams,
  ApiResponse,
  CacheConfig,
  DebounceOptions,
  ThrottleOptions,
  LogLevel,
  LogContext,
  LogEntry,
  LoggerConfig,
  ElementSelector,
  AnimationOptions,
  CreateElementOptions,
  TextAnalysisResult,
  TextGenerationOptions,
  TextCleanOptions,
  PerformanceMetric,
  DeepPartial,
  Optional,
  Nullable
} from './types';

// Экспорт утилит с явными именами
export { dateUtils, domUtils, logger, textUtils, urlUtils, validation };

/**
 * Утилитарные функции общего назначения с улучшенной производительностью и безопасностью
 */

// Расширенный дебаунс с опциями
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {}
): ((...args: Parameters<T>) => void) => {
  const { leading = false, trailing = true, maxWait } = options;

  let timeout: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let result: unknown;
  let lastArgs: Parameters<T> | null = null;

  const invokeFunc = (time: number) => {
    const args = lastArgs!;
    lastArgs = null;
    lastInvokeTime = time;
    result = func(...args);
    return result;
  };

  const startTimer = (pendingFunc: () => void, waitTime: number) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(pendingFunc, waitTime);
  };

  const shouldInvoke = (time: number) => {
    if (lastCallTime === null) return true;

    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const trailingEdge = (time: number) => {
    timeout = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = null;
    return result;
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }

    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    const remainingWait = maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;

    startTimer(timerExpired, remainingWait);
  };

  const debounced = (...args: Parameters<T>): void => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === null) {
        lastInvokeTime = time;
        startTimer(timerExpired, wait);

        if (leading) {
          result = invokeFunc(time);
        }
      } else if (maxWait !== undefined) {
        startTimer(timerExpired, wait);
        result = invokeFunc(time);
      }
    }

    if (timeout === null) {
      startTimer(timerExpired, wait);
    }
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    lastCallTime = null;
    lastArgs = null;
    timeout = null;
  };

  debounced.flush = () => {
    if (timeout) {
      trailingEdge(Date.now());
    }
    return result;
  };

  return debounced;
};

// Расширенный троттлинг с опциями
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): ((...args: Parameters<T>) => void) => {
  const { leading = true, trailing = true } = options;

  let timeout: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let result: unknown;
  let lastArgs: Parameters<T> | null = null;

  const invokeFunc = (time: number) => {
    const args = lastArgs!;
    lastArgs = null;
    lastInvokeTime = time;
    result = func(...args);
    return result;
  };

  const trailingEdge = (time: number) => {
    timeout = null;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = null;
    return result;
  };

  const throttled = (...args: Parameters<T>): void => {
    const time = Date.now();
    lastArgs = args;

    if (lastCallTime === null && leading === false) {
      lastCallTime = time;
    }

    const remaining = limit - (time - lastInvokeTime);

    if (remaining <= 0 || remaining > limit) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      lastInvokeTime = time;
      result = invokeFunc(time);
    } else if (!timeout && trailing !== false) {
      timeout = setTimeout(() => trailingEdge(time), remaining);
    }
  };

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    lastCallTime = null;
    lastArgs = null;
    timeout = null;
  };

  throttled.flush = () => {
    if (timeout) {
      trailingEdge(Date.now());
    }
    return result;
  };

  return throttled;
};

// Глубокое клонирование с поддержкой циклических ссылок
export const deepClone = <T>(obj: T, seen = new WeakMap()): T => {
  // Примитивы и функции
  if (obj === null || typeof obj !== 'object') return obj;

  // Обработка циклических ссылок
  if (seen.has(obj)) return seen.get(obj) as T;

  // Специальные типы
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof RegExp) return new RegExp(obj) as unknown as T;
  if (obj instanceof Map) {
    const clonedMap = new Map();
    seen.set(obj, clonedMap);
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key, seen), deepClone(value, seen));
    });
    return clonedMap as unknown as T;
  }
  if (obj instanceof Set) {
    const clonedSet = new Set();
    seen.set(obj, clonedSet);
    obj.forEach(value => {
      clonedSet.add(deepClone(value, seen));
    });
    return clonedSet as unknown as T;
  }
  if (obj instanceof ArrayBuffer) return obj.slice(0) as unknown as T;
  if (ArrayBuffer.isView(obj)) {
    return new (obj.constructor as any)(deepClone(obj.buffer, seen));
  }

  // Массивы
  if (Array.isArray(obj)) {
    const clonedArray: unknown[] = [];
    seen.set(obj, clonedArray);
    obj.forEach(item => {
      clonedArray.push(deepClone(item, seen));
    });
    return clonedArray as unknown as T;
  }

  // Объекты
  if (typeof obj === 'object') {
    const cloned = Object.create(Object.getPrototypeOf(obj));
    seen.set(obj, cloned);

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key], seen);
      }
    }

    // Символы
    const symbols = Object.getOwnPropertySymbols(obj);
    for (const symbol of symbols) {
      (cloned as any)[symbol] = deepClone((obj as any)[symbol], seen);
    }

    return cloned;
  }

  return obj;
};

// Глубокое сравнение с поддержкой специальных типов
export const deepEqual = (obj1: unknown, obj2: unknown, seen = new WeakMap()): boolean => {
  // Строгое равенство
  if (obj1 === obj2) return true;

  // Разные типы
  if (typeof obj1 !== typeof obj2) return false;

  // null/undefined
  if (obj1 == null || obj2 == null) return obj1 === obj2;

  // Обработка циклических ссылок
  if (seen.has(obj1) && seen.has(obj2)) {
    return seen.get(obj1) === seen.get(obj2);
  }
  seen.set(obj1, obj2);
  seen.set(obj2, obj1);

  // Специальные типы
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }
  if (obj1 instanceof RegExp && obj2 instanceof RegExp) {
    return obj1.toString() === obj2.toString();
  }
  if (obj1 instanceof Map && obj2 instanceof Map) {
    if (obj1.size !== obj2.size) return false;
    for (const [key, value] of obj1) {
      if (!obj2.has(key) || !deepEqual(value, obj2.get(key), seen)) {
        return false;
      }
    }
    return true;
  }
  if (obj1 instanceof Set && obj2 instanceof Set) {
    if (obj1.size !== obj2.size) return false;
    for (const value of obj1) {
      if (!obj2.has(value)) return false;
    }
    return true;
  }
  if (ArrayBuffer.isView(obj1) && ArrayBuffer.isView(obj2)) {
    if (obj1.byteLength !== obj2.byteLength) return false;
    return new Uint8Array(obj1 as any).every((val, i) =>
      val === new Uint8Array(obj2 as any)[i]
    );
  }

  // Массивы
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqual(item, obj2[index], seen));
  }

  // Объекты
  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key) || !deepEqual(
        (obj1 as any)[key],
        (obj2 as any)[key],
        seen
      )) {
        return false;
      }
    }

    // Символы
    const symbols1 = Object.getOwnPropertySymbols(obj1);
    const symbols2 = Object.getOwnPropertySymbols(obj2);

    if (symbols1.length !== symbols2.length) return false;

    for (const symbol of symbols1) {
      if (!deepEqual(
        (obj1 as any)[symbol],
        (obj2 as any)[symbol],
        seen
      )) {
        return false;
      }
    }

    return true;
  }

  return false;
};

// Уникальный ID с улучшенной энтропией
export const generateId = (prefix: string = '', separator: string = '_'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 11);
  const processId = typeof process !== 'undefined' && process.pid
    ? process.pid.toString(36)
    : Math.random().toString(36).substr(2, 4);

  return `${prefix}${separator}${timestamp}${separator}${random}${separator}${processId}`;
};

// UUID v4 генерация
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Проверка типа с улучшенной точностью
export const typeCheck = {
  isString: (value: unknown): value is string => typeof value === 'string',
  isNumber: (value: unknown): value is number => typeof value === 'number' && !isNaN(value),
  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',
  isArray: (value: unknown): value is unknown[] => Array.isArray(value),
  isObject: (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  isFunction: (value: unknown): value is (...args: unknown[]) => unknown =>
    typeof value === 'function',
  isNull: (value: unknown): value is null => value === null,
  isUndefined: (value: unknown): value is undefined => value === undefined,
  isSymbol: (value: unknown): value is symbol => typeof value === 'symbol',
  isDate: (value: unknown): value is Date => value instanceof Date,
  isRegExp: (value: unknown): value is RegExp => value instanceof RegExp,
  isMap: (value: unknown): value is Map<unknown, unknown> => value instanceof Map,
  isSet: (value: unknown): value is Set<unknown> => value instanceof Set,
  isPromise: (value: unknown): value is Promise<unknown> =>
    value instanceof Promise ||
    (typeof value === 'object' && value !== null && 'then' in value && 'catch' in value),

  isEmpty: (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    if (typeof value === 'number') return isNaN(value);
    return false;
  },

  isPrimitive: (value: unknown): boolean => {
    return value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'symbol' ||
      typeof value === 'undefined';
  }
};

// Форматирование с улучшенной локализацией
export const format = {
  currency: (
    amount: number,
    currency: string = 'RUB',
    locale: string = 'ru-RU',
    options?: Intl.NumberFormatOptions
  ): string => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        ...options
      }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  },

  percentage: (value: number, decimals: number = 1, locale: string = 'ru-RU'): string => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value / 100);
    } catch {
      return `${value.toFixed(decimals)}%`;
    }
  },

  plural: (count: number, words: [string, string, string]): string => {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[
      count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]
    ];
  },

  bytes: (bytes: number, decimals: number = 1, binary: boolean = false): string => {
    return textUtils.format.fileSize(bytes, decimals, binary);
  },

  phone: (phone: string, format: string = '+7 (XXX) XXX-XX-XX'): string => {
    return textUtils.format.phone(phone, format);
  }
};

// Утилиты для работы с коллекциями
export const collection = {
  groupBy: <T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> => {
    const groups: Record<string, T[]> = {};

    array.forEach(item => {
      const groupKey = typeof key === 'function'
        ? key(item)
        : String(item[key]);

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push(item);
    });

    return groups;
  },

  keyBy: <T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T> => {
    const result: Record<string, T> = {};

    array.forEach(item => {
      const itemKey = typeof key === 'function'
        ? key(item)
        : String(item[key]);

      result[itemKey] = item;
    });

    return result;
  },

  uniq: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },

  uniqBy: <T>(array: T[], key: keyof T | ((item: T) => unknown)): T[] => {
    const seen = new Set();

    return array.filter(item => {
      const itemKey = typeof key === 'function'
        ? key(item)
        : item[key];

      if (seen.has(itemKey)) {
        return false;
      }

      seen.add(itemKey);
      return true;
    });
  },

  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  }
};

// Утилиты для работы с объектами
export const object = {
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;

    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });

    return result;
  },

  omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };

    keys.forEach(key => {
      delete result[key];
    });

    return result;
  },

  get: <T>(obj: unknown, path: string, defaultValue?: T): T | undefined => {
    if (!obj || typeof obj !== 'object') return defaultValue;

    const keys = path.split('.');
    let result: any = obj;

    for (const key of keys) {
      if (result === null || result === undefined) return defaultValue;
      result = result[key];
    }

    return result === undefined ? defaultValue : result;
  },

  set: <T extends object>(obj: T, path: string, value: unknown): T => {
    const keys = path.split('.');
    let current: any = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];

      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }

      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
  },

  merge: <T extends object, U extends object>(target: T, source: U): T & U => {
    const result = { ...target } as T & U;

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = (target as any)[key];

        if (typeCheck.isObject(sourceValue) && typeCheck.isObject(targetValue)) {
          (result as any)[key] = object.merge(targetValue, sourceValue);
        } else {
          (result as any)[key] = sourceValue;
        }
      }
    }

    return result;
  }
};

// Экспорт по умолчанию
export default {
  // Основные утилиты
  debounce,
  throttle,
  deepClone,
  deepEqual,
  generateId,
  generateUUID,

  // Вспомогательные модули
  typeCheck,
  format,
  collection,
  object,

  // Специализированные утилиты
  dateUtils,
  domUtils,
  logger,
  textUtils,
  urlUtils,
  validation
};
