import type { CaseType } from './types';

/**
 * Улучшенные утилиты для работы с текстом
 */

/**
 * Обрезка текста с учетом слов
 */
export const truncateText = (
  text: string,
  maxLength: number,
  options: {
    suffix?: string;
    preserveWords?: boolean;
  } = {}
): string => {
  const { suffix = '...', preserveWords = true } = options;

  if (text.length <= maxLength) return text;

  if (!preserveWords) {
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  let truncated = text.substring(0, maxLength - suffix.length);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    truncated = truncated.substring(0, lastSpaceIndex);
  }

  return truncated.trim() + suffix;
};

/**
 * Преобразование регистра
 */
export const changeCase = (text: string, targetCase: CaseType): string => {
  switch (targetCase) {
    case 'camel':
      return text.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');

    case 'kebab':
      return text
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();

    case 'snake':
      return text
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();

    case 'pascal':
      return text
        .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
        .replace(/^(.)/, (_, char) => char.toUpperCase());

    default:
      return text;
  }
};

/**
 * Работа с регистром
 */
export const caseUtils = {
  camel: (text: string) => changeCase(text, 'camel'),
  kebab: (text: string) => changeCase(text, 'kebab'),
  snake: (text: string) => changeCase(text, 'snake'),
  pascal: (text: string) => changeCase(text, 'pascal'),

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  uncapitalize: (text: string): string => {
    return text.charAt(0).toLowerCase() + text.slice(1);
  },

  title: (text: string): string => {
    return text.replace(/\w\S*/g, (word) =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  },

  sentence: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
};

/**
 * Очистка и нормализация текста
 */
export const cleanText = (text: string, options: {
  normalizeSpaces?: boolean;
  removeExtraSpaces?: boolean;
  trim?: boolean;
} = {}): string => {
  const {
    normalizeSpaces = true,
    removeExtraSpaces = true,
    trim = true
  } = options;

  let cleaned = text;

  if (normalizeSpaces) {
    cleaned = cleaned.replace(/\s+/g, ' ');
  }

  if (removeExtraSpaces) {
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
  }

  if (trim) {
    cleaned = cleaned.trim();
  }

  return cleaned;
};

/**
 * Безопасная работа с HTML
 */
export const htmlUtils = {
  escape: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  unescape: (text: string): string => {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent || div.innerText || '';
  },

  stripTags: (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
};

/**
 * Генерация текста
 */
export const generate = {
  randomString: (length: number = 8, options: {
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
  } = {}): string => {
    const {
      includeNumbers = true,
      includeSymbols = false,
      includeUppercase = true,
      includeLowercase = true
    } = options;

    let chars = '';
    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) throw new Error('At least one character set must be included');

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  },

  id: (prefix: string = 'id'): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
};

/**
 * Анализ текста
 */
export const analyze = {
  words: (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  characters: (text: string, options: { includeSpaces?: boolean } = {}): number => {
    const { includeSpaces = true } = options;
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
  },

  readingTime: (text: string, wordsPerMinute: number = 200): number => {
    const words = analyze.words(text);
    return Math.ceil(words / wordsPerMinute);
  }
};

/**
 * Форматирование значений
 */
export const format = {
  number: (number: number, locale: string = 'ru-RU', options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(locale, options).format(number);
  },

  fileSize: (bytes: number, decimals: number = 1): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  },

  phone: (phone: string, format: string = '+7 (XXX) XXX-XX-XX'): string => {
    const numbers = phone.replace(/\D/g, '');
    let result = format;

    numbers.split('').forEach(number => {
      result = result.replace('X', number);
    });

    return result.replace(/X/g, '');
  }
};

/**
 * Создание slug
 */
export const createSlug = (text: string, separator: string = '-'): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, separator)
    .replace(new RegExp(`${separator}+`, 'g'), separator)
    .trim();
};

/**
 * Проверка текста
 */
export const validate = {
  isEmpty: (text: string): boolean => {
    return text.trim().length === 0;
  },

  isEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  isUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

export default {
  truncateText,
  changeCase,
  caseUtils,
  cleanText,
  htmlUtils,
  generate,
  analyze,
  format,
  createSlug,
  validate
};
