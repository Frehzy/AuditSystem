// src/core/utils/validation.rules.ts

import type { ValidationRule, ValidationResult, ValidationConfig } from './types';

/**
 * Улучшенная система валидации с поддержкой цепочек, кастомных правил и i18n
 */

// Конфигурация валидатора по умолчанию
const defaultConfig: ValidationConfig = {
  stopOnFirstError: false,
  validateOnBlur: true,
  validateOnChange: false,
  debounceTime: 300,
  locale: 'ru-RU',
  required: false
};

/**
 * Утилита для склонения слов в зависимости от числа
 */
const pluralize = (count: number, one: string, two: string, five: string): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return five;
  if (lastDigit === 1) return one;
  if (lastDigit >= 2 && lastDigit <= 4) return two;
  return five;
};

/**
 * Базовые правила валидации с улучшенными сообщениями и поддержкой i18n
 */
export const baseRules = {
  // Обязательное поле
  required: {
    test: (value: unknown) => {
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return Object.keys(value as object).length > 0;
      if (typeof value === 'number') return !isNaN(value);
      return true;
    },
    message: 'Поле обязательно для заполнения',
    severity: 'error' as const
  },

  // Email валидация
  email: {
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.trim());
    },
    message: 'Введите корректный email адрес',
    severity: 'error' as const
  },

  // Телефон (международный формат)
  phone: {
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    },
    message: 'Введите корректный номер телефона',
    severity: 'error' as const
  },

  // Минимальная длина
  minLength: (min: number): ValidationRule => ({
    test: (value: unknown) => {
      if (value === null || value === undefined) return true; // Для optional полей
      if (typeof value === 'string') return value.length >= min;
      if (Array.isArray(value)) return value.length >= min;
      return false;
    },
    message: `Минимальная длина: ${min} ${pluralize(min, 'символ', 'символа', 'символов')}`,
    severity: 'error' as const
  }),

  // Максимальная длина
  maxLength: (max: number): ValidationRule => ({
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.length <= max;
      if (Array.isArray(value)) return value.length <= max;
      return false;
    },
    message: `Максимальная длина: ${max} ${pluralize(max, 'символ', 'символа', 'символов')}`,
    severity: 'error' as const
  }),

  // Точная длина
  exactLength: (length: number): ValidationRule => ({
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.length === length;
      if (Array.isArray(value)) return value.length === length;
      return false;
    },
    message: `Должно быть exactly ${length} ${pluralize(length, 'символ', 'символа', 'символов')}`,
    severity: 'error' as const
  }),

  // Минимальное значение
  min: (min: number): ValidationRule => ({
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= min;
    },
    message: `Минимальное значение: ${min}`,
    severity: 'error' as const
  }),

  // Максимальное значение
  max: (max: number): ValidationRule => ({
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num <= max;
    },
    message: `Максимальное значение: ${max}`,
    severity: 'error' as const
  }),

  // Число
  number: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'number') return true;
      if (typeof value === 'string') {
        return !isNaN(Number(value)) && value.trim() !== '' && /^-?\d*\.?\d+$/.test(value.trim());
      }
      return false;
    },
    message: 'Введите число',
    severity: 'error' as const
  },

  // Целое число
  integer: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'number') return Number.isInteger(value);
      if (typeof value === 'string') return /^-?\d+$/.test(value.trim());
      return false;
    },
    message: 'Введите целое число',
    severity: 'error' as const
  },

  // Положительное число
  positive: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num > 0;
    },
    message: 'Введите положительное число',
    severity: 'error' as const
  },

  // Отрицательное число
  negative: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num < 0;
    },
    message: 'Введите отрицательное число',
    severity: 'error' as const
  },

  // URL валидация
  url: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      if (typeof value !== 'string') return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Введите корректный URL',
    severity: 'error' as const
  },

  // Сложный пароль
  password: {
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      return value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(value);
    },
    message: 'Пароль должен содержать минимум 8 символов, заглавные и строчные буквы, цифры и специальные символы',
    severity: 'error' as const
  },

  // Простой пароль (для менее строгих требований)
  simplePassword: {
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      return value.length >= 6;
    },
    message: 'Пароль должен содержать минимум 6 символов',
    severity: 'warning' as const
  },

  // Совпадение полей
  match: (fieldName: string, getFieldValue: (name: string) => unknown): ValidationRule => ({
    test: (value: unknown, context?: Record<string, unknown>) => {
      const fieldValue = getFieldValue(fieldName);
      return value === fieldValue;
    },
    message: 'Поля не совпадают',
    severity: 'error' as const
  }),

  // Регулярное выражение
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      if (typeof value !== 'string') return false;
      return regex.test(value);
    },
    message,
    severity: 'error' as const
  }),

  // Диапазон значений
  range: (min: number, max: number): ValidationRule => ({
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: `Значение должно быть между ${min} и ${max}`,
    severity: 'error' as const
  }),

  // Дата в прошлом
  pastDate: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      const date = new Date(value as string);
      return !isNaN(date.getTime()) && date < new Date();
    },
    message: 'Дата должна быть в прошлом',
    severity: 'error' as const
  },

  // Дата в будущем
  futureDate: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      const date = new Date(value as string);
      return !isNaN(date.getTime()) && date > new Date();
    },
    message: 'Дата должна быть в будущем',
    severity: 'error' as const
  },

  // IPv4 адрес
  ipv4: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      if (typeof value !== 'string') return false;
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipv4Regex.test(value)) return false;

      const parts = value.split('.');
      return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
      });
    },
    message: 'Введите корректный IPv4 адрес',
    severity: 'error' as const
  },

  // HEX цвет
  hexColor: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return true;
      if (typeof value !== 'string') return false;
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
    },
    message: 'Введите корректный HEX цвет',
    severity: 'error' as const
  },

  // Утилита pluralize для использования в других правилах
  pluralize
} as const;

/**
 * Улучшенный класс валидатора с поддержкой цепочек и конфигурации
 */
class Validator {
  private rules: ValidationRule[] = [];
  private customMessages: Record<string, string> = {};
  private config: ValidationConfig = { ...defaultConfig };
  private fieldName?: string;
  private warnings: ValidationRule[] = [];

  constructor(fieldName?: string) {
    this.fieldName = fieldName;
  }

  /**
   * Добавление правила
   */
  addRule(rule: ValidationRule): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * Добавление правила-предупреждения
   */
  addWarning(rule: ValidationRule): this {
    this.warnings.push({ ...rule, severity: 'warning' });
    return this;
  }

  /**
   * Установка кастомного сообщения для правила
   */
  setMessage(ruleId: string, message: string): this {
    this.customMessages[ruleId] = message;
    return this;
  }

  /**
   * Обновление конфигурации
   */
  setConfig(config: Partial<ValidationConfig>): this {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Валидация значения с улучшенной обработкой ошибок
   */
  validate(value: unknown, context?: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверяем обязательность поля
    if (this.config.required && !baseRules.required.test(value)) {
      const message = this.customMessages['required'] || baseRules.required.message;
      errors.push(message);

      if (this.config.stopOnFirstError) {
        return this.createResult(errors, warnings, value);
      }
    }

    // Если поле не обязательное и пустое - пропускаем остальные проверки
    if (!this.config.required && (value === null || value === undefined || value === '')) {
      return this.createResult([], [], value, true);
    }

    // Проверяем основные правила
    for (const rule of this.rules) {
      try {
        const isValid = rule.test(value, context);

        if (!isValid) {
          const message = this.customMessages[rule.message] || rule.message;

          if (rule.severity === 'warning') {
            warnings.push(message);
          } else {
            errors.push(message);
          }

          // Останавливаемся на первой ошибке если настроено
          if (this.config.stopOnFirstError && rule.severity === 'error') {
            break;
          }
        }
      } catch (error) {
        // Логируем ошибки в правилах валидации
        console.error('Validation rule error:', error);
        errors.push('Ошибка валидации');
      }
    }

    // Проверяем предупреждения
    for (const warning of this.warnings) {
      try {
        const isValid = warning.test(value, context);
        if (!isValid) {
          const message = this.customMessages[warning.message] || warning.message;
          warnings.push(message);
        }
      } catch (error) {
        console.error('Validation warning error:', error);
      }
    }

    return this.createResult(errors, warnings, value);
  }

  /**
   * Создание результата валидации
   */
  private createResult(
    errors: string[],
    warnings: string[],
    value: unknown,
    skipValidation: boolean = false
  ): ValidationResult {
    return {
      isValid: errors.length === 0 && (skipValidation || this.rules.every(rule => {
        try {
          return rule.test(value);
        } catch {
          return true;
        }
      })),
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
      fieldName: this.fieldName,
      timestamp: new Date(),
      value
    };
  }

  /**
   * Асинхронная валидация (для проверок требующих API вызовов)
   */
  async validateAsync(
    value: unknown,
    context?: Record<string, unknown>
  ): Promise<ValidationResult> {
    // В текущей реализации просто возвращаем синхронный результат
    // Может быть расширено для асинхронных проверок
    return this.validate(value, context);
  }

  /**
   * Создание валидатора с предустановленными правилами
   */
  static create(fieldName?: string): Validator {
    return new Validator(fieldName);
  }
}

/**
 * Утилиты для работы с валидацией
 */

/**
 * Создание кастомного правила валидации
 */
export const createRule = (
  test: (value: unknown, context?: Record<string, unknown>) => boolean,
  message: string,
  severity: 'error' | 'warning' | 'info' = 'error'
): ValidationRule => ({
  test,
  message,
  severity
});

/**
 * Композитная валидация (одно из правил должно быть true)
 */
export const oneOf = (rules: ValidationRule[]): ValidationRule => ({
  test: (value: unknown, context?: Record<string, unknown>) =>
    rules.some(rule => rule.test(value, context)),
  message: 'Значение не соответствует ни одному из допустимых форматов',
  severity: 'error'
});

/**
 * Все правила должны быть true
 */
export const allOf = (rules: ValidationRule[]): ValidationRule => ({
  test: (value: unknown, context?: Record<string, unknown>) =>
    rules.every(rule => rule.test(value, context)),
  message: 'Значение должно соответствовать всем требованиям',
  severity: 'error'
});

/**
 * Валидация объекта с несколькими полями
 */
export const validateObject = <T extends Record<string, unknown>>(
  obj: T,
  validators: Record<keyof T, Validator>,
  config: Partial<ValidationConfig> = {}
): Record<keyof T, ValidationResult> => {
  const results = {} as Record<keyof T, ValidationResult>;

  for (const key in validators) {
    if (validators.hasOwnProperty(key)) {
      const value = obj[key];
      const validator = validators[key];

      // Применяем конфигурацию к каждому валидатору
      if (config) {
        validator.setConfig(config);
      }

      results[key] = validator.validate(value, obj);
    }
  }

  return results;
};

/**
 * Асинхронная валидация объекта
 */
export const validateObjectAsync = async <T extends Record<string, unknown>>(
  obj: T,
  validators: Record<keyof T, Validator>,
  config: Partial<ValidationConfig> = {}
): Promise<Record<keyof T, ValidationResult>> => {
  const results = {} as Record<keyof T, ValidationResult>;
  const promises: Promise<void>[] = [];

  for (const key in validators) {
    if (validators.hasOwnProperty(key)) {
      const value = obj[key];
      const validator = validators[key];

      if (config) {
        validator.setConfig(config);
      }

      promises.push(
        validator.validateAsync(value, obj).then(result => {
          results[key] = result;
        })
      );
    }
  }

  await Promise.all(promises);
  return results;
};

/**
 * Проверка валидности всей формы
 */
export const isFormValid = <T extends Record<string, ValidationResult>>(
  validationResults: T
): boolean => {
  return Object.values(validationResults).every(result => result.isValid);
};

/**
 * Сбор всех ошибок формы
 */
export const getAllErrors = <T extends Record<string, ValidationResult>>(
  validationResults: T
): string[] => {
  return Object.values(validationResults)
    .flatMap(result => result.errors)
    .filter(Boolean);
};

/**
 * Сбор всех предупреждений формы
 */
export const getAllWarnings = <T extends Record<string, ValidationResult>>(
  validationResults: T
): string[] => {
  return Object.values(validationResults)
    .flatMap(result => result.warnings || [])
    .filter(Boolean);
};

/**
 * Получение ошибок для конкретного поля
 */
export const getFieldErrors = <T extends Record<string, ValidationResult>>(
  validationResults: T,
  fieldName: string
): string[] => {
  return validationResults[fieldName]?.errors || [];
};

/**
 * Сброс результатов валидации
 */
export const resetValidation = <T extends Record<string, ValidationResult>>(
  validationResults: T
): Record<keyof T, ValidationResult> => {
  const resetResults = {} as Record<keyof T, ValidationResult>;

  for (const key in validationResults) {
    resetResults[key] = {
      isValid: true,
      errors: [],
      fieldName: key,
      timestamp: new Date()
    };
  }

  return resetResults;
};

/**
 * Специализированные валидаторы для часто используемых случаев
 */
export const validators = {
  baseRules,

  email: (required: boolean = true): Validator => {
    const validator = Validator.create('email');
    if (required) validator.addRule(baseRules.required);
    return validator.addRule(baseRules.email);
  },

  password: (strong: boolean = true): Validator => {
    const validator = Validator.create('password')
      .addRule(baseRules.required)
      .addRule(baseRules.minLength(8));

    if (strong) {
      validator.addRule(baseRules.password);
    } else {
      validator.addWarning(baseRules.simplePassword);
    }

    return validator;
  },

  phone: (required: boolean = true): Validator => {
    const validator = Validator.create('phone');
    if (required) validator.addRule(baseRules.required);
    return validator.addRule(baseRules.phone);
  },

  number: (min?: number, max?: number, required: boolean = true): Validator => {
    const validator = Validator.create('number');

    if (required) validator.addRule(baseRules.required);
    validator.addRule(baseRules.number);

    if (min !== undefined) {
      validator.addRule(baseRules.min(min));
    }

    if (max !== undefined) {
      validator.addRule(baseRules.max(max));
    }

    return validator;
  },

  url: (required: boolean = true): Validator => {
    const validator = Validator.create('url');
    if (required) validator.addRule(baseRules.required);
    return validator.addRule(baseRules.url);
  },

  username: (): Validator => {
    return Validator.create('username')
      .addRule(baseRules.required)
      .addRule(baseRules.minLength(3))
      .addRule(baseRules.maxLength(50))
      .addRule(createRule(
        (val: unknown) => typeof val === 'string' && /^[a-zA-Z0-9_]+$/.test(val),
        'Только буквы, цифры и подчеркивания'
      ));
  },

  date: (past: boolean = false, future: boolean = false, required: boolean = true): Validator => {
    const validator = Validator.create('date');

    if (required) validator.addRule(baseRules.required);

    if (past) {
      validator.addRule(baseRules.pastDate);
    }

    if (future) {
      validator.addRule(baseRules.futureDate);
    }

    return validator;
  }
};

// Экспорт по умолчанию для обратной совместимости
export default {
  baseRules,
  Validator,
  createRule,
  oneOf,
  allOf,
  validateObject,
  validateObjectAsync,
  isFormValid,
  getAllErrors,
  getAllWarnings,
  getFieldErrors,
  resetValidation,
  validators
};
