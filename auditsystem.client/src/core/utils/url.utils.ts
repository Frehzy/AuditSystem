import type { UrlParams, PaginationParams } from './types';

/**
 * Улучшенные утилиты для работы с URL
 */

// Кэш для производительности
const urlCache = new Map<string, URL>();

/**
 * Безопасный парсинг URL с кэшированием
 */
export const parseUrl = (url: string, base?: string): URL | null => {
  try {
    const cacheKey = base ? `${url}|${base}` : url;

    if (urlCache.has(cacheKey)) {
      return new URL(urlCache.get(cacheKey)!.toString());
    }

    const parsed = new URL(url, base);
    urlCache.set(cacheKey, parsed);
    return new URL(parsed.toString()); // Возвращаем копию
  } catch {
    return null;
  }
};

/**
 * Валидация URL с улучшенными опциями
 */
export const isValidUrl = (
  url: string,
  options: {
    requireProtocol?: boolean;
    allowedProtocols?: string[];
    requireHostname?: boolean;
  } = {}
): boolean => {
  const {
    requireProtocol = true,
    allowedProtocols = ['http:', 'https:', 'ftp:', 'mailto:'],
    requireHostname = true
  } = options;

  const parsed = parseUrl(url);
  if (!parsed) return false;

  if (requireProtocol && !parsed.protocol) return false;

  if (allowedProtocols.length > 0 && !allowedProtocols.includes(parsed.protocol)) {
    return false;
  }

  if (requireHostname && !parsed.hostname) return false;

  return true;
};

/**
 * Проверка и нормализация URL с улучшенными опциями
 */
export const normalizeUrl = (
  url: string,
  options: {
    forceHttps?: boolean;
    removeWWW?: boolean;
    removeTrailingSlash?: boolean;
    removeQueryParams?: string[];
    removeHash?: boolean;
    sortQueryParams?: boolean;
    defaultProtocol?: string;
  } = {}
): string | null => {
  const {
    forceHttps = true,
    removeWWW = true,
    removeTrailingSlash = true,
    removeQueryParams = [],
    removeHash = false,
    sortQueryParams = false,
    defaultProtocol = 'https:'
  } = options;

  const parsed = parseUrl(url);
  if (!parsed) return null;

  // Протокол
  if (forceHttps) {
    parsed.protocol = 'https:';
  } else if (!parsed.protocol && defaultProtocol) {
    parsed.protocol = defaultProtocol;
  }

  // Хост
  if (removeWWW && parsed.hostname.startsWith('www.')) {
    parsed.hostname = parsed.hostname.slice(4);
  }

  // Путь
  if (removeTrailingSlash) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
  }

  // Параметры запроса
  if (removeQueryParams.length > 0 || sortQueryParams) {
    const params = new URLSearchParams(parsed.search);

    // Удаление параметров
    removeQueryParams.forEach(param => params.delete(param));

    // Сортировка параметров
    if (sortQueryParams) {
      const sortedParams = new URLSearchParams();
      [...params.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, value]) => sortedParams.append(key, value));
      parsed.search = sortedParams.toString();
    } else {
      parsed.search = params.toString();
    }
  }

  // Хеш
  if (removeHash) {
    parsed.hash = '';
  }

  return parsed.toString();
};

/**
 * Работа с параметрами запроса с улучшенной типобезопасностью
 */
export const queryParams = {
  parse: (
    queryString: string,
    options: {
      decode?: boolean;
      arrayFormat?: 'bracket' | 'index' | 'comma' | 'separator' | 'none';
      arraySeparator?: string;
    } = {}
  ): UrlParams => {
    const {
      decode = true,
      arrayFormat = 'none',
      arraySeparator = ','
    } = options;

    const params: UrlParams = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      if (decode) {
        try {
          params[key] = decodeURIComponent(value);
        } catch {
          params[key] = value;
        }
      } else {
        params[key] = value;
      }
    }

    return params;
  },

  stringify: (
    params: UrlParams,
    options: {
      encode?: boolean;
      skipNull?: boolean;
      skipEmptyString?: boolean;
      arrayFormat?: 'bracket' | 'index' | 'comma' | 'separator' | 'none';
      arraySeparator?: string;
    } = {}
  ): string => {
    const {
      encode = true,
      skipNull = true,
      skipEmptyString = false,
      arrayFormat = 'none',
      arraySeparator = ','
    } = options;

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        if (!skipNull) {
          searchParams.append(key, '');
        }
        return;
      }

      if (value === '' && skipEmptyString) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach(item => {
          const stringValue = String(item);
          searchParams.append(
            arrayFormat === 'bracket' ? `${key}[]` : key,
            encode ? encodeURIComponent(stringValue) : stringValue
          );
        });
      } else {
        const stringValue = String(value);
        searchParams.append(
          key,
          encode ? encodeURIComponent(stringValue) : stringValue
        );
      }
    });

    return searchParams.toString();
  },

  get: (url: string, param: string): string | null => {
    const parsed = parseUrl(url);
    return parsed ? parsed.searchParams.get(param) : null;
  },

  getAll: (url: string, param: string): string[] => {
    const parsed = parseUrl(url);
    return parsed ? parsed.searchParams.getAll(param) : [];
  },

  set: (url: string, params: UrlParams): string | null => {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        parsed.searchParams.delete(key);
      } else if (Array.isArray(value)) {
        parsed.searchParams.delete(key);
        value.forEach(item => parsed.searchParams.append(key, String(item)));
      } else {
        parsed.searchParams.set(key, String(value));
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
  },

  append: (url: string, params: UrlParams): string | null => {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(item => parsed.searchParams.append(key, String(item)));
        } else {
          parsed.searchParams.append(key, String(value));
        }
      }
    });

    return parsed.toString();
  }
};

/**
 * Работа с путями с улучшенной безопасностью
 */
export const pathUtils = {
  join: (...segments: string[]): string => {
    return segments
      .map(segment => segment.replace(/^\/+|\/+$/g, ''))
      .filter(segment => segment.length > 0 && segment !== '.')
      .join('/');
  },

  resolve: (base: string, ...segments: string[]): string => {
    const allSegments = [base, ...segments];
    const resolved: string[] = [];

    allSegments.forEach(segment => {
      if (segment.startsWith('/')) {
        resolved.length = 0;
      }

      segment.split('/').forEach(part => {
        if (part === '..') {
          resolved.pop();
        } else if (part !== '.' && part !== '') {
          resolved.push(part);
        }
      });
    });

    return '/' + resolved.join('/');
  },

  basename: (path: string, extension?: string): string => {
    const basename = path.split('/').pop() || '';

    if (extension && basename.endsWith(extension)) {
      return basename.slice(0, -extension.length);
    }

    return basename;
  },

  dirname: (path: string): string => {
    const segments = path.split('/');
    segments.pop();
    return segments.join('/') || '/';
  },

  extension: (path: string): string => {
    const basename = pathUtils.basename(path);
    const lastDotIndex = basename.lastIndexOf('.');
    return lastDotIndex > 0 ? basename.slice(lastDotIndex + 1) : '';
  },

  isAbsolute: (path: string): boolean => {
    return path.startsWith('/') || /^[a-zA-Z]:\\/.test(path);
  },

  normalize: (path: string): string => {
    return pathUtils.resolve('', path);
  }
};

/**
 * Работа с хешами с улучшенной безопасностью
 */
export const hashUtils = {
  get: (url: string): string => {
    const parsed = parseUrl(url);
    return parsed ? parsed.hash.slice(1) : '';
  },

  set: (url: string, hash: string): string | null => {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    parsed.hash = hash.startsWith('#') ? hash : `#${hash}`;
    return parsed.toString();
  },

  remove: (url: string): string | null => {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    parsed.hash = '';
    return parsed.toString();
  },

  update: (url: string, updater: (current: string) => string): string | null => {
    const currentHash = hashUtils.get(url);
    const newHash = updater(currentHash);
    return hashUtils.set(url, newHash);
  }
};

/**
 * Сравнение URL с улучшенными опциями
 */
export const compareUrls = (
  url1: string,
  url2: string,
  options: {
    ignoreProtocol?: boolean;
    ignoreWWW?: boolean;
    ignoreTrailingSlash?: boolean;
    ignoreQueryParams?: string[] | boolean;
    ignoreHash?: boolean;
    ignoreAuth?: boolean;
    ignorePort?: boolean;
  } = {}
): boolean => {
  const {
    ignoreProtocol = false,
    ignoreWWW = false,
    ignoreTrailingSlash = false,
    ignoreQueryParams = [],
    ignoreHash = false,
    ignoreAuth = false,
    ignorePort = false
  } = options;

  const normalized1 = normalizeUrl(url1, {
    forceHttps: ignoreProtocol,
    removeWWW: ignoreWWW,
    removeTrailingSlash: ignoreTrailingSlash,
    removeQueryParams: Array.isArray(ignoreQueryParams) ? ignoreQueryParams :
      ignoreQueryParams === true ? ['*'] : [],
    removeHash: ignoreHash
  });

  const normalized2 = normalizeUrl(url2, {
    forceHttps: ignoreProtocol,
    removeWWW: ignoreWWW,
    removeTrailingSlash: ignoreTrailingSlash,
    removeQueryParams: Array.isArray(ignoreQueryParams) ? ignoreQueryParams :
      ignoreQueryParams === true ? ['*'] : [],
    removeHash: ignoreHash
  });

  if (!normalized1 || !normalized2) return false;

  if (ignoreAuth || ignorePort) {
    const parsed1 = parseUrl(normalized1);
    const parsed2 = parseUrl(normalized2);

    if (!parsed1 || !parsed2) return false;

    if (ignoreAuth) {
      parsed1.username = '';
      parsed1.password = '';
      parsed2.username = '';
      parsed2.password = '';
    }

    if (ignorePort) {
      parsed1.port = '';
      parsed2.port = '';
    }

    return parsed1.toString() === parsed2.toString();
  }

  return normalized1 === normalized2;
};

/**
 * Создание абсолютного URL с улучшенной безопасностью
 */
export const makeAbsolute = (relativeUrl: string, baseUrl: string): string | null => {
  try {
    // Если URL уже абсолютный
    if (isAbsoluteUrl(relativeUrl)) {
      return relativeUrl;
    }

    // Если baseUrl не валидный
    if (!isValidUrl(baseUrl)) {
      return null;
    }

    return new URL(relativeUrl, baseUrl).toString();
  } catch {
    return null;
  }
};

/**
 * Извлечение домена с улучшенной обработкой
 */
export const getDomain = (url: string, includeSubdomain: boolean = false): string | null => {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  if (includeSubdomain) {
    return parsed.hostname;
  }

  const parts = parsed.hostname.split('.');
  return parts.length > 1 ? parts.slice(-2).join('.') : parsed.hostname;
};

/**
 * Извлечение поддомена
 */
export const getSubdomain = (url: string): string | null => {
  const domain = getDomain(url, true);
  if (!domain) return null;

  const parts = domain.split('.');
  return parts.length > 2 ? parts.slice(0, -2).join('.') : '';
};

/**
 * Проверка относительного URL
 */
export const isRelativeUrl = (url: string): boolean => {
  return !isAbsoluteUrl(url) && !url.startsWith('//');
};

/**
 * Проверка абсолютного URL
 */
export const isAbsoluteUrl = (url: string): boolean => {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//');
};

/**
 * Экранирование URL с улучшенной безопасностью
 */
export const encodeUrl = (url: string): string => {
  try {
    return encodeURI(url)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/`/g, '%60');
  } catch {
    return url;
  }
};

/**
 * Декодирование URL с обработкой ошибок
 */
export const decodeUrl = (url: string): string => {
  try {
    return decodeURI(url);
  } catch {
    try {
      return decodeURIComponent(url);
    } catch {
      return url;
    }
  }
};

/**
 * Создание URL для API с пагинацией
 */
export const createApiUrl = (
  baseUrl: string,
  endpoint: string,
  params: PaginationParams & Record<string, unknown> = {}
): string => {
  const url = new URL(pathUtils.join(baseUrl, endpoint));

  const { page, limit, sortBy, sortOrder, ...restParams } = params;

  if (page) url.searchParams.set('page', page.toString());
  if (limit) url.searchParams.set('limit', limit.toString());
  if (sortBy) url.searchParams.set('sortBy', sortBy);
  if (sortOrder) url.searchParams.set('sortOrder', sortOrder);

  Object.entries(restParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

/**
 * Очистка кэша URL
 */
export const clearUrlCache = (): void => {
  urlCache.clear();
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
  isAbsoluteUrl,
  encodeUrl,
  decodeUrl,
  createApiUrl,
  clearUrlCache
};
