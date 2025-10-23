/**
 * Утилиты для работы с датами и временем
 */

/**
 * Форматирование временной метки в относительное время
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'только что';
  if (diffMins === 1) return '1 минуту назад';
  if (diffMins < 5) return `${diffMins} минуты назад`;
  if (diffMins < 60) return `${diffMins} минут назад`;
  if (diffHours === 1) return '1 час назад';
  if (diffHours < 24) return `${diffHours} часов назад`;
  if (diffDays === 1) return '1 день назад';
  if (diffDays < 7) return `${diffDays} дней назад`;

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Форматирование времени для отображения
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Форматирование даты и времени
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Проверка, является ли дата сегодняшним днем
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Проверка, является ли дата вчерашним днем
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

/**
 * Получение разницы между двумя датами в миллисекундах
 */
export const getTimeDifference = (date1: Date, date2: Date): number => {
  return Math.abs(date1.getTime() - date2.getTime());
};

/**
 * Добавление времени к дате
 */
export const addTime = (date: Date, amount: number, unit: 'ms' | 's' | 'm' | 'h' | 'd'): Date => {
  const newDate = new Date(date);
  
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
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}ч ${minutes % 60}м`;
  }
  if (minutes > 0) {
    return `${minutes}м ${seconds % 60}с`;
  }
  return `${seconds}с`;
};

export default {
  formatRelativeTime,
  formatTime,
  formatDateTime,
  isToday,
  isYesterday,
  getTimeDifference,
  addTime,
  formatDuration
};
