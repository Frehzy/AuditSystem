export interface ValidationRule {
  test: (value: unknown) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Набор правил валидации с улучшенной типизацией
 */
export const validationRules = {
  required: (message?: string): ValidationRule => ({
    test: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message: message || 'Это поле обязательно для заполнения',
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => !value || String(value).length >= min,
    message: message || `Минимальная длина: ${min} символов`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => !value || String(value).length <= max,
    message: message || `Максимальная длина: ${max} символов`,
  }),

  email: (message?: string): ValidationRule => ({
    test: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
    message: message || 'Введите корректный email адрес',
  }),

  numeric: (message?: string): ValidationRule => ({
    test: (value) => !value || /^\d+$/.test(String(value)),
    message: message || 'Допускаются только цифры',
  }),

  pattern: (regex: RegExp, message: string): ValidationRule => ({
    test: (value) => !value || regex.test(String(value)),
    message,
  }),
};

/**
 * Валидатор для проверки значений по набору правил
 */
export class Validator {
  static validate(value: unknown, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateObject<T extends Record<string, unknown>>(
    obj: T,
    rules: { [K in keyof T]?: ValidationRule[] }
  ): { isValid: boolean; errors: Partial<Record<keyof T, string[]>> } {
    const errors: Partial<Record<keyof T, string[]>> = {};

    for (const [key, keyRules] of Object.entries(rules)) {
      if (keyRules && Array.isArray(keyRules)) {
        const result = this.validate(obj[key as keyof T], keyRules);
        if (!result.isValid) {
          errors[key as keyof T] = result.errors;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default validationRules;
