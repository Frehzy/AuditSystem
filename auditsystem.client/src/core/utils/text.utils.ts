import type { CaseType, TextAnalysisResult, TextGenerationOptions, TextCleanOptions } from './types';

/**
 * Улучшенные утилиты для работы с текстом
 */

// Константы для производительности
const WORDS_PER_MINUTE = 200;
const CHARS_PER_MINUTE = 1000;
const WORDS_PER_MINUTE_SPEAKING = 150;

/**
 * Обрезка текста с улучшенными опциями
 */
export const truncateText = (
  text: string,
  maxLength: number,
  options: {
    suffix?: string;
    preserveWords?: boolean;
    preserveSentences?: boolean;
    trim?: boolean;
  } = {}
): string => {
  const {
    suffix = '...',
    preserveWords = true,
    preserveSentences = false,
    trim = true
  } = options;

  if (typeof text !== 'string') return '';

  let processedText = trim ? text.trim() : text;

  if (processedText.length <= maxLength) return processedText;

  if (!preserveWords && !preserveSentences) {
    return processedText.substring(0, maxLength - suffix.length) + suffix;
  }

  if (preserveSentences) {
    const sentences = processedText.split(/(?<=[.!?])\s+/);
    let result = '';

    for (const sentence of sentences) {
      if ((result + sentence).length + suffix.length <= maxLength) {
        result += (result ? ' ' : '') + sentence;
      } else {
        break;
      }
    }

    if (result && result !== processedText) {
      return result + suffix;
    }
  }

  if (preserveWords) {
    let truncated = processedText.substring(0, maxLength - suffix.length);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    const lastPunctuationIndex = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?'),
      truncated.lastIndexOf(',')
    );

    // Предпочитаем обрезку по знакам препинания
    const cutIndex = lastPunctuationIndex > lastSpaceIndex * 0.8 ?
      lastPunctuationIndex + 1 : lastSpaceIndex;

    if (cutIndex > maxLength * 0.3) { // Минимальная значимая обрезка
      truncated = truncated.substring(0, cutIndex);
    }

    return truncated.trim() + suffix;
  }

  return processedText.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Преобразование регистра с улучшенной поддержкой Unicode
 */
export const changeCase = (text: string, targetCase: CaseType): string => {
  if (typeof text !== 'string') return '';

  switch (targetCase) {
    case 'camel':
      return text
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+(\p{L})/gu, (_, char) => char.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^./, char => char.toLowerCase());

    case 'kebab':
      return text
        .replace(/(\p{Ll})(\p{Lu})/gu, '$1-$2')
        .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1-$2')
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    case 'snake':
      return text
        .replace(/(\p{Ll})(\p{Lu})/gu, '$1_$2')
        .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1_$2')
        .replace(/[^\p{L}\p{N}]+/gu, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase();

    case 'pascal':
      return text
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+(\p{L})/gu, (_, char) => char.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^./, char => char.toUpperCase());

    case 'title':
      return text
        .replace(/\w\S*/g, (word) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );

    case 'sentence':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

    default:
      return text;
  }
};

/**
 * Работа с регистром с улучшенной производительностью
 */
export const caseUtils = {
  camel: (text: string) => changeCase(text, 'camel'),
  kebab: (text: string) => changeCase(text, 'kebab'),
  snake: (text: string) => changeCase(text, 'snake'),
  pascal: (text: string) => changeCase(text, 'pascal'),
  title: (text: string) => changeCase(text, 'title'),
  sentence: (text: string) => changeCase(text, 'sentence'),

  capitalize: (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  uncapitalize: (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toLowerCase() + text.slice(1);
  },

  capitalizeAll: (text: string): string => {
    return text.replace(/\b\p{L}/gu, char => char.toUpperCase());
  },

  toggle: (text: string): string => {
    return text.replace(/\p{L}/gu, char =>
      char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
    );
  }
};

/**
 * Очистка и нормализация текста с улучшенными опциями
 */
export const cleanText = (
  text: string,
  options: TextCleanOptions = {}
): string => {
  if (typeof text !== 'string') return '';

  const {
    normalizeSpaces = true,
    removeExtraSpaces = true,
    trim = true,
    removeLineBreaks = false,
    removeDuplicateSpaces = true,
    normalizeUnicode = true
  } = options;

  let cleaned = text;

  // Нормализация Unicode (NFKC форма)
  if (normalizeUnicode) {
    cleaned = cleaned.normalize('NFKC');
  }

  // Удаление лишних пробелов
  if (removeDuplicateSpaces) {
    cleaned = cleaned.replace(/\s+/g, ' ');
  }

  // Удаление переносов строк
  if (removeLineBreaks) {
    cleaned = cleaned.replace(/[\r\n\t]+/g, ' ');
  }

  // Нормализация пробелов
  if (normalizeSpaces) {
    cleaned = cleaned.replace(/\s/g, ' ');
  }

  // Удаление экстра пробелов
  if (removeExtraSpaces) {
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
  }

  // Трим
  if (trim) {
    cleaned = cleaned.trim();
  }

  return cleaned;
};

/**
 * Безопасная работа с HTML с улучшенной безопасностью
 */
export const htmlUtils = {
  escape: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\//g, '&#x2F;');
  },

  unescape: (text: string): string => {
    const div = document.createElement('div');
    div.innerHTML = text
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x2F;/g, '/');
    return div.textContent || div.innerText || '';
  },

  stripTags: (html: string, allowedTags: string[] = []): string => {
    if (allowedTags.length === 0) {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    }

    const allowedPattern = allowedTags.join('|');
    const regex = new RegExp(
      `<(?!\/?(${allowedPattern})\s*\/?>(?![^<]*<\/\\1>))[^>]*>`,
      'gi'
    );
    return html.replace(regex, '');
  },

  sanitize: (html: string, allowedTags: string[] = ['b', 'i', 'u', 'em', 'strong']): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Удаляем неразрешенные теги
    const elements = temp.getElementsByTagName('*');
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        element.parentNode?.removeChild(element);
      }
    }

    return temp.innerHTML;
  }
};

/**
 * Генерация текста с улучшенной безопасностью
 */
export const generate = {
  randomString: (
    length: number = 8,
    options: TextGenerationOptions = {}
  ): string => {
    const {
      includeNumbers = true,
      includeSymbols = false,
      includeUppercase = true,
      includeLowercase = true,
      excludeSimilar = true,
      excludeAmbiguous = false
    } = options;

    let chars = '';

    if (includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      chars = chars.replace(/[0Oo1lI]/g, '');
    }

    if (excludeAmbiguous) {
      chars = chars.replace(/[{}[]()\/\\'"`~,;:.<>]/g, '');
    }

    if (!chars) {
      throw new Error('At least one character set must be included');
    }

    // Используем crypto API если доступно
    const array = new Uint32Array(length);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < length; i++) {
        array[i] = Math.random() * 4294967296;
      }
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }

    return result;
  },

  id: (prefix: string = 'id', separator: string = '_'): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 11);
    return `${prefix}${separator}${timestamp}${separator}${random}`;
  },

  uuid: (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback для старых браузеров
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

/**
 * Анализ текста с улучшенной точностью
 */
export const analyze = {
  text: (text: string): TextAnalysisResult => {
    const cleaned = cleanText(text, { removeExtraSpaces: true, trim: true });
    const words = cleaned.split(/\s+/).filter(word => word.length > 0);
    const characters = cleaned.length;
    const charactersWithoutSpaces = cleaned.replace(/\s/g, '').length;
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = cleaned.split(/\n+/).filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words.length / WORDS_PER_MINUTE);
    const speakingTime = Math.ceil(words.length / WORDS_PER_MINUTE_SPEAKING);

    return {
      words: words.length,
      characters,
      charactersWithoutSpaces,
      sentences,
      paragraphs,
      readingTime,
      speakingTime
    };
  },

  words: (text: string): number => {
    return analyze.text(text).words;
  },

  characters: (text: string, options: { includeSpaces?: boolean } = {}): number => {
    const { includeSpaces = true } = options;
    const analysis = analyze.text(text);
    return includeSpaces ? analysis.characters : analysis.charactersWithoutSpaces;
  },

  readingTime: (text: string, wordsPerMinute: number = WORDS_PER_MINUTE): number => {
    const words = analyze.words(text);
    return Math.ceil(words / wordsPerMinute);
  },

  density: (text: string, topN: number = 10): Map<string, number> => {
    const words = cleanText(text, { removeExtraSpaces: true, trim: true })
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2); // Игнорируем короткие слова

    const frequency = new Map<string, number>();

    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // Сортируем по частоте и берем топ N
    return new Map(
      [...frequency.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
    );
  }
};

/**
 * Форматирование значений с улучшенной локализацией
 */
export const format = {
  number: (
    number: number,
    locale: string = 'ru-RU',
    options?: Intl.NumberFormatOptions
  ): string => {
    try {
      return new Intl.NumberFormat(locale, options).format(number);
    } catch {
      return number.toString();
    }
  },

  fileSize: (bytes: number, decimals: number = 1, binary: boolean = false): string => {
    if (bytes === 0) return '0 B';

    const k = binary ? 1024 : 1000;
    const sizes = binary
      ? ['B', 'KiB', 'MiB', 'GiB', 'TiB']
      : ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  },

  phone: (phone: string, format: string = '+7 (XXX) XXX-XX-XX'): string => {
    const numbers = phone.replace(/\D/g, '');
    let result = format;
    let numberIndex = 0;

    for (let i = 0; i < result.length && numberIndex < numbers.length; i++) {
      if (result[i] === 'X') {
        result = result.substring(0, i) + numbers[numberIndex] + result.substring(i + 1);
        numberIndex++;
      }
    }

    return result.replace(/X/g, '');
  },

  creditCard: (number: string, separator: string = ' '): string => {
    const cleaned = number.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(separator) : cleaned;
  },

  percentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  }
};

/**
 * Создание slug с улучшенной поддержкой Unicode
 */
export const createSlug = (
  text: string,
  separator: string = '-',
  options: {
    lowerCase?: boolean;
    preserveCase?: boolean;
  } = {}
): string => {
  const { lowerCase = true, preserveCase = false } = options;

  let slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Удаляем диакритические знаки
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Удаляем все кроме букв, цифр, пробелов и дефисов
    .replace(/\s+/g, separator) // Заменяем пробелы на разделитель
    .replace(new RegExp(`${separator}+`, 'g'), separator) // Удаляем дублирующиеся разделители
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), ''); // Удаляем разделители в начале и конце

  if (lowerCase && !preserveCase) {
    slug = slug.toLowerCase();
  }

  return slug;
};

/**
 * Проверка текста с улучшенной валидацией
 */
export const validate = {
  isEmpty: (text: string): boolean => {
    return !text || text.trim().length === 0;
  },

  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  isUrl: (url: string, requireProtocol: boolean = true): boolean => {
    try {
      const parsed = new URL(url);
      if (requireProtocol && !parsed.protocol) return false;
      return parsed.hostname !== '';
    } catch {
      return false;
    }
  },

  isPhone: (phone: string, country: string = 'ru'): boolean => {
    const cleaned = phone.replace(/\D/g, '');

    const patterns: Record<string, RegExp> = {
      'ru': /^[78]?\d{10}$/,
      'us': /^\+?1?\d{10}$/,
      'ua': /^\+?380\d{9}$/,
      'kz': /^\+?7\d{10}$/
    };

    const pattern = patterns[country] || /^\d{10,15}$/;
    return pattern.test(cleaned);
  },

  isStrongPassword: (password: string): { isValid: boolean; reasons: string[] } => {
    const reasons: string[] = [];

    if (password.length < 8) reasons.push('Минимум 8 символов');
    if (!/[A-Z]/.test(password)) reasons.push('Заглавные буквы');
    if (!/[a-z]/.test(password)) reasons.push('Строчные буквы');
    if (!/\d/.test(password)) reasons.push('Цифры');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) reasons.push('Специальные символы');

    return {
      isValid: reasons.length === 0,
      reasons
    };
  }
};

/**
 * Поиск и замена с поддержкой регистра
 */
export const replaceAll = (
  text: string,
  search: string,
  replacement: string,
  caseSensitive: boolean = false
): string => {
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
  return text.replace(regex, replacement);
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
  validate,
  replaceAll
};
