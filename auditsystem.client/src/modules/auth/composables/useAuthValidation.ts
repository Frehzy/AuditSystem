import { Validator, validationRules } from '@/core/utils/validation/validation.rules';
import type { AuthValidationErrors } from '../api/auth.types';

// Исправляем типизацию rules
interface ValidationRuleSet {
  username: ReturnType<typeof validationRules.required>[];
  password: ReturnType<typeof validationRules.required>[];
  email: ReturnType<typeof validationRules.required>[];
  confirmPassword: (ReturnType<typeof validationRules.required> | ReturnType<typeof validationRules.pattern>)[];
}

const createValidationRules = (): ValidationRuleSet => ({
  username: [
    validationRules.required('Имя пользователя обязательно'),
    validationRules.minLength(2, 'Минимум 2 символа'),
    validationRules.maxLength(50, 'Максимум 50 символов'),
    validationRules.pattern(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и подчеркивания'),
  ],
  password: [
    validationRules.required('Пароль обязателен'),
    validationRules.minLength(3, 'Минимум 3 символа'),
    validationRules.maxLength(100, 'Максимум 100 символов'),
  ],
  email: [
    validationRules.required('Email обязателен'),
    validationRules.email('Введите корректный email адрес'),
    validationRules.maxLength(100, 'Максимум 100 символов'),
  ],
  confirmPassword: [
    validationRules.required('Подтверждение пароля обязательно'),
  ],
});

export const useAuthValidation = () => {
  const rules = createValidationRules();

  /**
   * Валидация отдельного поля
   */
  const validateField = (
    field: keyof ValidationRuleSet, 
    value: string, 
    formData?: Record<string, string>
  ): string | null => {
    let fieldRules = rules[field];

    // Специальная проверка для подтверждения пароля
    if (field === 'confirmPassword' && formData?.password) {
      fieldRules = [
        ...fieldRules,
        validationRules.pattern(
          new RegExp(`^${formData.password}$`),
          'Пароли не совпадают'
        ),
      ];
    }

    // Приводим правила к правильному типу
    const validationRulesArray = fieldRules as any[];
    const result = Validator.validate(value, validationRulesArray);
    return result.errors.length > 0 ? result.errors[0] : null;
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
    validationRules: rules,
  };
};
