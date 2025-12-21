/**
 * Composable для валидации форм авторизации
 */

import { reactive, computed } from 'vue';

export interface AuthValidationErrors {
  username?: string;
  password?: string;
  email?: string;
  confirmPassword?: string;
  general?: string;
}

export const useAuthValidation = () => {
  const state = reactive<{
    errors: AuthValidationErrors;
    touched: Record<string, boolean>;
  }>({
    errors: {},
    touched: {}
  });

  const rules = {
    username: {
      required: (value: string) => !!value.trim() || 'Имя пользователя обязательно',
      minLength: (value: string) => value.length >= 2 || 'Минимум 2 символа',
      maxLength: (value: string) => value.length <= 50 || 'Максимум 50 символов',
      pattern: (value: string) => /^[a-zA-Z0-9_]+$/.test(value) || 'Только буквы, цифры и подчеркивания'
    },
    password: {
      required: (value: string) => !!value.trim() || 'Пароль обязателен',
      minLength: (value: string) => value.length >= 3 || 'Минимум 3 символа',
      maxLength: (value: string) => value.length <= 100 || 'Максимум 100 символов'
    }
  };

  const validateField = (field: keyof typeof rules, value: string, extra?: any) => {
    const fieldRules = rules[field];

    for (const [ruleName, validator] of Object.entries(fieldRules)) {
      const error = typeof validator === 'function'
        ? validator(value, extra)
        : (validator as any)(value);

      if (error && typeof error === 'string') {
        state.errors[field] = error;
        return;
      }
    }

    delete state.errors[field];
  };

  const validateForm = (form: Record<string, string>) => {
    state.errors = {};

    Object.entries(form).forEach(([field, value]) => {
      if (field in rules) {
        validateField(field as keyof typeof rules, value, form.password);
      }
    });

    return Object.keys(state.errors).length === 0;
  };

  const markAsTouched = (field: string) => {
    state.touched[field] = true;
  };

  const reset = () => {
    state.errors = {};
    state.touched = {};
  };

  const isValid = computed(() => Object.keys(state.errors).length === 0);

  return {
    errors: computed(() => state.errors),
    touched: computed(() => state.touched),
    isValid,
    validateField,
    validateForm,
    markAsTouched,
    reset
  };
};

export type UseAuthValidationReturn = ReturnType<typeof useAuthValidation>;
