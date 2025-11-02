import type { TimeUnit } from './types';

/**
 * Утилиты для работы с датами и временем
 */

// Константы для производительности
const MS_IN_MINUTE = 60 * 1000;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;
const MS_IN_WEEK = 7 * MS_IN_DAY;
const MS_IN_MONTH = 30 * MS_IN_DAY; // Приблизительно

/**
 * Безопасное создание Date объекта с валидацией
 */
const safeDate = (date: Date | string | number): Date => {
  if (date instanceof Date) return new Date(date.getTime());

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }

  return parsed;
};

/**
 * Форматирование временной метки в относительное время с улучшенной локализацией
 */
export const formatRelativeTime = (
  date: Date | string | number,
  options: {
    locale?: string;
    now?: Date;
  } = {}
): string => {
  try {
    const targetDate = safeDate(date);
    const now = options.now || new Date();
    const diffMs = now.getTime() - targetDate.getTime();
    const absDiffMs = Math.abs(diffMs);
    const isFuture = diffMs < 0;

    // Будущие даты
    if (isFuture) {
      const futureDiffMs = -diffMs;
      if (futureDiffMs < MS_IN_MINUTE) return 'скоро';
      if (futureDiffMs < MS_IN_HOUR) {
        const mins = Math.floor(futureDiffMs / MS_IN_MINUTE);
        return getFutureMinutesText(mins);
      }
      if (futureDiffMs < MS_IN_DAY) {
        const hours = Math.floor(futureDiffMs / MS_IN_HOUR);
        return getFutureHoursText(hours);
      }
      return formatDate(targetDate);
    }

    // Прошедшие даты
    const diffMins = Math.floor(absDiffMs / MS_IN_MINUTE);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return getPastMinutesText(diffMins);
    if (diffHours < 24) return getPastHoursText(diffHours);
    if (diffDays < 7) return getPastDaysText(diffDays);
    if (diffWeeks < 4) return getPastWeeksText(diffWeeks);
    if (diffMonths < 12) return getPastMonthsText(diffMonths);
    if (diffYears < 5) return getPastYearsText(diffYears);

    return formatDate(targetDate);
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return 'неизвестно';
  }
};

// Вспомогательные функции для текста относительного времени
const getFutureMinutesText = (mins: number): string => {
  if (mins === 1) return 'через 1 минуту';
  if (mins < 5) return `через ${mins} минуты`;
  return `через ${mins} минут`;
};

const getFutureHoursText = (hours: number): string => {
  if (hours === 1) return 'через 1 час';
  if (hours < 5) return `через ${hours} часа`;
  return `через ${hours} часов`;
};

const getPastMinutesText = (mins: number): string => {
  if (mins === 1) return '1 минуту назад';
  if (mins < 5) return `${mins} минуты назад`;
  return `${mins} минут назад`;
};

const getPastHoursText = (hours: number): string => {
  if (hours === 1) return '1 час назад';
  if (hours < 5) return `${hours} часа назад`;
  return `${hours} часов назад`;
};

const getPastDaysText = (days: number): string => {
  if (days === 1) return 'вчера';
  if (days === 2) return 'позавчера';
  return `${days} дней назад`;
};

const getPastWeeksText = (weeks: number): string => {
  if (weeks === 1) return '1 неделю назад';
  if (weeks < 5) return `${weeks} недели назад`;
  return `${weeks} недель назад`;
};

const getPastMonthsText = (months: number): string => {
  if (months === 1) return '1 месяц назад';
  if (months < 5) return `${months} месяца назад`;
  return `${months} месяцев назад`;
};

const getPastYearsText = (years: number): string => {
  if (years === 1) return '1 год назад';
  if (years < 5) return `${years} года назад`;
  return `${years} лет назад`;
};

/**
 * Форматирование времени с улучшенными опциями
 */
export const formatTime = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions & { locale?: string } = {}
): string => {
  try {
    const targetDate = safeDate(date);
    const { locale = 'ru-RU', ...timeOptions } = options;

    return targetDate.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      ...timeOptions
    });
  } catch (error) {
    console.warn('Error formatting time:', error);
    return '--:--';
  }
};

/**
 * Форматирование даты с улучшенными опциями
 */
export const formatDate = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions & { locale?: string } = {}
): string => {
  try {
    const targetDate = safeDate(date);
    const { locale = 'ru-RU', ...dateOptions } = options;

    return targetDate.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...dateOptions
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '--.--.----';
  }
};

/**
 * Форматирование даты и времени с улучшенными опциями
 */
export const formatDateTime = (
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions & { locale?: string } = {}
): string => {
  try {
    const targetDate = safeDate(date);
    const { locale = 'ru-RU', ...dateTimeOptions } = options;

    return targetDate.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...dateTimeOptions
    });
  } catch (error) {
    console.warn('Error formatting date time:', error);
    return '--.--.---- --:--';
  }
};

/**
 * Расширенное форматирование даты с шаблонами
 */
export const formatDateCustom = (
  date: Date | string | number,
  formatString: string = 'DD.MM.YYYY'
): string => {
  try {
    const targetDate = safeDate(date);

    const tokens: Record<string, () => string> = {
      'YYYY': () => targetDate.getFullYear().toString(),
      'YY': () => targetDate.getFullYear().toString().slice(-2),
      'MMMM': () => targetDate.toLocaleDateString('ru-RU', { month: 'long' }),
      'MMM': () => targetDate.toLocaleDateString('ru-RU', { month: 'short' }),
      'MM': () => (targetDate.getMonth() + 1).toString().padStart(2, '0'),
      'M': () => (targetDate.getMonth() + 1).toString(),
      'DD': () => targetDate.getDate().toString().padStart(2, '0'),
      'D': () => targetDate.getDate().toString(),
      'HH': () => targetDate.getHours().toString().padStart(2, '0'),
      'H': () => targetDate.getHours().toString(),
      'mm': () => targetDate.getMinutes().toString().padStart(2, '0'),
      'm': () => targetDate.getMinutes().toString(),
      'ss': () => targetDate.getSeconds().toString().padStart(2, '0'),
      's': () => targetDate.getSeconds().toString(),
    };

    return formatString.replace(
      /YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|mm|m|ss|s/g,
      (match) => tokens[match]?.() || match
    );
  } catch (error) {
    console.warn('Error in custom date formatting:', error);
    return formatString;
  }
};

/**
 * Проверка, является ли дата сегодняшним днем
 */
export const isToday = (date: Date | string | number): boolean => {
  try {
    const targetDate = safeDate(date);
    const today = new Date();
    return targetDate.toDateString() === today.toDateString();
  } catch {
    return false;
  }
};

/**
 * Проверка, является ли дата вчерашним днем
 */
export const isYesterday = (date: Date | string | number): boolean => {
  try {
    const targetDate = safeDate(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return targetDate.toDateString() === yesterday.toDateString();
  } catch {
    return false;
  }
};

/**
 * Проверка, является ли дата завтрашним днем
 */
export const isTomorrow = (date: Date | string | number): boolean => {
  try {
    const targetDate = safeDate(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return targetDate.toDateString() === tomorrow.toDateString();
  } catch {
    return false;
  }
};

/**
 * Проверка, является ли дата выходным днем
 */
export const isWeekend = (date: Date | string | number): boolean => {
  try {
    const targetDate = safeDate(date);
    const day = targetDate.getDay();
    return day === 0 || day === 6; // 0 = воскресенье, 6 = суббота
  } catch {
    return false;
  }
};

/**
 * Получение разницы между двумя датами с улучшенной обработкой
 */
export const getTimeDifference = (
  date1: Date | string | number,
  date2: Date | string | number,
  unit: TimeUnit = 'ms'
): number => {
  try {
    const d1 = safeDate(date1);
    const d2 = safeDate(date2);
    const diffMs = Math.abs(d1.getTime() - d2.getTime());

    switch (unit) {
      case 's': return Math.floor(diffMs / 1000);
      case 'm': return Math.floor(diffMs / MS_IN_MINUTE);
      case 'h': return Math.floor(diffMs / MS_IN_HOUR);
      case 'd': return Math.floor(diffMs / MS_IN_DAY);
      default: return diffMs;
    }
  } catch {
    return 0;
  }
};

/**
 * Добавление времени к дате с улучшенной безопасностью
 */
export const addTime = (
  date: Date | string | number,
  amount: number,
  unit: TimeUnit
): Date => {
  const targetDate = safeDate(date);
  const newDate = new Date(targetDate);

  // Используем временные метки для большей надежности
  const currentTime = newDate.getTime();

  switch (unit) {
    case 'ms':
      return new Date(currentTime + amount);
    case 's':
      return new Date(currentTime + amount * 1000);
    case 'm':
      return new Date(currentTime + amount * MS_IN_MINUTE);
    case 'h':
      return new Date(currentTime + amount * MS_IN_HOUR);
    case 'd':
      return new Date(currentTime + amount * MS_IN_DAY);
    default:
      return newDate;
  }
};

/**
 * Форматирование длительности с улучшенными опциями
 */
export const formatDuration = (
  ms: number,
  options: {
    detailed?: boolean;
    compact?: boolean;
    showZero?: boolean;
  } = {}
): string => {
  const { detailed = false, compact = false, showZero = false } = options;

  if (ms < 0) return '0с';

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (detailed) {
    const parts: string[] = [];

    if (days > 0 || showZero) parts.push(`${days}${compact ? 'д' : ' дн'}`);
    if (hours % 24 > 0 || showZero) parts.push(`${hours % 24}${compact ? 'ч' : ' ч'}`);
    if (minutes % 60 > 0 || showZero) parts.push(`${minutes % 60}${compact ? 'м' : ' мин'}`);
    if (seconds % 60 > 0 || showZero) parts.push(`${seconds % 60}${compact ? 'с' : ' сек'}`);

    return parts.length > 0 ? parts.join(' ') : `0${compact ? 'с' : ' сек'}`;
  }

  if (days > 0) return `${days}д ${hours % 24}ч`;
  if (hours > 0) return `${hours}ч ${minutes % 60}м`;
  if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
  return `${seconds}с`;
};

/**
 * Получение начала периода
 */
export const startOfPeriod = (
  date: Date | string | number,
  unit: 'day' | 'week' | 'month' | 'year' = 'day'
): Date => {
  const targetDate = safeDate(date);
  const newDate = new Date(targetDate);

  switch (unit) {
    case 'day':
      newDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      // Начало недели - понедельник
      const day = newDate.getDay();
      const diff = day === 0 ? 6 : day - 1; // Воскресенье -> 6 дней назад
      newDate.setDate(newDate.getDate() - diff);
      newDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      newDate.setDate(1);
      newDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      newDate.setMonth(0, 1);
      newDate.setHours(0, 0, 0, 0);
      break;
  }

  return newDate;
};

/**
 * Получение конца периода
 */
export const endOfPeriod = (
  date: Date | string | number,
  unit: 'day' | 'week' | 'month' | 'year' = 'day'
): Date => {
  const targetDate = safeDate(date);
  const newDate = new Date(targetDate);

  switch (unit) {
    case 'day':
      newDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      // Конец недели - воскресенье
      const day = newDate.getDay();
      const diff = day === 0 ? 0 : 7 - day;
      newDate.setDate(newDate.getDate() + diff);
      newDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() + 1, 0);
      newDate.setHours(23, 59, 59, 999);
      break;
    case 'year':
      newDate.setMonth(11, 31);
      newDate.setHours(23, 59, 59, 999);
      break;
  }

  return newDate;
};

// Алиасы для обратной совместимости
export const startOfDay = (date: Date | string | number): Date =>
  startOfPeriod(date, 'day');
export const endOfDay = (date: Date | string | number): Date =>
  endOfPeriod(date, 'day');

/**
 * Проверка находится ли дата между двумя датами с включением границ
 */
export const isBetween = (
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number,
  options: { inclusive?: boolean } = {}
): boolean => {
  try {
    const { inclusive = true } = options;
    const targetDate = safeDate(date).getTime();
    const startDate = safeDate(start).getTime();
    const endDate = safeDate(end).getTime();

    if (inclusive) {
      return targetDate >= startDate && targetDate <= endDate;
    }
    return targetDate > startDate && targetDate < endDate;
  } catch {
    return false;
  }
};

/**
 * Получение возраста от даты рождения
 */
export const getAge = (birthDate: Date | string | number): number => {
  try {
    const birth = safeDate(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch {
    return 0;
  }
};

/**
 * Валидация даты
 */
export const isValidDate = (date: unknown): date is Date | string | number => {
  try {
    if (date instanceof Date) return !isNaN(date.getTime());
    const testDate = new Date(date as any);
    return !isNaN(testDate.getTime());
  } catch {
    return false;
  }
};

export default {
  formatRelativeTime,
  formatTime,
  formatDate,
  formatDateTime,
  formatDateCustom,
  isToday,
  isYesterday,
  isTomorrow,
  isWeekend,
  getTimeDifference,
  addTime,
  formatDuration,
  startOfPeriod,
  endOfPeriod,
  startOfDay,
  endOfDay,
  isBetween,
  getAge,
  isValidDate,
  safeDate
};
