// src/framework/ui/types/form.ts
/**
 * Типы для компонентов форм
 */

import type { ValidationRule } from '../composables/useForm'

export interface FormField {
  value: unknown
  rules?: ValidationRule[]
  touched: boolean
  dirty: boolean
  errors: string[]
}

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
  icon?: string
}

export interface FormSubmitEvent {
  isValid: boolean
  data: Record<string, unknown>
  errors: Record<string, string[]>
}

export interface FormChangeEvent {
  field: string
  value: unknown
  isValid: boolean
}
