<!-- src/framework/ui/components/forms/BaseTextarea.vue -->
<template>
  <div class="base-textarea" :class="containerClasses">
    <label v-if="label" :for="textareaId" class="base-textarea__label">
      {{ label }}
      <span v-if="required" class="base-textarea__required">*</span>
    </label>

    <div class="base-textarea__wrapper">
      <textarea :id="textareaId"
                ref="textareaRef"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :readonly="readonly"
                :rows="computedRows"
                :maxlength="maxlength"
                :class="textareaClasses"
                @input="onInput"
                @blur="onBlur"
                @focus="onFocus"
                @keydown="onKeydown" />

      <div v-if="hasActions" class="base-textarea__actions">
        <button v-if="clearable && modelValue"
                type="button"
                class="base-textarea__clear"
                @click="clearTextarea"
                :disabled="disabled"
                aria-label="Очистить поле">
          <CloseIcon :size="16" />
        </button>
      </div>
    </div>

    <div v-if="helpText && !error" class="base-textarea__help">
      {{ helpText }}
    </div>

    <div v-if="error" class="base-textarea__error" role="alert">
      <AlertIcon :size="14" />
      {{ error }}
    </div>

    <div v-if="maxlength && showCounter" class="base-textarea__counter">
      {{ currentLength }}/{{ maxlength }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, useId, nextTick } from 'vue'
  import { CloseIcon, AlertIcon } from '@/assets/icons'

  interface Props {
    id?: string
    modelValue: string
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    error?: string
    helpText?: string
    rows?: number | string
    maxlength?: number
    showCounter?: boolean
    clearable?: boolean
    resize?: 'none' | 'vertical' | 'horizontal' | 'both'
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    required: false,
    disabled: false,
    readonly: false,
    error: undefined,
    helpText: undefined,
    rows: 3,
    showCounter: false,
    clearable: false,
    resize: 'vertical',
    size: 'md',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    'blur': [event: FocusEvent]
    'focus': [event: FocusEvent]
    'keydown': [event: KeyboardEvent]
    'clear': []
  }>()

  const textareaRef = ref<HTMLTextAreaElement | null>(null)
  const isFocused = ref(false)

  const textareaId = computed(() => props.id || `textarea-${useId()}`)
  const currentLength = computed(() => props.modelValue?.length || 0)
  const computedRows = computed(() => Number(props.rows))

  const hasActions = computed(() => props.clearable)

  const containerClasses = computed(() => [
    'base-textarea',
    `base-textarea--${props.size}`,
    {
      'base-textarea--error': !!props.error,
      'base-textarea--disabled': props.disabled,
      'base-textarea--focused': isFocused.value,
      'base-textarea--has-value': !!props.modelValue,
    },
  ])

  const textareaClasses = computed(() => [
    'base-textarea__input',
    `base-textarea__input--resize-${props.resize}`,
    {
      'base-textarea__input--error': !!props.error,
      'base-textarea__input--disabled': props.disabled,
      'base-textarea__input--focused': isFocused.value,
    },
  ])

  const onInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
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

  const clearTextarea = () => {
    emit('update:modelValue', '')
    emit('clear')
    nextTick(() => textareaRef.value?.focus())
  }

  defineExpose({
    focus: () => textareaRef.value?.focus(),
    blur: () => textareaRef.value?.blur(),
    select: () => textareaRef.value?.select(),
  })
</script>

<style scoped>
  .base-textarea {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: var(--spacing-lg, 1.5rem);
    position: relative;
  }

  .base-textarea__label {
    display: block;
    margin-bottom: var(--spacing-sm, 0.5rem);
    font-weight: var(--font-weight-semibold, 600);
    color: var(--color-text-primary, #1e293b);
    font-size: 0.875rem;
    line-height: 1.25;
    transition: color var(--transition-fast, 0.15s);
  }

  .base-textarea--disabled .base-textarea__label {
    color: var(--color-text-muted, #64748b);
  }

  .base-textarea__required {
    color: var(--color-error, #ef4444);
    margin-left: var(--spacing-xs, 0.25rem);
  }

  .base-textarea__wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .base-textarea__input {
    width: 100%;
    padding: var(--spacing-md, 1rem);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius-lg, 0.5rem);
    background: var(--color-surface, #ffffff);
    color: var(--color-text-primary, #1e293b);
    font-size: 0.875rem;
    font-family: var(--font-family-sans, 'Inter', sans-serif);
    line-height: 1.5;
    outline: none;
    transition: all var(--transition-normal, 0.3s);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

    .base-textarea__input:focus {
      border-color: var(--color-primary, #0ea5e9);
      box-shadow: var(--shadow-focus, 0 0 0 3px rgba(14, 165, 233, 0.4));
      transform: translateY(-1px);
    }

    .base-textarea__input:hover:not(:focus):not(.base-textarea__input--disabled):not(.base-textarea__input--error) {
      border-color: var(--color-primary-light, #7dd3fc);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

  .base-textarea__input--resize-none {
    resize: none;
  }

  .base-textarea__input--resize-vertical {
    resize: vertical;
    min-height: 80px;
  }

  .base-textarea__input--resize-horizontal {
    resize: horizontal;
    min-width: 200px;
  }

  .base-textarea__input--resize-both {
    resize: both;
    min-width: 200px;
    min-height: 80px;
  }

  .base-textarea--error .base-textarea__input {
    border-color: var(--color-error, #ef4444);
    box-shadow: 0 0 0 1px var(--color-error, #ef4444);
    background: color-mix(in srgb, var(--color-error) 2%, transparent);
  }

    .base-textarea--error .base-textarea__input:focus {
      border-color: var(--color-error, #ef4444);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 40%, transparent);
    }

  .base-textarea--disabled .base-textarea__input {
    background-color: var(--color-surface-hover, #f1f5f9);
    opacity: 0.6;
    cursor: not-allowed;
    color: var(--color-text-muted, #64748b);
    border-color: var(--color-border, #e2e8f0);
    box-shadow: none;
    transform: none;
  }

    .base-textarea--disabled .base-textarea__input:hover {
      border-color: var(--color-border, #e2e8f0);
      box-shadow: none;
      transform: none;
    }

  .base-textarea__actions {
    position: absolute;
    top: var(--spacing-md, 1rem);
    right: var(--spacing-md, 1rem);
    display: flex;
    gap: var(--spacing-xs, 0.25rem);
    z-index: 2;
  }

  .base-textarea__clear {
    background: var(--color-surface, #ffffff);
    border: 1px solid var(--color-border, #e2e8f0);
    cursor: pointer;
    padding: var(--spacing-xs, 0.25rem);
    border-radius: var(--radius-sm, 0.125rem);
    transition: all var(--transition-fast, 0.15s);
    color: var(--color-text-muted, #64748b);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

    .base-textarea__clear:hover:not(:disabled) {
      background-color: var(--color-primary, #0ea5e9);
      color: white;
      border-color: var(--color-primary, #0ea5e9);
      transform: scale(1.05);
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
    }

    .base-textarea__clear:active:not(:disabled) {
      transform: scale(0.95);
    }

  .base-textarea--disabled .base-textarea__clear {
    cursor: not-allowed;
    opacity: 0.5;
    background: var(--color-surface-hover, #f1f5f9);
  }

    .base-textarea--disabled .base-textarea__clear:hover {
      background: var(--color-surface-hover, #f1f5f9);
      color: var(--color-text-muted, #64748b);
      border-color: var(--color-border, #e2e8f0);
      transform: none;
      box-shadow: none;
    }

  .base-textarea__help {
    margin-top: var(--spacing-xs, 0.25rem);
    color: var(--color-text-muted, #64748b);
    font-size: 0.75rem;
    line-height: 1.25;
    animation: slide-down 0.2s ease-out;
  }

  .base-textarea__error {
    margin-top: var(--spacing-xs, 0.25rem);
    color: var(--color-error, #ef4444);
    font-size: 0.75rem;
    line-height: 1.25;
    font-weight: var(--font-weight-medium, 500);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 0.25rem);
    animation: slide-down 0.2s ease-out;
  }

  .base-textarea__counter {
    margin-top: var(--spacing-xs, 0.25rem);
    text-align: right;
    color: var(--color-text-muted, #64748b);
    font-size: 0.75rem;
    animation: slide-down 0.2s ease-out;
  }

  /* Sizes */
  .base-textarea--sm .base-textarea__input {
    padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
    font-size: 0.8125rem;
    border-radius: var(--radius-md, 0.375rem);
  }

  .base-textarea--sm .base-textarea__actions {
    top: var(--spacing-sm, 0.5rem);
    right: var(--spacing-sm, 0.5rem);
  }

  .base-textarea--lg .base-textarea__input {
    padding: var(--spacing-lg, 1.5rem);
    font-size: 1rem;
    border-radius: var(--radius-xl, 0.75rem);
  }

  .base-textarea--lg .base-textarea__actions {
    top: var(--spacing-lg, 1.5rem);
    right: var(--spacing-lg, 1.5rem);
  }

  /* Animations */
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .base-textarea__input {
      padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
    }

    .base-textarea__actions {
      top: var(--spacing-sm, 0.5rem);
      right: var(--spacing-sm, 0.5rem);
    }

    .base-textarea--lg .base-textarea__input {
      padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
    }

    .base-textarea--lg .base-textarea__actions {
      top: var(--spacing-md, 1rem);
      right: var(--spacing-md, 1rem);
    }
  }

  @media (max-width: 480px) {
    .base-textarea {
      margin-bottom: var(--spacing-md, 1rem);
    }

    .base-textarea__input {
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .base-textarea__input {
      border-width: 2px;
    }

      .base-textarea__input:focus {
        border-width: 3px;
      }

    .base-textarea--error .base-textarea__input {
      border-width: 2px;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .base-textarea__input,
    .base-textarea__clear,
    .base-textarea__help,
    .base-textarea__error,
    .base-textarea__counter {
      transition: none;
      animation: none;
    }
  }
</style>
