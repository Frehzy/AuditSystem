<template>
  <div class="base-input" :class="containerClasses">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required">*</span>
    </label>

    <div class="base-input__field-wrapper">
      <!-- Префикс -->
      <div v-if="$slots.prefix" class="base-input__prefix">
        <slot name="prefix" />
      </div>

      <!-- Основное поле ввода -->
      <input :id="inputId"
             ref="inputRef"
             :type="inputType"
             :value="modelValue"
             :placeholder="placeholder"
             :disabled="disabled"
             :readonly="readonly"
             :maxlength="maxlength"
             :autocomplete="autocomplete"
             :class="inputClasses"
             @input="onInput"
             @blur="onBlur"
             @focus="onFocus"
             @keydown="onKeydown" />

      <!-- Суффиксы -->
      <div v-if="hasSuffix" class="base-input__suffix-group">
        <!-- Переключатель видимости пароля -->
        <button v-if="showPasswordToggle && type === 'password'"
                type="button"
                class="base-input__suffix base-input__password-toggle"
                @click="togglePasswordVisibility"
                :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'">
          <EyeIcon v-if="showPassword" />
          <EyeOffIcon v-else />
        </button>

        <!-- Кнопка очистки -->
        <button v-if="clearable && modelValue"
                type="button"
                class="base-input__suffix base-input__clear"
                @click="clearInput"
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
      {{ modelValue?.length || 0 }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, nextTick } from 'vue'
import { EyeIcon, EyeOffIcon } from '@/assets/icons';

interface Props {
  id?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
  modelValue: string
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
const inputId = computed(() => props.id || `input-${useId()}`)
const inputType = computed(() => {
  if (props.type === 'password' && showPassword.value) {
    return 'text'
  }
  return props.type
})

const hasSuffix = computed(() => {
  return (
    props.clearable ||
    (props.showPasswordToggle && props.type === 'password') ||
    !!slots.suffix
  )
})

const containerClasses = computed(() => [
  'base-input',
  `base-input--${props.size}`,
  {
    'base-input--error': !!props.error,
    'base-input--disabled': props.disabled,
    'base-input--focused': isFocused.value,
    'base-input--has-value': !!props.modelValue,
  },
])

const inputClasses = computed(() => [
  'base-input__input',
  {
    'base-input__input--error': !!props.error,
    'base-input__input--disabled': props.disabled,
    'base-input__input--with-prefix': !!slots.prefix,
    'base-input__input--with-suffix': hasSuffix.value,
  },
])

// Методы
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const onBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const onFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const onKeydown = (event: KeyboardEvent) => {
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
    margin-bottom: 1rem;
  }

  .base-input__label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--color-text-primary);
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .base-input__required {
    color: var(--color-error);
    margin-left: 0.25rem;
  }

  .base-input__field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    transition: all var(--transition-normal);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

    .base-input__field-wrapper:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent), var(--shadow-md);
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
    background-color: color-mix(in srgb, var(--color-surface) 50%, transparent);
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .base-input__input {
    flex: 1;
    padding: 0.75rem;
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    min-height: 2.75rem;
    width: 100%;
    transition: color var(--transition-fast);
  }

    .base-input__input::placeholder {
      color: var(--color-text-muted);
    }

  .base-input--disabled .base-input__input {
    cursor: not-allowed;
    color: var(--color-text-muted);
  }

  .base-input__input--with-prefix {
    padding-left: 0.5rem;
  }

  .base-input__input--with-suffix {
    padding-right: 0.5rem;
  }

  /* Префикс */
  .base-input__prefix {
    display: flex;
    align-items: center;
    padding: 0 0.75rem;
    color: var(--color-text-muted);
    border-right: 1px solid var(--color-border);
    background: transparent !important;
    flex-shrink: 0;
    transition: color var(--transition-fast);
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
    padding: 0 0.5rem;
    color: var(--color-text-muted);
    border-left: 1px solid var(--color-border);
    background: transparent !important;
    transition: color var(--transition-fast);
  }

  .base-input__password-toggle,
  .base-input__clear {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all var(--transition-fast);
    color: inherit;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
  }

    .base-input__password-toggle:hover,
    .base-input__clear:hover {
      background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
    }

  .base-input__clear {
    font-size: 1.125rem;
    line-height: 1;
  }

  .base-input--disabled .base-input__password-toggle,
  .base-input--disabled .base-input__clear {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Вспомогательный текст и ошибки */
  .base-input__help {
    margin-top: 0.25rem;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    line-height: 1.25;
  }

  .base-input__error {
    margin-top: 0.25rem;
    color: var(--color-error);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

    .base-input__error::before {
      content: '⚠';
      font-size: 0.875rem;
    }

  .base-input__counter {
    margin-top: 0.25rem;
    text-align: right;
    color: var(--color-text-muted);
    font-size: 0.75rem;
  }

  /* Размеры */
  .base-input--sm .base-input__input {
    padding: 0.5rem 0.75rem;
    min-height: 2.25rem;
    font-size: 0.8125rem;
  }

  .base-input--sm .base-input__prefix,
  .base-input--sm .base-input__suffix {
    padding: 0 0.5rem;
  }

  .base-input--lg .base-input__input {
    padding: 0.875rem 1rem;
    min-height: 3rem;
    font-size: 1rem;
  }

  /* Адаптивность */
  @media (max-width: 480px) {
    .base-input__input {
      font-size: 1rem; /* Предотвращает зум на iOS */
    }
  }
</style>
