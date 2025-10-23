import { logger } from '@/core/utils/logger/logger';
import type { FormService, ValidationRule, FieldValidation, FormValidation, FormValidationRules } from '../types';

class FormServiceImpl implements FormService {
  private readonly logger = logger.create('FormService');

  validateField(
    value: any,
    rules: ValidationRule[],
    formData: Record<string, any> = {}
  ): FieldValidation {
    if (!rules || rules.length === 0) {
      return { isValid: true, errors: [] };
    }

    const errors: string[] = [];
    const validatedValue = this.normalizeValue(value);

    for (const rule of rules) {
      if (!rule.test(validatedValue, formData)) {
        errors.push(rule.message);

        // Early return for required field if value is empty
        if (rule.key === 'required' && this.isEmptyValue(validatedValue)) {
          break;
        }
      }
    }

    const result = {
      isValid: errors.length === 0,
      errors,
    };

    if (!result.isValid) {
      this.logger.debug('Field validation failed', {
        value: this.truncateValue(validatedValue),
        errors: result.errors,
        rulesCount: rules.length
      });
    }

    return result;
  }

  validateForm(
    data: Record<string, any>,
    rules: Record<string, ValidationRule[]>,
    touchedFields: string[] = []
  ): FormValidation {
    const errors: Record<string, string[]> = {};
    const touched: Record<string, boolean> = {};
    let isValid = true;

    // Initialize touched fields
    touchedFields.forEach(field => {
      touched[field] = true;
    });

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field];
      const isFieldTouched = touchedFields.includes(field);

      // Only validate touched fields or all fields if no touched fields specified
      if (touchedFields.length === 0 || isFieldTouched) {
        const fieldValidation = this.validateField(value, fieldRules, data);

        if (!fieldValidation.isValid) {
          errors[field] = fieldValidation.errors;
          isValid = false;
        }

        touched[field] = true;
      }
    }

    const result = { isValid, errors, touched };

    if (!isValid) {
      this.logger.debug('Form validation failed', {
        fields: Object.keys(data),
        errorFields: Object.keys(errors),
        errorCount: Object.values(errors).flat().length
      });
    }

    return result;
  }

  createRule(
    test: (value: any, formData?: Record<string, any>) => boolean,
    message: string
  ): ValidationRule {
    return { test, message };
  }

  // Common validation rules
  readonly rules: FormValidationRules = {
    required: (message: string = 'Это поле обязательно'): ValidationRule => ({
      test: (value) => {
        const normalized = this.normalizeValue(value);
        return !this.isEmptyValue(normalized);
      },
      message,
      key: 'required'
    }),

    minLength: (min: number, message?: string): ValidationRule => ({
      test: (value) => {
        const normalized = this.normalizeValue(value);
        return this.isEmptyValue(normalized) || String(normalized).length >= min;
      },
      message: message || `Минимальная длина: ${min} символов`,
      key: 'minLength'
    }),

    maxLength: (max: number, message?: string): ValidationRule => ({
      test: (value) => {
        const normalized = this.normalizeValue(value);
        return this.isEmptyValue(normalized) || String(normalized).length <= max;
      },
      message: message || `Максимальная длина: ${max} символов`,
      key: 'maxLength'
    }),

    email: (message?: string): ValidationRule => ({
      test: (value) => {
        const normalized = this.normalizeValue(value);
        if (this.isEmptyValue(normalized)) return true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(normalized).toLowerCase());
      },
      message: message || 'Введите корректный email адрес',
      key: 'email'
    }),

    pattern: (regex: RegExp, message: string): ValidationRule => ({
      test: (value) => {
        const normalized = this.normalizeValue(value);
        return this.isEmptyValue(normalized) || regex.test(String(normalized));
      },
      message,
      key: 'pattern'
    }),

    equals: (field: string, message: string): ValidationRule => ({
      test: (value, formData = {}) => {
        const normalized = this.normalizeValue(value);
        return this.isEmptyValue(normalized) || normalized === formData[field];
      },
      message,
      key: 'equals'
    }),

    min: (min: number, message?: string): ValidationRule => ({
      test: (value) => {
        const normalized = this.normalizeValue(value);
        if (this.isEmptyValue(normalized)) return true;

        const num = Number(normalized);
        return !isNaN(num) && num >= min;
      },
      message: message || `Минимальное значение: ${min}`,
      key: 'min'
    }),

    max: (max: number, message?: string): ValidationRule => ({
      test: (value) => {
        const normalized = this.normalizeValue(value);
        if (this.isEmptyValue(normalized)) return true;

        const num = Number(normalized);
        return !isNaN(num) && num <= max;
      },
      message: message || `Максимальное значение: ${max}`,
      key: 'max'
    }),

    custom: (validator: (value: any, formData?: Record<string, any>) => boolean, message: string): ValidationRule => ({
      test: validator,
      message,
      key: 'custom'
    }),
  };

  // Utility methods
  normalizeValue(value: any): any {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }

  isEmptyValue(value: any): boolean {
    return value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'string' && value.trim() === '');
  }

  truncateValue(value: any, maxLength: number = 50): any {
    if (typeof value === 'string' && value.length > maxLength) {
      return value.substring(0, maxLength) + '...';
    }
    return value;
  }

  // Advanced validation methods
  validateAsync = async (
    value: any,
    rules: ValidationRule[],
    formData: Record<string, any> = {}
  ): Promise<FieldValidation> => {
    // Для асинхронных валидаций (например, проверка на сервере)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.validateField(value, rules, formData));
      }, 0);
    });
  };

  createValidator = (rules: ValidationRule[]) => {
    return (value: any, formData?: Record<string, any>) => {
      return this.validateField(value, rules, formData);
    };
  };

  // Batch validation for multiple fields
  validateFields = (
    fields: Record<string, any>,
    rules: Record<string, ValidationRule[]>
  ): Record<string, FieldValidation> => {
    const results: Record<string, FieldValidation> = {};

    for (const [field, value] of Object.entries(fields)) {
      const fieldRules = rules[field] || [];
      results[field] = this.validateField(value, fieldRules, fields);
    }

    return results;
  };
}

export const formService: FormService = new FormServiceImpl();
