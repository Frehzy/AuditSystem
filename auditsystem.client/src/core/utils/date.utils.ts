import type { TimeUnit } from './types';

/**
 * Утилиты для работы с датами и временем
 */

/**
 * Форматирование временной метки в относительное время
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const targetDate = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) {
    if (diffMins === 1) return '1 минуту назад';
    if (diffMins < 5) return `${diffMins} минуты назад`;
    return `${diffMins} минут назад`;
  }

  if (diffHours < 24) {
    if (diffHours === 1) return '1 час назад';
    if (diffHours < 5) return `${diffHours} часа назад`;
    return `${diffHours} часов назад`;
  }

  if (diffDays < 7) {
    if (diffDays === 1) return 'вчера';
    if (diffDays === 2) return 'позавчера';
    return `${diffDays} дней назад`;
  }

  if (diffWeeks < 4) {
    if (diffWeeks === 1) return '1 неделю назад';
    return `${diffWeeks} недель назад`;
  }

  if (diffMonths < 12) {
    if (diffMonths === 1) return '1 месяц назад';
    if (diffMonths < 5) return `${diffMonths} месяца назад`;
    return `${diffMonths} месяцев назад`;
  }

  return formatDate(targetDate);
};

/**
 * Форматирование времени
 */
export const formatTime = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
  const targetDate = new Date(date);
  return targetDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  });
};

/**
 * Форматирование даты
 */
export const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
  const targetDate = new Date(date);
  return targetDate.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  });
};

/**
 * Форматирование даты и времени
 */
export const formatDateTime = (date: Date | string | number, options?: Intl.DateTimeFormatOptions): string => {
  const targetDate = new Date(date);
  return targetDate.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  });
};

/**
 * Проверка, является ли дата сегодняшним днем
 */
export const isToday = (date: Date | string | number): boolean => {
  const targetDate = new Date(date);
  const today = new Date();
  return targetDate.toDateString() === today.toDateString();
};

/**
 * Проверка, является ли дата вчерашним днем
 */
export const isYesterday = (date: Date | string | number): boolean => {
  const targetDate = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return targetDate.toDateString() === yesterday.toDateString();
};

/**
 * Проверка, является ли дата завтрашним днем
 */
export const isTomorrow = (date: Date | string | number): boolean => {
  const targetDate = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return targetDate.toDateString() === tomorrow.toDateString();
};

/**
 * Получение разницы между двумя датами
 */
export const getTimeDifference = (
  date1: Date | string | number,
  date2: Date | string | number,
  unit: TimeUnit = 'ms'
): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d1.getTime() - d2.getTime());

  switch (unit) {
    case 's': return Math.floor(diffMs / 1000);
    case 'm': return Math.floor(diffMs / 60000);
    case 'h': return Math.floor(diffMs / 3600000);
    case 'd': return Math.floor(diffMs / 86400000);
    default: return diffMs;
  }
};

/**
 * Добавление времени к дате
 */
export const addTime = (
  date: Date | string | number,
  amount: number,
  unit: TimeUnit
): Date => {
  const targetDate = new Date(date);
  const newDate = new Date(targetDate);

  switch (unit) {
    case 'ms':
      newDate.setMilliseconds(newDate.getMilliseconds() + amount);
      break;
    case 's':
      newDate.setSeconds(newDate.getSeconds() + amount);
      break;
    case 'm':
      newDate.setMinutes(newDate.getMinutes() + amount);
      break;
    case 'h':
      newDate.setHours(newDate.getHours() + amount);
      break;
    case 'd':
      newDate.setDate(newDate.getDate() + amount);
      break;
  }

  return newDate;
};

/**
 * Форматирование длительности
 */
export const formatDuration = (ms: number, detailed: boolean = false): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (detailed) {
    const parts = [];
    if (days > 0) parts.push(`${days}д`);
    if (hours % 24 > 0) parts.push(`${hours % 24}ч`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}м`);
    if (seconds % 60 > 0) parts.push(`${seconds % 60}с`);
    return parts.join(' ') || '0с';
  }

  if (days > 0) return `${days}д ${hours % 24}ч`;
  if (hours > 0) return `${hours}ч ${minutes % 60}м`;
  if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
  return `${seconds}с`;
};

/**
 * Получение начала дня
 */
export const startOfDay = (date: Date | string | number): Date => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
};

/**
 * Получение конца дня
 */
export const endOfDay = (date: Date | string | number): Date => {
  const targetDate = new Date(date);
  targetDate.setHours(23, 59, 59, 999);
  return targetDate;
};

/**
 * Проверка находится ли дата между двумя датами
 */
export const isBetween = (
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number
): boolean => {
  const targetDate = new Date(date).getTime();
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  return targetDate >= startDate && targetDate <= endDate;
};

export default {
  formatRelativeTime,
  formatTime,
  formatDate,
  formatDateTime,
  isToday,
  isYesterday,
  isTomorrow,
  getTimeDifference,
  addTime,
  formatDuration,
  startOfDay,
  endOfDay,
  isBetween
};
