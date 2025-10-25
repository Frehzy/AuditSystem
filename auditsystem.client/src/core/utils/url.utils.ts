import type { UrlParams } from './types';

/**
 * Улучшенные утилиты для работы с URL
 */

/**
 * Безопасный парсинг URL
 */
export const parseUrl = (url: string, base?: string): URL | null => {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
};

/**
 * Валидация URL
 */
export const isValidUrl = (url: string, base?: string): boolean => {
  return parseUrl(url, base) !== null;
};

/**
 * Проверка и нормализация URL
 */
export const normalizeUrl = (url: string, options: {
  forceHttps?: boolean;
  removeWWW?: boolean;
  removeTrailingSlash?: boolean;
  removeQueryParams?: string[];
} = {}): string | null => {
  const {
    forceHttps = true,
    removeWWW = true,
    removeTrailingSlash = true,
    removeQueryParams = []
  } = options;

  const parsed = parseUrl(url);
  if (!parsed) return null;

  // Протокол
  if (forceHttps) {
    parsed.protocol = 'https:';
  }

  // Хост
  if (removeWWW && parsed.hostname.startsWith('www.')) {
    parsed.hostname = parsed.hostname.slice(4);
  }

  // Путь
  if (removeTrailingSlash) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  }

  // Параметры запроса
  if (removeQueryParams.length > 0) {
    const params = new URLSearchParams(parsed.search);
    removeQueryParams.forEach(param => params.delete(param));
    parsed.search = params.toString();
  }

  return parsed.toString();
};

/**
 * Работа с параметрами запроса
 */
export const queryParams = {
  parse: (queryString: string): UrlParams => {
    const params: UrlParams = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    return params;
  },

  stringify: (params: UrlParams): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, value);
      }
    });

    return searchParams.toString();
  },

  get: (url: string, param: string): string | null => {
    const parsed = parseUrl(url);
    return parsed ? parsed.searchParams.get(param) : null;
  },

  set: (url: string, params: UrlParams): string | null => {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        parsed.searchParams.delete(key);
      } else {
        parsed.searchParams.set(key, value);
      }
    });

    return parsed.toString();
  },

  remove: (url: string, ...params: string[]): string | null => {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    params.forEach(param => parsed.searchParams.delete(param));

    return parsed.toString();
  },

  has: (url: string, param: string): boolean => {
    const parsed = parseUrl(url);
    return parsed ? parsed.searchParams.has(param) : false;
  }
};

/**
 * Работа с путями
 */
export const pathUtils = {
  join: (...segments: string[]): string => {
    return segments
      .map(segment => segment.replace(/^\/+|\/+$/g, ''))
      .filter(segment => segment.length > 0)
      .join('/');
  },

  resolve: (base: string, ...segments: string[]): string => {
    const allSegments = [base, ...segments];
    return pathUtils.join(...allSegments);
  },

  basename: (path: string): string => {
    return path.split('/').pop() || '';
  },

  dirname: (path: string): string => {
    const segments = path.split('/');
    segments.pop();
    return segments.join('/');
  },

  extension: (path: string): string => {
    const basename = pathUtils.basename(path);
    const lastDotIndex = basename.lastIndexOf('.');
    return lastDotIndex > 0 ? basename.slice(lastDotIndex + 1) : '';
  }
};

/**
 * Работа с хешами
 */
export const hashUtils = {
  get: (url: string): string => {
    const parsed = parseUrl(url);
    return parsed ? parsed.hash.slice(1) : '';
  },

  set: (url: string, hash: string): string | null => {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    parsed.hash = hash;
    return parsed.toString();
  },

  remove: (url: string): string | null => {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    parsed.hash = '';
    return parsed.toString();
  }
};

/**
 * Сравнение URL
 */
export const compareUrls = (url1: string, url2: string, options: {
  ignoreProtocol?: boolean;
  ignoreWWW?: boolean;
  ignoreTrailingSlash?: boolean;
  ignoreQueryParams?: string[];
  ignoreHash?: boolean;
} = {}): boolean => {
  const {
    ignoreProtocol = false,
    ignoreWWW = false,
    ignoreTrailingSlash = false,
    ignoreQueryParams = [],
    ignoreHash = false
  } = options;

  const normalized1 = normalizeUrl(url1, {
    forceHttps: ignoreProtocol,
    removeWWW: ignoreWWW,
    removeTrailingSlash: ignoreTrailingSlash,
    removeQueryParams: ignoreQueryParams
  });

  const normalized2 = normalizeUrl(url2, {
    forceHttps: ignoreProtocol,
    removeWWW: ignoreWWW,
    removeTrailingSlash: ignoreTrailingSlash,
    removeQueryParams: ignoreQueryParams
  });

  if (!normalized1 || !normalized2) return false;

  if (ignoreHash) {
    return hashUtils.remove(normalized1) === hashUtils.remove(normalized2);
  }

  return normalized1 === normalized2;
};

/**
 * Создание абсолютного URL
 */
export const makeAbsolute = (relativeUrl: string, baseUrl: string): string | null => {
  try {
    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return null;
  }
};

/**
 * Извлечение домена
 */
export const getDomain = (url: string): string | null => {
  const parsed = parseUrl(url);
  return parsed ? parsed.hostname : null;
};

/**
 * Извлечение поддомена
 */
export const getSubdomain = (url: string): string | null => {
  const domain = getDomain(url);
  if (!domain) return null;

  const parts = domain.split('.');
  return parts.length > 2 ? parts.slice(0, -2).join('.') : '';
};

/**
 * Проверка относительного URL
 */
export const isRelativeUrl = (url: string): boolean => {
  return !/^[a-z][a-z0-9+.-]*:/i.test(url) && !url.startsWith('//');
};

/**
 * Экранирование URL
 */
export const encodeUrl = (url: string): string => {
  return encodeURI(url).replace(/'/g, '%27').replace(/"/g, '%22');
};

/**
 * Декодирование URL
 */
export const decodeUrl = (url: string): string => {
  try {
    return decodeURI(url);
  } catch {
    return url;
  }
};

export default {
  parseUrl,
  isValidUrl,
  normalizeUrl,
  queryParams,
  pathUtils,
  hashUtils,
  compareUrls,
  makeAbsolute,
  getDomain,
  getSubdomain,
  isRelativeUrl,
  encodeUrl,
  decodeUrl
};
