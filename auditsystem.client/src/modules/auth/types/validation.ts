// src/modules/auth/types/validation.ts

/** Ошибки валидации формы авторизации */
export interface AuthValidationErrors {
  username?: string;
  password?: string;
  email?: string;
  confirmPassword?: string;
  general?: string;
}

/** Правила валидации */
export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

/** Состояние валидации */
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}
