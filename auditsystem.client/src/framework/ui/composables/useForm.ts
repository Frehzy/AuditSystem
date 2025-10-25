// src/framework/ui/composables/useForm.ts
import { ref, computed, watch } from 'vue'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
  message?: string
}

export interface FormField {
  value: any
  rules?: ValidationRule[]
  touched: boolean
  dirty: boolean
  errors: string[]
}

export interface FormOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounce?: number
}

/**
 * Композабл для управления формами с валидацией
 * 
 * @example
 * const { fields, validate, reset } = useForm({
 *   username: {
 *     value: '',
 *     rules: [
 *       { required: true, message: 'Имя пользователя обязательно' },
 *       { minLength: 3, message: 'Минимум 3 символа' }
 *     ]
 *   }
 * })
 */
export function useForm<T extends Record<string, FormField>>(
  initialFields: T,
  options: FormOptions = {}
) {
  const fields = ref({ ...initialFields })
  const isValid = ref(false)
  const isSubmitting = ref(false)

  const { validateOnChange = true, validateOnBlur = true, debounce = 300 } = options

  // Вычисляемое свойство для проверки валидности всей формы
  const formValid = computed(() => {
    return Object.values(fields.value).every(field => field.errors.length === 0)
  })

  // Валидация одного поля
  const validateField = (fieldName: keyof T): string[] => {
    const field = fields.value[fieldName]
    const errors: string[] = []

    if (!field.rules) return errors

    for (const rule of field.rules) {
      let valid = true
      let message = rule.message

      if (rule.required && (field.value === '' || field.value == null)) {
        valid = false
        message = message || 'Это поле обязательно для заполнения'
      }

      if (rule.minLength && field.value && field.value.length < rule.minLength) {
        valid = false
        message = message || `Минимальная длина: ${rule.minLength} символов`
      }

      if (rule.maxLength && field.value && field.value.length > rule.maxLength) {
        valid = false
        message = message || `Максимальная длина: ${rule.maxLength} символов`
      }

      if (rule.pattern && field.value && !rule.pattern.test(field.value)) {
        valid = false
        message = message || 'Неверный формат'
      }

      if (rule.validator) {
        const result = rule.validator(field.value)
        if (result !== true) {
          valid = false
          message = typeof result === 'string' ? result : message || 'Неверное значение'
        }
      }

      if (!valid && message) {
        errors.push(message)
      }
    }

    field.errors = errors
    return errors
  }

  // Валидация всей формы
  const validate = (): boolean => {
    let valid = true

    Object.keys(fields.value).forEach(fieldName => {
      const errors = validateField(fieldName as keyof T)
      if (errors.length > 0) {
        valid = false
      }
    })

    isValid.value = valid
    return valid
  }

  // Сброс формы
  const reset = () => {
    Object.keys(fields.value).forEach(fieldName => {
      const field = fields.value[fieldName]
      field.value = initialFields[fieldName].value
      field.touched = false
      field.dirty = false
      field.errors = []
    })
    isValid.value = false
    isSubmitting.value = false
  }

  // Отметка поля как "тронутого"
  const markAsTouched = (fieldName: keyof T) => {
    fields.value[fieldName].touched = true
  }

  // Отметка поля как "измененного"
  const markAsDirty = (fieldName: keyof T) => {
    fields.value[fieldName].dirty = true
  }

  // Получение данных формы
  const getFormData = () => {
    const data: any = {}
    Object.keys(fields.value).forEach(fieldName => {
      data[fieldName] = fields.value[fieldName].value
    })
    return data
  }

  // Watchers для автоматической валидации
  if (validateOnChange) {
    watch(
      () => Object.values(fields.value).map(f => f.value),
      () => {
        validate()
      },
      { deep: true, debounce }
    )
  }

  return {
    fields: computed(() => fields.value),
    isValid: computed(() => formValid.value),
    isSubmitting: computed(() => isSubmitting.value),
    validate,
    validateField,
    reset,
    markAsTouched,
    markAsDirty,
    getFormData,
    setSubmitting: (submitting: boolean) => {
      isSubmitting.value = submitting
    },
  }
}
