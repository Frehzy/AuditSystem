<template>
  <div class="base-input" :class="computedContainerClasses">
    <label v-if="label" :for="computedInputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__field-wrapper">
      <!-- Префикс -->
      <div v-if="$slots.prefix" class="base-input__prefix">
        <slot name="prefix" />
      </div>

      <!-- Основное поле ввода -->
      <input :id="computedInputId"
             ref="inputRef"
             :type="computedInputType"
             :value="computedValue"
             :placeholder="placeholder"
             :disabled="disabled"
             :readonly="readonly"
             :maxlength="maxlength"
             :autocomplete="autocomplete"
             :class="computedInputClasses"
             @input="handleInput"
             @blur="handleBlur"
             @focus="handleFocus"
             @keydown="handleKeydown" />

      <!-- Суффиксы -->
      <div v-if="hasSuffix" class="base-input__suffix-group">
        <!-- Переключатель видимости пароля -->
        <button v-if="showPasswordToggle && type === 'password'"
                type="button"
                class="base-input__suffix base-input__password-toggle"
                @click="togglePasswordVisibility"
                :disabled="disabled"
                :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'">
          <EyeIcon v-if="showPassword" />
          <EyeOffIcon v-else />
        </button>

        <!-- Кнопка очистки -->
        <button v-if="clearable && modelValue"
                type="button"
                class="base-input__suffix base-input__clear"
                @click="clearInput"
                :disabled="disabled"
                aria-label="Очистить поле">
          ×
        </button>

        <!-- Пользовательский суффикс -->
        <div v-if="$slots.suffix" class="base-input__suffix">
          <slot name="suffix" />
        </div>
      </div>
    </div>

    <!-- Вспомогательный текст -->
    <div v-if="helpText && !error" class="base-input__help">
      {{ helpText }}
    </div>

    <!-- Сообщение об ошибке -->
    <div v-if="error" class="base-input__error" role="alert">
      {{ error }}
    </div>

    <!-- Счетчик символов -->
    <div v-if="maxlength && showCounter" class="base-input__counter">
      {{ computedValue?.length || 0 }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useId, nextTick } from 'vue'
  import EyeIcon from '@/assets/icons/auth/EyeIcon.vue'
  import EyeOffIcon from '@/assets/icons/auth/EyeOffIcon.vue'

  interface Props {
    id?: string
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
    modelValue: string | number
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    error?: string
    helpText?: string
    maxlength?: number
    showCounter?: boolean
    clearable?: boolean
    autocomplete?: string
    showPasswordToggle?: boolean
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
    disabled: false,
    readonly: false,
    error: undefined,
    helpText: undefined,
    showCounter: false,
    clearable: false,
    showPasswordToggle: false,
    size: 'md',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
    'keydown': [event: KeyboardEvent]
    'clear': []
  }>()

  const slots = defineSlots()

  // Реактивные состояния
  const inputRef = ref<HTMLInputElement | null>(null)
  const showPassword = ref(false)
  const isFocused = ref(false)

  // Вычисляемые свойства
  const computedInputId = computed(() => props.id || `input-${useId()}`)
  const computedInputType = computed(() => {
    if (props.type === 'password' && showPassword.value) {
      return 'text'
    }
    return props.type
  })

  // Преобразуем значение в строку для отображения
  const computedValue = computed(() => {
    return String(props.modelValue ?? '')
  })

  const hasSuffix = computed(() => {
    return (
      props.clearable ||
      (props.showPasswordToggle && props.type === 'password') ||
      !!slots.suffix
    )
  })

  const computedContainerClasses = computed(() => [
    'base-input',
    `base-input--${props.size}`,
    {
      'base-input--error': !!props.error,
      'base-input--disabled': props.disabled,
      'base-input--focused': isFocused.value,
      'base-input--has-value': !!props.modelValue,
    },
  ])

  const computedInputClasses = computed(() => [
    'base-input__input',
    {
      'base-input__input--error': !!props.error,
      'base-input__input--disabled': props.disabled,
      'base-input__input--with-prefix': !!slots.prefix,
      'base-input__input--with-suffix': hasSuffix.value,
    },
  ])

  // Методы
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    // Для числовых полей преобразуем обратно в число
    if (props.type === 'number') {
      const numValue = target.value === '' ? '' : Number(target.value)
      emit('update:modelValue', numValue)
    } else {
      emit('update:modelValue', target.value)
    }
  }

  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false
    emit('blur', event)
  }

  const handleFocus = (event: FocusEvent) => {
    isFocused.value = true
    emit('focus', event)
  }

  const handleKeydown = (event: KeyboardEvent) => {
    emit('keydown', event)
  }

  const clearInput = () => {
    emit('update:modelValue', '')
    emit('clear')
    nextTick(() => inputRef.value?.focus())
  }

  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
  }

  // Публичные методы
  defineExpose({
    focus: () => inputRef.value?.focus(),
    blur: () => inputRef.value?.blur(),
    select: () => inputRef.value?.select(),
  })
</script>

<style scoped>
  .base-input {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--space-md, 1rem);
  }

  .base-input__label {
    display: block;
    margin-bottom: var(--space-sm, 0.75rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-input__required {
    color: var(--color-error);
    margin-left: var(--space-xs, 0.5rem);
  }

  .base-input__field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md, 0.5rem);
    transition: all var(--transition-fast, 0.15s);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

    .base-input__field-wrapper:focus-within {
      border-color: var(--color-primary);
      box-shadow: var(--shadow-focus);
      transform: translateY(-1px);
    }

  .base-input--error .base-input__field-wrapper {
    border-color: var(--color-error);
    box-shadow: 0 0 0 1px var(--color-error);
  }

    .base-input--error .base-input__field-wrapper:focus-within {
      border-color: var(--color-error);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 20%, transparent);
    }

  .base-input--disabled .base-input__field-wrapper {
    background-color: var(--color-surface-hover);
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .base-input__input {
    flex: 1;
    padding: var(--space-md, 1rem);
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    min-height: 2.75rem;
    width: 100%;
    transition: color var(--transition-fast, 0.15s);
    font-family: var(--font-family-sans, inherit);
  }

    .base-input__input::placeholder {
      color: var(--color-text-muted);
    }

  .base-input--disabled .base-input__input {
    cursor: not-allowed;
    color: var(--color-text-muted);
  }

  .base-input__input--with-prefix {
    padding-left: var(--space-sm, 0.75rem);
  }

  .base-input__input--with-suffix {
    padding-right: var(--space-sm, 0.75rem);
  }

  /* Префикс */
  .base-input__prefix {
    display: flex;
    align-items: center;
    padding: 0 var(--space-md, 1rem);
    color: var(--color-text-muted);
    border-right: 1px solid var(--color-border);
    background: transparent;
    flex-shrink: 0;
    transition: color var(--transition-fast, 0.15s);
  }

  .base-input__field-wrapper:focus-within .base-input__prefix {
    color: var(--color-primary);
  }

  /* Группа суффиксов */
  .base-input__suffix-group {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .base-input__suffix {
    display: flex;
    align-items: center;
    padding: 0 var(--space-sm, 0.75rem);
    color: var(--color-text-muted);
    border-left: 1px solid var(--color-border);
    background: transparent;
    transition: color var(--transition-fast, 0.15s);
  }

  .base-input__password-toggle,
  .base-input__clear {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--space-xs, 0.5rem);
    border-radius: var(--radius-sm, 0.375rem);
    transition: all var(--transition-fast, 0.15s);
    color: inherit;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
  }

    .base-input__password-toggle:hover:not(:disabled),
    .base-input__clear:hover:not(:disabled) {
      background-color: color-mix(in srgb, var(--color-primary) 10%, transparent);
      color: var(--color-primary);
    }

    .base-input__password-toggle:disabled,
    .base-input__clear:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

  .base-input__clear {
    font-size: 1.125rem;
    line-height: 1;
    font-weight: var(--font-weight-semibold, 600);
  }

  /* Вспомогательный текст и ошибки */
  .base-input__help {
    margin-top: var(--space-sm, 0.75rem);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
  }

  .base-input__error {
    margin-top: var(--space-sm, 0.75rem);
    color: var(--color-error);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-medium, 500);
    display: flex;
    align-items: center;
    gap: var(--space-xs, 0.5rem);
  }

    .base-input__error::before {
      content: '⚠';
      font-size: 0.875rem;
    }

  .base-input__counter {
    margin-top: var(--space-sm, 0.75rem);
    text-align: right;
    color: var(--color-text-muted);
    font-size: 0.75rem;
  }

  /* Размеры */
  .base-input--sm .base-input__input {
    padding: var(--space-sm, 0.75rem);
    min-height: 2.25rem;
    font-size: 0.8125rem;
  }

  .base-input--sm .base-input__prefix,
  .base-input--sm .base-input__suffix {
    padding: 0 var(--space-sm, 0.75rem);
  }

  .base-input--lg .base-input__input {
    padding: var(--space-lg, 1.25rem);
    min-height: 3rem;
    font-size: 1rem;
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .base-input__input {
      font-size: 1rem; /* Предотвращает зум на iOS */
    }

    .base-input--sm .base-input__input {
      padding: var(--space-sm, 0.75rem) var(--space-md, 1rem);
    }
  }

  @media (max-width: 480px) {
    .base-input {
      margin-bottom: var(--space-lg, 1.25rem);
    }

    .base-input__field-wrapper {
      border-radius: var(--radius-lg, 0.75rem);
    }
  }

  /* Анимации для улучшения UX */
  .base-input__field-wrapper {
    animation: slide-in var(--transition-fast, 0.15s) ease-out;
  }

  @keyframes slide-in {
    from {
      opacity: 0;
      transform: translateY(2px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Улучшения для доступности */
  @media (prefers-reduced-motion: reduce) {
    .base-input__field-wrapper {
      animation: none;
      transition: none;
    }

    .base-input__input {
      transition: none;
    }
  }

  /* Улучшения для высокой контрастности */
  @media (prefers-contrast: high) {
    .base-input__field-wrapper {
      border-width: 2px;
    }

    .base-input--error .base-input__field-wrapper {
      border-width: 2px;
    }
  }
</style>
