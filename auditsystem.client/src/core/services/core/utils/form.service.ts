// src/core/services/core/utils/form.service.ts
import { logger } from '@/core/utils/logger';
import type { FormService, ValidationRule, FieldValidation, FormValidation, FormValidationRules } from '@/core/types';

class FormServiceImpl implements FormService {
  private readonly logger = logger.create('FormService');

  validateField(value: unknown, rules: ValidationRule[], formData?: Record<string, unknown>): FieldValidation {
    const errors: string[] = [];

    for (const rule of rules) {
      try {
        const isValid = rule.test(value, formData);
        if (!isValid) {
          errors.push(rule.message);
        }
      } catch (error) {
        this.logger.error('Error during field validation', {
          ruleKey: rule.key,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errors.push('Validation error occurred');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateForm(data: Record<string, unknown>, rules: Record<string, ValidationRule[]>, touchedFields: string[] = []): FormValidation {
    const errors: Record<string, string[]> = {};
    const touched: Record<string, boolean> = {};
    let isValid = true;

    // Initialize touched state
    Object.keys(data).forEach(key => {
      touched[key] = touchedFields.includes(key);
    });

    // Validate each field
    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      if (fieldRules.length === 0) continue;

      const fieldValue = data[fieldName];
      const fieldValidation = this.validateField(fieldValue, fieldRules, data);

      if (!fieldValidation.isValid) {
        errors[fieldName] = fieldValidation.errors;
        isValid = false;
      }
    }

    // Log validation results
    if (!isValid) {
      this.logger.debug('Form validation failed', {
        errors: Object.keys(errors),
        totalErrors: Object.values(errors).flat().length
      });
    }

    return { isValid, errors, touched };
  }

  createRule(test: (value: unknown, formData?: Record<string, unknown>) => boolean, message: string): ValidationRule {
    return {
      test,
      message
    };
  }

  readonly rules: FormValidationRules = {
    required: (message = 'Это поле обязательно для заполнения') =>
      this.createRule(
        (value) => value != null && value !== '' && !(Array.isArray(value) && value.length === 0),
        message
      ),

    minLength: (min: number, message?: string) =>
      this.createRule(
        (value) => value == null || String(value).length >= min,
        message || `Минимальная длина: ${min} символов`
      ),

    maxLength: (max: number, message?: string) =>
      this.createRule(
        (value) => value == null || String(value).length <= max,
        message || `Максимальная длина: ${max} символов`
      ),

    email: (message = 'Введите корректный email адрес') =>
      this.createRule(
        (value) => value == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
        message
      ),

    pattern: (regex: RegExp, message: string) =>
      this.createRule(
        (value) => value == null || regex.test(String(value)),
        message
      ),

    equals: (field: string, message: string) =>
      this.createRule(
        (value, formData) => value == null || value === formData?.[field],
        message
      ),

    min: (min: number, message?: string) =>
      this.createRule(
        (value) => value == null || Number(value) >= min,
        message || `Минимальное значение: ${min}`
      ),

    max: (max: number, message?: string) =>
      this.createRule(
        (value) => value == null || Number(value) <= max,
        message || `Максимальное значение: ${max}`
      ),

    custom: (validator: (value: unknown, formData?: Record<string, unknown>) => boolean, message: string) =>
      this.createRule(validator, message)
  };
}

export const formService: FormService = new FormServiceImpl();
