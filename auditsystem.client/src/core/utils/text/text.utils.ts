/**
 * Утилиты для работы с текстом и строками
 */

/**
 * Обрезка текста с добавлением многоточия
 */
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength - suffix.length);
  return truncated.trim() + suffix;
};

/**
 * Преобразование в camelCase
 */
export const toCamelCase = (text: string): string => {
  return text.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
};

/**
 * Преобразование в kebab-case
 */
export const toKebabCase = (text: string): string => {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Преобразование в snake_case
 */
export const toSnakeCase = (text: string): string => {
  return text
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * Преобразование в PascalCase
 */
export const toPascalCase = (text: string): string => {
  return text
    .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^(.)/, (_, char) => char.toUpperCase());
};

/**
 * Преобразование первого символа в верхний регистр
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Преобразование первого символа в нижний регистр
 */
export const uncapitalize = (text: string): string => {
  return text.charAt(0).toLowerCase() + text.slice(1);
};

/**
 * Преобразование в заголовок (каждое слово с большой буквы)
 */
export const toTitleCase = (text: string): string => {
  return text.replace(/\w\S*/g, (word) => capitalize(word.toLowerCase()));
};

/**
 * Удаление лишних пробелов
 */
export const normalizeSpaces = (text: string): string => {
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Экранирование HTML
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Деэкранирование HTML
 */
export const unescapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
};

/**
 * Генерация случайной строки
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * Подсчет слов в тексте
 */
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Подсчет символов в тексте
 */
export const countCharacters = (text: string, includeSpaces: boolean = true): number => {
  if (includeSpaces) {
    return text.length;
  }
  return text.replace(/\s/g, '').length;
};

/**
 * Обрезка текста по словам
 */
export const truncateWords = (text: string, maxWords: number, suffix: string = '...'): string => {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) return text;

  return words.slice(0, maxWords).join(' ') + suffix;
};

/**
 * Форматирование числа с разделителями
 */
export const formatNumber = (number: number, locale: string = 'ru-RU'): string => {
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Форматирование размера файла
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

/**
 * Проверка на пустую строку
 */
export const isEmptyString = (text: string): boolean => {
  return text.trim().length === 0;
};

/**
 * Удаление диакритических знаков
 */
export const removeDiacritics = (text: string): string => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Создание slug из текста
 */
export const createSlug = (text: string): string => {
  return removeDiacritics(text)
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default {
  truncateText,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  toPascalCase,
  capitalize,
  uncapitalize,
  toTitleCase,
  normalizeSpaces,
  escapeHtml,
  unescapeHtml,
  generateRandomString,
  countWords,
  countCharacters,
  truncateWords,
  formatNumber,
  formatFileSize,
  isEmptyString,
  removeDiacritics,
  createSlug
};
