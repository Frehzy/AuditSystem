// src/modules/auth/composables/useAuthValidation.ts
import { validators } from '@/core/utils/validation.rules';
import type { AuthValidationErrors } from '../api/auth.types';

export const useAuthValidation = () => {
  /**
   * Валидация отдельного поля
   */
  const validateField = (
    field: string,
    value: string,
    formData?: Record<string, string>
  ): string | null => {
    let fieldRules: Array<{ test: (val: unknown) => boolean; message: string }> = [];

    // Правила для разных полей
    switch (field) {
      case 'username':
        fieldRules = [
          validators.baseRules.required,
          validators.baseRules.minLength(2),
          validators.baseRules.maxLength(50),
          {
            test: (val: unknown) => typeof val === 'string' && /^[a-zA-Z0-9_]+$/.test(val),
            message: 'Только буквы, цифры и подчеркивания'
          },
        ];
        break;
      case 'password':
        fieldRules = [
          validators.baseRules.required,
          validators.baseRules.minLength(3),
          validators.baseRules.maxLength(100),
        ];
        break;
      case 'email':
        fieldRules = [
          validators.baseRules.required,
          validators.baseRules.email,
          validators.baseRules.maxLength(100),
        ];
        break;
      case 'confirmPassword':
        fieldRules = [
          validators.baseRules.required,
        ];

        // Специальная проверка для подтверждения пароля
        if (formData?.password && value !== formData.password) {
          return 'Пароли не совпадают';
        }
        break;
      default:
        return null;
    }

    // Проверка каждого правила
    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }

    return null;
  };

  /**
   * Валидация всей формы
   */
  const validateForm = (form: {
    username?: string;
    password?: string;
    email?: string;
    confirmPassword?: string;
  }): AuthValidationErrors => {
    const errors: AuthValidationErrors = {};

    if (form.username !== undefined) {
      const usernameError = validateField('username', form.username);
      if (usernameError) errors.username = usernameError;
    }

    if (form.password !== undefined) {
      const passwordError = validateField('password', form.password);
      if (passwordError) errors.password = passwordError;
    }

    if (form.email !== undefined) {
      const emailError = validateField('email', form.email);
      if (emailError) errors.email = emailError;
    }

    if (form.confirmPassword !== undefined) {
      const confirmPasswordError = validateField(
        'confirmPassword',
        form.confirmPassword,
        form as Record<string, string>
      );
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    }

    return errors;
  };

  /**
   * Проверка валидности формы
   */
  const isFormValid = (form: Record<string, unknown>, errors: AuthValidationErrors): boolean => {
    return Object.keys(errors).length === 0 &&
      Object.values(form).every(value => {
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        return value !== undefined && value !== null;
      });
  };

  /**
   * Сброс ошибок валидации
   */
  const resetErrors = (): AuthValidationErrors => {
    return {};
  };

  return {
    validateField,
    validateForm,
    isFormValid,
    resetErrors,
  };
};
