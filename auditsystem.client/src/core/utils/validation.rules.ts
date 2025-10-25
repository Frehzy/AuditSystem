// src/core/utils/validation.rules.ts
import type { ValidationRule, ValidationResult } from './types';

/**
 * Улучшенная система валидации с поддержкой цепочек и кастомных правил
 */

/**
 * Базовые правила валидации
 */
export const baseRules = {
  required: {
    test: (value: unknown) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message: 'Поле обязательно для заполнения'
  },

  email: {
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message: 'Введите корректный email адрес'
  },

  phone: {
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      const cleaned = value.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    },
    message: 'Введите корректный номер телефона'
  },

  minLength: (min: number): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value === 'string') return value.length >= min;
      if (Array.isArray(value)) return value.length >= min;
      return false;
    },
    message: `Минимальная длина: ${min} символов`
  }),

  maxLength: (max: number): ValidationRule => ({
    test: (value: unknown) => {
      if (typeof value === 'string') return value.length <= max;
      if (Array.isArray(value)) return value.length <= max;
      return false;
    },
    message: `Максимальная длина: ${max} символов`
  }),

  min: (min: number): ValidationRule => ({
    test: (value: unknown) => {
      const num = Number(value);
      return !isNaN(num) && num >= min;
    },
    message: `Минимальное значение: ${min}`
  }),

  max: (max: number): ValidationRule => ({
    test: (value: unknown) => {
      const num = Number(value);
      return !isNaN(num) && num <= max;
    },
    message: `Максимальное значение: ${max}`
  }),

  number: {
    test: (value: unknown) => {
      if (typeof value === 'number') return true;
      if (typeof value === 'string') return !isNaN(Number(value));
      return false;
    },
    message: 'Введите число'
  },

  integer: {
    test: (value: unknown) => {
      if (typeof value === 'number') return Number.isInteger(value);
      if (typeof value === 'string') return /^-?\d+$/.test(value);
      return false;
    },
    message: 'Введите целое число'
  },

  positive: {
    test: (value: unknown) => {
      const num = Number(value);
      return !isNaN(num) && num > 0;
    },
    message: 'Введите положительное число'
  },

  url: {
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Введите корректный URL'
  },

  password: {
    test: (value: unknown) => {
      if (typeof value !== 'string') return false;
      return value.length >= 8 &&
        /[A-Z]/.test(value) &&
        /[a-z]/.test(value) &&
        /\d/.test(value);
    },
    message: 'Пароль должен содержать минимум 8 символов, заглавные и строчные буквы, цифры'
  },

  match: (fieldName: string, getFieldValue: (name: string) => unknown): ValidationRule => ({
    test: (value: unknown) => {
      const fieldValue = getFieldValue(fieldName);
      return value === fieldValue;
    },
    message: 'Поля не совпадают'
  })
} as const;

/**
 * Класс для создания цепочек валидации
 */
class Validator {
  private rules: ValidationRule[] = [];
  private customMessages: Record<string, string> = {};

  /**
   * Добавление правила
   */
  addRule(rule: ValidationRule): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * Установка кастомного сообщения
   */
  setMessage(ruleName: string, message: string): this {
    this.customMessages[ruleName] = message;
    return this;
  }

  /**
   * Валидация значения
   */
  validate(value: unknown): ValidationResult {
    const errors: string[] = [];

    for (const rule of this.rules) {
      if (!rule.test(value)) {
        const message = this.customMessages[rule.message] || rule.message;
        errors.push(message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Создание валидатора с предустановленными правилами
   */
  static create(): Validator {
    return new Validator();
  }
}

/**
 * Создание сложных правил валидации
 */
export const createRule = (
  test: (value: unknown) => boolean,
  message: string
): ValidationRule => ({
  test,
  message
});

/**
 * Композитная валидация (одно из правил)
 */
export const oneOf = (rules: ValidationRule[]): ValidationRule => ({
  test: (value: unknown) => rules.some(rule => rule.test(value)),
  message: 'Значение не соответствует ни одному из допустимых форматов'
});

/**
 * Валидация объекта
 */
export const validateObject = <T extends Record<string, unknown>>(
  obj: T,
  validators: Record<keyof T, ValidationRule[]>
): Record<keyof T, ValidationResult> => {
  const results = {} as Record<keyof T, ValidationResult>;

  for (const key in validators) {
    if (validators.hasOwnProperty(key)) {
      const value = obj[key];
      const fieldValidators = validators[key];

      const errors: string[] = [];

      for (const rule of fieldValidators) {
        if (!rule.test(value)) {
          errors.push(rule.message);
        }
      }

      results[key] = {
        isValid: errors.length === 0,
        errors
      };
    }
  }

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
 * Специализированные валидаторы
 */
export const validators = {
  baseRules, // Добавляем baseRules в validators
  email: (): Validator => {
    return Validator.create()
      .addRule(baseRules.required)
      .addRule(baseRules.email);
  },

  password: (): Validator => {
    return Validator.create()
      .addRule(baseRules.required)
      .addRule(baseRules.minLength(8))
      .addRule(baseRules.password);
  },

  phone: (): Validator => {
    return Validator.create()
      .addRule(baseRules.required)
      .addRule(baseRules.phone);
  },

  number: (min?: number, max?: number): Validator => {
    const validator = Validator.create()
      .addRule(baseRules.required)
      .addRule(baseRules.number);

    if (min !== undefined) {
      validator.addRule(baseRules.min(min));
    }

    if (max !== undefined) {
      validator.addRule(baseRules.max(max));
    }

    return validator;
  },

  url: (): Validator => {
    return Validator.create()
      .addRule(baseRules.required)
      .addRule(baseRules.url);
  }
};

export default {
  baseRules,
  Validator,
  createRule,
  oneOf,
  validateObject,
  isFormValid,
  getAllErrors,
  validators
};
