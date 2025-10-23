/**
 * Утилиты для работы с URL
 */

/**
 * Парсинг и валидация URL
 */
export const parseUrl = (url: string): URL | null => {
  try {
    return new URL(url);
  } catch {
    return null;
  }
};

/**
 * Проверка валидности URL
 */
export const isValidUrl = (url: string): boolean => {
  return parseUrl(url) !== null;
};

/**
 * Обрезка URL для отображения
 */
export const truncateUrl = (url: string, maxLength: number = 22): string => {
  const parsed = parseUrl(url);

  if (!parsed) {
    return url.length > maxLength ? url.substring(0, maxLength - 3) + '...' : url;
  }

  let hostname = parsed.hostname;

  // Убираем www. если есть
  if (hostname.startsWith('www.')) {
    hostname = hostname.substring(4);
  }

  return hostname.length > maxLength ? hostname.substring(0, maxLength - 3) + '...' : hostname;
};

/**
 * Извлечение домена из URL
 */
export const extractDomain = (url: string): string => {
  const parsed = parseUrl(url);
  return parsed?.hostname || url;
};

/**
 * Создание абсолютного URL из относительного
 */
export const makeAbsoluteUrl = (relativeUrl: string, baseUrl: string): string => {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return relativeUrl;
  }
};

/**
 * Добавление параметров к URL
 */
export const addUrlParams = (url: string, params: Record<string, string>): string => {
  const urlObj = new URL(url);

  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  return urlObj.toString();
};

/**
 * Получение параметров из URL
 */
export const getUrlParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  const urlObj = new URL(url);

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
};

/**
 * Удаление параметров из URL
 */
export const removeUrlParams = (url: string, paramsToRemove: string[]): string => {
  const urlObj = new URL(url);

  paramsToRemove.forEach(param => {
    urlObj.searchParams.delete(param);
  });

  return urlObj.toString();
};

/**
 * Нормализация URL (добавление протокола если отсутствует)
 */
export const normalizeUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

export default {
  parseUrl,
  isValidUrl,
  truncateUrl,
  extractDomain,
  makeAbsoluteUrl,
  addUrlParams,
  getUrlParams,
  removeUrlParams,
  normalizeUrl
};
