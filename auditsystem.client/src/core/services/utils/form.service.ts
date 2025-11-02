// src/core/services/utils/form.service.ts
import { logger } from '@/core/utils/logger';
import { errorHandler } from './error-handler.service';
import type {
  FormService,
  ValidationRule,
  FieldValidation,
  FormValidation,
  FormValidationRules
} from '@/core/types';

/**
 * Production-ready form validation service with comprehensive validation rules
 */
class FormServiceImpl implements FormService {
  private readonly logger = logger.create('FormService');

  readonly rules: FormValidationRules = {
    required: (message: string = 'This field is required') => ({
      test: (value: unknown) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      },
      message
    }),

    minLength: (min: number, message?: string) => ({
      test: (value: unknown) => {
        if (value === null || value === undefined) return false;
        const str = String(value);
        return str.length >= min;
      },
      message: message || `Minimum length is ${min} characters`
    }),

    maxLength: (max: number, message?: string) => ({
      test: (value: unknown) => {
        if (value === null || value === undefined) return true;
        const str = String(value);
        return str.length <= max;
      },
      message: message || `Maximum length is ${max} characters`
    }),

    email: (message: string = 'Please enter a valid email address') => ({
      test: (value: unknown) => {
        if (!value || typeof value !== 'string') return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value.trim());
      },
      message
    }),

    pattern: (regex: RegExp, message: string) => ({
      test: (value: unknown) => {
        if (value === null || value === undefined) return false;
        return regex.test(String(value));
      },
      message
    }),

    equals: (field: string, message: string) => ({
      test: (value: unknown, formData: Record<string, unknown> = {}) => {
        return value === (formData as any)[field];
      },
      message,
      key: field
    }),

    min: (min: number, message?: string) => ({
      test: (value: unknown) => {
        if (value === null || value === undefined) return false;
        const num = Number(value);
        return !isNaN(num) && num >= min;
      },
      message: message || `Minimum value is ${min}`
    }),

    max: (max: number, message?: string) => ({
      test: (value: unknown) => {
        if (value === null || value === undefined) return true;
        const num = Number(value);
        return !isNaN(num) && num <= max;
      },
      message: message || `Maximum value is ${max}`
    }),

    custom: (validator: (value: unknown, formData?: Record<string, unknown>) => boolean, message: string) => ({
      test: validator,
      message
    }),

    phone: (message: string = 'Please enter a valid phone number') => ({
      test: (value: unknown) => {
        if (!value || typeof value !== 'string') return false;
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(value.replace(/\s/g, ''));
      },
      message
    }),

    url: (message: string = 'Please enter a valid URL') => ({
      test: (value: unknown) => {
        if (!value || typeof value !== 'string') return false;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message
    }),

    strongPassword: (message: string = 'Password must contain uppercase, lowercase, number and special character') => ({
      test: (value: unknown) => {
        if (!value || typeof value !== 'string') return false;
        const hasUpper = /[A-Z]/.test(value);
        const hasLower = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
        return hasUpper && hasLower && hasNumber && hasSpecial && value.length >= 8;
      },
      message
    }),

    dateAfter: (date: Date, message?: string) => ({
      test: (value: unknown) => {
        if (!value) return false;
        const inputDate = new Date(value as string);
        const compareDate = new Date(date);
        return inputDate > compareDate;
      },
      message: message || `Date must be after ${date.toLocaleDateString()}`
    }),

    dateBefore: (date: Date, message?: string) => ({
      test: (value: unknown) => {
        if (!value) return false;
        const inputDate = new Date(value as string);
        const compareDate = new Date(date);
        return inputDate < compareDate;
      },
      message: message || `Date must be before ${date.toLocaleDateString()}`
    }),

    oneOf: (allowedValues: unknown[], message?: string) => ({
      test: (value: unknown) => {
        return allowedValues.includes(value);
      },
      message: message || `Value must be one of: ${allowedValues.join(', ')}`
    }),

    range: (min: number, max: number, message?: string) => ({
      test: (value: unknown) => {
        if (value === null || value === undefined) return false;
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
      },
      message: message || `Value must be between ${min} and ${max}`
    })
  } as FormValidationRules; // Добавлено приведение типа

  constructor() {
    this.logger.debug('FormService initialized');
  }

  validateField(
    value: unknown,
    rules: ValidationRule[],
    formData: Record<string, unknown> = {}
  ): FieldValidation {
    const errors: string[] = [];

    try {
      for (const rule of rules) {
        try {
          const isValid = rule.test(value, formData);

          if (!isValid) {
            errors.push(rule.message);
          }
        } catch (error) {
          const handledError = errorHandler.handle(error, `FormValidation:${rule.message}`);
          errors.push(`Validation error: ${handledError.message}`);
          this.logger.warn('Validation rule execution failed', {
            rule: rule.message,
            error: handledError.message
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      const handledError = errorHandler.handle(error, 'FormValidation:field');
      this.logger.error('Field validation failed', {
        value: String(value).substring(0, 100),
        error: handledError.message
      });

      return {
        isValid: false,
        errors: ['Validation system error']
      };
    }
  }

  async validateFieldAsync(
    value: unknown,
    rules: ValidationRule[],
    formData: Record<string, unknown> = {}
  ): Promise<FieldValidation> {
    const errors: string[] = [];

    try {
      for (const rule of rules) {
        try {
          const result = rule.test(value, formData);

          // Исправление ошибки instanceof для Promise
          let isValid: boolean;
          if (result && typeof result === 'object' && typeof (result as any).then === 'function') {
            isValid = await (result as Promise<boolean>);
          } else {
            isValid = result as boolean;
          }

          if (!isValid) {
            errors.push(rule.message);
          }
        } catch (error) {
          const handledError = errorHandler.handle(error, `FormValidation:async:${rule.message}`);
          errors.push(`Validation error: ${handledError.message}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      const handledError = errorHandler.handle(error, 'FormValidation:field:async');
      this.logger.error('Async field validation failed', {
        error: handledError.message
      });

      return {
        isValid: false,
        errors: ['Async validation system error']
      };
    }
  }

  validateForm(
    data: Record<string, unknown>,
    rules: Record<string, ValidationRule[]>,
    touchedFields: string[] = []
  ): FormValidation {
    const errors: Record<string, string[]> = {};
    const touched: Record<string, boolean> = {};
    let isValid = true;

    try {
      // Initialize touched state
      Object.keys(data).forEach(key => {
        touched[key] = touchedFields.includes(key);
      });

      // Validate each field
      for (const [field, fieldRules] of Object.entries(rules)) {
        if (fieldRules.length === 0) continue;

        const fieldValue = data[field];
        const fieldValidation = this.validateField(fieldValue, fieldRules, data);

        if (!fieldValidation.isValid) {
          errors[field] = fieldValidation.errors;
          isValid = false;
        }
      }

      this.logger.debug('Form validation completed', {
        isValid,
        errorCount: Object.keys(errors).length,
        fields: Object.keys(data)
      });

      return {
        isValid,
        errors,
        touched
      };
    } catch (error) {
      const handledError = errorHandler.handle(error, 'FormValidation:form');
      this.logger.error('Form validation failed', {
        error: handledError.message,
        fields: Object.keys(data)
      });

      return {
        isValid: false,
        errors: { _system: ['Form validation system error'] },
        touched: {}
      };
    }
  }

  validateArray(
    values: unknown[],
    rules: ValidationRule[],
    formData: Record<string, unknown> = {}
  ): { isValid: boolean; errors: string[][] } {
    const errors: string[][] = [];
    let isValid = true;

    try {
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        const fieldValidation = this.validateField(value, rules, formData);

        errors[i] = fieldValidation.errors;

        if (!fieldValidation.isValid) {
          isValid = false;
        }
      }

      return {
        isValid,
        errors
      };
    } catch (error) {
      const handledError = errorHandler.handle(error, 'FormValidation:array');
      this.logger.error('Array validation failed', {
        error: handledError.message,
        itemCount: values.length
      });

      return {
        isValid: false,
        errors: Array(values.length).fill(['Validation system error'])
      };
    }
  }

  validateNested(
    data: Record<string, unknown>,
    rules: Record<string, ValidationRule[]>,
    formData: Record<string, unknown> = {}
  ): FormValidation {
    const errors: Record<string, string[]> = {};
    const touched: Record<string, boolean> = {};
    let isValid = true;

    try {
      for (const [field, fieldRules] of Object.entries(rules)) {
        if (fieldRules.length === 0) continue;

        // Handle nested fields (e.g., 'user.name')
        const fieldValue = this.getNestedValue(data, field);
        const fieldValidation = this.validateField(fieldValue, fieldRules, formData);

        if (!fieldValidation.isValid) {
          errors[field] = fieldValidation.errors;
          isValid = false;
        }

        touched[field] = true;
      }

      return {
        isValid,
        errors,
        touched
      };
    } catch (error) {
      const handledError = errorHandler.handle(error, 'FormValidation:nested');
      this.logger.error('Nested form validation failed', {
        error: handledError.message
      });

      return {
        isValid: false,
        errors: { _system: ['Nested validation system error'] },
        touched: {}
      };
    }
  }

  cleanFormData<T extends Record<string, unknown>>(data: T): Partial<T> {
    const cleaned: Partial<T> = {};

    try {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed !== '') {
              (cleaned as any)[key] = trimmed;
            }
          } else {
            (cleaned as any)[key] = value;
          }
        }
      });

      return cleaned;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'FormService:clean');
      this.logger.error('Form data cleaning failed', {
        error: handledError.message
      });

      return {};
    }
  }

  getFormChanges<T extends Record<string, unknown>>(
    original: T,
    current: T
  ): Partial<T> {
    const changes: Partial<T> = {};

    try {
      const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);

      allKeys.forEach(key => {
        const originalValue = (original as any)[key];
        const currentValue = (current as any)[key];

        if (!this.isEqual(originalValue, currentValue)) {
          (changes as any)[key] = currentValue;
        }
      });

      return changes;
    } catch (error) {
      const handledError = errorHandler.handle(error, 'FormService:changes');
      this.logger.error('Form changes detection failed', {
        error: handledError.message
      });

      return {};
    }
  }

  createRule(
    test: (value: unknown, formData?: Record<string, unknown>) => boolean,
    message: string
  ): ValidationRule {
    return {
      test,
      message
    };
  }

  createValidationSet(...rules: ValidationRule[]): ValidationRule[] {
    return [...rules];
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      if (current && typeof current === 'object' && key in (current as any)) {
        return (current as any)[key];
      }
      return undefined;
    }, obj as any);
  }

  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return a === b;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object' && a !== null && b !== null) {
      const aObj = a as Record<string, unknown>;
      const bObj = b as Record<string, unknown>;

      const aKeys = Object.keys(aObj);
      const bKeys = Object.keys(bObj);

      if (aKeys.length !== bKeys.length) return false;

      return aKeys.every(key =>
        key in bObj && this.isEqual(aObj[key], bObj[key])
      );
    }

    return String(a) === String(b);
  }
}

// Создание и экспорт синглтона
export const formService: FormService = new FormServiceImpl();
